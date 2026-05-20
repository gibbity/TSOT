import { getGeminiModel } from './client';
import { INGESTION_SYSTEM_PROMPT } from '../prompts/ingestion';
import { IngestedPaper } from '@/types';

interface InputPaper {
  title: string;
  abstract: string;
  year: number | null;
  authors: string | null;
  sourceUrl: string | null;
}

export async function ingestPapersBatch(
  papers: InputPaper[]
): Promise<Array<IngestedPaper & { original: InputPaper }>> {
  if (papers.length === 0) return [];
  
  const model = getGeminiModel();
  
  // Format the papers as context
  const context = papers
    .map((p, idx) => `[Paper ${idx}]\nTITLE: ${p.title}\nABSTRACT: ${p.abstract}`)
    .join('\n\n---\n\n');
    
  const prompt = `${INGESTION_SYSTEM_PROMPT}\n\nProcess these ${papers.length} papers. Return a JSON array of results matching the order and count of the provided papers. If a paper is not relevant, return { "isRelevant": false } for that index.\n\n${context}`;
  
  let result;
  let retries = 3;
  let delay = 2000;
  
  while (retries > 0) {
    try {
      result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
          maxOutputTokens: 8192,
        },
      });
      break;
    } catch (error: any) {
      retries--;
      if (retries === 0) {
        console.error('Failed to ingest papers batch via Gemini after retries:', error);
        throw error;
      }
      console.warn(`⚠️ Gemini API returned error: ${error.message}. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  if (!result) {
    throw new Error('Gemini API returned no result.');
  }

  try {
    const text = result.response.text();
    
    // Quick sanitize to handle potential markdown backticks in output
    let sanitizedText = text.trim();
    if (sanitizedText.startsWith('```json')) {
      sanitizedText = sanitizedText.substring(7);
    }
    if (sanitizedText.endsWith('```')) {
      sanitizedText = sanitizedText.substring(0, sanitizedText.length - 3);
    }
    sanitizedText = sanitizedText.trim();
    
    let parsed: any[];
    try {
      parsed = JSON.parse(sanitizedText);
    } catch (parseErr) {
      // Gemini truncated the JSON — attempt to recover all complete objects
      console.warn(`⚠️  JSON truncated by Gemini. Attempting partial recovery...`);
      // Find the last closing } that belongs to a complete array element
      const lastClose = sanitizedText.lastIndexOf('}');
      if (lastClose === -1) throw parseErr;
      const truncated = sanitizedText.substring(0, lastClose + 1);
      // Re-wrap as a valid JSON array
      const recovered = truncated.startsWith('[') ? truncated + ']' : '[' + truncated + ']';
      try {
        parsed = JSON.parse(recovered);
        console.warn(`✅ Partial recovery succeeded: recovered ${parsed.length} paper(s) from truncated output.`);
      } catch {
        throw parseErr; // give up, throw the original error
      }
    }
    
    if (!Array.isArray(parsed)) {
      throw new Error('Gemini did not return an array of results.');
    }
    
    const output: Array<IngestedPaper & { original: InputPaper }> = [];
    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i];
      if (item && i < papers.length) {
        output.push({
          ...item,
          original: papers[i]
        });
      }
    }
    return output;
  } catch (error) {
    console.error('Failed to ingest papers batch via Gemini:', error);
    throw error;
  }
}
