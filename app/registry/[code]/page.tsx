import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { RegistryRecord } from '@/types';
import RiskBadge from '@/components/registry/RiskBadge';
import SourceBadge from '@/components/registry/SourceBadge';
import { ArrowLeft, ExternalLink } from 'lucide-react';

const SEED_RECORDS: RegistryRecord[] = [
  {
    id: 1,
    code: 'SOT-COMP-2026',
    pillar: 'COGNITIVE OFFLOADING',
    title: 'AI self-verification drops to 59% accuracy under single-track monologues.',
    human_summary: 'When users rely on continuous, unstructured conversational agents without forcing step-by-step verification, their own cognitive tracking degrades. Longitudinal experiments track an erosion of prompt scrutiny and an immediate jump in reliance on hallucinated data outputs.',
    metric: '59% self-verification rate',
    verdict: 'Implement a mandatory structural checkpoint after 3 consecutive conversational steps to reset the cognitive verification baseline.',
    risk_level: 'critical',
    source_url: 'https://openalex.org',
    source_type: 'peer-reviewed',
    paper_year: 2026,
    authors: 'Monopoli, V., & Lora, A.',
    is_premium: false,
    created_at: '2026-05-19T00:00:00.000Z',
  },
  {
    id: 2,
    code: 'SOT-COMP-2027',
    pillar: 'FRICTION & VERIFICATION',
    title: "AI's emotional response simulation in group settings alters user prospective planning by 47%.",
    human_summary: 'Inserting conversational anthropomorphism in collaborative planning environments causes human partners to defer strategic decisions. The study tracks how simulated emotional validation bypasses critical skepticism systems, leading to high-friction adoption blockages.',
    metric: '47% prospective planning variance',
    verdict: 'Remove subjective validation verbs from task-oriented multi-agent interfaces. Enforce neutral, metrics-based statements.',
    risk_level: 'warning',
    source_url: 'https://openalex.org',
    source_type: 'preprint',
    paper_year: 2026,
    authors: 'Gartner, E., et al.',
    is_premium: false,
    created_at: '2026-05-19T00:00:00.000Z',
  },
  {
    id: 3,
    code: 'SOT-COMP-2028',
    pillar: 'EPISTEMIC AGENCY',
    title: 'AI language models exhibit a 75% reduction in search query depth with hyper-personalized feeds.',
    human_summary: 'Hyper-personalized search engines create prompt complacency. In studies where LLMs filtered answers based on perceived user sentiment profiles, individuals immediately stopped exploring divergent viewpoints, reducing their vocabulary variance and source cross-validation.',
    metric: '75% search query depth reduction',
    verdict: 'Maintain a static, unpersonalized sidebar of raw sources to preserve lateral discovery paths.',
    risk_level: 'stable',
    source_url: 'https://openalex.org',
    source_type: 'conference',
    paper_year: 2025,
    authors: 'Chen, H., & Muller, S.',
    is_premium: false,
    created_at: '2026-05-19T00:00:00.000Z',
  },
  {
    id: 4,
    code: 'SOT-COMP-3011',
    pillar: 'TEMPORAL PERCEPTION',
    title: 'Response latencies under 200ms trigger anthropomorphic projection in 82% of users.',
    human_summary: 'Sub-200ms streaming responses confuse human turn-taking thresholds. Participants who experienced instantaneous feedback consistently personified the machine, projecting intent, agency, and empathy onto system statements. Increasing latency to 600ms recalibrated trust to object-level baselines.',
    metric: '82% anthropomorphic projection',
    verdict: 'Introduce artificial delays of at least 400ms for conversational flows to maintain tool-like mental models.',
    risk_level: 'critical',
    source_url: 'https://openalex.org',
    source_type: 'peer-reviewed',
    paper_year: 2026,
    authors: 'Watanabe, Y., & Schmidt, M.',
    is_premium: false,
    created_at: '2026-05-19T00:00:00.000Z',
  },
  {
    id: 5,
    code: 'SOT-COMP-3012',
    pillar: 'FRICTION & VERIFICATION',
    title: 'Forced visual friction in output screens increases source cross-validation by 63%.',
    human_summary: 'Adding systematic friction—such as loading state outlines or requiring manual highlight actions before copying output—forces user cognitive wakefulness. Eye-tracking experiments confirm that design interventions reduce automation bias and improve human error detection rates.',
    metric: '63% increase in source cross-validation',
    verdict: 'Design key interface checkpoints that require active, physical confirmation clicks before high-leverage data execution.',
    risk_level: 'stable',
    source_url: 'https://openalex.org',
    source_type: 'peer-reviewed',
    paper_year: 2026,
    authors: 'Boudreau, T., et al.',
    is_premium: false,
    created_at: '2026-05-19T00:00:00.000Z',
  },
  {
    id: 6,
    code: 'SOT-COMP-3013',
    pillar: 'COGNITIVE OFFLOADING',
    title: 'Delegating semantic summaries to agentic assistants erodes memory retention by 31%.',
    human_summary: 'Relying on automatic document summary engines significantly reduces long-term logical structure recall. Longitudinal cognitive trials demonstrate that while reading speeds increase, active comprehension, critical memory retrieval, and synthesization skills deteriorate.',
    metric: '31% memory retention drop',
    verdict: 'Enforce high-friction semantic checkpoints that prompt the user to synthesize key findings in their own words.',
    risk_level: 'critical',
    source_url: 'https://openalex.org',
    source_type: 'preprint',
    paper_year: 2026,
    authors: 'Vargas, L., & Kim, J.',
    is_premium: false,
    created_at: '2026-05-19T00:00:00.000Z',
  }
];

