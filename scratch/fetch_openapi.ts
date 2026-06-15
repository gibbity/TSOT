import { createClient } from '@supabase/supabase-js';

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !anonKey) {
    console.error('❌ Missing credentials.');
    return;
  }

  // PostgREST exposes OpenAPI spec at the root with a GET request
  const response = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
      'Content-type': 'application/json'
    }
  });

  if (!response.ok) {
    console.error(`❌ Failed to fetch OpenAPI: ${response.statusText}`);
    return;
  }

  const spec = await response.json();
  console.log('Exposed Paths (Tables/Views/RPCs):');
  console.log(Object.keys(spec.paths));
  
  console.log('\nDefinitions (Schemas):');
  if (spec.definitions) {
    console.log(Object.keys(spec.definitions));
  } else {
    console.log('No definitions found.');
  }
}

run();
