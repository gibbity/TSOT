import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

async function testKeyFlow() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // 1. Generate a test API key
  const rawKey = `tsot_live_${crypto.randomBytes(16).toString('hex')}`;
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const keyPrefix = rawKey.slice(0, 14) + '...';

  console.log(`🔑 Generated test key: ${rawKey}`);
  console.log(`🔒 Key Hash: ${keyHash}`);

  // 2. Insert into api_keys table
  const { data: inserted, error: insertErr } = await supabase.from('api_keys').insert({
    key_hash: keyHash,
    key_prefix: keyPrefix,
    tier: 'pro',
    daily_limit: 500,
    is_active: true
  }).select().single();

  if (insertErr) {
    console.error('Failed to insert test key:', insertErr);
    return;
  }
  console.log('✅ Key inserted successfully into Supabase:', inserted);

  // 3. Test check_and_increment_usage RPC
  const { data: check1, error: rpcErr1 } = await supabase.rpc('check_and_increment_usage', {
    p_key_hash: keyHash
  });
  console.log('⚡ Usage Check 1 (First call):', check1);

  const { data: check2, error: rpcErr2 } = await supabase.rpc('check_and_increment_usage', {
    p_key_hash: keyHash
  });
  console.log('⚡ Usage Check 2 (Incremented count):', check2);

  // Clean up test key
  await supabase.from('api_keys').delete().eq('key_hash', keyHash);
  console.log('🧹 Cleaned up test key.');
}

testKeyFlow();
