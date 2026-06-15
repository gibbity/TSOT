import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { count: allCount, error: allErr } = await supabase
    .from('registry')
    .select('*', { count: 'exact', head: true });
    
  const { count: embCount, error: embErr } = await supabase
    .from('registry')
    .select('*', { count: 'exact', head: true })
    .not('embedding', 'is', null);

  if (allErr || embErr) {
    console.error('Error:', allErr || embErr);
    process.exit(1);
  }
  
  console.log('Total records:', allCount);
  console.log('Records with embeddings:', embCount);
  process.exit(0);
}

run();
