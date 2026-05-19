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
  
  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });
    
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
    
    const parsed = JSON.parse(sanitizedText);
    
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