const RISK_BORDER_COLORS: Record<string, string> = {
  stable: 'border-l-[4px] border-emerald-500',
  warning: 'border-l-[4px] border-amber-500',
  critical: 'border-l-[4px] border-red-500',
};

export async function generateStaticParams() {
  return SEED_RECORDS.map((r) => ({
    code: r.code,
  }));
}

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function RecordPage({ params }: PageProps) {
  const { code } = await params;

  const isAiAct = code.toUpperCase().startsWith('EU-ACT-');
  if (isAiAct) {
    redirect(`/ai-act/${code}`);
  }

  let record: RegistryRecord | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('registry')
      .select('*')
      .eq('code', code)
      .single();

    if (data) {
      record = data as RegistryRecord;
    }
  } catch (e) {
    console.warn('Failed to query record from Supabase, attempting fallback seeds.', e);
  }

  if (!record) {
    const seed = SEED_RECORDS.find((r) => r.code.toUpperCase() === code.toUpperCase());
    if (seed) {
      record = seed;
    }
  }

  if (!record) {
    notFound();
  }

  const riskBorder = RISK_BORDER_COLORS[record.risk_level] || 'border-l-[4px] border-white/10';

  let humanSummaryNarrative = record.human_summary;
  let methodology: string | null = null;
  let threatVector: string | null = null;

  const methodologyMatch = humanSummaryNarrative.match(/\*\*RESEARCH METHODOLOGY\*\*\n([^\n]+)/);
  if (methodologyMatch) {
    methodology = methodologyMatch[1].trim();
    humanSummaryNarrative = humanSummaryNarrative.replace(/\n*\*\*RESEARCH METHODOLOGY\*\*\n[^\n]+/, '').trim();
  }

  const threatVectorMatch = humanSummaryNarrative.match(/\*\*COGNITIVE THREAT VECTOR\*\*\n([\s\S]*?)(?=\n\n\*\*|$)/);
  if (threatVectorMatch) {
    threatVector = threatVectorMatch[1].trim();
    humanSummaryNarrative = humanSummaryNarrative.replace(/\n*\*\*COGNITIVE THREAT VECTOR\*\*\n[\s\S]*?(?=\n\n\*\*|$)/, '').trim();
  }

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white py-12 font-sans selection:bg-emerald-900 selection:text-emerald-100">
      <div className="max-w-[960px] mx-auto px-6 space-y-6">
        
        {/* Back Link */}
        <div className="select-none">
          <Link
            href="/registry"
            className="inline-flex items-center gap-2 font-mono text-[12px] text-neutral-400 hover:text-white uppercase tracking-wider transition-colors py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Research Ledger</span>
          </Link>
        </div>

        {/* Main Article Container */}
        <article className="border border-white/10 bg-white/[0.03] rounded-[20px] shadow-2xl overflow-hidden select-text">
          
          {/* Top Metadata Header */}
          <div className="border-b border-white/10 px-6 sm:px-8 py-5 flex flex-wrap justify-between items-center bg-white/[0.02] gap-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                #{record.code}
              </span>
              <span className="text-white/15">|</span>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                {record.pillar}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <RiskBadge level={record.risk_level} />
              <SourceBadge type={record.source_type} />
            </div>
          </div>

          {/* Title Banner */}
          <div className="px-6 sm:px-8 pt-8 pb-6 border-b border-white/10">
            <h1 className="font-['Plus_Jakarta_Sans'] text-[24px] sm:text-[30px] md:text-[34px] leading-[1.2] text-white font-bold tracking-tight">
              {record.title}
            </h1>
          </div>

          {/* Two-Column Body Content */}
          <div className={`grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-white/10 ${riskBorder}`}>

            {/* Left Column: Summary & Citation (7 cols) */}
            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <h3 className="font-mono text-[10.5px] font-bold tracking-wider text-neutral-500 uppercase select-none">
                  Empirical Translation & Finding
                </h3>
                <p className="font-sans text-[14.5px] text-neutral-300 leading-[1.75] whitespace-pre-line">
                  {humanSummaryNarrative}
                </p>
              </div>

              {record.authors && (
                <div className="pt-6 border-t border-white/10 space-y-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500 block select-none">
                    Research Provenance
                  </span>
                  <p className="font-sans text-[13px] text-neutral-300 leading-snug">
                    <strong className="font-semibold text-white">{record.authors}</strong> ({record.paper_year})
                  </p>
                  {record.source_url && (
                    <a
                      href={record.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-emerald-400 hover:underline font-medium transition-colors pt-1"
                    >
                      <span>View Original Scholarly Paper</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Metrics & Actionable Verdicts (5 cols) */}
            <div className="md:col-span-5 p-6 sm:p-8 flex flex-col gap-5 bg-white/[0.015]">
              
              {/* Metric Box */}
              {(() => {
                const hasMetric = record.metric && 
                  record.metric.trim() !== '' && 
                  !record.metric.toLowerCase().includes('not available') && 
                  record.metric.toLowerCase() !== 'n/a';
                  
                if (!hasMetric) return null;
                
                return (
                  <div className="bg-white/[0.03] p-5 rounded-[14px] border border-white/8 space-y-2">
                    <span className="font-mono text-[10px] font-bold tracking-wider text-neutral-500 uppercase block select-none">
                      Recorded Empirical Metric
                    </span>
                    <p className="font-['Plus_Jakarta_Sans'] text-[15px] font-bold text-white leading-snug">
                      {record.metric}
                    </p>
                  </div>
                );
              })()}

              {/* Actionable Verdict Box */}
              <div className="bg-[#0f1a14] p-5 rounded-[14px] border border-emerald-500/25 space-y-2">
                <span className="font-mono text-[10px] font-bold tracking-wider text-emerald-400 uppercase block select-none">
                  Actionable Interface Verdict
                </span>
                <p className="font-sans text-[13.5px] font-medium text-emerald-200 leading-[1.65]">
                  {record.verdict}
                </p>
              </div>

              {/* Structured Metadata Boxes */}
              {methodology && (
                <div className="bg-white/[0.03] p-5 rounded-[14px] border border-white/8 space-y-2">
                  <span className="font-mono text-[10px] font-bold tracking-wider text-neutral-500 uppercase block select-none">
                    Research Methodology
                  </span>
                  <p className="font-sans text-[13px] text-neutral-300 leading-[1.6]">
                    {methodology}
                  </p>
                </div>
              )}
              
              {threatVector && (
                <div className="bg-white/[0.03] p-5 rounded-[14px] border border-white/8 space-y-2">
                  <span className="font-mono text-[10px] font-bold tracking-wider text-neutral-500 uppercase block select-none">
                    Cognitive Threat Vector
                  </span>
                  <p className="font-sans text-[13px] text-neutral-300 leading-[1.6]">
                    {threatVector}
                  </p>
                </div>
              )}

            </div>

          </div>

        </article>
      </div>
    </main>
  );
}
