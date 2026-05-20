import { createClient } from '@supabase/supabase-js';

async function cleanupDuplicates() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase variables.');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase.from('registry').select('id, title, source_url, created_at');
  
  if (error) {
    console.error('❌ Failed to fetch registry:', error);
    return;
  }

  const byUrl = new Map<string, Array<any>>();
  const byNormalizedTitle = new Map<string, Array<any>>();
  
  for (const item of data || []) {
    if (item.source_url && item.source_url.trim() !== '') {
      if (!byUrl.has(item.source_url)) {
        byUrl.set(item.source_url, []);
      }
      byUrl.get(item.source_url)!.push(item);
    } else {
      const normalized = item.title.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      if (!byNormalizedTitle.has(normalized)) {
        byNormalizedTitle.set(normalized, []);
      }
      byNormalizedTitle.get(normalized)!.push(item);
    }
  }

  let idsToDelete: number[] = [];

  // Find URL duplicates
  for (const [url, list] of byUrl.entries()) {
    if (list.length > 1) {
      list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      console.log(`\nURL Duplicate: ${url}`);
      list.forEach((item, index) => {
        if (index > 0) idsToDelete.push(item.id);
        console.log(`  [${index === 0 ? 'KEEP' : 'DELETE'}] ID: ${item.id} | ${item.title}`);
      });
    }
  }

  // Find Title duplicates for papers without URL
  for (const [title, list] of byNormalizedTitle.entries()) {
    if (list.length > 1) {
      list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      console.log(`\nTitle Duplicate: ${title}`);
      list.forEach((item, index) => {
        if (index > 0) idsToDelete.push(item.id);
        console.log(`  [${index === 0 ? 'KEEP' : 'DELETE'}] ID: ${item.id} | ${item.title}`);
      });
    }
  }

  if (idsToDelete.length === 0) {
    console.log('\n✅ Clean database! No duplicate papers found.');
    return;
  }

  console.log(`\n🗑️ Found ${idsToDelete.length} duplicate records to delete.`);
  
  // Delete in batches of 50
  for (let i = 0; i < idsToDelete.length; i += 50) {
    const batch = idsToDelete.slice(i, i + 50);
    const { error: delErr } = await supabase.from('registry').delete().in('id', batch);
    if (delErr) {
      console.error('❌ Failed to delete batch:', delErr);
    } else {
      console.log(`✅ Deleted batch of ${batch.length} duplicates.`);
    }
  }
  
  console.log('🎉 Cleanup complete!');
}

cleanupDuplicates();
