import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

async function generateQueryEmbedding(text: string): Promise<number[] | null> {
  if (!ai) return null;
  try {
    const embModel = ai.getGenerativeModel({ model: 'gemini-embedding-2' });
    const result = await embModel.embedContent({
      content: { role: 'user', parts: [{ text }] },
      outputDimensionality: 768
    } as any);
    return result.embedding?.values || null;
  } catch (err) {
    console.error('Embedding failed:', err);
    return null;
  }
}

async function test() {
  const testPrompt = "We are building an AI recruitment screening bot that auto-picks candidates and emails them.";
  console.log(`\n======================================================`);
  console.log(`TESTING EU COMPLIANCE TOOL LOGIC`);
  console.log(`Prompt: "${testPrompt}"`);
  console.log(`======================================================`);

  const embedding = await generateQueryEmbedding(testPrompt);
  
  // 1. EU Compliance Test
  const { data: euData, error: euError } = await supabase.rpc('hybrid_search_ai_act', {
    query_embedding: embedding,
    query_text: testPrompt,
    match_limit: 3,
    filter_category: null
  });

  if (euError) {
    console.error('❌ EU Compliance search failed:', euError);
  } else {
    console.log(`✅ Found ${euData?.length || 0} matching EU AI Act articles:`);
    euData?.forEach((c: any) => {
      console.log(`- Article ${c.code} [Risk: ${c.pillar}]: ${c.title}`);
    });
  }

  // 2. Cognitive Safety Test
  console.log(`\n======================================================`);
  console.log(`TESTING COGNITIVE SAFETY TOOL LOGIC`);
  console.log(`======================================================`);
  const { data: cogData, error: cogError } = await supabase.rpc('hybrid_search_registry', {
    query_embedding: embedding,
    query_text: testPrompt,
    match_limit: 3,
    filter_pillar: null
  });

  if (cogError) {
    console.error('❌ Cognitive safety search failed:', cogError);
  } else {
    console.log(`✅ Found ${cogData?.length || 0} matching research papers:`);
    cogData?.forEach((c: any) => {
      console.log(`- Paper [${c.code}] [Pillar: ${c.pillar}]: ${c.title}`);
    });
  }
}

test();
