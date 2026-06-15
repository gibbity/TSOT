import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const codes = ['SOT-TLUVH2', 'SOT-27EJBQ', 'SOT-QNM1EE'];
  
  const { data, error } = await supabase
    .from('registry')
    .select('code, title, human_summary, verdict, pillar')
    .in('code', codes);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('SPECIFIC DATA COUNT:', data?.length);
    for (const record of data || []) {
      console.log(`=== CODE: ${record.code} ===`);
      console.log(`TITLE: ${record.title}`);
      console.log(`PILLAR: ${record.pillar}`);
      console.log(`VERDICT: ${record.verdict}`);
      console.log(`HUMAN_SUMMARY:\n${record.human_summary}`);
      console.log('=========================\n');
    }
  }
}

run();
