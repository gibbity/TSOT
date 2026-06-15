import { createClient } from '@supabase/supabase-js';

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data, error } = await supabase
    .from('registry')
    .select('id, code, title, metric, verdict, human_summary, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error(error);
    return;
  }

  data.forEach((r, i) => {
    console.log(`\n--- [${i+1}] Code: ${r.code} | Created: ${r.created_at} ---`);
    console.log(`Title: ${r.title}`);
    console.log(`Metric: ${r.metric}`);
    console.log(`Verdict: ${r.verdict}`);
    console.log(`Summary: ${r.human_summary.substring(0, 200)}...`);
  });
}

run();
