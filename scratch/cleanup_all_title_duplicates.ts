import { createClient } from '@supabase/supabase-js';

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Fetch all records
  const { data, error } = await supabase
    .from('registry')
    .select('id, code, title, source_url, created_at');

  if (error) {
    console.error('❌ Failed to fetch records:', error);
    return;
  }

  // Map case-insensitive title to the list of records
  const titleMap = new Map<string, any[]>();
  for (const item of data || []) {
    const normalized = item.title.toLowerCase().trim().replace(/\s+/g, ' ');
    if (!titleMap.has(normalized)) {
      titleMap.set(normalized, []);
    }
    titleMap.get(normalized)!.push(item);
  }

  const idsToDelete: number[] = [];

  console.log('🔍 Identifying duplicates based on case-insensitive title...');
  for (const [title, list] of titleMap.entries()) {
    if (list.length > 1) {
      // Sort by creation date so we KEEP the oldest one
      list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      console.log(`\n⚠️ Duplicate group for: "${list[0].title}"`);
      list.forEach((item, index) => {
        if (index === 0) {
          console.log(`  [KEEP] ID: ${item.id} | Code: ${item.code} | URL: ${item.source_url} | Created: ${item.created_at}`);
        } else {
          console.log(`  [DELETE] ID: ${item.id} | Code: ${item.code} | URL: ${item.source_url} | Created: ${item.created_at}`);
          idsToDelete.push(item.id);
        }
      });
    }
  }

  if (idsToDelete.length === 0) {
    console.log('\n✅ No duplicates found in database.');
    return;
  }

  console.log(`\n🗑️ Deleting ${idsToDelete.length} duplicates from Supabase...`);
  const { error: deleteErr } = await supabase
    .from('registry')
    .delete()
    .in('id', idsToDelete);

  if (deleteErr) {
    console.error('❌ Failed to delete duplicates:', deleteErr);
  } else {
    console.log('🎉 Successfully deleted duplicates and cleaned the database!');
  }
}

run();
