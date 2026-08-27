import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

async function main() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  console.log('🧪 Starting API Key Rate Limit & Upgrade Blocking Test...');

  // 1. Generate a test API key with daily limit of 2
  const rawKey = `tsot_live_${crypto.randomBytes(16).toString('hex')}`;
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const keyPrefix = `${rawKey.slice(0, 14)}...`;

  const { error: insertErr } = await supabase.from('api_keys').insert({
    key_hash: keyHash,
    key_prefix: keyPrefix,
    tier: 'free',
    daily_limit: 2,
    is_active: true
  });

  if (insertErr) {
    console.error('❌ Failed to insert test key:', insertErr);
    process.exit(1);
  }
  console.log(`🔑 Created test key with DAILY_LIMIT = 2: ${rawKey}`);

  // Helper to send request to /api/moat
  const sendRequest = async (callNumber: number) => {
    console.log(`\n📡 Dispatching API Call #${callNumber}...`);
    const res = await fetch(`${baseUrl}/api/moat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': rawKey
      },
      body: JSON.stringify({
        tool: 'audit_eu_compliance',
        prompt: 'Testing rate limit enforcement and payment blocking modal trigger.'
      })
    });

    const status = res.status;
    const data = await res.json();
    console.log(`📊 HTTP Status: ${status}`);
    console.log('📦 Response:', JSON.stringify(data, null, 2));
    return { status, data };
  };

  try {
    // Call 1: Should succeed (1/2)
    const call1 = await sendRequest(1);
    if (call1.status !== 200) throw new Error(`Call 1 failed with status ${call1.status}`);
    console.log('✅ Call 1 passed quota check (Remaining: 1)');

    // Call 2: Should succeed (2/2)
    const call2 = await sendRequest(2);
    if (call2.status !== 200) throw new Error(`Call 2 failed with status ${call2.status}`);
    console.log('✅ Call 2 passed quota check (Remaining: 0)');

    // Call 3: Should be blocked by HTTP 429
    const call3 = await sendRequest(3);
    if (call3.status === 429 && call3.data.upgradeRequired === true) {
      console.log('\n🎯 SUCCESS: Call #3 was BLOCKED by HTTP 429 (Daily Quota Exceeded)!');
      console.log(`🔒 Upgrade Required Flag: ${call3.data.upgradeRequired}`);
      console.log(`🛑 Block Message: "${call3.data.message}"`);
    } else {
      throw new Error(`Expected HTTP 429 with upgradeRequired=true, got status ${call3.status}`);
    }

  } finally {
    // Cleanup
    await supabase.from('api_keys').delete().eq('key_hash', keyHash);
    console.log('\n🧹 Cleaned up test key from Supabase.');
  }
}

main().catch(console.error);
