import { createClient } from '@supabase/supabase-js';
import { getGeminiModel } from '../lib/gemini/client';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const MIGRATION_SYSTEM_PROMPT = `
You are the elite editorial assistant for The Sign of Times (TSOT).
We are migrating legacy records in our database to a new structured format.
For each provided record, you will receive its "code", "title", "human_summary", and legacy "verdict".

Your tasks for each record:
1. Extract or infer the research methodology from the human_summary (e.g., "8-Week Longitudinal Cohort study (n=312 knowledge workers)"). Keep it concise (Max 15 words).
2. Extract or infer the primary cognitive threat vector (e.g., "Automation Bias & Prospective Memory Decay"). Keep it concise (Max 6 words).
3. Rewrite the legacy verdict to be a generalized actionable verdict for builders, developers, and founders. Remove any language that specifically targets "designers" or "design-only" framing. It must remain ONE concrete, actionable constraint or behavioral implication.

RETURN EXCLUSIVELY VALID JSON matching this exact schema:
[
  {
    "code": string,
    "methodology": string,
    "threat_vector": string,
    "rewritten_verdict": string
  }
]
No markdown wrapping, no preamble, just the JSON array.
`;

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function migrateRecords() {
  console.log('Fetching legacy records...');
  const { data: records, error } = await supabase.from('registry').select('code, title, human_summary, verdict');
  
  if (error) {
    console.error('Failed to fetch records:', error);
    return;
  }

  // Filter records that don't have the methodology section already
  const legacyRecords = records.filter(r => !r.human_summary.includes('**RESEARCH METHODOLOGY**'));
  
  console.log(`Found ${legacyRecords.length} records to migrate.`);
  if (legacyRecords.length === 0) return;

  const model = getGeminiModel();
  const BATCH_SIZE = 5;

  for (let i = 0; i < legacyRecords.length; i += BATCH_SIZE) {
    const batch = legacyRecords.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(legacyRecords.length / BATCH_SIZE)} (${batch.length} records)...`);
    
    const context = batch.map(r => `CODE: ${r.code}\nTITLE: ${r.title}\nHUMAN SUMMARY: ${r.human_summary}\nLEGACY VERDICT: ${r.verdict}`).join('\n\n---\n\n');
    const prompt = `${MIGRATION_SYSTEM_PROMPT}\n\nProcess these ${batch.length} records.\n\n${context}`;

    let retries = 3;
    let resultJson: any[] | null = null;
    
    while (retries > 0 && !resultJson) {
      try {
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });
        
        let text = result.response.text().trim();
        if (text.startsWith('```json')) text = text.substring(7);
        if (text.endsWith('```')) text = text.substring(0, text.length - 3);
        
        resultJson = JSON.parse(text.trim());
      } catch (err: any) {
        retries--;
        console.error(`Gemini API error: ${err.message}. Retries left: ${retries}`);
        await delay(2000);
      }
    }

    if (!resultJson) {
      console.error('Failed to process batch after retries. Skipping.');
      continue;
    }

    for (const item of resultJson) {
      const originalRecord = batch.find(r => r.code === item.code);
      if (!originalRecord) continue;

      let formattedSummary = originalRecord.human_summary;
      if (item.methodology && item.methodology.trim() !== '') {
        formattedSummary += `\n\n**RESEARCH METHODOLOGY**\n${item.methodology.trim()}`;
      }
      if (item.threat_vector && item.threat_vector.trim() !== '') {
        formattedSummary += `\n\n**COGNITIVE THREAT VECTOR**\n${item.threat_vector.trim()}`;
      }

      console.log(`Updating record ${item.code}...`);
      const { error: updateError } = await supabase.from('registry').update({
        human_summary: formattedSummary,
        verdict: item.rewritten_verdict
      }).eq('code', item.code);

      if (updateError) {
        console.error(`Failed to update record ${item.code}:`, updateError);
      }
    }
    
    // Slight delay between batches to respect rate limits
    await delay(1000);
  }
  
  console.log('Migration completed successfully!');
}

migrateRecords().catch(console.error);
