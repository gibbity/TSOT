import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const codes = ['SOT-TLUVH2', 'SOT-27EJBQ', 'SOT-QNM1EE'];
  
  // First, query these specific codes
  const { data: specificData, error: specError } = await supabase
    .from('registry')
    .select('code, title, human_summary, verdict, pillar')
    .in('code', codes);

  if (specError) {
    console.error('Error fetching specific codes:', specError);
    process.exit(1);
  } else {
    console.log('--- SPECIFIC RECORDS ---');
    console.log(JSON.stringify(specificData, null, 2));
    process.exit(0);
  }
}

run();
