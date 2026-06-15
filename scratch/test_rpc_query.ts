import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const queryText = 'banana apple';
  const limit = 200;

  const apiKey = process.env.GEMINI_API_KEY!;
  const ai = new GoogleGenerativeAI(apiKey);
  const embModel = ai.getGenerativeModel({ model: 'gemini-embedding-2' });
  const embResult = await embModel.embedContent({
    content: { role: 'user', parts: [{ text: queryText }] },
    outputDimensionality: 768
  } as any);
  const queryEmbedding = embResult.embedding?.values || null;

  console.log('Generated embedding length:', queryEmbedding?.length);

  const { data, error } = await supabase.rpc('hybrid_search_registry', {
    query_embedding: queryEmbedding,
    query_text: queryText,
    match_limit: limit,
    filter_pillar: null
  });

  if (error) {
    console.error('RPC Error:', error);
  } else {
    console.log(`RPC returned ${data?.length} records`);
    if (data && data.length > 0) {
      console.log('Top (Rank 1):', {
        similarity: data[0].similarity_score,
        keyword: data[0].keyword_score,
        combined: data[0].combined_score
      });
      if (data.length >= 50) {
        console.log('Rank 50:', {
          similarity: data[49].similarity_score,
          keyword: data[49].keyword_score,
          combined: data[49].combined_score
        });
      }
      if (data.length >= 100) {
        console.log('Rank 100:', {
          similarity: data[99].similarity_score,
          keyword: data[99].keyword_score,
          combined: data[99].combined_score
        });
      }
      if (data.length >= 200) {
        console.log('Rank 200:', {
          similarity: data[199].similarity_score,
          keyword: data[199].keyword_score,
          combined: data[199].combined_score
        });
      }
    }
  }
}

run();
