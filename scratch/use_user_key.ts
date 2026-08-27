import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

async function main() {
  const apiKey = 'tsot_live_e9943fc61f48deadd8881ba2f8f41cb0';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  console.log(`🔑 Using Key: ${apiKey}`);
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
  console.log(`🔒 Key Hash: ${keyHash}`);

  // Check if key exists in Supabase, if not insert it
  const { data: existing } = await supabase.from('api_keys').select('*').eq('key_hash', keyHash).maybeSingle();
  if (!existing) {
    console.log('Registering key in Supabase database...');
    await supabase.from('api_keys').insert({
      key_hash: keyHash,
      key_prefix: `${apiKey.slice(0, 14)}...`,
      tier: 'pro',
      daily_limit: 500,
      is_active: true
    });
    console.log('✅ Key registered with Pro tier (500 limit).');
  } else {
    console.log(`Found existing key in DB: Tier=${existing.tier}, Limit=${existing.daily_limit}`);
  }

  // Make a live audit request to /api/moat
  console.log('\n📡 Dispatching live request to /api/moat...');
  const res = await fetch(`${baseUrl}/api/moat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    },
    body: JSON.stringify({
      tool: 'audit_eu_compliance',
      prompt: 'We are designing an agentic clinical workflow copilot that drafts medical summaries for doctor review with strict provenance verification.'
    })
  });

  console.log(`📊 HTTP Status: ${res.status}`);
  const data = await res.json();
  console.log('\n📦 Full Live Output:');
  console.log(JSON.stringify(data, null, 2));

  // Check usage table
  const today = new Date().toISOString().split('T')[0];
  const { data: usage } = await supabase.from('api_usage').select('*').eq('key_hash', keyHash).eq('usage_date', today).maybeSingle();
  console.log(`\n⚡ Live Atomic Usage Record in Supabase for today:`, usage);
}

main().catch(console.error);
