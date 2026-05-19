import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RegistryRecord } from '@/types';
import RiskBadge from '@/components/registry/RiskBadge';
import SourceBadge from '@/components/registry/SourceBadge';

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

const PILLAR_COLORS: Record<string, string> = {
  'COGNITIVE OFFLOADING': '#534AB7',
  'FRICTION & VERIFICATION': '#0F6E56',
  'TEMPORAL PERCEPTION': '#854F0B',
  'EPISTEMIC AGENCY': '#993C1D',
};

const RISK_BORDER_COLORS: Record<string, string> = {
  stable: 'border-l-[3px] border-[#1A7A4A]',
  warning: 'border-l-[3px] border-[#E8A020]',
  critical: 'border-l-[3px] border-[#FF3E00]',
};

// Generates structural metadata parameters
export async function generateStaticParams() {
  return SEED_RECORDS.map((rec) => ({
    code: rec.code,
  }));
}

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function RecordPage({ params }: PageProps) {
  const { code } = await params;
  
  let record: RegistryRecord | null = null;

  // 1. Fetch from Supabase first
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

  // 2. Fallback to local seeds
  if (!record) {
    const seed = SEED_RECORDS.find((r) => r.code.toUpperCase() === code.toUpperCase());
    if (seed) {
      record = seed;
    }
  }

  if (!record) {
    notFound();
  }

  const themeColor = PILLAR_COLORS[record.pillar] || '#7A7A79';
  const riskBorder = RISK_BORDER_COLORS[record.risk_level] || 'border-l-[3px] border-border';

  return (
    <main className="py-12 max-w-[900px] mx-auto px-6">
      {/* Back Button Link */}
      <div className="mb-8">
        <Link
          href="/registry"
          className="font-mono text-[11px] text-mid-concrete hover:text-carbon uppercase tracking-widest transition-colors"
        >
          ← BACK TO LEDGER
        </Link>
      </div>

      <article className="border border-border bg-white select-text">
        {/* Top Header Panel Info */}
        <div className="border-b border-border px-6 sm:px-8 py-5 flex flex-wrap justify-between items-center bg-concrete/10 gap-4">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[13px] font-bold text-carbon">
              #{record.code}
            </span>
            <span className="text-border">|</span>
            <span
              className="font-sans text-[10px] font-bold uppercase tracking-wider"
              style={{ color: themeColor }}
            >
              {record.pillar}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <RiskBadge level={record.risk_level} />
            <SourceBadge type={record.source_type} />
          </div>
        </div>

        {/* H1 Serified Title */}
        <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-6 border-b border-border">
          <h1 className="font-gambarino text-[28px] sm:text-[34px] md:text-[40px] leading-[1.15] text-carbon font-bold tracking-[-0.02em]">
            {record.title}
          </h1>
        </div>

        {/* Multi Column Layout Content */}
        <div className={`grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border ${riskBorder}`}>
          
          {/* Left Column: Human Summary */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <h3 className="font-sans text-[10px] font-bold tracking-[0.15em] text-mid-concrete uppercase mb-4">
                HUMAN TRANSLATION / ANALYSIS
              </h3>
              <p className="font-sans text-[14px] text-carbon leading-[1.7] whitespace-pre-line">
                {record.human_summary}
              </p>
            </div>
            {record.authors && (
              <div className="mt-8 pt-4 border-t border-border/60">
                <span className="font-sans text-[9px] font-bold uppercase tracking-wider text-mid-concrete block mb-1">
                  RESEARCH CITATION
                </span>
                <span className="font-sans text-[12px] text-carbon italic block">
                  {record.authors} ({record.paper_year})
                </span>
                {record.source_url && (
                  <a
                    href={record.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[10px] text-signal hover:underline uppercase block mt-2 tracking-wider"
                  >
                    View Original Scholar Document ↗
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Empirical Metric & Actionable Verdict */}
          <div className="p-6 sm:p-8 flex flex-col gap-8 bg-concrete/5">
            {/* Metric Panel */}
            <div className="border border-border p-5 bg-white">
              <span className="font-sans text-[10px] font-bold tracking-[0.15em] text-mid-concrete uppercase block mb-3">
                EMPIRICAL METRIC RECORDED
              </span>
              <p className="font-sans text-[15px] font-bold text-carbon leading-snug">
                {record.metric}
              </p>
            </div>

            {/* Actionable Verdict Panel */}
            <div className="border border-border p-5 bg-white relative">
              {/* Signal Tick */}
              <span className="absolute top-0 right-0 w-2 h-[1px] bg-signal"></span>
              <span className="absolute top-0 right-0 h-2 w-[1px] bg-signal"></span>

              <span className="font-sans text-[10px] font-bold tracking-[0.15em] text-signal uppercase block mb-3">
                ACTIONABLE DESIGN VERDICT
              </span>
              <p className="font-sans text-[14px] text-carbon leading-[1.6]">
                {record.verdict}
              </p>
            </div>
          </div>
          
        </div>
      </article>
    </main>
  );
}
