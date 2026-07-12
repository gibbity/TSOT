'use client';

import { useState } from 'react';
import { 
  Copy, 
  Check, 
  Terminal, 
  Play, 
  Cpu, 
  Zap, 
  Code, 
  Server, 
  ShieldAlert, 
  ExternalLink,
  Info
} from 'lucide-react';

type LangTab = 'curl' | 'javascript' | 'python';

export default function ApiDocsPage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [langTab, setLangTab] = useState<LangTab>('curl');

  // Interactive Console states
  const [consoleTool, setConsoleTool] = useState<'audit_eu_compliance' | 'optimize_hci_design' | 'query_research_moat'>('audit_eu_compliance');
  const [consolePrompt, setConsolePrompt] = useState(
    'We are building an agentic conversational assistant with response latency under 150ms that guides the user and summarizes all daily tasks automatically.'
  );
  const [consoleByokKey, setConsoleByokKey] = useState('');
  const [sending, setSending] = useState(false);
  const [consoleResponse, setConsoleResponse] = useState<string>(
    '// Click "Send API POST Request" above to trigger a live call to /api/moat\n// The live JSON response will render here...'
  );

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const getCodeSnippet = (tab: LangTab) => {
    const apiDomain = typeof window !== 'undefined' ? window.location.origin : 'https://your-site.vercel.app';
    const payload = JSON.stringify({
      tool: consoleTool,
      prompt: consolePrompt,
      byok_key: consoleByokKey || undefined
    }, null, 2);

    if (tab === 'curl') {
      return `curl -X POST "${apiDomain}/api/moat" \\
  -H "Content-Type: application/json" \\
  -d '${payload.replace(/'/g, "'\\''")}'`;
    }
    if (tab === 'javascript') {
      return `fetch("${apiDomain}/api/moat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(${payload})
})
.then(res => res.json())
.then(data => console.log(data));`;
    }
    if (tab === 'python') {
      return `import requests

url = "${apiDomain}/api/moat"
payload = ${JSON.stringify(JSON.parse(payload), null, 4)}

response = requests.post(url, json=payload)
data = response.json()
print(data)`;
    }
    return '';
  };

  const handleSendRequest = async () => {
    setSending(true);
    setConsoleResponse('// Sending HTTP POST request to /api/moat...\n// Awaiting response from serverless RAG pipeline...');
    try {
      const response = await fetch('/api/moat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: consoleTool,
          prompt: consolePrompt,
          byok_key: consoleByokKey || undefined
        })
      });
      const data = await response.json();
      setConsoleResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setConsoleResponse(`// HTTP Request Failed:\n// ${err.message || err}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-12 select-none">
      
      {/* Page Header */}
      <div className="border-b border-border pb-8 mb-10">
        <div className="flex items-center gap-2.5 text-[#3a66f5] mb-2">
          <Server className="w-6 h-6 animate-pulse" />
          <span className="font-sans text-[12px] font-bold uppercase tracking-widest">Developer REST API</span>
        </div>
        <h1 className="font-gambarino text-[32px] md:text-[44px] leading-tight text-carbon">
          TSOT Developer API Docs
        </h1>
        <p className="font-sans text-[15px] text-mid-concrete mt-2 max-w-[800px] leading-relaxed">
          Expose compliance validation, empirical HCI checks, and research database queries to your own codebases, Slackbots, or CI/CD pipelines using our stateless POST endpoint.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LEFT COLUMN: API SPEC & DOCUMENTATION (7 Cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Base Endpoint Spec */}
          <div className="border border-border rounded-[20px] bg-white p-6 shadow-sm">
            <h3 className="font-gambarino text-[18px] text-carbon mb-3">Endpoint Specification</h3>
            <div className="flex items-center gap-3 font-mono text-[13px] bg-neutral-900 text-white p-3.5 rounded-[12px]">
              <span className="bg-[#3a66f5] px-2 py-0.5 rounded text-[11px] font-bold uppercase">POST</span>
              <span className="text-neutral-300">/api/moat</span>
            </div>
            <p className="font-sans text-[13px] text-mid-concrete mt-3 leading-relaxed">
              Exposes the backend RAG pipeline. This endpoint matches compliance rules and empirical papers to your query, and formats the output context instructions.
            </p>
          </div>

          {/* Request Parameters */}
          <div className="border border-border rounded-[20px] bg-white p-6 shadow-sm">
            <h3 className="font-gambarino text-[18px] text-carbon mb-4">Request Parameters</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-[13px]">
                <thead>
                  <tr className="border-b border-carbon text-mid-concrete font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 pr-4">FIELD</th>
                    <th className="py-2.5 px-4">TYPE</th>
                    <th className="py-2.5 px-4">REQUIRED</th>
                    <th className="py-2.5 pl-4">DESCRIPTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-3 pr-4 font-mono font-bold text-carbon">tool</td>
                    <td className="py-3 px-4 font-mono text-[#3a66f5]">string</td>
                    <td className="py-3 px-4 font-semibold text-red-600">Yes</td>
                    <td className="py-3 pl-4 text-mid-concrete leading-relaxed">
                      One of: <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-[11px]">audit_eu_compliance</code>, <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-[11px]">optimize_hci_design</code>, or <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-[11px]">query_research_moat</code>.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono font-bold text-carbon">prompt</td>
                    <td className="py-3 px-4 font-mono text-[#3a66f5]">string</td>
                    <td className="py-3 px-4 font-semibold text-red-600">Yes</td>
                    <td className="py-3 pl-4 text-mid-concrete leading-relaxed">
                      The detailed description to audit (or query/dilemma to resolve).
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono font-bold text-carbon">byok_key</td>
                    <td className="py-3 px-4 font-mono text-[#3a66f5]">string</td>
                    <td className="py-3 px-4 font-semibold text-mid-concrete">Optional</td>
                    <td className="py-3 pl-4 text-mid-concrete leading-relaxed">
                      Provide a personal Gemini key. If provided (or if configured on the server), the endpoint executes RAG synthesis and outputs the final result.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Response Format */}
          <div className="border border-border rounded-[20px] bg-white p-6 shadow-sm">
            <h3 className="font-gambarino text-[18px] text-carbon mb-4">Response Fields</h3>
            <div className="space-y-4 font-sans text-[13px]">
              <div className="flex border-b border-border pb-3">
                <div className="w-[150px] font-mono font-bold text-carbon">success</div>
                <div className="w-[100px] font-mono text-[#3a66f5]">boolean</div>
                <div className="flex-1 text-mid-concrete">Indicates whether the API executed successfully.</div>
              </div>
              <div className="flex border-b border-border pb-3">
                <div className="w-[150px] font-mono font-bold text-carbon">prompt</div>
                <div className="w-[100px] font-mono text-[#3a66f5]">string</div>
                <div className="flex-1 text-mid-concrete">The context-enriched RAG instruction prompt. Use this to run LLM synthesis client-side for $0 host token cost.</div>
              </div>
              <div className="flex border-b border-border pb-3">
                <div className="w-[150px] font-mono font-bold text-carbon">result</div>
                <div className="w-[100px] font-mono text-[#3a66f5]">string | null</div>
                <div className="flex-1 text-mid-concrete">The fully synthesized XML report from the Gemini model (present if API keys are configured).</div>
              </div>
              <div className="flex pb-2">
                <div className="w-[150px] font-mono font-bold text-carbon">retrieved_records</div>
                <div className="w-[100px] font-mono text-[#3a66f5]">array</div>
                <div className="flex-1 text-mid-concrete">List of RAG registry and regulatory articles matched by embedding similarity scores.</div>
              </div>
            </div>
          </div>

          {/* Code Snippets Section */}
          <div className="border border-border rounded-[20px] bg-white overflow-hidden shadow-sm">
            <div className="bg-[#fcfcfc] border-b border-border p-4 flex items-center justify-between">
              <span className="font-gambarino text-[15px] text-carbon">Code Snippet Library</span>
              <div className="flex bg-neutral-100 p-1 rounded-[8px]">
                <button
                  onClick={() => setLangTab('curl')}
                  className={`px-3 py-1 text-[11px] font-bold rounded-[6px] uppercase tracking-wider transition-colors ${
                    langTab === 'curl' ? 'bg-white text-carbon shadow-sm' : 'text-mid-concrete hover:text-carbon'
                  }`}
                >
                  cURL
                </button>
                <button
                  onClick={() => setLangTab('javascript')}
                  className={`px-3 py-1 text-[11px] font-bold rounded-[6px] uppercase tracking-wider transition-colors ${
                    langTab === 'javascript' ? 'bg-white text-carbon shadow-sm' : 'text-mid-concrete hover:text-carbon'
                  }`}
                >
                  Fetch (JS)
                </button>
                <button
                  onClick={() => setLangTab('python')}
                  className={`px-3 py-1 text-[11px] font-bold rounded-[6px] uppercase tracking-wider transition-colors ${
                    langTab === 'python' ? 'bg-white text-carbon shadow-sm' : 'text-mid-concrete hover:text-carbon'
                  }`}
                >
                  Python
                </button>
              </div>
            </div>
            <div className="p-6 relative bg-neutral-900">
              <button
                onClick={() => handleCopy(getCodeSnippet(langTab), 'snippet')}
                className="absolute right-4 top-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-[8px] flex items-center gap-1 text-[11px] font-bold uppercase transition-all"
              >
                {copiedSection === 'snippet' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-stable" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Code
                  </>
                )}
              </button>
              <pre className="text-[#00FF66] font-mono text-[11.5px] overflow-x-auto whitespace-pre leading-relaxed select-text">
                {getCodeSnippet(langTab)}
              </pre>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE CONSOLE (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-border rounded-[24px] p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-gambarino text-[18px] text-carbon mb-1">Interactive Sandbox Console</h3>
            <p className="font-sans text-[12.5px] text-mid-concrete leading-relaxed">
              Formulate your POST parameters, input optional personal keys, and trigger a live REST call to `/api/moat`.
            </p>
          </div>

          {/* Select Tool */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3a66f5]">
              Target Tool (tool)
            </label>
            <select
              value={consoleTool}
              onChange={(e) => setConsoleTool(e.target.value as any)}
              className="w-full bg-[#fcfcfc] border border-border p-3.5 rounded-[12px] text-[13px] text-carbon font-semibold focus:outline-none transition-all focus:border-[#3a66f5]"
            >
              <option value="audit_eu_compliance">audit_eu_compliance (Compliance Auditor)</option>
              <option value="optimize_hci_design">optimize_hci_design (UX Design Optimizer)</option>
              <option value="query_research_moat">query_research_moat (Dilemma QA Solver)</option>
            </select>
          </div>

          {/* Design Prompt */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon">
              Prompt/Query Value (prompt)
            </label>
            <textarea
              value={consolePrompt}
              onChange={(e) => setConsolePrompt(e.target.value)}
              rows={4}
              className="w-full bg-[#fcfcfc] border border-border p-3.5 rounded-[12px] text-[13px] text-carbon resize-none font-sans focus:outline-none transition-all focus:border-[#3a66f5]"
              placeholder="Describe your design parameters or type your query..."
            />
          </div>

          {/* BYOK Key */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon flex items-center justify-between">
              <span>Personal Gemini API Key (byok_key)</span>
              <span className="text-[10px] text-emerald-600 font-semibold normal-case">Optional</span>
            </label>
            <input
              type="password"
              value={consoleByokKey}
              onChange={(e) => setConsoleByokKey(e.target.value)}
              className="w-full bg-[#fcfcfc] border border-border p-3.5 rounded-[12px] text-[13px] text-carbon focus:outline-none transition-all focus:border-[#3a66f5] font-mono"
              placeholder="Provide to test serverless synthesis (not stored)..."
            />
          </div>

          {/* Send Request Button */}
          <button
            onClick={handleSendRequest}
            disabled={sending || !consolePrompt.trim()}
            className="w-full flex items-center justify-center gap-2 bg-[#3a66f5] hover:bg-[#254edb] disabled:bg-[#d0d0d0] text-white py-4 rounded-[12px] text-[12px] font-bold uppercase tracking-wider transition-all duration-300 shadow-sm cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            {sending ? 'Sending POST Request...' : 'Send API POST Request'}
          </button>

          {/* Response Terminal */}
          <div className="flex flex-col h-[280px]">
            <div className="flex items-center justify-between bg-carbon text-[#a0a0a0] px-4 py-2.5 rounded-t-[12px] border-b border-carbon border-opacity-10 font-mono text-[11px]">
              <span className="font-bold tracking-wider">RESPONSE CONSOLE</span>
              <button
                onClick={() => handleCopy(consoleResponse, 'console_resp')}
                className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedSection === 'console_resp' ? (
                  <>
                    <Check className="w-3 h-3 text-stable" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy JSON
                  </>
                )}
              </button>
            </div>
            <div className="flex-grow bg-[#0B0B0B] text-[#00FF66] font-mono text-[11.5px] p-4 rounded-b-[12px] overflow-auto select-text shadow-inner">
              <pre className="whitespace-pre-wrap leading-relaxed">{consoleResponse}</pre>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
