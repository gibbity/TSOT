import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = 'https://mdjckkbpbqmivatxdpcx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kamNra2JwYnFtaXZhdHhkcGN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTE2NzIwOCwiZXhwIjoyMDk0NzQzMjA4fQ.dHInw_R9Ns_k9rvtMBWI5Ky8UV9_uPXEccBwj6CBjMY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function dump() {
  console.log('Connecting to Supabase...');
  const { count, error: countErr } = await supabase.from('registry').select('*', { count: 'exact', head: true });
  if (countErr) {
    console.error('Count error:', countErr);
    process.exit(1);
  }
  console.log(`Total registry records in DB: ${count}`);

  let allRecords: any[] = [];
  for (let page = 0; page < 3; page++) {
    const from = page * 1000;
    const to = from + 999;
    console.log(`Fetching range ${from} to ${to}...`);
    const { data, error } = await supabase
      .from('registry')
      .select('id, code, pillar, title, human_summary, metric, verdict, risk_level, source_url, source_type, paper_year, authors, is_premium, created_at')
      .not('human_summary', 'is', null)
      .order('id', { ascending: true })
      .range(from, to);

    if (error) {
      console.error('Fetch error:', error);
      break;
    }
    if (data && data.length > 0) {
      allRecords = allRecords.concat(data);
    }
  }

  console.log(`Total fetched records: ${allRecords.length}`);
  const targetPath = path.resolve('packages/tsot-mcp-server/src/registry_data.json');
  fs.writeFileSync(targetPath, JSON.stringify(allRecords, null, 2), 'utf-8');
  console.log(`Saved successfully to ${targetPath}`);
  process.exit(0);
}

dump();
