import { GoogleGenerativeAI } from '@google/generative-ai';

async function main() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error('Missing GEMINI_API_KEY');
    return;
  }
  const ai = new GoogleGenerativeAI(key);
  const models = [
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-pro-latest'
  ];

  for (const m of models) {
    try {
      const g = ai.getGenerativeModel({ model: m });
      const res = await g.generateContent('Say exactly: Hello');
      console.log(`✅ Success for: ${m} - Output: ${res.response.text().trim()}`);
    } catch (err: any) {
      console.log(`❌ Failed for: ${m} - ${err.message}`);
    }
  }
}

main();
