'use client';

import { useState, useEffect } from 'react';
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
  Info,
  Key,
  Flame,
  CheckCircle2,
  RefreshCw,
  Lock
} from 'lucide-react';
import UpgradeModal from '@/components/UpgradeModal';

type LangTab = 'curl' | 'javascript' | 'python';

export default function ApiDocsPage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [langTab, setLangTab] = useState<LangTab>('curl');

  // API Key State
  const [activeApiKey, setActiveApiKey] = useState<string>('');
  const [keyPrefix, setKeyPrefix] = useState<string>('');
  const [keyTier, setKeyTier] = useState<string>('free');
  const [dailyLimit, setDailyLimit] = useState<number>(5);
  const [usedCount, setUsedCount] = useState<number>(0);
  const [generatingKey, setGeneratingKey] = useState<boolean>(false);

  // Upgrade Modal State
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);

  // Interactive Console states
  const [consoleTool, setConsoleTool] = useState<'audit_eu_compliance' | 'optimize_hci_design' | 'query_research_moat'>('audit_eu_compliance');
  const [consolePrompt, setConsolePrompt] = useState(
    'We are building an agentic conversational assistant with response latency under 150ms that guides the user and summarizes all daily tasks automatically.'
  );
  const [consoleByokKey, setConsoleByokKey] = useState('');
  const [sending, setSending] = useState(false);
  const [consoleResponse, setConsoleResponse] = useState<string>(
    '// Click "Send API POST Request" below to trigger a live call to /api/moat\n// The live JSON response and rate-limit headers will render here...'
  );

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const [apiDomain, setApiDomain] = useState<string>('https://tsot-research.vercel.app');

  useEffect(() => {
    setApiDomain(window.location.origin);
  }, []);

  // Generate a live API Key
  const handleGenerateKey = async (customLimit: number = 5) => {
    setGeneratingKey(true);
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: 'free',
          dailyLimit: customLimit
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveApiKey(data.apiKey);
        setKeyPrefix(data.keyPrefix);
        setKeyTier(data.tier);
        setDailyLimit(data.dailyLimit);
        setUsedCount(0);
      }
    } catch (err) {
      console.error('Failed to generate key:', err);
    } finally {
      setGeneratingKey(false);
    }
  };

  const getCodeSnippet = (tab: LangTab) => {
    const payload = JSON.stringify({
      tool: consoleTool,
      prompt: consolePrompt,
      byok_key: consoleByokKey || undefined
    }, null, 2);

    const authHeader = activeApiKey ? `  -H "x-api-key: ${activeApiKey}" \\\n` : '';

    if (tab === 'curl') {
      return `curl -X POST "${apiDomain}/api/moat" \\
  -H "Content-Type: application/json" \\
${authHeader}  -d '${payload.replace(/'/g, "'\\''")}'`;
    }
    if (tab === 'javascript') {
      const headersObj: any = { "Content-Type": "application/json" };
      if (activeApiKey) headersObj["x-api-key"] = activeApiKey;

      return `fetch("${apiDomain}/api/moat", {
  method: "POST",
  headers: ${JSON.stringify(headersObj, null, 4)},
  body: JSON.stringify(${payload})
})
.then(res => res.json())
.then(data => console.log(data));`;
    }
    if (tab === 'python') {
      const headersPython = activeApiKey ? `{"Content-Type": "application/json", "x-api-key": "${activeApiKey}"}` : `{"Content-Type": "application/json"}`;
      return `import requests

url = "${apiDomain}/api/moat"
headers = ${headersPython}
payload = ${JSON.stringify(JSON.parse(payload), null, 4)}

response = requests.post(url, headers=headers, json=payload)
data = response.json()
print(data)`;
    }
    return '';
  };

  const handleSendRequest = async () => {
    setSending(true);
    setConsoleResponse('// Sending HTTP POST request to /api/moat...\n// Checking rate limits and querying research ledger...');
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (activeApiKey) {
        headers['x-api-key'] = activeApiKey;
      }

      const response = await fetch('/api/moat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          tool: consoleTool,
          prompt: consolePrompt,
          byok_key: consoleByokKey || undefined
        })
      });

      const data = await response.json();
      setConsoleResponse(JSON.stringify(data, null, 2));

      // If Rate limited (429) or upgradeRequired, trigger Upgrade Modal
      if (response.status === 429 || data.upgradeRequired) {
        setUsedCount(dailyLimit);
        setIsUpgradeModalOpen(true);
      } else if (data.usage) {
        setUsedCount(data.usage.count || 0);
        setDailyLimit(data.usage.limit || dailyLimit);
      } else if (activeApiKey) {
        setUsedCount(prev => Math.min(prev + 1, dailyLimit));
      }

    } catch (err: any) {
      setConsoleResponse(`// HTTP Request Failed:\n// ${err.message || err}`);
    } finally {
      setSending(false);
    }
  };

  // Simulate Exhausting Quota to test 429 block & popup
  const handleSimulateExhaustQuota = async () => {
    // Generate a test key with limit of 1
    setGeneratingKey(true);
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: 'free', dailyLimit: 1 })
      });
      const data = await res.json();
      if (data.success) {
        setActiveApiKey(data.apiKey);
        setKeyPrefix(data.keyPrefix);
        setDailyLimit(1);
        setUsedCount(0);

        // Send 2 requests to trigger 429 block
        setSending(true);
        setConsoleResponse('// Simulating quota exhaustion: Sending Request #1 (1/1 allowed)...');
        await fetch('/api/moat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': data.apiKey },
          body: JSON.stringify({ tool: 'audit_eu_compliance', prompt: 'Simulation call 1' })
        });

        setConsoleResponse('// Simulating quota exhaustion: Sending Request #2 (Quota Exceeded -> Expecting HTTP 429 Block)...');
        const blockedRes = await fetch('/api/moat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': data.apiKey },
          body: JSON.stringify({ tool: 'audit_eu_compliance', prompt: 'Simulation call 2' })
        });

        const blockedData = await blockedRes.json();
        setConsoleResponse(`// 🛑 HTTP 429 QUOTA EXCEEDED BLOCK RECEIVED:\n${JSON.stringify(blockedData, null, 2)}`);
        setUsedCount(1);
        setIsUpgradeModalOpen(true);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setGeneratingKey(false);
      setSending(false);
    }
  };

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-12 select-none">
      
      {/* Upgrade & Rate Limit Popup Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentCount={usedCount >= dailyLimit ? dailyLimit : usedCount}
        limit={dailyLimit}
        tier={keyTier}
        onUpgradeSuccess={() => {
          setKeyTier('pro');
          setDailyLimit(500);
          setUsedCount(0);
        }}
      />

      {/* Page Header */}
      <div className="border-b border-border pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
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

        {/* Upgrade Button in Header */}
        <button
          onClick={() => setIsUpgradeModalOpen(true)}
          className="px-5 py-3 rounded-[12px] bg-[#3a66f5] hover:bg-[#254edb] text-white font-sans text-[12.5px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>View Pro Quotas ($49/mo)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LEFT COLUMN: API SPEC & DOCUMENTATION (7 Cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* API KEY & QUOTA CARD */}
          <div className="border border-border rounded-[24px] bg-[#f9f9fb] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-carbon">
                <Key className="w-5 h-5 text-[#3a66f5]" />
                <h3 className="font-gambarino text-[18px]">API Key & Live Quota Manager</h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider ${
                keyTier === 'pro' ? 'bg-purple-100 text-purple-700' : 'bg-neutral-200 text-neutral-700'
              }`}>
                Tier: {keyTier}
              </span>
            </div>

            {activeApiKey ? (
              <div className="space-y-4 pt-2">
                <div className="bg-white border border-border p-3.5 rounded-[12px] flex items-center justify-between font-mono text-[12px]">
                  <div>
                    <span className="text-neutral-400 text-[10.5px] block font-sans uppercase">Active Live Key</span>
                    <span className="text-carbon font-bold select-all">{activeApiKey}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(activeApiKey, 'active_key')}
                    className="p-2 hover:bg-neutral-100 rounded-[8px] text-neutral-600 cursor-pointer"
                  >
                    {copiedSection === 'active_key' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Quota Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11.5px] font-sans">
                    <span className="text-neutral-500">Daily Requests Used:</span>
                    <span className="font-bold text-carbon">{usedCount} / {dailyLimit} reqs</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${
                        usedCount >= dailyLimit ? 'bg-red-500' : 'bg-[#3a66f5]'
                      }`}
                      style={{ width: `${Math.min(100, (usedCount / dailyLimit) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => handleGenerateKey(5)}
                    disabled={generatingKey}
                    className="px-3 py-2 bg-white border border-border hover:bg-neutral-50 rounded-[10px] text-[11.5px] font-bold text-neutral-700 cursor-pointer"
                  >
                    Regenerate Key (Limit 5)
                  </button>
                  <button
                    onClick={handleSimulateExhaustQuota}
                    disabled={generatingKey || sending}
                    className="px-3.5 py-2 bg-amber-50 border border-amber-300 hover:bg-amber-100 rounded-[10px] text-[11.5px] font-bold text-amber-800 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-600" />
                    Simulate Limit Exceeded & Test 429 Popup
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <p className="font-sans text-[13px] text-mid-concrete leading-relaxed">
                  Generate a sandbox API key to test authenticated requests and rate-limiting limits.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleGenerateKey(5)}
                    disabled={generatingKey}
                    className="px-4 py-2.5 bg-[#3a66f5] hover:bg-[#254edb] text-white rounded-[12px] text-[12px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {generatingKey ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                    <span>Generate Free API Key (5 req/day)</span>
                  </button>
                  <button
                    onClick={handleSimulateExhaustQuota}
                    disabled={generatingKey || sending}
                    className="px-4 py-2.5 bg-neutral-900 hover:bg-black text-amber-400 rounded-[12px] text-[12px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Test 429 Rate Limit Block & Popup</span>
                  </button>
                </div>
              </div>
            )}
          </div>

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
            <h3 className="font-gambarino text-[18px] text-carbon mb-4">Request Headers & Parameters</h3>
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
                    <td className="py-3 pr-4 font-mono font-bold text-carbon">x-api-key</td>
                    <td className="py-3 px-4 font-mono text-[#3a66f5]">Header</td>
                    <td className="py-3 px-4 font-semibold text-mid-concrete">Optional</td>
                    <td className="py-3 pl-4 text-mid-concrete leading-relaxed">
                      Your live API key (e.g. <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-[11px]">tsot_live_...</code>) for server-side rate tracking and Pro access.
                    </td>
                  </tr>
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
                      Provide a personal Gemini key. If provided (or configured on server), executes synthesis and outputs the final result.
                    </td>
                  </tr>
                </tbody>
              </table>
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
                className="absolute right-4 top-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-[8px] flex items-center gap-1 text-[11px] font-bold uppercase transition-all cursor-pointer"
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
              Formulate your POST parameters, test your active API key, and trigger live REST calls to `/api/moat`.
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
