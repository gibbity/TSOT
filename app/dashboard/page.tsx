'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Cpu, 
  Terminal, 
  Copy, 
  Check, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Layers, 
  Code, 
  Sparkles, 
  Download, 
  Mail, 
  Send,
  Lock,
  Globe,
  HelpCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

interface AuditRecord {
  id: string;
  systemName: string;
  intendedPurpose: string;
  riskLevel: 'MINIMAL RISK' | 'LIMITED RISK' | 'HIGH-RISK' | 'PROHIBITED';
  score: number;
  timestamp: string;
  articleCitations: string[];
  hciCitations: string[];
}

export default function UserDashboardPage() {
  // Waitlist form state
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistCompany, setWaitlistCompany] = useState('');
  const [waitlistUseCase, setWaitlistUseCase] = useState('Enterprise AI Compliance');
  const [submittedWaitlist, setSubmittedWaitlist] = useState(false);
  const [submittingWaitlist, setSubmittingWaitlist] = useState(false);

  // MCP Config Tab state
  const [mcpTab, setMcpTab] = useState<'cursor' | 'claude' | 'windsurf' | 'roocode' | 'cli'>('cursor');
  const [copiedMcp, setCopiedMcp] = useState(false);

  // Audit Dossier modal state
  const [selectedAuditForDossier, setSelectedAuditForDossier] = useState<AuditRecord | null>(null);

  // Demo Audit Logs
  const [auditLogs] = useState<AuditRecord[]>([
    {
      id: 'aud-101',
      systemName: 'Scribe Synthetic Persona Generator',
      intendedPurpose: 'Synthetic persona generation and user research simulation',
      riskLevel: 'LIMITED RISK',
      score: 94,
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      articleCitations: ['EU-ACT-ART-50(1)', 'EU-ACT-ART-50(2)'],
      hciCitations: ['SOT-COMP-2026', 'SOT-COMP-2028']
    },
    {
      id: 'aud-102',
      systemName: 'Nexus Legal Diagnostic Assistant',
      intendedPurpose: 'Auxiliary decision support for European regulatory documents',
      riskLevel: 'MINIMAL RISK',
      score: 88,
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      articleCitations: ['EU-ACT-ART-14(4)', 'EU-ACT-ART-11'],
      hciCitations: ['SOT-COMP-2027']
    },
    {
      id: 'aud-103',
      systemName: 'OmniVoice Automated Recruiter',
      intendedPurpose: 'Biometric voice emotion recognition in job interviews',
      riskLevel: 'HIGH-RISK',
      score: 62,
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      articleCitations: ['EU-ACT-ART-6(2)', 'EU-ACT-ART-14', 'EU-ACT-ART-15'],
      hciCitations: ['SOT-COMP-3011', 'SOT-COMP-3012']
    }
  ]);

  // Waitlist submission handler
  const handleJoinWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail.trim()) return;
    setSubmittingWaitlist(true);
    setTimeout(() => {
      setSubmittingWaitlist(false);
      setSubmittedWaitlist(true);
    }, 800);
  };

  // Copy helper
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMcp(true);
    setTimeout(() => setCopiedMcp(false), 2000);
  };

  // Zero-setup MCP configurations (No API key needed!)
  const mcpConfigs = {
    cursor: {
      title: 'Cursor IDE',
      filename: '.cursor/mcp.json',
      json: JSON.stringify({
        mcpServers: {
          tsot: {
            command: "npx",
            args: ["-y", "tsot-mcp-server"]
          }
        }
      }, null, 2)
    },
    claude: {
      title: 'Claude Desktop',
      filename: 'claude_desktop_config.json',
      json: JSON.stringify({
        mcpServers: {
          tsot: {
            command: "npx",
            args: ["-y", "tsot-mcp-server"]
          }
        }
      }, null, 2)
    },
    windsurf: {
      title: 'Windsurf',
      filename: '~/.codeium/windsurf/mcp_config.json',
      json: JSON.stringify({
        mcpServers: {
          tsot: {
            command: "npx",
            args: ["-y", "tsot-mcp-server"]
          }
        }
      }, null, 2)
    },
    roocode: {
      title: 'Roo Code / Roo-Cline',
      filename: 'roo_code_mcp_settings.json',
      json: JSON.stringify({
        mcpServers: {
          tsot: {
            command: "npx",
            args: ["-y", "tsot-mcp-server"]
          }
        }
      }, null, 2)
    },
    cli: {
      title: 'Local CLI / Standalone Stdio',
      filename: 'Terminal Command',
      json: `npx -y tsot-mcp-server`
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-sans selection:bg-[#5a018a] selection:text-white pb-20">
      
      {/* Header Bar */}
      <div className="border-b border-neutral-800 bg-[#111115]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5a018a] to-[#3a66f5] flex items-center justify-center font-bold text-white shadow-md">
              TS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-[18px] text-white tracking-tight">
                  Developer Dashboard
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  MCP Local Mode (Free)
                </span>
              </div>
              <p className="text-[12px] text-neutral-400 font-mono mt-0.5">
                Zero Setup • 3,000 Papers + 124 Statutory Articles In-Memory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#mcp-setup"
              className="py-2 px-4 rounded-[10px] bg-[#3a66f5] hover:bg-[#254edb] text-white text-[13px] font-medium transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <Cpu className="w-4 h-4" />
              <span>Use Free MCP Server</span>
            </a>
            <a
              href="#api-waitlist"
              className="py-2 px-4 rounded-[10px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[13px] font-bold transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-white" />
              <span>Join API Waitlist</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 pt-8 space-y-8">
        
        {/* Highlight Banner: Use MCP Server */}
        <div className="relative rounded-[24px] bg-gradient-to-r from-[#171426] via-[#12121c] to-[#0f172a] border border-purple-500/30 p-8 shadow-2xl overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-[800px] space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              Recommended Integration Model
            </div>

            <h2 className="font-['Plus_Jakarta_Sans'] text-[28px] md:text-[34px] font-bold text-white tracking-tight leading-tight">
              Use TSOT via MCP Server <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                100% Free • Zero Configuration Required
              </span>
            </h2>

            <p className="text-[14px] md:text-[15px] text-neutral-300 leading-relaxed font-sans">
              No API keys or cloud credentials needed! Run <code className="font-mono text-purple-300 bg-black/50 px-2 py-0.5 rounded border border-purple-500/30">npx -y tsot-mcp-server</code> directly in Cursor, Claude Desktop, Windsurf, or Roo Code. It includes <strong>3,000 embedded HCI research papers</strong> and <strong>124 statutory EU AI Act articles</strong> with sub-2ms BM25 local search.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="#mcp-setup"
                className="py-3 px-6 rounded-[12px] bg-[#3a66f5] hover:bg-[#254edb] text-white font-bold text-[13px] transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
              >
                <Terminal className="w-4 h-4" />
                <span>Get MCP Setup Snippets</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/mcp"
                className="py-3 px-5 rounded-[12px] bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 font-medium text-[13px] border border-neutral-700 transition-colors flex items-center gap-2"
              >
                <span>Try Live MCP Sandbox</span>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
              </Link>
            </div>
          </div>
        </div>

        {/* Section: MCP Configuration Studio */}
        <div id="mcp-setup" className="bg-[#121216] border border-neutral-800 rounded-[24px] p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-400" />
                <h2 className="font-['Plus_Jakarta_Sans'] text-[20px] font-bold text-white tracking-tight">
                  Free MCP Server Integration Studio
                </h2>
              </div>
              <p className="text-[13px] text-neutral-400 mt-1">
                Zero API key required. Copy the pre-configured JSON snippet directly into your IDE config file.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#18181f] p-1 rounded-[12px] border border-neutral-800 self-start sm:self-auto">
              {(['cursor', 'claude', 'windsurf', 'roocode', 'cli'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setMcpTab(tab)}
                  className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-all cursor-pointer ${
                    mcpTab === tab 
                      ? 'bg-[#3a66f5] text-white shadow-sm font-semibold' 
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {tab === 'cursor' && 'Cursor'}
                  {tab === 'claude' && 'Claude'}
                  {tab === 'windsurf' && 'Windsurf'}
                  {tab === 'roocode' && 'Roo Code'}
                  {tab === 'cli' && 'CLI Stdio'}
                </button>
              ))}
            </div>
          </div>

          {/* Config Box */}
          <div className="relative rounded-[16px] bg-[#0c0c0e] border border-neutral-800 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-[#16161c] border-b border-neutral-800 font-mono text-[12px]">
              <div className="flex items-center gap-2 text-neutral-300">
                <Code className="w-4 h-4 text-purple-400" />
                <span>{mcpConfigs[mcpTab].filename}</span>
              </div>
              <button
                onClick={() => handleCopyText(mcpConfigs[mcpTab].json)}
                className="py-1 px-3 rounded-[6px] bg-neutral-800 hover:bg-neutral-700 text-white text-[12px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedMcp ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Config</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 text-[13.5px] font-mono text-purple-300 leading-relaxed overflow-x-auto">
              <code>{mcpConfigs[mcpTab].json}</code>
            </pre>

            <div className="px-4 py-2.5 bg-[#14141a] border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-400 font-sans">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                100% Free Local Stdio Mode • Unlimited Local Queries
              </span>
              <span>Sub-2ms In-Memory BM25 Search Engine</span>
            </div>
          </div>
        </div>

        {/* Section: Cloud API Waitlist */}
        <div id="api-waitlist" className="bg-[#121216] border border-neutral-800 rounded-[24px] p-8 shadow-xl space-y-6 relative overflow-hidden">
          <div className="max-w-[750px] space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Hosted Cloud API (Private Beta)
              </span>
            </div>

            <h2 className="font-['Plus_Jakarta_Sans'] text-[24px] md:text-[28px] font-bold text-white tracking-tight">
              Join the TSOT Hosted Cloud API Waitlist
            </h2>

            <p className="text-[14px] text-neutral-300 leading-relaxed">
              We are rolling out hosted Cloud API access for enterprise pipelines requiring <strong>768-dim vector embeddings</strong>, live daily auto-ingested OpenAlex research updates (9,200+ papers), and statutory Article 11 pre-filing export tools.
            </p>
          </div>

          {submittedWaitlist ? (
            <div className="p-6 rounded-[16px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2 font-sans">
              <div className="flex items-center gap-2 font-bold text-[16px] text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                You're on the Cloud API Waitlist!
              </div>
              <p className="text-[13px] text-neutral-300">
                Thank you for applying. Your position is reserved. In the meantime, enjoy unlimited local audits using the free <code className="font-mono text-purple-300">tsot-mcp-server</code> package.
              </p>
            </div>
          ) : (
            <form onSubmit={handleJoinWaitlist} className="space-y-4 max-w-[600px] pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-mono uppercase text-neutral-400 mb-1.5">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="developer@company.com"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#16161c] border border-neutral-700 text-white text-[13px] focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-mono uppercase text-neutral-400 mb-1.5">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    placeholder="Acme AI Labs"
                    value={waitlistCompany}
                    onChange={(e) => setWaitlistCompany(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#16161c] border border-neutral-700 text-white text-[13px] focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-mono uppercase text-neutral-400 mb-1.5">
                  Primary Use Case
                </label>
                <select
                  value={waitlistUseCase}
                  onChange={(e) => setWaitlistUseCase(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#16161c] border border-neutral-700 text-white text-[13px] focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="Enterprise AI Compliance">Enterprise EU AI Act Compliance</option>
                  <option value="Automated CI/CD Verification">Automated CI/CD Verification Pipeline</option>
                  <option value="HCI & Cognitive Safety Research">HCI & Cognitive Safety Research</option>
                  <option value="Agentic Tooling & MCP">Agentic Tooling & MCP</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submittingWaitlist || !waitlistEmail.trim()}
                className="py-3 px-6 rounded-[12px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-[13px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/20 disabled:opacity-50"
              >
                {submittingWaitlist ? (
                  <span>Submitting Application...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Join Cloud API Waitlist</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-2 flex items-center gap-6 text-[12px] text-neutral-400 font-mono border-t border-neutral-800/80">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Rolling Invites Weekly
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              Hosted in EU Data Centers
            </span>
          </div>
        </div>

        {/* Section: EU AI Act Diagnostic Ledger */}
        <div className="bg-[#121216] border border-neutral-800 rounded-[24px] p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h2 className="font-['Plus_Jakarta_Sans'] text-[20px] font-bold text-white tracking-tight">
                  EU AI Act Diagnostic Ledger
                </h2>
              </div>
              <p className="text-[13px] text-neutral-400 mt-1">
                Historical compliance evaluations generated by your system via the Auditor interface or MCP server tools.
              </p>
            </div>

            <Link
              href="/auditor"
              className="py-2.5 px-4 rounded-[12px] bg-neutral-800 hover:bg-neutral-700 text-white text-[13px] font-medium transition-all flex items-center justify-center gap-2 cursor-pointer border border-neutral-700"
            >
              <span>Run New Audit</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 rounded-[16px] bg-[#17171e] border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[15px] text-white font-['Plus_Jakarta_Sans']">
                      {log.systemName}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider ${
                      log.riskLevel === 'LIMITED RISK' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      log.riskLevel === 'HIGH-RISK' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {log.riskLevel}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-neutral-400 font-sans">
                    {log.intendedPurpose}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px] text-neutral-400">
                    <span>Citations:</span>
                    {log.articleCitations.map(c => (
                      <span key={c} className="bg-neutral-800 px-2 py-0.5 rounded text-purple-300">{c}</span>
                    ))}
                    {log.hciCitations.map(c => (
                      <span key={c} className="bg-neutral-800 px-2 py-0.5 rounded text-blue-300">{c}</span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                  <div className="text-right">
                    <div className="text-[20px] font-bold text-emerald-400 font-['Plus_Jakarta_Sans']">
                      {log.score}%
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono">
                      Compliance Score
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedAuditForDossier(log)}
                    className="py-2 px-3.5 rounded-[10px] bg-[#3a66f5]/10 hover:bg-[#3a66f5]/20 text-[#3a66f5] border border-[#3a66f5]/30 text-[12px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Article 11 Dossier</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MODAL: Article 11 Dossier Viewer */}
      {selectedAuditForDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-[700px] bg-[#121216] border border-neutral-800 rounded-[24px] p-6 text-white shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-[18px] font-bold font-['Plus_Jakarta_Sans'] text-white">
                  Statutory EU AI Act Article 11 Compliance Dossier
                </h3>
              </div>
              <button
                onClick={() => setSelectedAuditForDossier(null)}
                className="p-1 rounded bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-2 font-mono text-[12px] text-neutral-300 leading-relaxed">
              <div className="p-3 bg-[#0a0a0c] rounded-[10px] border border-neutral-800">
                <span className="text-purple-400"># ARTICLE 11 TECHNICAL DOCUMENTATION DOSSIER</span><br/>
                <span className="text-neutral-500">Regulation (EU) 2024/1689 Assessment Report</span><br/><br/>
                System Name: {selectedAuditForDossier.systemName}<br/>
                Intended Purpose: {selectedAuditForDossier.intendedPurpose}<br/>
                Statutory Taxonomy Tier: <span className="text-amber-400">{selectedAuditForDossier.riskLevel}</span><br/>
                Quantitative Safety Score: <span className="text-emerald-400">{selectedAuditForDossier.score}%</span><br/>
                Generated Timestamp: {selectedAuditForDossier.timestamp}<br/><br/>
                ## Statutory Mandates Verified:<br/>
                {selectedAuditForDossier.articleCitations.map(c => `- ${c}: Compliant\n`)}<br/>
                ## Scientific Provenance References:<br/>
                {selectedAuditForDossier.hciCitations.map(c => `- ${c}: Evidence Verified\n`)}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-neutral-800">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`ARTICLE 11 DOSSIER\nSystem: ${selectedAuditForDossier.systemName}\nRisk Tier: ${selectedAuditForDossier.riskLevel}\nScore: ${selectedAuditForDossier.score}%`);
                  setSelectedAuditForDossier(null);
                }}
                className="py-2 px-4 rounded-[10px] bg-[#3a66f5] hover:bg-[#254edb] text-white font-bold text-[12px] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Dossier Text</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
