import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

const JSON_PATH = path.join(__dirname, '..', 'lib', 'supabase', 'ai_act_data.json');

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize Gemini API
const geminiApiKey = process.env.GEMINI_API_KEY;

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function main() {
  console.log('🌱 Starting EU AI Act Seeding process...');

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('⚠️ Supabase environment variables not defined. Skipping database write.');
    console.log('   Please make sure to set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    return;
  }

  if (!geminiApiKey) {
    console.error('❌ Missing GEMINI_API_KEY. Cannot compute embeddings.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const ai = new GoogleGenerativeAI(geminiApiKey);
  const embModel = ai.getGenerativeModel({ model: 'gemini-embedding-2' });

  if (!fs.existsSync(JSON_PATH)) {
    console.error(`❌ JSON file not found at: ${JSON_PATH}`);
    process.exit(1);
  }

  const articles = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  console.log(`Loaded ${articles.length} articles from JSON.`);

  // Generate embeddings and insert/upsert into DB in batches to prevent rate limits
  const BATCH_SIZE = 20;
  let count = 0;

  for (let i = 0; i < articles.length; i += BATCH_SIZE) {
    const chunk = articles.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch [${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(articles.length / BATCH_SIZE)}] (${chunk.length} articles)...`);

    // Generate embeddings for the batch
    const batchRequests = chunk.map((art: any) => {
      const textToEmbed = `Title: ${art.title}\nSummary: ${art.article_text}\nVerdict: ${art.compliance_verdict}`;
      return {
        content: { role: 'user', parts: [{ text: textToEmbed }] },
        outputDimensionality: 768
      };
    });

    let success = false;
    let attempts = 0;
    const maxAttempts = 5;
    let embeddings: any[] = [];

    while (attempts < maxAttempts && !success) {
      try {
        console.log(`🤖 Generating embeddings for batch...`);
        const result = await embModel.batchEmbedContents({
          requests: batchRequests as any
        });
        embeddings = result.embeddings ?? [];
        if (embeddings.length === chunk.length) {
          success = true;
        } else {
          throw new Error('Embedding size mismatch.');
        }
      } catch (err: any) {
        attempts++;
        console.warn(`⚠️ Attempt ${attempts} failed: ${err?.message || err}`);
        if (err?.message?.includes('429') || err?.message?.includes('quota')) {
          console.log('Sleeping 60 seconds for rate limit cooldown...');
          await delay(60000);
        } else {
          await delay(5000);
        }
      }
    }

    if (!success) {
      console.error(`❌ Batch failed after ${maxAttempts} attempts. Skipping.`);
      continue;
    }

    // Prepare rows for upsert
    const rows = chunk.map((art: any, index: number) => ({
      code: art.code,
      pillar: art.category,
      title: art.title,
      human_summary: art.article_text,
      verdict: art.compliance_verdict,
      risk_level: art.risk_level,
      embedding: embeddings[index]?.values ?? null,
      source_url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689',
      source_type: 'regulation',
      paper_year: 2024,
      authors: 'European Parliament & Council',
      is_premium: false
    }));

    // Upsert into Supabase public.ai_act
    console.log(`💾 Upserting to Supabase public.ai_act table...`);
    const { error } = await supabase
      .from('ai_act')
      .upsert(rows, { onConflict: 'code' });

    if (error) {
      console.error(`❌ Database insert/upsert error:`, error);
    } else {
      count += rows.length;
      console.log(`✅ Successfully seeded ${count}/${articles.length} articles.`);
    }

    // Delay between batches to stay safe under rate limit
    if (i + BATCH_SIZE < articles.length) {
      console.log('💤 Delaying 15 seconds to respect rate limits...');
      await delay(15000);
    }
  }

  console.log(`\n🎉 Seeding completed! Successfully seeded ${count} articles in Supabase.`);
}

main();
