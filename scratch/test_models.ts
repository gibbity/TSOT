import { GoogleGenerativeAI } from '@google/generative-ai';

async function main() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error('Missing GEMINI_API_KEY');
    return;
  }
  const ai = new GoogleGenerativeAI(key);
  // We can query the models list or check a few known ones
  const candidates = [
    'gemini-3.1-flash-lite'
  ];

  for (const model of candidates) {
    try {
      const g = ai.getGenerativeModel({ model });
      const res = await g.generateContent('Hi');
      console.log(`✅ Success for: ${model}`);
    } catch (err: any) {
      console.log(`❌ Failed for: ${model} - ${err.message}`);
    }
  }
}

main();
