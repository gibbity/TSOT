import { GoogleGenerativeAI } from '@google/generative-ai';

async function main() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error('Missing GEMINI_API_KEY');
    return;
  }
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data: any = await response.json();
    if (data.models) {
      console.log('Model Names:');
      for (const m of data.models) {
        console.log(`- ${m.name}`);
      }
    } else {
      console.log('Response:', data);
    }
  } catch (err: any) {
    console.error('Error listing models:', err);
  }
}

main();
