import { GoogleGenerativeAI } from '@google/generative-ai';

async function main() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error('Missing GEMINI_API_KEY');
    return;
  }
  const ai = new GoogleGenerativeAI(key);
  try {
    // List models using fetch directly or SDK
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();
    console.log('Available models:', JSON.stringify(data, null, 2));
  } catch (err: any) {
    console.error('Error listing models:', err);
  }
}

main();
