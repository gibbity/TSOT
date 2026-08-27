import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import HeroSplitConsole from '@/components/landing/HeroSplitConsole';
import { 
  ShieldCheck,
  ArrowRight,
  Cpu,
  BookOpen,
  Terminal,
  CheckCircle2,
  ExternalLink,
  Code2,
} from 'lucide-react';

export default async function HomePage() {
  let registryCount = 9200;
  let aiActCount = 124;

  try {
    const supabase = await createClient();
    const { count: regCount } = await supabase.from('registry').select('*', { count: 'exact', head: true });
    if (regCount !== null) registryCount = regCount;
    const { count: actCount } = await supabase.from('ai_act').select('*', { count: 'exact', head: true });
    if (actCount !== null) aiActCount = actCount;
  } catch (e) {}

  const ledgerSamples = [
    {
      code: 'SOT-COMP-2026',
      pillar: 'COGNITIVE OFFLOADING',
      finding: 'User self-verification accuracy drops to 59% under uninterrupted AI monologues.',
      fix: 'Mandatory verification checkpoint every 3 conversational turns.',
      article: 'Art. 50(1)',
      risk: 'HIGH-RISK',
      riskColor: 'text-red-400 bg-red-500/10 border-red-500/20',
    },
    {
      code: 'SOT-COMP-2027',
      pillar: 'FRICTION & VERIFICATION',
      finding: 'AI emotional simulation shifts user prospective planning by 47%.',
      fix: 'Remove subjective validation verbs from task-oriented interfaces.',
      article: 'Art. 14(4)',
      risk: 'LIMITED RISK',
      riskColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      code: 'SOT-COMP-2028',
      pillar: 'EPISTEMIC AGENCY',
      finding: 'Hyper-personalized AI feeds reduce search query depth by 75%.',
      fix: 'Maintain a static unpersonalized source sidebar to preserve discovery.',
      article: 'Art. 11',
      risk: 'MINIMAL RISK',
      riskColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <main className="bg-[#ffffff] min-h-screen font-sans text-[#212121] overflow-x-hidden selection:bg-[#003c33] selection:text-white">

      {/* ============================================================ */}
      {/* 1. HERO — Dark canvas, centered, single focal point          */}
      {/* ============================================================ */}
      <HeroSplitConsole />

      {/* ============================================================ */}
      {/* 2. IDE MOCKUP — Labeled, contextual, full-width              */}
      {/* ============================================================ */}
      <section className="py-16 bg-[#f7f7f5] border-b border-[#e5e7eb]">
        <div className="max-w-[860px] mx-auto px-6 space-y-5">

          {/* Label above — Vercel-style contextual caption */}
          <div className="text-center space-y-1">
            <p className="text-[11.5px] font-mono font-bold uppercase tracking-widest text-[#75758a]">
              What it looks like in Cursor
            </p>
            <p className="text-[14px] text-[#616161] font-sans">
              One prompt. Instant statutory citation. No browser tab required.
            </p>
          </div>

          {/* IDE Window */}
          <div className="bg-[#1a1a1f] rounded-[20px] border border-[#2a2a32] shadow-2xl overflow-hidden ring-1 ring-white/5">
            {/* Window Chrome */}
            <div className="flex items-center px-4 py-3 bg-[#131317] border-b border-[#2a2a32] relative">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <span className="text-[11.5px] font-mono text-neutral-400 absolute left-1/2 -translate-x-1/2">
                Cursor — Agent Chat
              </span>
              <span className="ml-auto text-[10.5px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25 font-semibold">
                tsot-mcp-server ●
              </span>
            </div>

            {/* Chat */}
            <div className="p-6 space-y-4">
              {/* User bubble */}
              <div className="flex justify-end">
                <div className="bg-[#2a2a35] text-white text-[13.5px] font-sans rounded-2xl rounded-tr-sm px-4 py-3 max-w-[68%] leading-relaxed">
                  Audit this agent prompt for EU AI Act compliance risk.
                </div>
              </div>

              {/* AI response */}
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-[#003c33] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                </div>
                <div className="bg-[#0f0f14] border border-[#252530] rounded-2xl rounded-tl-sm px-5 py-4 text-[13.5px] font-sans leading-relaxed space-y-3.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/25">
                      LIMITED RISK — Article 50
                    </span>
                    <span className="text-[11px] font-mono text-emerald-500">1.6ms · local BM25 engine</span>
                  </div>
                  <p className="text-neutral-300 leading-relaxed">
                    This agent generates synthetic persona responses without an explicit AI disclosure. Under{' '}
                    <code className="font-mono text-[12px] bg-[#1e1e2a] px-1.5 py-0.5 rounded text-purple-300">Reg. (EU) 2024/1689</code>{' '}
                    you must notify users they are interacting with an AI system at the outset of every interaction.
                  </p>
                  <div className="border-t border-[#252530] pt-3 space-y-1">
                    <p className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">Required action</p>
                    <p className="text-[13px] text-emerald-300 font-medium leading-relaxed">
                      Add a disclosure notice at session start — backed by{' '}
                      <code className="font-mono text-[11.5px] bg-[#1e1e2a] px-1.5 py-0.5 rounded text-blue-300">[SOT-COMP-2026]</code>{' '}
                      and statutory citation{' '}
                      <code className="font-mono text-[11.5px] bg-[#1e1e2a] px-1.5 py-0.5 rounded text-purple-300">[Art. 50(1)]</code>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bar */}
            <div className="px-6 py-3 border-t border-[#2a2a32] flex items-center justify-between text-[11.5px] font-mono text-neutral-600">
              <span>{registryCount.toLocaleString()} papers + {aiActCount} articles indexed · runs fully offline</span>
              <Link href="/registry" className="text-emerald-500 hover:text-emerald-300 transition-colors flex items-center gap-1">
                Open Research Ledger →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. STAT BAR — Monochrome, 4 numbers, zero effort             */}
      {/* ============================================================ */}
      <section className="py-12 border-b border-[#e5e7eb] bg-[#ffffff]">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#e5e7eb]">
            {[
              { number: `${registryCount.toLocaleString()}+`, label: 'Peer-reviewed papers', sub: 'HCI, Cognitive Science, AI Safety' },
              { number: `${aiActCount}`, label: 'EU AI Act articles', sub: 'Full Regulation (EU) 2024/1689' },
              { number: '<2ms', label: 'Response time', sub: 'In-memory BM25, fully offline' },
              { number: '$0', label: 'Cost to run', sub: 'No key, no account, no limit' },
            ].map((s) => (
              <div key={s.label} className="px-8 py-8 first:pl-0 last:pr-0 space-y-1">
                <div className="font-['Plus_Jakarta_Sans'] text-[34px] font-bold text-[#000000] tracking-tight leading-none">
                  {s.number}
                </div>
                <div className="text-[13.5px] font-semibold text-[#212121] pt-0.5">{s.label}</div>
                <div className="text-[12px] text-[#9a9aaa] font-mono">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. LEDGER MOAT — The unfair advantage. Show, don't claim.   */}
      {/* ============================================================ */}
      <section className="py-20 bg-[#0a0a0c] text-white relative overflow-hidden">
        {/* Subtle grid background matching hero */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative max-w-[1100px] mx-auto px-6 space-y-12">

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-4 max-w-[600px]">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider font-bold bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                <BookOpen className="w-3 h-3" />
                The Research Ledger
              </span>
              <h2 className="font-['Plus_Jakarta_Sans'] text-[32px] sm:text-[42px] font-normal leading-[1.1] tracking-[-0.8px] text-white">
                No other compliance tool is backed by{' '}
                <span className="text-emerald-400">{registryCount.toLocaleString()}+</span> peer-reviewed papers.
              </h2>
              <p className="text-[16px] text-neutral-400 font-sans leading-relaxed">
                Every audit cites real research — empirical HCI findings mapped to the exact statutory article that applies to your system.
                Not AI-generated advice. Not legal opinion.
              </p>
            </div>
            <Link
              href="/registry"
              className="shrink-0 inline-flex items-center gap-2 bg-white text-[#0a0a0c] font-bold text-[14px] px-6 py-3.5 rounded-full hover:bg-neutral-100 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore the Ledger</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Ledger table */}
          <div className="border border-white/8 rounded-[16px] overflow-hidden divide-y divide-white/6">
            {/* Header row */}
            <div className="grid grid-cols-12 px-5 py-3 bg-white/4 text-[10.5px] font-mono uppercase tracking-widest text-neutral-600">
              <span className="col-span-2">Code</span>
              <span className="col-span-4">HCI Finding</span>
              <span className="col-span-3 hidden md:block">Required Fix</span>
              <span className="col-span-2">EU Article</span>
              <span className="col-span-1">Risk</span>
            </div>
            {ledgerSamples.map((row) => (
              <Link
                key={row.code}
                href={`/registry?search=${encodeURIComponent(row.code)}`}
                className="grid grid-cols-12 px-5 py-5 gap-4 bg-transparent hover:bg-white/3 transition-colors items-start cursor-pointer group"
              >
                <div className="col-span-2 space-y-1">
                  <div className="font-mono text-[11.5px] text-emerald-400 font-bold group-hover:underline">{row.code}</div>
                  <div className="font-mono text-[10px] text-neutral-600 uppercase hidden sm:block">{row.pillar}</div>
                </div>
                <div className="col-span-4 text-[13px] text-neutral-300 font-sans leading-snug">
                  {row.finding}
                </div>
                <div className="col-span-3 text-[12.5px] text-neutral-500 font-sans leading-snug hidden md:block">
                  {row.fix}
                </div>
                <div className="col-span-2 font-mono text-[11.5px] text-blue-400">
                  [{row.article}]
                </div>
                <div className="col-span-1">
                  <span className={`inline-block font-mono text-[9.5px] font-bold px-2 py-0.5 rounded-md border ${row.riskColor} whitespace-nowrap`}>
                    {row.risk.split(' ')[0]}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <p className="text-center font-mono text-[12px] text-neutral-700">
            Showing 3 of {registryCount.toLocaleString()}+ indexed records · Updated continuously via OpenAlex
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. HOW IT WORKS — Minimal, numbered, scannable               */}
      {/* ============================================================ */}
      <section className="py-20 bg-[#f7f7f5] border-b border-[#e5e7eb]">
        <div className="max-w-[1100px] mx-auto px-6 space-y-12">

          <div className="space-y-2 max-w-[480px]">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#9a9aaa]">
              Setup in 10 seconds
            </span>
            <h2 className="font-['Plus_Jakarta_Sans'] text-[30px] font-bold text-[#000000] tracking-tight">
              Add it once. It runs inside<br />your editor forever.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                n: '01',
                title: 'Add the MCP server',
                body: (
                  <>
                    Add{' '}
                    <code className="font-mono text-[#003c33] bg-emerald-50 px-1.5 py-0.5 rounded text-[12px] border border-emerald-100">
                      npx -y tsot-mcp-server
                    </code>{' '}
                    to your Cursor, Claude Desktop, or Windsurf MCP config file.
                  </>
                ),
              },
              {
                n: '02',
                title: 'Ask while you build',
                body: (
                  <>
                    Prompt your agent:{' '}
                    <em className="text-[#212121] not-italic font-medium">
                      "Audit this prompt for EU AI Act risk"
                    </em>{' '}
                    — no context switching, no browser tab.
                  </>
                ),
              },
              {
                n: '03',
                title: 'Get citations, not opinions',
                body: (
                  <>
                    Every response includes a statutory article tag like{' '}
                    <code className="font-mono text-[#003c33] text-[12px]">[Art. 50]</code>{' '}
                    and a citable HCI research paper reference from the Ledger.
                  </>
                ),
              },
            ].map((step) => (
              <div key={step.n} className="p-7 rounded-[18px] bg-white border border-[#e5e7eb] space-y-4 hover:border-[#003c33]/20 hover:shadow-sm transition-all">
                <div className="font-mono text-[13px] font-bold text-[#003c33] bg-[#e8f5f0] w-9 h-9 rounded-full flex items-center justify-center border border-[#003c33]/15">
                  {step.n}
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-[#000000] leading-snug">
                  {step.title}
                </h3>
                <p className="text-[13.5px] text-[#616161] leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. CTA — Dark, minimal, command as anchor                    */}
      {/* ============================================================ */}
      <section className="py-24 bg-[#0a0a0c] text-white relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative max-w-[680px] mx-auto px-6 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="font-['Plus_Jakarta_Sans'] text-[38px] sm:text-[50px] font-normal tracking-[-1.2px] text-white leading-[1.08]">
              Free. Local.<br />No keys.
            </h2>
            <p className="text-[16px] text-neutral-500 font-sans">
              Never ship an EU AI Act violation again.
            </p>
          </div>

          {/* Command */}
          <div className="inline-flex items-center gap-3 px-5 py-4 bg-[#0f1a14] border border-emerald-500/20 rounded-[14px] font-mono text-[15px] text-emerald-400 shadow-lg shadow-emerald-900/20">
            <Terminal className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>npx -y tsot-mcp-server</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px] font-mono text-neutral-600">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> No signup</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> No API key</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Works offline</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Unlimited local queries</span>
          </div>

          <div className="pt-1 border-t border-white/5">
            <Link
              href="/waitlist"
              className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-300 text-[13.5px] transition-colors font-mono"
            >
              <span>Need cloud-scale search or Article 11 dossiers?</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
