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
    console.error('Error fetching records:', error);
    return;
  }

  const titleMap = new Map<string, any[]>();
  for (const item of data || []) {
    const normalized = item.title.toLowerCase().trim().replace(/\s+/g, ' ');
    if (!titleMap.has(normalized)) {
      titleMap.set(normalized, []);
    }
    titleMap.get(normalized)!.push(item);
  }

  console.log('🔍 Detailed Duplicate Analysis:');
  for (const [title, list] of titleMap.entries()) {
    if (list.length > 1) {
      console.log(`\nTitle: "${list[0].title}"`);
      list.forEach(item => {
        console.log(`  - ID: ${item.id} | Code: ${item.code} | URL: ${item.source_url} | Created: ${item.created_at}`);
      });
    }
  }
}

run();
