import { createClient } from '@supabase/supabase-js';

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: records1, error: err1 } = await supabase
    .from('registry')
    .select('*')
    .ilike('authors', '%Joo%');

  const { data: records2, error: err2 } = await supabase
    .from('registry')
    .select('*')
    .ilike('title', '%UX/UI%');

  const { data: records3, error: err3 } = await supabase
    .from('registry')
    .select('*')
    .ilike('human_summary', '%Bertão%');

  console.log('Joo Authors:', records1);
  console.log('UX/UI Title:', records2);
  console.log('Bertão Summary:', records3);
}

run();
