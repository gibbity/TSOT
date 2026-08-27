'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Cpu,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  FileText,
  Terminal,
  Globe,
  Lock,
  Send,
  Check,
  Copy,
  Server,
  Activity,
  Zap,
} from 'lucide-react';

const GRID_STYLE = {
  backgroundImage: `
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
  `,
  backgroundSize: '48px 48px',
};

const launchFeatures = [
  {
    icon: <Server className="w-5 h-5 text-emerald-400" />,
    tag: 'Cloud Infrastructure',
    title: '768-dim Cloud Vector Search',
    description: 'Full 9,200+ paper corpus with real-time vector similarity embeddings, updated weekly via OpenAlex.',
  },
  {
    icon: <FileText className="w-5 h-5 text-emerald-400" />,
    tag: 'Statutory Compliance',
    title: 'Article 11 Documentation Exporter',
    description: 'One-click PDF & Markdown dossiers formatted for Regulation (EU) 2024/1689 conformity assessments.',
  },
  {
    icon: <Activity className="w-5 h-5 text-emerald-400" />,
    tag: 'CI/CD Automation',
    title: 'Continuous Safety Copilot',
    description: 'Automated prompt scrutiny and cognitive degradation checks directly in your GitHub Actions workflow.',
  },
  {
    icon: <Lock className="w-5 h-5 text-emerald-400" />,
    tag: 'Enterprise',
    title: 'Private Cloud Gateway',
    description: 'SOC2-compliant gateway pre-indexed with your internal prompt libraries and proprietary architectures.',
  },
];

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [useCase, setUseCase] = useState('Article 11 Compliance Dossiers');
  const [modelCount, setModelCount] = useState('1-5 AI Agents');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedMcp, setCopiedMcp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setSubmitted(true); }, 800);
  };

  const handleCopyMcp = () => {
    navigator.clipboard.writeText('npx -y tsot-mcp-server');
    setCopiedMcp(true);
    setTimeout(() => setCopiedMcp(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white font-sans selection:bg-emerald-900 selection:text-emerald-100">

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/8">
        <div className="absolute inset-0 pointer-events-none" style={GRID_STYLE} />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,60,51,0.3) 0%, transparent 70%)' }}
        />
        <div className="relative max-w-[780px] mx-auto px-6 pt-20 pb-16 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11.5px] font-mono tracking-wider text-neutral-300 bg-white/5 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>DEVELOPER ROADMAP · HOSTED CLOUD BETA</span>
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] text-[38px] sm:text-[52px] font-normal leading-[1.05] tracking-[-1.4px] text-white">
            What TSOT is launching next.
          </h1>
          <p className="text-neutral-400 text-[17px] leading-relaxed max-w-[560px] mx-auto">
            The free MCP server is available today. The enterprise cloud engine — cloud vector search, Article 11 dossiers, and CI/CD integration — is coming soon.
          </p>
        </div>
      </section>

      {/* Launch Features */}
      <section className="py-16 border-b border-white/8">
        <div className="max-w-[1100px] mx-auto px-6 space-y-10">
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-neutral-600">Upcoming Platform Capabilities</span>
            <h2 className="font-['Plus_Jakarta_Sans'] text-[26px] font-bold text-white tracking-tight">
              Built for AI teams shipping under Regulation (EU) 2024/1689.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {launchFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="p-7 rounded-[18px] bg-white/3 border border-white/8 space-y-4 hover:border-emerald-500/20 hover:bg-white/5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-[10px] bg-emerald-500/10 border border-emerald-500/15">
                    {feat.icon}
                  </div>
                  <span className="text-[10.5px] font-mono uppercase tracking-wider font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/15">
                    {feat.tag}
                  </span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-white leading-snug">
                  {feat.title}
                </h3>
                <p className="text-[13.5px] text-neutral-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist Form */}
      <section className="py-16 border-b border-white/8">
        <div className="max-w-[680px] mx-auto px-6">
          <div className="rounded-[20px] bg-white/3 border border-white/10 p-8 sm:p-10 space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Zap className="w-3.5 h-3.5" />
                Early Access Registration
              </div>
              <h2 className="font-['Plus_Jakarta_Sans'] text-[26px] sm:text-[30px] font-normal text-white tracking-tight">
                Join the Private Cloud Beta Waitlist
              </h2>
              <p className="text-[14px] text-neutral-400 leading-relaxed">
                Be among the first teams to access hosted vector search, automated Article 11 dossiers, and CI/CD compliance integrations.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-[14px] bg-emerald-500/8 border border-emerald-500/20 text-emerald-300 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[17px] text-emerald-300 font-['Plus_Jakarta_Sans']">You're on the waitlist!</h3>
                    <p className="text-[12px] text-neutral-500 font-mono mt-0.5">Onboarding Wave 2 · Q3 2026</p>
                  </div>
                </div>
                <p className="text-[13.5px] text-neutral-300 leading-relaxed">
                  While you wait, start auditing locally today with the free MCP server:
                </p>
                <div className="flex items-center justify-between gap-3 p-3.5 rounded-[10px] bg-[#0f1a14] border border-emerald-500/20 font-mono text-[13px] text-emerald-400">
                  <span>npx -y tsot-mcp-server</span>
                  <button
                    onClick={handleCopyMcp}
                    className="py-1 px-3 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 text-[12px] font-sans flex items-center gap-1.5 cursor-pointer transition-colors border border-white/10"
                  >
                    {copiedMcp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedMcp ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5">Full Name *</label>
                    <input
                      type="text" required placeholder="Alex Mercer" value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-[10px] bg-white/4 border border-white/10 text-white text-[13.5px] focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-neutral-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5">Work Email *</label>
                    <input
                      type="email" required placeholder="alex@company.com" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-[10px] bg-white/4 border border-white/10 text-white text-[13.5px] focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-neutral-600"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5">Company</label>
                    <input
                      type="text" placeholder="Cognitive Labs AI" value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-4 py-3 rounded-[10px] bg-white/4 border border-white/10 text-white text-[13.5px] focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-neutral-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5">AI Agents in Prod</label>
                    <select
                      value={modelCount} onChange={(e) => setModelCount(e.target.value)}
                      className="w-full px-4 py-3 rounded-[10px] bg-[#0a0a0c] border border-white/10 text-white text-[13.5px] focus:outline-none focus:border-emerald-500/50 transition-colors"
                    >
                      <option value="1-5 AI Agents">1–5 AI Agents</option>
                      <option value="5-20 AI Agents">5–20 AI Agents</option>
                      <option value="20+ AI Agents">20+ Enterprise</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5">Primary Capability Needed</label>
                  <select
                    value={useCase} onChange={(e) => setUseCase(e.target.value)}
                    className="w-full px-4 py-3 rounded-[10px] bg-[#0a0a0c] border border-white/10 text-white text-[13.5px] focus:outline-none focus:border-emerald-500/50 transition-colors"
                  >
                    <option value="Article 11 Compliance Dossiers">Article 11 Technical Documentation Exporter</option>
                    <option value="Cloud Vector API">Cloud Vector Search API (9,200+ Papers)</option>
                    <option value="CI/CD Safety">Automated CI/CD Safety Copilot</option>
                    <option value="Enterprise Gateway">Enterprise Private Vector Gateway</option>
                  </select>
                </div>
                <button
                  type="submit" disabled={submitting || !email.trim()}
                  className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-neutral-100 text-[#0a0a0c] font-bold text-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  {submitting ? 'Submitting...' : (
                    <>
                      <Send className="w-4 h-4 text-[#003c33]" />
                      <span>Join Cloud Beta Waitlist</span>
                      <ArrowRight className="w-4 h-4 text-[#003c33]" />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="pt-4 border-t border-white/8 flex flex-wrap items-center justify-between text-[12px] text-neutral-600 font-mono gap-3">
              <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-emerald-700" /> EU Data Sovereignty · GDPR Compliant</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Regulation (EU) 2024/1689 Aligned</span>
            </div>
          </div>
        </div>
      </section>

      {/* Free MCP CTA */}
      <section className="py-16">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="rounded-[20px] bg-white/3 border border-white/10 p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[12px] font-bold">
                <CheckCircle2 className="w-4 h-4" /> Available Today · 100% Free
              </div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-[22px] font-bold text-white tracking-tight">
                Start locally right now.
              </h3>
              <p className="text-[14px] text-neutral-400">
                Zero API key. Sub-2ms BM25 over 3,000 papers + 124 EU AI Act articles.
              </p>
            </div>
            <Link
              href="/mcp"
              className="shrink-0 py-3.5 px-6 rounded-full bg-white text-[#0a0a0c] font-bold text-[14px] hover:bg-neutral-100 transition-all flex items-center gap-2"
            >
              <Cpu className="w-4 h-4 text-[#003c33]" />
              <span>Use Free MCP Server</span>
              <ArrowRight className="w-4 h-4 text-[#003c33]" />
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
