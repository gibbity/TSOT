import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const GRID_STYLE = {
  backgroundImage: `
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
  `,
  backgroundSize: '48px 48px',
};

const pillars = [
  {
    n: '01',
    title: 'COGNITIVE OFFLOADING',
    body: 'Deals with technologies that erode human prospective memory, structural planning, logical reasoning, and long-term retention. Evaluates the long-term impact of delegating cognitive tasks to machines.',
    accent: 'border-purple-500/20 hover:border-purple-500/40',
    tag: 'text-purple-400',
  },
  {
    n: '02',
    title: 'FRICTION & VERIFICATION',
    body: 'Measures interface interventions that interrupt automated habits. Focuses on productive friction paradigms that calibrate user expectations and restore active verification loops.',
    accent: 'border-emerald-500/20 hover:border-emerald-500/40',
    tag: 'text-emerald-400',
  },
  {
    n: '03',
    title: 'TEMPORAL PERCEPTION',
    body: 'Evaluates response timing, system latencies, and output pacing. Researches how real-time streaming and immediate reply structures affect human turn-taking thresholds and anthropomorphism.',
    accent: 'border-amber-500/20 hover:border-amber-500/40',
    tag: 'text-amber-400',
  },
  {
    n: '04',
    title: 'EPISTEMIC AGENCY',
    body: 'Studies how generative search formats, personalized sentiment mapping, and contextual source filtering change how users establish truth, review evidence, and shape beliefs.',
    accent: 'border-red-500/20 hover:border-red-500/40',
    tag: 'text-red-400',
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white font-sans selection:bg-emerald-900 selection:text-emerald-100">

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/8">
        <div className="absolute inset-0 pointer-events-none" style={GRID_STYLE} />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[280px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,60,51,0.25) 0%, transparent 70%)' }}
        />
        <div className="relative max-w-[780px] mx-auto px-6 pt-20 pb-16 space-y-5">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11.5px] font-mono tracking-wider text-neutral-400 bg-white/5 border border-white/10">
            Methodology & Research Pillars
          </span>
          <h1 className="font-['Plus_Jakarta_Sans'] text-[38px] sm:text-[52px] font-normal leading-[1.05] tracking-[-1.4px] text-white">
            Map how AI alters the human mind.
          </h1>
          <p className="text-neutral-400 text-[17px] leading-relaxed max-w-[560px]">
            TSOT converts empirical HCI discoveries into structured, actionable guidelines for engineers, designers, and founders building AI-powered products.
          </p>
        </div>
      </section>

      {/* What is TSOT */}
      <section className="py-16 border-b border-white/8">
        <div className="max-w-[800px] mx-auto px-6 space-y-6">
          <p className="text-[20px] text-neutral-200 leading-relaxed font-sans">
            The Sign of Times (TSOT) is a research registry designed to map how current AI interface structures alter human cognition, memory recall, planning, and belief calibration.
          </p>
          <p className="text-[15px] text-neutral-500 leading-relaxed">
            Unlike typical AI databases focused on model benchmarks or generic developer tooling, TSOT works from the outside in. We track the empirical effects of agentic design systems on the human mind, converting scientific discoveries into structured, actionable guidelines.
          </p>
        </div>
      </section>

      {/* Four Pillars */}
      <section className="py-16 border-b border-white/8">
        <div className="max-w-[1100px] mx-auto px-6 space-y-10">
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-neutral-600">The Four Cognitive Pillars</span>
            <h2 className="font-['Plus_Jakarta_Sans'] text-[28px] font-bold text-white tracking-tight">
              Every audit maps to one of four empirical research pillars.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pillars.map((p) => (
              <div
                key={p.n}
                className={`p-7 rounded-[18px] bg-white/3 border transition-all space-y-4 ${p.accent}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-[12px] font-bold uppercase tracking-widest ${p.tag}`}>
                    {p.title}
                  </span>
                  <span className="font-mono text-[11px] text-neutral-700">{p.n}</span>
                </div>
                <p className="text-[13.5px] text-neutral-400 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ingestion */}
      <section className="py-16 border-b border-white/8">
        <div className="max-w-[800px] mx-auto px-6 space-y-8">
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-neutral-600">Ingestion Automation & Integrity</span>
            <h2 className="font-['Plus_Jakarta_Sans'] text-[24px] font-bold text-white tracking-tight">
              Every record cites the source. No AI opinion without empirical grounding.
            </h2>
          </div>
          <div className="space-y-4 text-[15px] text-neutral-400 leading-relaxed">
            <p>
              Our registry queries <strong className="text-neutral-200">OpenAlex</strong> using specific target keywords. Abstracts are parsed through <strong className="text-neutral-200">Gemini Flash</strong> via a strict schema designed to convert complex statistical data into accessible, human-centric findings.
            </p>
            <p>
              To guarantee integrity, our editorial prompts forbid corporate cheerleading or alarmist framing. If a paper abstract fails to report clean, empirical metrics, it is flagged as such. Every registry record links directly to its original scholarly publication so users can cross-validate all findings.
            </p>
          </div>
        </div>
      </section>

      {/* Auditor Architecture */}
      <section className="py-16 border-b border-white/8">
        <div className="max-w-[800px] mx-auto px-6 space-y-6">
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-neutral-600">Adversarial Auditor Architecture</span>
            <h2 className="font-['Plus_Jakarta_Sans'] text-[24px] font-bold text-white tracking-tight">
              Retrieval-augmented generation grounded in real science.
            </h2>
          </div>
          <div className="space-y-4 text-[15px] text-neutral-400 leading-relaxed">
            <p>
              The MCP audit engine uses in-memory BM25 full-text indexing to query the registry. When you prompt your editor, it retrieves the most relevant research records as grounding context before generating any compliance finding.
            </p>
            <p>
              It then conducts a strict comparison: analyzing where your architecture presents risks against empirical HCI findings, and supplies explicit, sprint-actionable verdicts with mandatory statutory citation tags like <code className="font-mono text-[12px] bg-white/5 px-1.5 py-0.5 rounded text-emerald-400">[Art. 50(1)]</code>.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="rounded-[20px] bg-white/3 border border-white/10 p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="space-y-2">
              <h3 className="font-['Plus_Jakarta_Sans'] text-[22px] font-bold text-white tracking-tight">
                Explore the Research Ledger.
              </h3>
              <p className="text-[14px] text-neutral-400">
                Browse 9,200+ indexed HCI papers organized by cognitive pillar and EU AI Act statutory article.
              </p>
            </div>
            <Link
              href="/registry"
              className="shrink-0 py-3.5 px-6 rounded-full bg-white text-[#0a0a0c] font-bold text-[14px] hover:bg-neutral-100 transition-all flex items-center gap-2"
            >
              <span>Open the Ledger</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
