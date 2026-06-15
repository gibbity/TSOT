import { createClient } from '@supabase/supabase-js';

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing credentials.');
    return;
  }

  // Fetch OpenAPI spec using service_role key
  const response = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-type': 'application/json'
    }
  });

  if (!response.ok) {
    console.error(`❌ Failed to fetch OpenAPI: ${response.statusText} (${response.status})`);
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
