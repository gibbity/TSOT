import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

const PROGRESS_FILE = path.join(__dirname, 'backfill_embeddings_progress.json');

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase environment variables.');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, serviceRoleKey);

// Initialize Gemini API
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.error('❌ Missing GEMINI_API_KEY.');
  process.exit(1);
}
const ai = new GoogleGenerativeAI(geminiApiKey);
const embModel = ai.getGenerativeModel({ model: 'gemini-embedding-2' });

// Helper: load progress
function loadProgress(): Set<string> {
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
      return new Set(data);
    } catch {
      return new Set();
    }
  }
  return new Set();
}

// Helper: save progress
function saveProgress(progress: Set<string>) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(Array.from(progress), null, 2), 'utf8');
}

// Delay helper
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function fetchAllPapers() {
  let allPapers: any[] = [];
  let from = 0;
  const step = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('registry')
      .select('id, code, title, human_summary, verdict')
      .order('created_at', { ascending: true })
      .range(from, from + step - 1);

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      allPapers = allPapers.concat(data);
      from += step;
      if (data.length < step) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }
  return allPapers;
}

async function fetchNullEmbeddingCodes() {
  let nullCodes: string[] = [];
  let from = 0;
  const step = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('registry')
      .select('code')
      .is('embedding', null)
      .range(from, from + step - 1);

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      nullCodes = nullCodes.concat(data.map(r => r.code));
      from += step;
      if (data.length < step) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }
  return new Set(nullCodes);
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function runWithConcurrencyLimit<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>
): Promise<void> {
  const promises: Promise<void>[] = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const currentIndex = index++;
      const currentItem = items[currentIndex];
      if (currentItem) {
        try {
          await fn(currentItem);
        } catch (err) {
          console.error('Worker error:', err);
        }
      }
    }
  }

  for (let i = 0; i < Math.min(limit, items.length); i++) {
    promises.push(worker());
  }

  await Promise.all(promises);
}

async function main() {
  console.log('📚 Fetching all papers from TSOT registry that need embeddings (paginated)...');
  
  let papers: any[] = [];
  try {
    papers = await fetchAllPapers();
  } catch (error) {
    console.error('❌ Failed to fetch registry records:', error);
    process.exit(1);
  }

  console.log(`Total papers in database: ${papers.length}`);
  const progress = loadProgress();
  console.log(`Already processed in local tracker: ${progress.size} papers`);

  // To double check database status, we can filter down to records that are actually null in the database
  let dbNullCodes = new Set<string>();
  try {
    dbNullCodes = await fetchNullEmbeddingCodes();
  } catch (nullCheckError) {
    console.error('❌ Failed to check records with null embeddings in DB:', nullCheckError);
    process.exit(1);
  }

  console.log(`Database records with NULL embedding: ${dbNullCodes.size}`);

  // We filter papers that either aren't in local progress or are still null in database
  const papersToProcess = papers.filter(p => dbNullCodes.has(p.code) && !progress.has(p.code));
  console.log(`Remaining papers to process this run: ${papersToProcess.length}`);

  if (papersToProcess.length === 0) {
    console.log('🎉 No papers left to embed. Database is fully populated!');
    return;
  }

  const BATCH_SIZE = 40;
  const paperChunks = chunkArray(papersToProcess, BATCH_SIZE);
  console.log(`📦 Split into ${paperChunks.length} batches of up to ${BATCH_SIZE} papers each.`);

  let count = 0;
  const startTime = Date.now();

  for (let batchIndex = 0; batchIndex < paperChunks.length; batchIndex++) {
    const chunk = paperChunks[batchIndex];
    console.log(`\n──────────────────────────────────────────────────`);
    console.log(`Processing Batch [${batchIndex + 1}/${paperChunks.length}] (${chunk.length} papers)`);

    // Prepare requests
    const batchRequests = chunk.map(paper => {
      const textToEmbed = `Title: ${paper.title}\nSummary: ${paper.human_summary}\nVerdict: ${paper.verdict}`;
      return {
        content: { role: 'user', parts: [{ text: textToEmbed }] },
        outputDimensionality: 768
      };
    });

    let attempts = 0;
    const maxAttempts = 5;
    let success = false;
    let embeddings: any[] = [];

    while (attempts < maxAttempts && !success) {
      try {
        console.log(`🤖 Generating embeddings batch via Gemini API...`);
        const result = await embModel.batchEmbedContents({
          requests: batchRequests as any
        });

        embeddings = result.embeddings ?? [];
        if (embeddings.length !== chunk.length) {
          throw new Error(`Embedding generation returned mismatch in result count. Expected: ${chunk.length}, got: ${embeddings.length}`);
        }
        success = true;
      } catch (err: any) {
        attempts++;
        const errMessage = err?.message || String(err);
        console.warn(`⚠️ Batch attempt ${attempts} failed: ${errMessage.substring(0, 300)}`);
        
        if (
          errMessage.includes('429') || 
          errMessage.includes('quota') || 
          errMessage.includes('Quota exceeded') || 
          errMessage.includes('ResourceExhausted')
        ) {
          console.warn(`🚀 Hit rate limit/quota. Waiting 45s for cooldown before retry...`);
          await delay(45000);
        } else {
          await delay(5000);
        }
      }
    }

    if (!success) {
      console.error(`❌ Failed to generate embeddings for batch ${batchIndex + 1} after ${maxAttempts} attempts. Skipping batch.`);
      continue;
    }

    console.log(`✅ Generated embeddings successfully. Uploading to database in parallel...`);

    // Upload to database in parallel with a concurrency limit of 10
    const uploadTasks = chunk.map((paper, index) => {
      return async () => {
        const embeddingVal = embeddings[index]?.values;
        if (!embeddingVal || embeddingVal.length !== 768) {
          console.error(`❌ Invalid embedding for ${paper.code}. Skipping.`);
          return;
        }

        const { error: updateError } = await supabase
          .from('registry')
          .update({
            embedding: embeddingVal
          })
          .eq('code', paper.code);

        if (updateError) {
          console.error(`❌ Database update failed for ${paper.code}:`, updateError);
        } else {
          progress.add(paper.code);
          count++;
        }
      };
    });

    await runWithConcurrencyLimit(uploadTasks, 10, async (task) => {
      await task();
    });

    // Save progress after each batch
    saveProgress(progress);
    console.log(`🎉 Batch [${batchIndex + 1}/${paperChunks.length}] upload complete. Successfully processed ${count}/${papersToProcess.length} papers so far.`);

    // Print elapsed and estimated time
    const elapsedMin = ((Date.now() - startTime) / 60000).toFixed(2);
    const estRemainingMin = count > 0 ? (((Date.now() - startTime) / count) * (papersToProcess.length - count) / 60000).toFixed(2) : 'N/A';
    console.log(`⏱️ Elapsed: ${elapsedMin}m | Est. Remaining: ${estRemainingMin}m`);

    // Cooldown delay between batches to stay comfortably under the TPM limit
    if (batchIndex < paperChunks.length - 1) {
      console.log(`💤 Cooldown delay (30s) to respect API rate limits...`);
      await delay(30000);
    }
  }

  console.log(`\n🎉 Embedding backfill complete! Processed ${count} papers during this run.`);
}

main();

