import { GoogleGenerativeAI } from '@google/generative-ai';

async function run() {
  const apiKey = process.env.GEMINI_API_KEY!;
  const ai = new GoogleGenerativeAI(apiKey);
  
  const model2 = ai.getGenerativeModel({ model: 'gemini-embedding-2' });
  try {
    const result = await model2.embedContent({
      content: { role: 'user', parts: [{ text: 'Hello world! Testing gemini-embedding-2 with 768 dimensions.' }] },
      outputDimensionality: 768
    } as any);
    const embedding = result.embedding.values;
    console.log('✅ gemini-embedding-2 successful with 768 outputDimensionality!');
    console.log('Dimensions:', embedding.length);
    console.log('Sample:', embedding.slice(0, 5));
  } catch (err) {
    console.error('❌ gemini-embedding-2 with 768 failed:', err);
  }

  const model001 = ai.getGenerativeModel({ model: 'gemini-embedding-001' });
  try {
    const result = await model001.embedContent({
      content: { role: 'user', parts: [{ text: 'Hello world! Testing gemini-embedding-001 with 768 dimensions.' }] },
      outputDimensionality: 768
    } as any);
    const embedding = result.embedding.values;
    console.log('✅ gemini-embedding-001 successful with 768 outputDimensionality!');
    console.log('Dimensions:', embedding.length);
    console.log('Sample:', embedding.slice(0, 5));
  } catch (err) {
    console.error('❌ gemini-embedding-001 with 768 failed:', err);
  }
}

run();
