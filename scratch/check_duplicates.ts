import { createClient } from '@supabase/supabase-js';

async function checkDuplicates() {
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

  let duplicateCount = 0;
  console.log('🔍 Scanning database for duplicate titles (case-insensitive)...');
  
  for (const [normalized, list] of titleMap.entries()) {
    if (list.length > 1) {
      duplicateCount++;
      console.log(`\n⚠️ Duplicate found: "${list[0].title}"`);
      list.forEach((item, index) => {
        console.log(`   [${index + 1}] ID: ${item.id}, Code: ${item.code}`);
      });
    }
  }

  if (duplicateCount === 0) {
    console.log('✅ Clean database! No duplicate paper titles found.');
  } else {
    console.log(`\nFound ${duplicateCount} duplicate papers.`);
  }
}

checkDuplicates();
