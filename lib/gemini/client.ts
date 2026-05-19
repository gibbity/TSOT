import { GoogleGenerativeAI } from '@google/generative-ai';

export function getGeminiModel(customKey?: string) {
  const key = customKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('Gemini API key is required. Provide GEMINI_API_KEY in environment or via BYOK.');
  }
  const ai = new GoogleGenerativeAI(key);
  
  // Default to gemini-2.0-flash or gemini-1.5-flash if none specified, 
  // but allow custom override like gemini-3.1-flash-lite
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  return ai.getGenerativeModel({ model: modelName });
}
