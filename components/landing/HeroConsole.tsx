'use client';

import { useState } from 'react';
import { Play, Terminal, Check, Copy, Sparkles, Scale, ShieldAlert } from 'lucide-react';

const EXAMPLES = [
  {
    label: 'EU Act: Emotion Bot',
    prompt: 'We are building a conversational customer support bot that simulates human emotional empathy, validates user feelings, and does not explicitly declare itself as an AI system during chat.',
    type: 'compliance'
  },
  {
    label: 'EU Act: Subliminal Engagement',
    prompt: 'An AI-driven interface that deploys subliminal audio-visual cues and engagement reminders below the user’s conscious threshold to guide habit building and retention.',
    type: 'compliance'
  },
  {
    label: 'Ledger: Cognitive Offloading',
    prompt: 'An agentic writing assistant that reads user documents, automatically summarizes findings, and drafts replies for all tasks without requiring manual review checkpoints.',
    type: 'design'
  }
];

export default function HeroConsole() {
  const [activeEx, setActiveEx] = useState(EXAMPLES[0]);
  const [prompt, setPrompt] = useState(EXAMPLES[0].prompt);
  const [auditing, setAuditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string>(`// Select an example preset above or enter your own product details, then click "Audit Interface"
// The document-grounded compliance & design audit will render here in real-time...`);

  const handleCopy = () => {
    navigator.clipboard.writeText(consoleOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectExample = (ex: typeof EXAMPLES[0]) => {
    setActiveEx(ex);
    setPrompt(ex.prompt);
  };

  const handleAudit = async () => {
    setAuditing(true);
    setConsoleOutput('// Initializing document-gated audit...\n// Querying research databases & EU AI Act articles...\n// Performing re-ranking and synthesis...');
    
    try {
      const toolToRun = activeEx.type === 'compliance' ? 'audit_eu_compliance' : 'optimize_hci_design';
      const response = await fetch('/api/moat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: toolToRun,
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch select-none font-['Google_Sans']">
      
      {/* Console Input Panel (5 Cols) */}
      <div className="lg:col-span-5 bg-white border border-border rounded-[16px] p-4 shadow-xs flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-[#5a018a]">
            <Sparkles className="w-4 h-4 fill-[#5a018a]/10" />
            <span className="font-['Google_Sans'] text-[10px] font-bold uppercase tracking-wider">Audit Simulator</span>
          </div>
          <h3 className="text-[15px] font-medium text-black">
            Test Your System
          </h3>
          <p className="text-[11.5px] text-mid-concrete leading-relaxed">
            Select one of our preset compliance or design scenarios, or write a custom description to run a live audit.
          </p>

          {/* Example Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => handleSelectExample(ex)}
                className={`px-2.5 py-1 rounded-full text-[10.5px] font-['Google_Sans'] transition-all border cursor-pointer ${
                  prompt === ex.prompt
                    ? ex.type === 'compliance'
                      ? 'bg-red-50 text-red-600 border-red-200 font-semibold'
                      : 'bg-blue-50 text-blue-600 border-blue-200 font-semibold'
                    : 'bg-neutral-50 text-mid-concrete border-border hover:bg-neutral-100 hover:text-black'
                }`}
              >
                {ex.label}
              </button>
            ))}
          </div>

          {/* Text Area */}
          <div className="pt-1">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full bg-[#fcfcfc] border border-border p-2.5 rounded-[10px] text-[12px] text-carbon font-['Google_Sans'] focus:outline-none transition-all focus:border-[#5a018a] resize-none"
              placeholder="Describe user-interface latency, conversational turns, emotional modeling, or feedback loops..."
            />
          </div>
        </div>

        {/* Button */}
        <button
          onClick={handleAudit}
          disabled={auditing || !prompt.trim()}
          className="w-full flex items-center justify-center gap-1.5 bg-[#5a018a] hover:bg-[#430166] disabled:bg-[#d0d0d0] text-white py-2.5 rounded-[10px] text-[11px] font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          {auditing ? 'Running Auditing Pipeline...' : 'Audit Interface'}
        </button>
      </div>

      {/* Terminal View Panel (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col h-[320px] lg:h-auto">
        <div className="flex items-center justify-between bg-carbon text-[#a0a0a0] px-4 py-2.5 rounded-t-[12px] border-b border-carbon border-opacity-10 font-mono text-[10.5px]">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#FF3E00]" />
            <div className="w-2 h-2 rounded-full bg-[#E8A020]" />
            <div className="w-2 h-2 rounded-full bg-[#1A7A4A]" />
            <span className="ml-2 font-bold tracking-wider text-concrete flex items-center gap-1">
              <Terminal className="w-3 h-3" />
              TSOT-AUDIT-OUTPUT
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-stable" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy Output
              </>
            )}
          </button>
        </div>
        <div className="flex-grow bg-[#0B0B0B] text-[#00FF66] font-mono text-[11px] p-4 rounded-b-[12px] overflow-auto select-text shadow-inner">
          <pre className="whitespace-pre-wrap leading-relaxed">{consoleOutput}</pre>
        </div>
      </div>

    </div>
  );
}
