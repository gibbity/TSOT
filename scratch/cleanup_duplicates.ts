import { createClient } from '@supabase/supabase-js';

async function cleanupDuplicates() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase variables.');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase.from('registry').select('id, title, source_url, code, pillar');
  
  if (error) {
    console.error('❌ Failed to fetch registry:', error);
    return;
  }

  const records = data || [];
  console.log(`📊 Loaded ${records.length} records from registry.`);

  const idsToDelete = new Set<number>();
  
  // 1. Deduplicate by source_url (only for valid, non-empty URLs)
  const urlMap = new Map<string, typeof records>();
  for (const record of records) {
    if (!record.source_url) continue;
    const normUrl = record.source_url.toLowerCase().trim();
    if (!urlMap.has(normUrl)) {
      urlMap.set(normUrl, []);
    }
    urlMap.get(normUrl)!.push(record);
  }

  console.log('\n🔍 Checking duplicates by Source URL (DOI / Landing Page)...');
  for (const [url, list] of urlMap.entries()) {
    if (list.length > 1) {
      // Sort by id ascending to keep the earliest one inserted
      list.sort((a, b) => a.id - b.id);
      console.log(`⚠️ Found URL duplicate: "${url}" (${list.length} copies)`);
      console.log(`   Keep: ID ${list[0].id} (Code: ${list[0].code}, Pillar: ${list[0].pillar}) - Title: "${list[0].title}"`);
      for (let i = 1; i < list.length; i++) {
        console.log(`   ❌ Delete: ID ${list[i].id} (Code: ${list[i].code}, Pillar: ${list[i].pillar}) - Title: "${list[i].title}"`);
        idsToDelete.add(list[i].id);
      }
    }
  }

  // Filter out records already queued for deletion to proceed to title deduplication
  const remainingRecords = records.filter(r => !idsToDelete.has(r.id));

  // 2. Deduplicate by normalized Title (case-insensitive, whitespace-collapsed)
  const titleMap = new Map<string, typeof records>();
  for (const record of remainingRecords) {
    if (!record.title) continue;
    const normTitle = record.title.toLowerCase().trim().replace(/\s+/g, ' ');
    if (!titleMap.has(normTitle)) {
      titleMap.set(normTitle, []);
    }
    titleMap.get(normTitle)!.push(record);
  }

  console.log('\n🔍 Checking remaining duplicates by Title...');
  for (const [title, list] of titleMap.entries()) {
    if (list.length > 1) {
      list.sort((a, b) => a.id - b.id);
      console.log(`⚠️ Found Title duplicate: "${list[0].title}" (${list.length} copies)`);
      for (let i = 1; i < list.length; i++) {
        console.log(`   ❌ Delete: ID ${list[i].id} (Code: ${list[i].code}, Pillar: ${list[i].pillar})`);
        idsToDelete.add(list[i].id);
      }
    }
  }

  const deleteList = Array.from(idsToDelete);
  if (deleteList.length === 0) {
    console.log('\n✅ Database is 100% clean. No duplicate papers found.');
    return;
  }

  console.log(`\n🔥 Executing deletion of ${deleteList.length} duplicate records...`);
  const { error: deleteErr } = await supabase
    .from('registry')
    .delete()
    .in('id', deleteList);

  if (deleteErr) {
    console.error('❌ Failed to delete duplicates:', deleteErr);
  } else {
    console.log('✨ Success! All duplicates successfully removed.');
  }
}

cleanupDuplicates();
