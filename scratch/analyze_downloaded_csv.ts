import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Simple CSV parser that handles quotes and newlines inside fields
function parseCsv(filepath: string): any[] {
  const content = fs.readFileSync(filepath, 'utf8');
  const rows: string[][] = [];
  let currentField = '';
  let insideQuotes = false;
  let currentRow: string[] = [];

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (insideQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote
          currentField += '"';
          i++; // skip next quote
        } else {
          // Closing quote
          insideQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\r' || char === '\n') {
        if (char === '\r' && nextChar === '\n') {
          i++; // skip \n
        }
        currentRow.push(currentField);
        if (currentRow.length > 1 || currentRow[0] !== '') {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentRow.length > 0 || currentField !== '') {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  // Map to objects using header row
  const headers = rows[0].map(h => h.trim());
  const records = rows.slice(1).map(row => {
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });

  return records;
}

async function run() {
  const csvPath = 'C:\\Users\\kushr\\Downloads\\registry_rows.csv';
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found at ${csvPath}`);
    return;
  }

  console.log(`📖 Parsing downloaded CSV file: ${csvPath}...`);
  const csvRecords = parseCsv(csvPath);
  console.log(`📊 Total rows parsed from CSV: ${csvRecords.length}`);

  // Fetch all active database records
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  console.log('📚 Fetching all active registry records from Supabase...');
  let dbRecords: any[] = [];
  let from = 0;
  const step = 1000;
  let hasMore = true;

  while (hasMore) {
    const to = from + step - 1;
    const { data, error } = await supabase
      .from('registry')
      .select('id, code, title, source_url')
      .order('id', { ascending: true })
      .range(from, to);

    if (error) {
      console.error('❌ Error fetching from DB:', error);
      return;
    }

    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      dbRecords = dbRecords.concat(data);
      if (data.length < step) {
        hasMore = false;
      } else {
        from += step;
      }
    }
  }

  console.log(`📊 Total active rows in DB: ${dbRecords.length}`);

  // Identify differences
  const dbIdSet = new Set(dbRecords.map(r => Number(r.id)));
  const dbTitleSet = new Set(dbRecords.map(r => r.title.toLowerCase().trim().replace(/\s+/g, ' ')));

  const missingFromDb: any[] = [];
  const duplicateTitlesInCsv = new Map<string, any[]>();

  for (const csvRec of csvRecords) {
    const csvId = Number(csvRec.id);
    const csvTitle = csvRec.title.toLowerCase().trim().replace(/\s+/g, ' ');

    if (!dbIdSet.has(csvId)) {
      missingFromDb.push(csvRec);
    }

    if (!duplicateTitlesInCsv.has(csvTitle)) {
      duplicateTitlesInCsv.set(csvTitle, []);
    }
    duplicateTitlesInCsv.get(csvTitle)!.push(csvRec);
  }

  console.log(`\n🔍 Analysis Results:`);
  console.log(`- Rows in CSV: ${csvRecords.length}`);
  console.log(`- Rows in DB: ${dbRecords.length}`);
  console.log(`- Rows in CSV that are physically missing from DB (by ID): ${missingFromDb.length}`);

  let duplicateCount = 0;
  for (const [title, list] of duplicateTitlesInCsv.entries()) {
    if (list.length > 1) {
      duplicateCount += (list.length - 1);
    }
  }
  console.log(`- Redundant duplicate titles in CSV: ${duplicateCount}`);

  if (missingFromDb.length > 0) {
    console.log(`\n❌ Top 20 missing rows from DB:`);
    missingFromDb.slice(0, 20).forEach(m => {
      console.log(`  - ID: ${m.id} | Code: ${m.code} | Title: "${m.title.substring(0, 60)}..."`);
    });
  } else {
    console.log('\n✅ Zero missing rows! Every record in the CSV is active in the database (or was a deleted duplicate).');
  }
}

run();
