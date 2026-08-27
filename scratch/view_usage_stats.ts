import { createClient } from '@supabase/supabase-js';

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  console.log('📊 Querying TSOT Platform Live Metrics...');

  // 1. Audit logs
  const { count: auditCount } = await supabase.from('audit_logs').select('id', { count: 'exact', head: true });
  console.log(`📡 Total Audit Logs Recorded: ${auditCount || 0}`);

  // 2. Active API Keys
  const { count: keysCount, data: keys } = await supabase.from('api_keys').select('*', { count: 'exact' });
  console.log(`🔑 Total Minted API Keys: ${keysCount || 0}`);

  // 3. API Usage
  const { data: usage } = await supabase.from('api_usage').select('*');
  console.log(`⚡ Active Daily Usage Rows: ${usage?.length || 0}`);
}

main();
