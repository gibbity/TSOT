import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { RegistryRecord } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { records, queryText, chatHistory } = await req.json();

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: 'No records provided for synthesis.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 500 });
    }

    const ai = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    const model = ai.getGenerativeModel({ model: modelName });

    // Build context prompt
    const recordsContext = records
      .map((r, i) => `Record #${i + 1} [${r.code}]
Pillar: ${r.pillar}
Title: ${r.title}
Summary: ${r.human_summary}
Metric: ${r.metric}
Verdict: ${r.verdict}`)
      .join('\n\n---\n\n');

    const systemPrompt = `You are a Senior HCI Research Librarian at The Sign of Times (TSOT).
Your task is to write cohesive, objective, and dense scientific answers and syntheses based ONLY on the provided research records context.

[TSOT REGISTRY RECORDS CONTEXT]
${recordsContext}

[INSTRUCTIONS]
1. **Cohesive Synthesis**: Synthesize findings when asked. Identify the overlapping cognitive vulnerabilities (e.g. trust calibration, memory decay, attention fragmentation) across these papers.
2. **Strict Citations**: You MUST cite the paper codes inline. When discussing a metric or finding, explicitly use the format \`#CODE\` (e.g., #SOT-COMP-2026). Do NOT use markdown links, just the bare citation.
3. **Tone**: Maintain a stark, empirical, brutalist academic tone. Avoid marketing fluff, speculation, or subjective validation words.
4. **Formatting**: Use clean Markdown with headers. Do NOT use XML tags.`;

    const chatContents: any[] = [];
    chatContents.push({ role: 'user', parts: [{ text: systemPrompt }] });
    chatContents.push({ role: 'model', parts: [{ text: "Understood. I will act as the TSOT Senior Research Librarian, using ONLY the provided records to answer the user's questions and provide clear syntheses with #CODE citations." }] });

    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach((msg: any) => {
        chatContents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      });
    } else {
      // First turn
      chatContents.push({
        role: 'user',
        parts: [{ text: `Please write a comprehensive, cohesive synthesis of the matching research records for the topic query: "${queryText || 'General Registry Search'}". Synthesize the verdicts from the papers into a unified, sprint-ready recommendation band at the bottom.` }]
      });
    }

    const streamResult = await model.generateContentStream({
      contents: chatContents
    });

    const encoder = new TextEncoder();
    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResult.stream) {
            const chunkText = chunk.text();
            controller.enqueue(encoder.encode(chunkText));
          }
        } catch (err: any) {
          controller.enqueue(encoder.encode(`\n[STREAM ERROR]: ${err.message}`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(responseStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error: any) {
    console.error('Synthesis API error:', error);
    return NextResponse.json({ error: error.message || 'Server error occurred' }, { status: 500 });
  }
}
