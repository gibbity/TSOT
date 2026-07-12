'use client';

import { useState } from 'react';
import { 
  Copy, 
  Check, 
  Terminal, 
  Settings, 
  Play, 
  FileText, 
  Cpu,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  Search,
  BookOpen
} from 'lucide-react';

export default function McpIntegrationPage() {
  const [activeTab, setActiveTab] = useState<'setup' | 'sandbox'>('setup');
  const [setupTab, setSetupTab] = useState<'vercel' | 'cursor' | 'claude'>('vercel');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Sandbox Form States
  const [selectedTool, setSelectedTool] = useState<
    'audit_eu_compliance' | 'optimize_hci_design' | 'query_research_moat' | 'search_registry' | 'search_ai_act' | 'get_record'
  >('audit_eu_compliance');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPillar, setSearchPillar] = useState('ALL');
  const [searchCategory, setSearchCategory] = useState('ALL');
  const [searchLimit, setSearchLimit] = useState(5);
  const [recordCode, setRecordCode] = useState('SOT-COMP-2026');
  const [recordSource, setRecordSource] = useState('both');
  const [auditPrompt, setAuditPrompt] = useState(
    'We are building an agentic conversational assistant with response latency under 150ms that guides the user and summarizes all daily tasks automatically.'
  );

  // Execution States
  const [executing, setExecuting] = useState(false);
  const [output, setOutput] = useState<string>(
    '// Select a tool on the left, fill out the parameters, and click "Run Live Tool Request"\n// The response from the live Next.js API /api/mcp endpoint will render here...'
  );

  // Copy helper
  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Run Sandbox Simulation
  const handleExecute = async () => {
    setExecuting(true);
    setOutput('// Generating JSON-RPC payload...\n// Dispatching POST request to live endpoint /api/mcp...');
    
    try {
      let args: any = {};
      if (selectedTool === 'audit_eu_compliance') {
        args = { prompt: auditPrompt };
      } else if (selectedTool === 'optimize_hci_design') {
        args = { prompt: auditPrompt };
      } else if (selectedTool === 'query_research_moat') {
        args = { query: searchQuery };
      } else if (selectedTool === 'search_registry') {
        args = { query: searchQuery, pillar: searchPillar, limit: searchLimit };
      } else if (selectedTool === 'search_ai_act') {
        args = { query: searchQuery, category: searchCategory, limit: searchLimit };
      } else if (selectedTool === 'get_record') {
        args = { code: recordCode, source: recordSource };
      }

      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Math.floor(Math.random() * 1000) + 1,
          method: 'tools/call',
          params: {
            name: selectedTool,
            arguments: args
          }
        })
      });

      const data = await response.json();
      
      if (data.error) {
        setOutput(`// RPC Server Error:\n${JSON.stringify(data.error, null, 2)}`);
      } else if (data.result?.content?.[0]?.text) {
        setOutput(data.result.content[0].text);
      } else {
        setOutput(JSON.stringify(data, null, 2));
      }
    } catch (err: any) {
      setOutput(`// Error executing live RPC call:\n// ${err.message || err}`);
    } finally {
      setExecuting(false);
    }
  };

  // Copyable Config Text Generators
  const getVercelConfig = (domain: string) => `{
  "mcpServers": {
    "tsot-mcp-server": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "${domain}/api/mcp"
      ]
    }
  }
}`;

  const getClaudeConfig = () => `{
  "mcpServers": {
    "tsot-mcp-server": {
      "command": "npx",
      "args": [
        "tsx",
        "c:/Users/kushr/.gemini/antigravity/scratch/tsot/scratch/mcp_server.ts"
      ],
      "env": {
        "NEXT_PUBLIC_SUPABASE_URL": "${process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'}",
        "SUPABASE_SERVICE_ROLE_KEY": "YOUR_SUPABASE_SERVICE_ROLE_KEY",
        "GEMINI_API_KEY": "YOUR_GEMINI_API_KEY"
      }
    }
  }
}`;

  const cursorLocalCommand = `npx tsx --env-file="c:/Users/kushr/.gemini/antigravity/scratch/tsot/.env.local" "c:/Users/kushr/.gemini/antigravity/scratch/tsot/scratch/mcp_server.ts"`;

  const siteDomain = typeof window !== 'undefined' ? window.location.origin : 'https://your-site.vercel.app';

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-12 select-none">
      {/* Editorial Header */}
      <div className="border-b border-border pb-8 mb-10">
        <div className="flex items-center gap-2.5 text-[#3a66f5] mb-2">
          <Cpu className="w-6 h-6 animate-pulse" />
          <span className="font-sans text-[12px] font-bold uppercase tracking-widest">Model Context Protocol</span>
        </div>
        <h1 className="font-gambarino text-[32px] md:text-[44px] leading-tight text-carbon">
          Moat MCP Server Portal
        </h1>
        <p className="font-sans text-[15px] text-mid-concrete mt-2 max-w-[800px] leading-relaxed">
          Connect your local AI instances, editors, and workflows directly to the TSOT Research Moat. Your LLMs can now verify regulations compliance, optimize UX designs, and resolve interaction dilemmas instantly.
        </p>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-border mb-8">
        <button
          onClick={() => setActiveTab('setup')}
          className={`flex items-center gap-2 py-4 px-6 font-gambarino text-[16px] border-b-2 tracking-wide transition-all duration-300 ${
            activeTab === 'setup'
              ? 'border-[#3a66f5] text-[#3a66f5]'
              : 'border-transparent text-carbon hover:text-[#3a66f5]'
          }`}
        >
          <Settings className="w-4 h-4" />
          Setup & Deployment
        </button>
        <button
          onClick={() => setActiveTab('sandbox')}
          className={`flex items-center gap-2 py-4 px-6 font-gambarino text-[16px] border-b-2 tracking-wide transition-all duration-300 ${
            activeTab === 'sandbox'
              ? 'border-[#3a66f5] text-[#3a66f5]'
              : 'border-transparent text-carbon hover:text-[#3a66f5]'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Interactive Sandbox
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB CONTENT: SETUP */}
      {/* ======================================================== */}
      {activeTab === 'setup' && (
        <div className="space-y-12">
          
          {/* Core Core Capabilities Cards */}
          <div>
            <h3 className="font-gambarino text-[20px] text-carbon mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              What your AI can do with the TSOT MCP
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1 */}
              <div className="border border-border rounded-[20px] p-6 hover:shadow-md transition-shadow bg-white">
                <div className="w-10 h-10 rounded-[12px] bg-red-100 flex items-center justify-center text-red-600 mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-gambarino text-[16px] text-carbon mb-2">1. Check EU Regulations</h4>
                <p className="font-sans text-[13px] text-mid-concrete leading-relaxed">
                  Call the <code className="bg-[#f5f5f5] px-1 py-0.5 rounded font-mono text-[11px] text-red-600 font-semibold">audit_eu_compliance</code> tool to parse product descriptions and automatically flag EU AI Act violations.
                </p>
              </div>

              {/* Card 2 */}
              <div className="border border-border rounded-[20px] p-6 hover:shadow-md transition-shadow bg-white">
                <div className="w-10 h-10 rounded-[12px] bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                  <Cpu className="w-5 h-5" />
                </div>
                <h4 className="font-gambarino text-[16px] text-carbon mb-2">2. Optimize HCI Designs</h4>
                <p className="font-sans text-[13px] text-mid-concrete leading-relaxed">
                  Call the <code className="bg-[#f5f5f5] px-1 py-0.5 rounded font-mono text-[11px] text-blue-600 font-semibold">optimize_hci_design</code> tool to evaluate cognitive friction, anthropomorphism, and response latencies.
                </p>
              </div>

              {/* Card 3 */}
              <div className="border border-border rounded-[20px] p-6 hover:shadow-md transition-shadow bg-white">
                <div className="w-10 h-10 rounded-[12px] bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h4 className="font-gambarino text-[16px] text-carbon mb-2">3. Solve Moat Queries</h4>
                <p className="font-sans text-[13px] text-mid-concrete leading-relaxed">
                  Call the <code className="bg-[#f5f5f5] px-1 py-0.5 rounded font-mono text-[11px] text-emerald-600 font-semibold">query_research_moat</code> tool to ask questions and receive empirical design recommendations.
                </p>
              </div>

            </div>
          </div>

          {/* Configuration Guides */}
          <div className="border border-border rounded-[24px] bg-white overflow-hidden shadow-sm">
            <div className="bg-[#fcfcfc] border-b border-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-gambarino text-[18px] text-carbon">Client Configuration Guide</h3>
                <p className="font-sans text-[12px] text-mid-concrete mt-1">
                  Choose your connection method and follow the copy-paste instructions to link your AI agent.
                </p>
              </div>
              
              {/* Pill Selectors */}
              <div className="flex bg-[#f2f2f2] p-1.5 rounded-[12px] self-start md:self-auto">
                <button
                  onClick={() => setSetupTab('vercel')}
                  className={`px-4 py-2 text-[12px] font-bold rounded-[8px] uppercase tracking-wider transition-all ${
                    setupTab === 'vercel'
                      ? 'bg-white text-carbon shadow-sm'
                      : 'text-mid-concrete hover:text-carbon'
                  }`}
                >
                  Vercel Bridge (Fastest)
                </button>
                <button
                  onClick={() => setSetupTab('cursor')}
                  className={`px-4 py-2 text-[12px] font-bold rounded-[8px] uppercase tracking-wider transition-all ${
                    setupTab === 'cursor'
                      ? 'bg-white text-[#8124ff] shadow-sm'
                      : 'text-mid-concrete hover:text-carbon'
                  }`}
                >
                  Cursor IDE
                </button>
                <button
                  onClick={() => setSetupTab('claude')}
                  className={`px-4 py-2 text-[12px] font-bold rounded-[8px] uppercase tracking-wider transition-all ${
                    setupTab === 'claude'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-mid-concrete hover:text-carbon'
                  }`}
                >
                  Claude Desktop
                </button>
              </div>
            </div>

            <div className="p-8">
              {/* TAB: VERCEL BRIDGE */}
              {setupTab === 'vercel' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="bg-carbon text-white px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Zero Local Config
                    </span>
                    <h4 className="font-gambarino text-[18px] text-carbon">Option A: Stateless Online Bridge</h4>
                    <p className="font-sans text-[13.5px] text-mid-concrete leading-relaxed max-w-[900px]">
                      The simplest way to use MCP. It routes requests statelessly to your production Vercel deployment. You do not need to install local databases, run script environments, or share Gemini API keys.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-5 space-y-4">
                      <div className="bg-[#f9f9f9] border border-border p-5 rounded-[16px] space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-carbon text-white flex items-center justify-center font-bold text-[12px]">1</div>
                          <span className="font-sans text-[13px] font-semibold text-carbon">Copy the configuration JSON</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-carbon text-white flex items-center justify-center font-bold text-[12px]">2</div>
                          <span className="font-sans text-[13px] font-semibold text-carbon">Paste it in your client config file</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-carbon text-white flex items-center justify-center font-bold text-[12px]">3</div>
                          <span className="font-sans text-[13px] font-semibold text-carbon">Your local AI does the synthesis for $0</span>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-7 space-y-3">
                      <div className="relative">
                        <div className="absolute right-3 top-3 z-10">
                          <button
                            onClick={() => handleCopy(getVercelConfig(siteDomain), 'vercel')}
                            className="bg-white hover:bg-neutral-100 text-carbon p-2 rounded-[8px] border border-border shadow-sm flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider cursor-pointer"
                          >
                            {copiedSection === 'vercel' ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-stable" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                Copy JSON
                              </>
                            )}
                          </button>
                        </div>
                        <div className="bg-[#0b0b0b] rounded-[16px] p-6 text-[#00FF66] font-mono text-[11px] overflow-auto max-h-[300px] border border-border select-all shadow-inner">
                          <pre>{getVercelConfig(siteDomain)}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: CURSOR */}
              {setupTab === 'cursor' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="bg-purple-600 bg-opacity-10 text-[#8124ff] px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Cursor IDE Settings
                    </span>
                    <h4 className="font-gambarino text-[18px] text-carbon">Option B: Local Cursor Integration</h4>
                    <p className="font-sans text-[13.5px] text-mid-concrete leading-relaxed max-w-[900px]">
                      Connect Cursor to your local code repository using Stdio. Cursor will spawn a background node runner to connect the AI directly.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-6 space-y-4">
                      <div className="bg-[#f9f9f9] border border-border p-6 rounded-[16px] space-y-4 font-sans text-[13px] text-carbon">
                        <div className="flex items-start gap-3">
                          <span className="bg-purple-600 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] mt-0.5">1</span>
                          <div>
                            <span className="font-bold">Open Settings:</span> Go to **Cursor Settings &gt; Features &gt; MCP**.
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="bg-purple-600 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] mt-0.5">2</span>
                          <div>
                            <span className="font-bold">Add Server:</span> Click **+ Add New MCP Server**.
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="bg-purple-600 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] mt-0.5">3</span>
                          <div>
                            <span className="font-bold">Enter Parameters:</span> Name: <code className="bg-[#eee] px-1 py-0.5 rounded font-mono">tsot-local</code>, Type: <code className="bg-[#eee] px-1 py-0.5 rounded font-mono">command</code>, and copy the Command below.
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-6 space-y-3">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon">
                        Copy Cursor Command:
                      </label>
                      <div className="relative">
                        <div className="absolute right-3 top-3 z-10">
                          <button
                            onClick={() => handleCopy(cursorLocalCommand, 'cursor_cmd')}
                            className="bg-white hover:bg-neutral-100 text-carbon p-2 rounded-[8px] border border-border shadow-sm flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider cursor-pointer"
                          >
                            {copiedSection === 'cursor_cmd' ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-stable" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                Copy Command
                              </>
                            )}
                          </button>
                        </div>
                        <div className="bg-[#0b0b0b] rounded-[16px] p-6 text-[#00FF66] font-mono text-[11.5px] overflow-auto max-h-[300px] border border-border select-all shadow-inner leading-relaxed break-all">
                          {cursorLocalCommand}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: CLAUDE */}
              {setupTab === 'claude' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="bg-orange-500 bg-opacity-10 text-orange-600 px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Claude Desktop Config
                    </span>
                    <h4 className="font-gambarino text-[18px] text-carbon">Option C: Local Claude Desktop Setup</h4>
                    <p className="font-sans text-[13.5px] text-mid-concrete leading-relaxed max-w-[900px]">
                      Register the local Stdio server inside your Claude Desktop JSON config file.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-5 space-y-4">
                      <div className="bg-[#f9f9f9] border border-border p-6 rounded-[16px] space-y-4 font-sans text-[13px] text-carbon">
                        <div className="flex items-start gap-3">
                          <span className="bg-orange-600 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] mt-0.5">1</span>
                          <div>
                            <span className="font-bold">Locate configuration file:</span>
                            <br />
                            <span className="text-mid-concrete">Windows:</span> <code className="bg-[#eee] px-1 py-0.5 rounded font-mono text-[11px] break-all">%APPDATA%\Claude\claude_desktop_config.json</code>
                            <br />
                            <span className="text-mid-concrete">Mac:</span> <code className="bg-[#eee] px-1 py-0.5 rounded font-mono text-[11px] break-all">~/Library/Application Support/Claude/claude_desktop_config.json</code>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="bg-orange-600 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] mt-0.5">2</span>
                          <div>
                            <span className="font-bold">Merge JSON:</span> Insert the block on the right into the config file and restart Claude Desktop.
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-7 space-y-3">
                      <div className="relative">
                        <div className="absolute right-3 top-3 z-10">
                          <button
                            onClick={() => handleCopy(getClaudeConfig(), 'claude_config')}
                            className="bg-white hover:bg-neutral-100 text-carbon p-2 rounded-[8px] border border-border shadow-sm flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider cursor-pointer"
                          >
                            {copiedSection === 'claude_config' ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-stable" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                Copy JSON
                              </>
                            )}
                          </button>
                        </div>
                        <div className="bg-[#0b0b0b] rounded-[16px] p-6 text-[#00FF66] font-mono text-[11px] overflow-auto max-h-[300px] border border-border select-all shadow-inner">
                          <pre>{getClaudeConfig()}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB CONTENT: SANDBOX */}
      {/* ======================================================== */}
      {activeTab === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sandbox Configurator (Left Side) */}
          <div className="lg:col-span-5 bg-white border border-border rounded-[24px] p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-gambarino text-[18px] text-carbon mb-1">Live Tool Tester</h3>
              <p className="font-sans text-[12.5px] text-mid-concrete leading-relaxed">
                Test the live API endpoint by triggering actual JSON-RPC calls. View the response returned from your backend.
              </p>
            </div>

            {/* Select Tool */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3a66f5]">
                Select Tool to Execute
              </label>
              <select
                value={selectedTool}
                onChange={(e) => setSelectedTool(e.target.value as any)}
                className="w-full bg-[#fcfcfc] border border-border p-3.5 rounded-[12px] text-[13px] text-carbon font-semibold focus:outline-none transition-all focus:border-[#3a66f5]"
              >
                <option value="audit_eu_compliance">audit_eu_compliance (RAG Compliance Check)</option>
                <option value="optimize_hci_design">optimize_hci_design (RAG Design Optimize)</option>
                <option value="query_research_moat">query_research_moat (Moat QA Solving)</option>
                <option value="search_registry">search_registry (Raw Papers Search)</option>
                <option value="search_ai_act">search_ai_act (Raw Compliance Search)</option>
                <option value="get_record">get_record (Detailed Code Fetch)</option>
              </select>
            </div>

            {/* Inputs depending on selected tool */}
            {selectedTool === 'audit_eu_compliance' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon">
                    Design Prompt (prompt)
                  </label>
                  <textarea
                    value={auditPrompt}
                    onChange={(e) => setAuditPrompt(e.target.value)}
                    rows={4}
                    className="w-full bg-[#fcfcfc] border border-border p-3.5 rounded-[12px] text-[13px] text-carbon resize-none font-sans focus:outline-none transition-all focus:border-[#3a66f5]"
                    placeholder="Describe the UI flow, risks, or compliance factors..."
                  />
                </div>
              </div>
            )}

            {selectedTool === 'optimize_hci_design' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon">
                    Design Prompt (prompt)
                  </label>
                  <textarea
                    value={auditPrompt}
                    onChange={(e) => setAuditPrompt(e.target.value)}
                    rows={4}
                    className="w-full bg-[#fcfcfc] border border-border p-3.5 rounded-[12px] text-[13px] text-carbon resize-none font-sans focus:outline-none transition-all focus:border-[#3a66f5]"
                    placeholder="Describe the latency metrics, conversational turns, or Offloading friction..."
                  />
                </div>
              </div>
            )}

            {selectedTool === 'query_research_moat' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon">
                    Dilemma Question (query)
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. How does response timing affect user anthropomorphism?"
                    className="w-full bg-[#fcfcfc] border border-border p-3.5 rounded-[12px] text-[13px] text-carbon focus:outline-none transition-all focus:border-[#3a66f5]"
                  />
                </div>
              </div>
            )}

            {selectedTool === 'search_registry' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon">
                    Keyword Query (query)
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. Cognitive offloading"
                    className="w-full bg-[#fcfcfc] border border-border p-3.5 rounded-[12px] text-[13px] text-carbon focus:outline-none transition-all focus:border-[#3a66f5]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon">
                      Filter Pillar
                    </label>
                    <select
                      value={searchPillar}
                      onChange={(e) => setSearchPillar(e.target.value)}
                      className="w-full bg-[#fcfcfc] border border-border p-3 rounded-[12px] text-[13px] text-carbon focus:outline-none"
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
                      Max Limit
                    </label>
                    <input
                      type="number"
                      value={searchLimit}
                      onChange={(e) => setSearchLimit(Number(e.target.value))}
                      min="1"
                      max="10"
                      className="w-full bg-[#fcfcfc] border border-border p-3 rounded-[12px] text-[13px] text-carbon"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedTool === 'search_ai_act' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon">
                    Keyword Query (query)
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. prohibited practice"
                    className="w-full bg-[#fcfcfc] border border-border p-3.5 rounded-[12px] text-[13px] text-carbon focus:outline-none transition-all focus:border-[#3a66f5]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon">
                      Risk category
                    </label>
                    <select
                      value={searchCategory}
                      onChange={(e) => setSearchCategory(e.target.value)}
                      className="w-full bg-[#fcfcfc] border border-border p-3 rounded-[12px] text-[13px] text-carbon focus:outline-none"
                    >
                      <option value="ALL">ALL RISK CATEGORIES</option>
                      <option value="PROHIBITED PRACTICE">PROHIBITED PRACTICE</option>
                      <option value="HIGH RISK">HIGH RISK</option>
                      <option value="LIMITED RISK">LIMITED RISK</option>
                      <option value="MINIMAL RISK">MINIMAL RISK</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon">
                      Max Limit
                    </label>
                    <input
                      type="number"
                      value={searchLimit}
                      onChange={(e) => setSearchLimit(Number(e.target.value))}
                      min="1"
                      max="10"
                      className="w-full bg-[#fcfcfc] border border-border p-3 rounded-[12px] text-[13px] text-carbon"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedTool === 'get_record' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon">
                      Record Code (code)
                    </label>
                    <input
                      type="text"
                      value={recordCode}
                      onChange={(e) => setRecordCode(e.target.value)}
                      placeholder="e.g. SOT-COMP-2026"
                      className="w-full bg-[#fcfcfc] border border-border p-3.5 rounded-[12px] text-[13px] text-carbon focus:outline-none transition-all focus:border-[#3a66f5]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon">
                      Ledger Source
                    </label>
                    <select
                      value={recordSource}
                      onChange={(e) => setRecordSource(e.target.value)}
                      className="w-full bg-[#fcfcfc] border border-border p-3.5 rounded-[12px] text-[13px] text-carbon focus:outline-none"
                    >
                      <option value="both">Both Ledgers</option>
                      <option value="corpus">HCI Research</option>
                      <option value="ai_act">EU AI Act</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Execute Button */}
            <button
              onClick={handleExecute}
              disabled={
                executing || 
                (selectedTool === 'query_research_moat' && !searchQuery.trim()) ||
                (selectedTool === 'search_registry' && !searchQuery.trim()) || 
                (selectedTool === 'search_ai_act' && !searchQuery.trim())
              }
              className="w-full flex items-center justify-center gap-2 bg-[#3a66f5] hover:bg-[#254edb] disabled:bg-[#d0d0d0] text-white py-4 rounded-[12px] text-[12px] font-bold uppercase tracking-wider transition-all duration-300 shadow-sm cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              {executing ? 'Invoking RPC Endpoint...' : 'Run Live Tool Request'}
            </button>
          </div>

          {/* Stdio Terminal Output (Right Side) */}
          <div className="lg:col-span-7 flex flex-col h-[560px]">
            <div className="flex items-center justify-between bg-carbon text-[#a0a0a0] px-5 py-4 rounded-t-[16px] border-b border-carbon border-opacity-10 font-mono text-[12px]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF3E00]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#E8A020]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#1A7A4A]" />
                <span className="ml-3 font-bold tracking-wider text-concrete">TSOT-MCP-STDIO-SHELL</span>
              </div>
              <button
                onClick={() => handleCopy(output, 'sandbox_output')}
                className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedSection === 'sandbox_output' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-stable" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Response
                  </>
                )}
              </button>
            </div>
            <div className="flex-grow bg-[#0B0B0B] text-[#00FF66] font-mono text-[12px] p-6 rounded-b-[16px] overflow-auto select-text shadow-inner">
              <pre className="whitespace-pre-wrap leading-relaxed">{output}</pre>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
