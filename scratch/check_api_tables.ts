import { createClient } from '@supabase/supabase-js';

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing credentials');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: keysData, error: keysErr } = await supabase.from('api_keys').select('*').limit(1);
  console.log('api_keys:', keysErr ? `Error: ${keysErr.message}` : `Found table! Rows: ${keysData?.length}`);

  const { data: usageData, error: usageErr } = await supabase.from('api_usage').select('*').limit(1);
  console.log('api_usage:', usageErr ? `Error: ${usageErr.message}` : `Found table! Rows: ${usageData?.length}`);

  const { data: rpcData, error: rpcErr } = await supabase.rpc('check_and_increment_usage', { p_key_hash: 'test' });
  console.log('check_and_increment_usage:', rpcErr ? `Error: ${rpcErr.message}` : `RPC success: ${JSON.stringify(rpcData)}`);
}

main().catch(console.error);
