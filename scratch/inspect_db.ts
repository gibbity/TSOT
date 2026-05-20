import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, count, error } = await supabase.from('registry').select('code, title, human_summary, verdict', { count: 'exact' }).limit(2);
  if (error) {
    console.error(error);
    return;
  }
  console.log('Total records:', count);
  console.log('Sample:', JSON.stringify(data, null, 2));
}

run();
