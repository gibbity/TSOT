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
  BookOpen,
  Package,
  Globe,
  Code
} from 'lucide-react';

export default function McpIntegrationPage() {
  const [activeTab, setActiveTab] = useState<'setup' | 'sandbox'>('setup');
  const [setupTab, setSetupTab] = useState<'npm' | 'claude' | 'cursor' | 'vercel' | 'smithery'>('npm');
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
  const getClaudeConfig = () => `{
  "mcpServers": {
    "tsot": {
      "command": "npx",
      "args": [
        "-y",
        "tsot-mcp-server"
      ]
    }
  }
}`;

  const getVercelConfig = (domain: string) => `{
  "mcpServers": {
    "tsot-remote": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "${domain}/api/mcp"
      ]
    }
  }
}`;

  const npmCliCommand = `npx -y tsot-mcp-server`;
  const npmSseCommand = `npx -y tsot-mcp-server --http --port 3001`;
  const siteDomain = typeof window !== 'undefined' ? window.location.origin : 'https://your-site.vercel.app';

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-12 select-none">
      {/* Editorial Header */}
      <div className="border-b border-border pb-8 mb-10">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-3">
          <div className="flex items-center gap-2.5 text-[#3a66f5]">
            <Cpu className="w-6 h-6 animate-pulse" />
            <span className="font-sans text-[12px] font-bold uppercase tracking-widest">Model Context Protocol</span>
          </div>
          
          <div className="flex items-center gap-2 bg-[#3a66f5]/10 text-[#3a66f5] px-3.5 py-1.5 rounded-full text-[11px] font-mono font-bold">
            <Package className="w-4 h-4" />
            <span>npm: tsot-mcp-server@1.0.0</span>
          </div>
        </div>

        <h1 className="font-gambarino text-[32px] md:text-[44px] leading-tight text-carbon">
          TSOT Model Context Protocol (MCP) Server
        </h1>
        <p className="font-sans text-[15px] text-mid-concrete mt-2 max-w-[850px] leading-relaxed">
          Connect local AI agents, Claude Desktop, Cursor, Windsurf, and Roo Code directly to the TSOT Empirical HCI Ledger and EU AI Act Compliance Engine. Run compliance audits and UX optimizations straight from your AI coding assistant.
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
          Setup & Marketplace Installation
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
          Interactive MCP Sandbox
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB CONTENT: SETUP */}
      {/* ======================================================== */}
      {activeTab === 'setup' && (
        <div className="space-y-12">
          
          {/* Capabilities Cards */}
          <div>
            <h3 className="font-gambarino text-[20px] text-carbon mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              Supported Live Tools & Capabilities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1 */}
              <div className="border border-border rounded-[20px] p-6 hover:shadow-md transition-shadow bg-white">
                <div className="w-10 h-10 rounded-[12px] bg-red-100 flex items-center justify-center text-red-600 mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-gambarino text-[16px] text-carbon mb-2">1. EU AI Act Auditor</h4>
                <p className="font-sans text-[13px] text-mid-concrete leading-relaxed">
                  Call <code className="bg-[#f5f5f5] px-1 py-0.5 rounded font-mono text-[11px] text-red-600 font-semibold">audit_eu_compliance</code> to parse product designs against 124 EU AI Act articles with cited risk findings.
                </p>
              </div>

              {/* Card 2 */}
              <div className="border border-border rounded-[20px] p-6 hover:shadow-md transition-shadow bg-white">
                <div className="w-10 h-10 rounded-[12px] bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                  <Cpu className="w-5 h-5" />
                </div>
                <h4 className="font-gambarino text-[16px] text-carbon mb-2">2. HCI Design Optimizer</h4>
                <p className="font-sans text-[13px] text-mid-concrete leading-relaxed">
                  Call <code className="bg-[#f5f5f5] px-1 py-0.5 rounded font-mono text-[11px] text-blue-600 font-semibold">optimize_hci_design</code> to evaluate cognitive offloading, friction checkpoints, and response latencies.
                </p>
              </div>

              {/* Card 3 */}
              <div className="border border-border rounded-[20px] p-6 hover:shadow-md transition-shadow bg-white">
                <div className="w-10 h-10 rounded-[12px] bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h4 className="font-gambarino text-[16px] text-carbon mb-2">3. Moat & Dilemma Solver</h4>
                <p className="font-sans text-[13px] text-mid-concrete leading-relaxed">
                  Call <code className="bg-[#f5f5f5] px-1 py-0.5 rounded font-mono text-[11px] text-emerald-600 font-semibold">query_research_moat</code> to resolve design trade-offs backed by peer-reviewed research papers.
                </p>
              </div>

            </div>
          </div>

          {/* Configuration Guides */}
          <div className="border border-border rounded-[24px] bg-white overflow-hidden shadow-sm">
            <div className="bg-[#fcfcfc] border-b border-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-gambarino text-[18px] text-carbon">Installation & Integration Guide</h3>
                <p className="font-sans text-[12px] text-mid-concrete mt-1">
                  Select your client environment below to copy the 1-line installation configuration.
                </p>
              </div>
              
              {/* Pill Selectors */}
              <div className="flex flex-wrap bg-[#f2f2f2] p-1.5 rounded-[14px]">
                <button
                  onClick={() => setSetupTab('npm')}
                  className={`px-3.5 py-1.5 text-[11px] font-bold rounded-[8px] uppercase tracking-wider transition-all cursor-pointer ${
                    setupTab === 'npm'
                      ? 'bg-[#3a66f5] text-white shadow-sm'
                      : 'text-mid-concrete hover:text-carbon'
                  }`}
                >
                  NPM Standalone (Recommended)
                </button>
                <button
                  onClick={() => setSetupTab('claude')}
                  className={`px-3.5 py-1.5 text-[11px] font-bold rounded-[8px] uppercase tracking-wider transition-all cursor-pointer ${
                    setupTab === 'claude'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-mid-concrete hover:text-carbon'
                  }`}
                >
                  Claude Desktop
                </button>
                <button
                  onClick={() => setSetupTab('cursor')}
                  className={`px-3.5 py-1.5 text-[11px] font-bold rounded-[8px] uppercase tracking-wider transition-all cursor-pointer ${
                    setupTab === 'cursor'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-mid-concrete hover:text-carbon'
                  }`}
                >
                  Cursor / Windsurf
                </button>
                <button
                  onClick={() => setSetupTab('vercel')}
                  className={`px-3.5 py-1.5 text-[11px] font-bold rounded-[8px] uppercase tracking-wider transition-all cursor-pointer ${
                    setupTab === 'vercel'
                      ? 'bg-white text-carbon shadow-sm'
                      : 'text-mid-concrete hover:text-carbon'
                  }`}
                >
                  Vercel Remote Bridge
                </button>
                <button
                  onClick={() => setSetupTab('smithery')}
                  className={`px-3.5 py-1.5 text-[11px] font-bold rounded-[8px] uppercase tracking-wider transition-all cursor-pointer ${
                    setupTab === 'smithery'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-mid-concrete hover:text-carbon'
                  }`}
                >
                  Smithery.ai
                </button>
              </div>
            </div>

            <div className="p-8">
              {/* TAB 1: NPM STANDALONE */}
              {setupTab === 'npm' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="bg-[#3a66f5] text-white px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Official Package
                    </span>
                    <h4 className="font-gambarino text-[18px] text-carbon">Standalone NPM Package (`tsot-mcp-server`)</h4>
                    <p className="font-sans text-[13.5px] text-mid-concrete leading-relaxed max-w-[900px]">
                      The official published NPM package runs out-of-the-box with zero configuration required. It includes all 124 EU AI Act articles and empirical research records directly embedded for offline execution.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-5 space-y-4">
                      <div className="bg-[#f9f9f9] border border-border p-5 rounded-[16px] space-y-3 font-sans text-[13px]">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#3a66f5] text-white flex items-center justify-center font-bold text-[12px]">1</div>
                          <span className="font-semibold text-carbon">Zero installation required via <code className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border">npx</code></span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#3a66f5] text-white flex items-center justify-center font-bold text-[12px]">2</div>
                          <span className="font-semibold text-carbon">Supports stdio and HTTP SSE modes</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#3a66f5] text-white flex items-center justify-center font-bold text-[12px]">3</div>
                          <span className="font-semibold text-carbon">Automatic offline fallback with embedded seeds</span>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-7 space-y-4">
                      {/* Stdio command */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon mb-2">
                          1-Line Stdio Command:
                        </label>
                        <div className="relative">
                          <button
                            onClick={() => handleCopy(npmCliCommand, 'npm_cli')}
                            className="absolute right-3 top-3 z-10 bg-white hover:bg-neutral-100 text-carbon p-2 rounded-[8px] border border-border shadow-sm flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider cursor-pointer"
                          >
                            {copiedSection === 'npm_cli' ? (
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
                          <div className="bg-[#0b0b0b] rounded-[16px] p-5 text-[#00FF66] font-mono text-[12px] overflow-auto border border-border select-all shadow-inner">
                            {npmCliCommand}
                          </div>
                        </div>
                      </div>

                      {/* HTTP SSE command */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon mb-2">
                          HTTP SSE Server Mode:
                        </label>
                        <div className="relative">
                          <button
                            onClick={() => handleCopy(npmSseCommand, 'npm_sse')}
                            className="absolute right-3 top-3 z-10 bg-white hover:bg-neutral-100 text-carbon p-2 rounded-[8px] border border-border shadow-sm flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider cursor-pointer"
                          >
                            {copiedSection === 'npm_sse' ? (
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
                          <div className="bg-[#0b0b0b] rounded-[16px] p-5 text-[#00FF66] font-mono text-[12px] overflow-auto border border-border select-all shadow-inner">
                            {npmSseCommand}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CLAUDE DESKTOP */}
              {setupTab === 'claude' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="bg-orange-600 bg-opacity-10 text-orange-600 px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Claude Desktop Integration
                    </span>
                    <h4 className="font-gambarino text-[18px] text-carbon">Claude Desktop Config (`claude_desktop_config.json`)</h4>
                    <p className="font-sans text-[13.5px] text-mid-concrete leading-relaxed max-w-[900px]">
                      Add the configuration block below to your local Claude Desktop configuration file (`%APPDATA%\Claude\claude_desktop_config.json` on Windows or `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS).
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute right-3 top-3 z-10">
                      <button
                        onClick={() => handleCopy(getClaudeConfig(), 'claude')}
                        className="bg-white hover:bg-neutral-100 text-carbon p-2 rounded-[8px] border border-border shadow-sm flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        {copiedSection === 'claude' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-stable" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy JSON Config
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-[#0b0b0b] rounded-[16px] p-6 text-[#00FF66] font-mono text-[11.5px] overflow-auto max-h-[350px] border border-border select-all shadow-inner leading-relaxed">
                      <pre>{getClaudeConfig()}</pre>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CURSOR & WINDSURF */}
              {setupTab === 'cursor' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="bg-purple-600 bg-opacity-10 text-purple-600 px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Editor Extension
                    </span>
                    <h4 className="font-gambarino text-[18px] text-carbon">Cursor, Windsurf, Roo Code & Cline</h4>
                    <p className="font-sans text-[13.5px] text-mid-concrete leading-relaxed max-w-[900px]">
                      In your IDE settings (**Features &gt; MCP** in Cursor or **Roo Code Settings &gt; MCP**), add a new Stdio server:
                    </p>
                  </div>

                  <div className="bg-[#f9f9f9] border border-border p-6 rounded-[16px] space-y-4 font-sans text-[13px]">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-[12px] border border-border">
                        <span className="text-[11px] font-bold text-mid-concrete uppercase block mb-1">Server Name</span>
                        <code className="font-mono font-bold text-carbon text-[13px]">tsot-mcp-server</code>
                      </div>
                      <div className="bg-white p-4 rounded-[12px] border border-border">
                        <span className="text-[11px] font-bold text-mid-concrete uppercase block mb-1">Transport Type</span>
                        <code className="font-mono font-bold text-purple-600 text-[13px]">stdio</code>
                      </div>
                      <div className="bg-white p-4 rounded-[12px] border border-border">
                        <span className="text-[11px] font-bold text-mid-concrete uppercase block mb-1">Command</span>
                        <code className="font-mono font-bold text-emerald-600 text-[13px]">npx -y tsot-mcp-server</code>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: VERCEL REMOTE */}
              {setupTab === 'vercel' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="bg-carbon text-white px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Stateless Web Endpoint
                    </span>
                    <h4 className="font-gambarino text-[18px] text-carbon">Vercel Production Bridge Endpoint</h4>
                    <p className="font-sans text-[13.5px] text-mid-concrete leading-relaxed max-w-[900px]">
                      Route MCP tool calls directly to the hosted Next.js production endpoint (`/api/mcp`) using `mcp-remote`.
                    </p>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => handleCopy(getVercelConfig(siteDomain), 'vercel')}
                      className="absolute right-3 top-3 z-10 bg-white hover:bg-neutral-100 text-carbon p-2 rounded-[8px] border border-border shadow-sm flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider cursor-pointer"
                    >
                      {copiedSection === 'vercel' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-stable" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy Remote JSON
                        </>
                      )}
                    </button>
                    <div className="bg-[#0b0b0b] rounded-[16px] p-6 text-[#00FF66] font-mono text-[11.5px] overflow-auto max-h-[300px] border border-border select-all shadow-inner">
                      <pre>{getVercelConfig(siteDomain)}</pre>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: SMITHERY */}
              {setupTab === 'smithery' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="bg-emerald-600 bg-opacity-10 text-emerald-600 px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Marketplace Manifest
                    </span>
                    <h4 className="font-gambarino text-[18px] text-carbon">Smithery.ai Marketplace Manifest</h4>
                    <p className="font-sans text-[13.5px] text-mid-concrete leading-relaxed max-w-[900px]">
                      `tsot-mcp-server` includes a pre-configured `smithery.yaml` manifest. You can install it directly via the Smithery CLI:
                    </p>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => handleCopy('npx -y @smithery/cli install tsot-mcp-server --client claude', 'smithery_cmd')}
                      className="absolute right-3 top-3 z-10 bg-white hover:bg-neutral-100 text-carbon p-2 rounded-[8px] border border-border shadow-sm flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider cursor-pointer"
                    >
                      {copiedSection === 'smithery_cmd' ? (
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
                    <div className="bg-[#0b0b0b] rounded-[16px] p-6 text-[#00FF66] font-mono text-[12px] overflow-auto border border-border select-all shadow-inner">
                      npx -y @smithery/cli install tsot-mcp-server --client claude
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB CONTENT: INTERACTIVE SANDBOX */}
      {/* ======================================================== */}
      {activeTab === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 border border-border rounded-[24px] bg-white p-6 shadow-sm space-y-6">
            <div>
              <span className="bg-[#3a66f5]/10 text-[#3a66f5] px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider">
                Live Tool Playground
              </span>
              <h3 className="font-gambarino text-[20px] text-carbon mt-2">Execute Live MCP Tools</h3>
              <p className="font-sans text-[12.5px] text-mid-concrete mt-1 leading-relaxed">
                Test how the MCP server responds to live JSON-RPC requests via `/api/mcp`.
              </p>
            </div>

            {/* Tool Selector */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon">
                Select Tool Function:
              </label>
              <select
                value={selectedTool}
                onChange={(e) => setSelectedTool(e.target.value as any)}
                className="w-full bg-[#f9f9f9] border border-border rounded-[12px] p-3 font-mono text-[12.5px] text-carbon focus:outline-none focus:border-[#3a66f5]"
              >
                <option value="audit_eu_compliance">audit_eu_compliance (Check EU AI Act)</option>
                <option value="optimize_hci_design">optimize_hci_design (HCI Optimization)</option>
                <option value="query_research_moat">query_research_moat (Dilemma Solver)</option>
                <option value="search_registry">search_registry (Search HCI Ledger)</option>
                <option value="search_ai_act">search_ai_act (Search EU AI Act)</option>
                <option value="get_record">get_record (Fetch Single Article)</option>
              </select>
            </div>

            {/* Tool Parameters Dynamic Form */}
            <div className="space-y-4 pt-2 border-t border-border">
              {(selectedTool === 'audit_eu_compliance' || selectedTool === 'optimize_hci_design') && (
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon">
                    Prompt / Product Description:
                  </label>
                  <textarea
                    rows={4}
                    value={auditPrompt}
                    onChange={(e) => setAuditPrompt(e.target.value)}
                    className="w-full bg-[#f9f9f9] border border-border rounded-[12px] p-3 font-sans text-[13px] text-carbon focus:outline-none focus:border-[#3a66f5] leading-relaxed"
                  />
                </div>
              )}

              {selectedTool === 'query_research_moat' && (
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon">
                    Design Dilemma Query:
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g., Should we add latency to streaming AI responses?"
                    className="w-full bg-[#f9f9f9] border border-border rounded-[12px] p-3 font-sans text-[13px] text-carbon focus:outline-none focus:border-[#3a66f5]"
                  />
                </div>
              )}

              {selectedTool === 'search_registry' && (
                <>
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon">Search Query:</label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g., cognitive offloading"
                      className="w-full bg-[#f9f9f9] border border-border rounded-[12px] p-3 font-sans text-[13px] text-carbon focus:outline-none focus:border-[#3a66f5]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon">Pillar Filter:</label>
                    <select
                      value={searchPillar}
                      onChange={(e) => setSearchPillar(e.target.value)}
                      className="w-full bg-[#f9f9f9] border border-border rounded-[12px] p-3 font-sans text-[12.5px] text-carbon"
                    >
                      <option value="ALL">ALL PILLARS</option>
                      <option value="COGNITIVE OFFLOADING">COGNITIVE OFFLOADING</option>
                      <option value="FRICTION & VERIFICATION">FRICTION & VERIFICATION</option>
                      <option value="TEMPORAL PERCEPTION">TEMPORAL PERCEPTION</option>
                      <option value="EPISTEMIC AGENCY">EPISTEMIC AGENCY</option>
                    </select>
                  </div>
                </>
              )}

              {selectedTool === 'search_ai_act' && (
                <>
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon">Search Query:</label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g., facial recognition"
                      className="w-full bg-[#f9f9f9] border border-border rounded-[12px] p-3 font-sans text-[13px] text-carbon focus:outline-none focus:border-[#3a66f5]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon">Risk Category:</label>
                    <select
                      value={searchCategory}
                      onChange={(e) => setSearchCategory(e.target.value)}
                      className="w-full bg-[#f9f9f9] border border-border rounded-[12px] p-3 font-sans text-[12.5px] text-carbon"
                    >
                      <option value="ALL">ALL CATEGORIES</option>
                      <option value="PROHIBITED PRACTICE">PROHIBITED PRACTICE</option>
                      <option value="HIGH RISK">HIGH RISK</option>
                      <option value="LIMITED RISK">LIMITED RISK</option>
                      <option value="MINIMAL RISK">MINIMAL RISK</option>
                    </select>
                  </div>
                </>
              )}

              {selectedTool === 'get_record' && (
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-carbon">Record Code:</label>
                  <input
                    type="text"
                    value={recordCode}
                    onChange={(e) => setRecordCode(e.target.value)}
                    placeholder="e.g., SOT-COMP-2026 or EU-ACT-ART-5"
                    className="w-full bg-[#f9f9f9] border border-border rounded-[12px] p-3 font-mono text-[13px] text-carbon focus:outline-none focus:border-[#3a66f5]"
                  />
                </div>
              )}
            </div>

            {/* Run Button */}
            <button
              onClick={handleExecute}
              disabled={executing}
              className="w-full bg-[#3a66f5] hover:bg-[#254edb] disabled:bg-neutral-400 text-white font-sans text-[13px] font-bold uppercase tracking-wider py-4 rounded-[14px] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              {executing ? (
                <span>Executing RPC Request...</span>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Run Live Tool Request</span>
                </>
              )}
            </button>
          </div>

          {/* Output Display Column (7 cols) */}
          <div className="lg:col-span-7 border border-border rounded-[24px] bg-[#0b0b0b] text-white p-6 shadow-md space-y-4 font-mono text-[12px] overflow-hidden min-h-[520px] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Terminal className="w-4 h-4" />
                  <span className="font-bold text-[11px] uppercase tracking-wider">Response Stream</span>
                </div>
                <span className="text-[10px] text-neutral-500 font-sans">Endpoint: /api/mcp</span>
              </div>

              <div className="text-[#00FF66] leading-relaxed whitespace-pre-wrap max-h-[480px] overflow-auto p-2">
                {output}
              </div>
            </div>

            <div className="text-[10px] text-neutral-500 border-t border-neutral-800 pt-3 flex justify-between items-center font-sans">
              <span>JSON-RPC 2.0 Compliant</span>
              <span>Model Context Protocol v1.29.0</span>
            </div>
          </div>

        </div>
      )}

    </main>
  );
}
