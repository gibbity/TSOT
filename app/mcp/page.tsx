'use client';

import { useState } from 'react';
import { 
  Copy, 
  Check, 
  Terminal, 
  Settings, 
  Play, 
  FileText, 
  BookOpen, 
  Cpu,
  HelpCircle,
  Code
} from 'lucide-react';

export default function McpIntegrationPage() {
  const [activeTab, setActiveTab] = useState<'setup' | 'sandbox'>('setup');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Sandbox Form States
  const [selectedTool, setSelectedTool] = useState<'search_registry' | 'search_ai_act' | 'get_record' | 'audit_product'>('search_registry');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPillar, setSearchPillar] = useState('ALL');
  const [searchCategory, setSearchCategory] = useState('ALL');
  const [searchLimit, setSearchLimit] = useState(5);
  const [recordCode, setRecordCode] = useState('SOT-COMP-2026');
  const [recordSource, setRecordSource] = useState('both');
  const [auditPrompt, setAuditPrompt] = useState('We are building an agentic conversational assistant with response latency under 150ms that guides the user and summarizes all daily tasks automatically.');
  const [auditSource, setAuditSource] = useState('both');

  // Execution States
  const [executing, setExecuting] = useState(false);
  const [output, setOutput] = useState<string>('// Select a tool, fill in parameters, and click "Execute Tool Simulation" to view the response here...');

  // Copy helper
  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Run Sandbox Simulation
  const handleExecute = async () => {
    setExecuting(true);
    setOutput('// Executing tool command. Initializing RAG pipeline...\n// Waiting for response from TSOT API services...');
    
    try {
      if (selectedTool === 'search_registry') {
        const queryParams = new URLSearchParams({
          q: searchQuery,
          pillar: searchPillar,
          source: 'corpus',
          limit: String(searchLimit)
        });
        const res = await fetch(`/api/search?${queryParams.toString()}`);
        const data = await res.json();
        setOutput(JSON.stringify(data.records || data, null, 2));
      } 
      else if (selectedTool === 'search_ai_act') {
        const queryParams = new URLSearchParams({
          q: searchQuery,
          pillar: searchCategory, // Database maps category filter to pillar in get API search
          source: 'ai_act',
          limit: String(searchLimit)
        });
        const res = await fetch(`/api/search?${queryParams.toString()}`);
        const data = await res.json();
        setOutput(JSON.stringify(data.records || data, null, 2));
      } 
      else if (selectedTool === 'get_record') {
        // We call search API to find specific code or query
        const queryParams = new URLSearchParams({
          q: recordCode,
          source: recordSource === 'both' ? 'corpus' : recordSource, // Fallback search query
          limit: '1'
        });
        const res = await fetch(`/api/search?${queryParams.toString()}`);
        const data = await res.json();
        const recordsList = data.records || [];
        const exactRecord = recordsList.find((r: any) => r.code.toUpperCase() === recordCode.toUpperCase());
        if (exactRecord) {
          setOutput(JSON.stringify(exactRecord, null, 2));
        } else if (recordsList.length > 0) {
          setOutput(`// No exact code match found in database. Showing closest result:\n${JSON.stringify(recordsList[0], null, 2)}`);
        } else {
          setOutput(`{\n  "error": "Record with code '${recordCode}' not found in active ledger."\n}`);
        }
      } 
      else if (selectedTool === 'audit_product') {
        const res = await fetch('/api/auditor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: auditPrompt,
            source: auditSource,
            tier: 'pro'
          })
        });
        const data = await res.text();
        setOutput(data);
      }
    } catch (err: any) {
      setOutput(`// Error executing tool simulation:\n// ${err.message || err}`);
    } finally {
      setExecuting(false);
    }
  };

  const claudeConfigText = `{
  "mcpServers": {
    "tsot-mcp-server": {
      "command": "npx",
      "args": [
        "tsx",
        "c:/Users/kushr/.gemini/antigravity/scratch/tsot/scratch/mcp_server.ts"
      ],
      "env": {
        "NEXT_PUBLIC_SUPABASE_URL": "https://mdjckkbpbqmivatxdpcx.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "YOUR_SUPABASE_SERVICE_ROLE_KEY",
        "GEMINI_API_KEY": "YOUR_GEMINI_API_KEY",
        "GEMINI_MODEL": "gemini-3.1-flash-lite"
      }
    }
  }
}`;

  const cursorConfigCmd = `npx tsx --env-file="c:/Users/kushr/.gemini/antigravity/scratch/tsot/.env.local" "c:/Users/kushr/.gemini/antigravity/scratch/tsot/scratch/mcp_server.ts"`;

  const vercelConfigText = `{
  "mcpServers": {
    "tsot-mcp-server": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://your-site.vercel.app/api/mcp"
      ]
    }
  }
}`;

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-12">
      {/* Editorial Header */}
      <div className="border-b border-border pb-8 mb-10">
        <h1 className="font-gambarino text-[32px] md:text-[44px] leading-tight text-carbon">
          Model Context Protocol (MCP) Integration
        </h1>
        <p className="font-sans text-[15px] text-mid-concrete mt-2 max-w-[800px]">
          Equip your local AI instances, editors, and workflows with the direct ability to search the TSOT Research Ledger, inspect regulatory compliance articles, and run high-fidelity adversarial design audits.
        </p>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-border mb-8">
        <button
          onClick={() => setActiveTab('setup')}
          className={`flex items-center gap-2 py-4 px-6 font-gambarino text-[16px] border-b-2 tracking-wide transition-all ${
            activeTab === 'setup'
              ? 'border-[#3a66f5] text-[#3a66f5]'
              : 'border-transparent text-carbon hover:text-[#3a66f5]'
          }`}
        >
          <Settings className="w-4 h-4" />
          Configuration & Setup
        </button>
        <button
          onClick={() => setActiveTab('sandbox')}
          className={`flex items-center gap-2 py-4 px-6 font-gambarino text-[16px] border-b-2 tracking-wide transition-all ${
            activeTab === 'sandbox'
              ? 'border-[#3a66f5] text-[#3a66f5]'
              : 'border-transparent text-carbon hover:text-[#3a66f5]'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Interactive Sandbox
        </button>
      </div>

      {/* TAB CONTENT: SETUP */}
      {activeTab === 'setup' && (
        <div className="space-y-12">
          {/* Overview Banner */}
          <div className="bg-[#f8f8f8] rounded-[22px] shadow-[5px_7px_4px_0px_rgba(0,0,0,0.15)] p-8 border border-border flex flex-col md:flex-row gap-6 items-start">
            <div className="bg-[#3a66f5] bg-opacity-10 p-4 rounded-[16px] text-[#3a66f5]">
              <Cpu className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-gambarino text-[18px] text-carbon mb-2">What is the TSOT MCP Server?</h3>
              <p className="font-sans text-[14px] text-mid-concrete leading-relaxed max-w-[850px]">
                The Model Context Protocol (MCP) is an open standard that allows LLMs to run tools, query databases, and read resources securely. Our MCP server runs as a background process communicating either locally over standard I/O (stdio) or over the web using Server-Sent Events (SSE). It connects directly to the TSOT Supabase database and Gemini APIs, allowing your AI agents to consult human-AI research findings in real time.
              </p>
            </div>
          </div>

          {/* Config Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Claude Desktop Card */}
            <div className="bg-white border border-border rounded-[22px] p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-orange-500 bg-opacity-10 text-orange-600 px-3 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider">
                    Claude Desktop
                  </span>
                  <h4 className="font-gambarino text-[16px] text-carbon">Claude Local (Stdio)</h4>
                </div>
                <p className="font-sans text-[13px] text-mid-concrete mb-4">
                  Add this block to your local Claude Desktop config file: <code className="bg-[#f2f0eb] px-1.5 py-0.5 rounded text-[12px] font-mono">%APPDATA%\Claude\claude_desktop_config.json</code> (Windows) or <code className="bg-[#f2f0eb] px-1.5 py-0.5 rounded text-[12px] font-mono">~/Library/Application Support/Claude/claude_desktop_config.json</code> (Mac).
                  <br />
                  <span className="text-emerald-600 font-semibold text-[11px] mt-1.5 block">
                    ✓ GEMINI_API_KEY is optional (falls back to Full-Text Search and delegates synthesis to Claude’s active key).
                  </span>
                </p>
                <div className="relative bg-[#0b0b0b] rounded-[12px] p-4 text-[#e0ded8] font-mono text-[11px] overflow-auto h-[240px] border border-border border-opacity-20 select-text">
                  <pre>{claudeConfigText}</pre>
                </div>
              </div>
              <button
                onClick={() => handleCopy(claudeConfigText, 'claude')}
                className="mt-4 w-full flex items-center justify-center gap-2 border border-carbon text-carbon hover:bg-carbon hover:text-white py-2.5 rounded-[10px] text-[12px] font-bold uppercase tracking-wider transition-all duration-300"
              >
                {copiedSection === 'claude' ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Config JSON
                  </>
                )}
              </button>
            </div>

            {/* Cursor Editor Card */}
            <div className="bg-white border border-border rounded-[22px] p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-purple-600 bg-opacity-10 text-purple-600 px-3 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider">
                    Cursor IDE
                  </span>
                  <h4 className="font-gambarino text-[16px] text-carbon">Cursor Local (Stdio)</h4>
                </div>
                <p className="font-sans text-[13px] text-mid-concrete mb-4">
                  Go to **Cursor Settings &gt; Features &gt; MCP**. Click **+ Add New MCP Server** and fill out the details:
                  <br />
                  <span className="text-emerald-600 font-semibold text-[11px] mt-1.5 block">
                    ✓ Uses your active LLM inside Cursor (any model, any company) to run audits contextually.
                  </span>
                </p>
                <div className="space-y-3 font-sans text-[13px] text-carbon">
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="font-bold text-mid-concrete">Name:</span>
                    <span>tsot-mcp-server</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="font-bold text-mid-concrete">Type:</span>
                    <span>command</span>
                  </div>
                  <div className="flex flex-col border-b border-border pb-2 gap-1.5">
                    <span className="font-bold text-mid-concrete">Command:</span>
                    <span className="font-mono text-[11px] bg-[#f2f0eb] p-2 rounded break-all select-all">
                      {cursorConfigCmd}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleCopy(cursorConfigCmd, 'cursor')}
                className="mt-6 w-full flex items-center justify-center gap-2 border border-carbon text-carbon hover:bg-carbon hover:text-white py-2.5 rounded-[10px] text-[12px] font-bold uppercase tracking-wider transition-all duration-300"
              >
                {copiedSection === 'cursor' ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied Command!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Stdio Command
                  </>
                )}
              </button>
            </div>

            {/* Hosted Vercel Bridge Card */}
            <div className="bg-white border border-border rounded-[22px] p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-carbon text-white px-3 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider">
                    Vercel Bridge
                  </span>
                  <h4 className="font-gambarino text-[16px] text-carbon">Stateless Vercel Setup</h4>
                </div>
                <p className="font-sans text-[13px] text-mid-concrete mb-4">
                  Deploy to Vercel, then connect Claude or Cursor to your production API route statelessly via the <code className="bg-[#f2f0eb] px-1.5 py-0.5 rounded text-[12px] font-mono">mcp-remote</code> bridge:
                </p>
                <div className="relative bg-[#0b0b0b] rounded-[12px] p-4 text-[#e0ded8] font-mono text-[11px] overflow-auto h-[240px] border border-border border-opacity-20 select-text">
                  <pre>{vercelConfigText}</pre>
                </div>
              </div>
              <button
                onClick={() => handleCopy(vercelConfigText, 'sse')}
                className="mt-4 w-full flex items-center justify-center gap-2 border border-carbon text-carbon hover:bg-carbon hover:text-white py-2.5 rounded-[10px] text-[12px] font-bold uppercase tracking-wider transition-all duration-300"
              >
                {copiedSection === 'sse' ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Bridge Config
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tools Explainer Table */}
          <div>
            <div className="flex items-center gap-2 mb-6 border-b border-border pb-2">
              <FileText className="w-4 h-4 text-[#3a66f5]" />
              <h3 className="font-gambarino text-[18px] text-carbon">Supported MCP Tools & Capabilities</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-[13px]">
                <thead>
                  <tr className="border-b border-carbon text-mid-concrete font-bold">
                    <th className="py-3 pr-4">TOOL NAME</th>
                    <th className="py-3 px-4">DESCRIPTION</th>
                    <th className="py-3 pl-4">PARAMETERS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-4 pr-4 font-mono font-bold text-carbon">search_registry</td>
                    <td className="py-4 px-4 text-mid-concrete leading-relaxed">Search the TSOT research ledger. Leverages hybrid semantic embeddings and keyword full-text index lookup.</td>
                    <td className="py-4 pl-4 text-carbon font-mono">query, pillar, limit</td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 font-mono font-bold text-carbon">search_ai_act</td>
                    <td className="py-4 px-4 text-mid-concrete leading-relaxed">Search compliance regulations in the EU AI Act. Matches categories against user features.</td>
                    <td className="py-4 pl-4 text-carbon font-mono">query, category, limit</td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 font-mono font-bold text-carbon">get_record</td>
                    <td className="py-4 px-4 text-mid-concrete leading-relaxed">Fetch absolute summary and design constraint recommendations of a single code item.</td>
                    <td className="py-4 pl-4 text-carbon font-mono">code, source</td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 font-mono font-bold text-carbon">audit_product</td>
                    <td className="py-4 px-4 text-[#3a66f5] font-medium leading-relaxed">Perform Adversarial Design Auditing on a description. Returns XML risk analysis, findings, and sprints.</td>
                    <td className="py-4 pl-4 text-carbon font-mono">prompt, source</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SANDBOX */}
      {activeTab === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sandbox Configurator (Left Side) */}
          <div className="lg:col-span-5 bg-[#f8f8f8] border border-border rounded-[22px] p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-gambarino text-[18px] text-carbon mb-1">Tool Configurator</h3>
              <p className="font-sans text-[12px] text-mid-concrete">
                Configure parameter values and click execute to trigger the mock MCP backend resolver.
              </p>
            </div>

            {/* Select Tool */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3a66f5]">
                Select Tool to Call
              </label>
              <select
                value={selectedTool}
                onChange={(e) => setSelectedTool(e.target.value as any)}
                className="w-full bg-white border border-border p-3 rounded-[10px] text-[13px] text-carbon focus:outline-none"
              >
                <option value="search_registry">search_registry (HCI Research)</option>
                <option value="search_ai_act">search_ai_act (EU AI Act)</option>
                <option value="get_record">get_record (Single Item Lookup)</option>
                <option value="audit_product">audit_product (Adversarial Design Audit)</option>
              </select>
            </div>

            {/* Dynamic Inputs depending on selected tool */}
            {selectedTool === 'search_registry' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon">
                    Query Text (query)
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. cognitive offloading"
                    className="w-full bg-white border border-border p-3 rounded-[10px] text-[13px] text-carbon"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon">
                    Filter Pillar (pillar)
                  </label>
                  <select
                    value={searchPillar}
                    onChange={(e) => setSearchPillar(e.target.value)}
                    className="w-full bg-white border border-border p-3 rounded-[10px] text-[13px] text-carbon focus:outline-none"
                  >
                    <option value="ALL">ALL PILLARS</option>
                    <option value="COGNITIVE OFFLOADING">COGNITIVE OFFLOADING</option>
                    <option value="FRICTION & VERIFICATION">FRICTION & VERIFICATION</option>
                    <option value="TEMPORAL PERCEPTION">TEMPORAL PERCEPTION</option>
                    <option value="EPISTEMIC AGENCY">EPISTEMIC AGENCY</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon">
                    Max Limit (limit)
                  </label>
                  <input
                    type="number"
                    value={searchLimit}
                    onChange={(e) => setSearchLimit(Number(e.target.value))}
                    min="1"
                    max="20"
                    className="w-full bg-white border border-border p-3 rounded-[10px] text-[13px] text-carbon"
                  />
                </div>
              </div>
            )}

            {selectedTool === 'search_ai_act' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon">
                    Query Text (query)
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. prohibited practice"
                    className="w-full bg-white border border-border p-3 rounded-[10px] text-[13px] text-carbon"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon">
                    Risk Category (category)
                  </label>
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="w-full bg-white border border-border p-3 rounded-[10px] text-[13px] text-carbon focus:outline-none"
                  >
                    <option value="ALL">ALL CATEGORIES</option>
                    <option value="PROHIBITED PRACTICE">PROHIBITED PRACTICE</option>
                    <option value="HIGH RISK">HIGH RISK</option>
                    <option value="LIMITED RISK">LIMITED RISK</option>
                    <option value="MINIMAL RISK">MINIMAL RISK</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon">
                    Max Limit (limit)
                  </label>
                  <input
                    type="number"
                    value={searchLimit}
                    onChange={(e) => setSearchLimit(Number(e.target.value))}
                    min="1"
                    max="20"
                    className="w-full bg-white border border-border p-3 rounded-[10px] text-[13px] text-carbon"
                  />
                </div>
              </div>
            )}

            {selectedTool === 'get_record' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon">
                    Record Code (code)
                  </label>
                  <input
                    type="text"
                    value={recordCode}
                    onChange={(e) => setRecordCode(e.target.value)}
                    placeholder="e.g. SOT-COMP-2026"
                    className="w-full bg-white border border-border p-3 rounded-[10px] text-[13px] text-carbon"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon">
                    Database Source (source)
                  </label>
                  <select
                    value={recordSource}
                    onChange={(e) => setRecordSource(e.target.value)}
                    className="w-full bg-white border border-border p-3 rounded-[10px] text-[13px] text-carbon focus:outline-none"
                  >
                    <option value="both">Both Ledgers</option>
                    <option value="corpus">HCI Research Ledger</option>
                    <option value="ai_act">EU AI Act articles</option>
                  </select>
                </div>
              </div>
            )}

            {selectedTool === 'audit_product' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon">
                    Product Prompt (prompt)
                  </label>
                  <textarea
                    value={auditPrompt}
                    onChange={(e) => setAuditPrompt(e.target.value)}
                    rows={5}
                    placeholder="Describe your user interface, latencies, conversational mechanisms, or automation patterns..."
                    className="w-full bg-white border border-border p-3 rounded-[10px] text-[13px] text-carbon resize-none font-sans focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon">
                    Audit Source (source)
                  </label>
                  <select
                    value={auditSource}
                    onChange={(e) => setAuditSource(e.target.value)}
                    className="w-full bg-white border border-border p-3 rounded-[10px] text-[13px] text-carbon focus:outline-none"
                  >
                    <option value="both">Both Ledgers</option>
                    <option value="corpus">HCI Research Ledger</option>
                    <option value="ai_act">EU AI Act articles</option>
                  </select>
                </div>
              </div>
            )}

            {/* Execute Button */}
            <button
              onClick={handleExecute}
              disabled={executing || (selectedTool === 'search_registry' && !searchQuery.trim()) || (selectedTool === 'search_ai_act' && !searchQuery.trim())}
              className="w-full flex items-center justify-center gap-2 bg-[#3a66f5] hover:bg-[#254edb] disabled:bg-mid-concrete text-white py-3.5 rounded-[10px] text-[12px] font-bold uppercase tracking-wider transition-all duration-300 shadow-sm"
            >
              <Play className="w-4 h-4 fill-white" />
              {executing ? 'Executing Live Query...' : 'Execute Tool Simulation'}
            </button>
          </div>

          {/* Stdio Terminal Output (Right Side) */}
          <div className="lg:col-span-7 flex flex-col h-[520px]">
            <div className="flex items-center justify-between bg-carbon text-[#a0a0a0] px-5 py-3.5 rounded-t-[12px] border-b border-carbon border-opacity-10 font-mono text-[12px]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF3E00]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#E8A020]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#1A7A4A]" />
                <span className="ml-3 font-bold tracking-wider text-concrete">TSOT-MCP-STDIO-SHELL</span>
              </div>
              <button
                onClick={() => handleCopy(output, 'sandbox_output')}
                className="hover:text-white flex items-center gap-1.5 transition-colors"
              >
                {copiedSection === 'sandbox_output' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-stable" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="flex-grow bg-[#0B0B0B] text-[#00FF66] font-mono text-[12px] p-6 rounded-b-[12px] overflow-auto select-text shadow-inner">
              <pre className="whitespace-pre-wrap leading-relaxed">{output}</pre>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
