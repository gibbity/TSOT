import { createClient } from '@supabase/supabase-js';

async function cleanupDuplicates() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase variables.');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase.from('registry').select('id, title, code');
  
  if (error) {
    console.error('❌ Failed to fetch registry:', error);
    return;
  }

  const titleMap = new Map<string, Array<{ id: number; code: string; title: string }>>();
  
  for (const item of data || []) {
    const normalized = item.title.toLowerCase().trim().replace(/\s+/g, ' ');
    if (!titleMap.has(normalized)) {
      titleMap.set(normalized, []);
    }
    titleMap.get(normalized)!.push(item);
  }

  const idsToDelete: number[] = [];
  
  console.log('🧹 Preparing to cleanup duplicate papers...');
  
  for (const [normalized, list] of titleMap.entries()) {
    if (list.length > 1) {
      console.log(`⚠️ Found ${list.length} copies of: "${list[0].title}"`);
      // Keep the first copy (list[0]), delete all others (list[1], list[2], etc.)
      for (let i = 1; i < list.length; i++) {
        console.log(`   ❌ Will delete ID: ${list[i].id} (Code: ${list[i].code})`);
        idsToDelete.push(list[i].id);
      }
    }
  }

  if (idsToDelete.length === 0) {
    console.log('✅ No duplicates to clean up!');
    return;
  }

  console.log(`\n🔥 Executing deletion of ${idsToDelete.length} duplicate records...`);
  const { error: deleteErr } = await supabase
    .from('registry')
    .delete()
    .in('id', idsToDelete);

  if (deleteErr) {
    console.error('❌ Failed to delete duplicates:', deleteErr);
  } else {
    console.log('✨ Cleanup complete! Database is now 100% deduplicated.');
  }
}

cleanupDuplicates();
