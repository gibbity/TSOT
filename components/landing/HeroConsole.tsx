'use client';

import { useState } from 'react';
import { Play, Terminal, Check, Copy, Sparkles } from 'lucide-react';

const EXAMPLES = [
  {
    label: '150ms Speech Chatbot',
    prompt: 'We are building an agentic conversational assistant with response latency under 150ms that guides the user and summarizes all daily tasks automatically.'
  },
  {
    label: 'Hyper-personalized Search',
    prompt: 'A search engine that automatically filters recommendations and answers based on the user’s perceived sentiment profile and preferences.'
  },
  {
    label: 'Agentic Email Summarizer',
    prompt: 'An AI copilot that automatically reads, synthesizes, and drafts replies for all incoming emails without requiring user confirmation.'
  }
];

export default function HeroConsole() {
  const [prompt, setPrompt] = useState(EXAMPLES[0].prompt);
  const [auditing, setAuditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string>(`// Select an example above or write your own, then click "Audit Interface"
// The RAG-backed compliance & design audit will render here in real-time...`);

  const handleCopy = () => {
    navigator.clipboard.writeText(consoleOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAudit = async () => {
    setAuditing(true);
    setConsoleOutput('// Initializing RAG audit...\n// Fetching empirical research & EU AI Act articles...\n// Querying moat backend services...');
    
    try {
      const response = await fetch('/api/moat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'optimize_hci_design',
          prompt: prompt
        })
      });
      const data = await response.json();
      if (data.success && data.result) {
        setConsoleOutput(data.result);
      } else if (data.prompt) {
        setConsoleOutput(`// Backend synthesis fallback.\n// Enrichment matches ${data.retrieved_records?.length || 0} records.\n\n${data.prompt}`);
      } else {
        setConsoleOutput(JSON.stringify(data, null, 2));
      }
    } catch (err: any) {
      setConsoleOutput(`// Audit failed: ${err.message || err}`);
    } finally {
      setAuditing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch select-none">
      
      {/* Console Input Panel (5 Cols) */}
      <div className="lg:col-span-5 bg-white border border-border rounded-[24px] p-6 shadow-sm flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#3a66f5]">
            <Sparkles className="w-5 h-5 fill-[#3a66f5]/10 animate-bounce" />
            <span className="font-sans text-[11px] font-bold uppercase tracking-wider">Interactive Audit Simulator</span>
          </div>
          <h3 className="font-gambarino text-[18px] text-carbon">
            Test Your Design Architecture
          </h3>
          <p className="font-sans text-[12.5px] text-mid-concrete leading-relaxed">
            Choose an example feature below or type your product details to test our RAG database check.
          </p>

          {/* Example Pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => setPrompt(ex.prompt)}
                className={`px-3 py-1.5 rounded-full text-[11.5px] font-sans transition-all duration-300 border cursor-pointer ${
                  prompt === ex.prompt
                    ? 'bg-[#3a66f5]/10 text-[#3a66f5] border-[#3a66f5]/30 font-semibold'
                    : 'bg-neutral-50 text-mid-concrete border-border hover:bg-neutral-100 hover:text-carbon'
                }`}
              >
                {ex.label}
              </button>
            ))}
          </div>

          {/* Text Area */}
          <div className="space-y-2 pt-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="w-full bg-[#fcfcfc] border border-border p-3.5 rounded-[12px] text-[13px] text-carbon font-sans focus:outline-none transition-all focus:border-[#3a66f5] resize-none"
              placeholder="Describe user-interface latency, conversational turns, emotional modeling, or feedback loops..."
            />
          </div>
        </div>

        {/* Button */}
        <button
          onClick={handleAudit}
          disabled={auditing || !prompt.trim()}
          className="w-full flex items-center justify-center gap-2 bg-[#3a66f5] hover:bg-[#254edb] disabled:bg-[#d0d0d0] text-white py-4 rounded-[12px] text-[12px] font-bold uppercase tracking-wider transition-all duration-300 shadow-sm cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          {auditing ? 'Running Auditing Pipeline...' : 'Audit Interface'}
        </button>
      </div>

      {/* Terminal View Panel (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col h-[400px] lg:h-auto">
        <div className="flex items-center justify-between bg-carbon text-[#a0a0a0] px-5 py-4 rounded-t-[16px] border-b border-carbon border-opacity-10 font-mono text-[12px]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF3E00]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#E8A020]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#1A7A4A]" />
            <span className="ml-3 font-bold tracking-wider text-concrete flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              TSOT-AUDIT-OUTPUT
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-stable" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Output
              </>
            )}
          </button>
        </div>
        <div className="flex-grow bg-[#0B0B0B] text-[#00FF66] font-mono text-[12px] p-6 rounded-b-[16px] overflow-auto select-text shadow-inner">
          <pre className="whitespace-pre-wrap leading-relaxed">{consoleOutput}</pre>
        </div>
      </div>

    </div>
  );
}
