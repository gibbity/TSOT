import { createClient } from '@supabase/supabase-js';

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Check all available tables via OpenAPI schema
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/?apikey=${serviceRoleKey}`);
    const json = await res.json();
    console.log('Definitions in OpenAPI schema:', Object.keys(json.definitions || {}));
    console.log('Paths:', Object.keys(json.paths || {}));
  } catch (e: any) {
    console.error('Fetch error:', e.message);
  }
}

main();
