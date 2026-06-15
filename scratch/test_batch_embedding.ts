import { GoogleGenerativeAI } from '@google/generative-ai';

async function testModel(modelName: string) {
  const apiKey = process.env.GEMINI_API_KEY!;
  const ai = new GoogleGenerativeAI(apiKey);
  const model = ai.getGenerativeModel({ model: modelName });

  console.log(`\nTesting batchEmbedContents on model: "${modelName}"...`);
  try {
    const result = await model.batchEmbedContents({
      requests: [
        {
          content: { role: 'user', parts: [{ text: 'Hello world! Test 1.' }] },
          outputDimensionality: 768
        } as any,
        {
          content: { role: 'user', parts: [{ text: 'Hello world! Test 2.' }] },
          outputDimensionality: 768
        } as any
      ]
    });
    console.log(`✅ Success! Batch returned ${result.embeddings?.length} embeddings.`);
  } catch (err: any) {
    console.error(`❌ Failed:`, err?.message || err);
  }
}

async function run() {
  await testModel('gemini-embedding-2');
  await testModel('gemini-embedding-001');
  await testModel('text-embedding-004');
}

run();
