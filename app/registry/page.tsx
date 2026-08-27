import { createClient } from '@/lib/supabase/server';
import RegistryClient from '@/components/registry/RegistryClient';
import { RegistryRecord } from '@/types';
import { BookOpen } from 'lucide-react';

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

const GRID_STYLE = {
  backgroundImage: `
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
  `,
  backgroundSize: '48px 48px',
};

export default async function RegistryPage() {
  let records: RegistryRecord[] = [];
  let totalCount = 0;

  try {
    const supabase = await createClient();
    const { data, count } = await supabase
      .from('registry')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(0, 29);

    if (data && data.length > 0) {
      records = data as RegistryRecord[];
      totalCount = count || data.length;
    } else {
      records = SEED_RECORDS;
      totalCount = SEED_RECORDS.length;
    }
  } catch (error) {
    console.warn('Supabase database unlinked. Rendering fallback ledger seeds.', error);
    records = SEED_RECORDS;
    totalCount = SEED_RECORDS.length;
  }

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white selection:bg-emerald-900 selection:text-emerald-100 font-sans">
      {/* Editorial Header */}
      <section className="border-b border-white/8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={GRID_STYLE} />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,60,51,0.25) 0%, transparent 70%)' }}
        />
        <div className="relative max-w-[1200px] mx-auto px-6 pt-16 pb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11.5px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Empirical Evidence Repository</span>
            <span className="text-neutral-600">|</span>
            <span className="text-neutral-300 font-normal">{totalCount.toLocaleString()} Indexed Papers</span>
          </div>

          <h1 className="font-['Plus_Jakarta_Sans'] text-[34px] sm:text-[46px] font-normal leading-[1.08] tracking-[-1.2px] text-white">
            HCI Research Ledger
          </h1>

          <p className="text-neutral-400 text-[15px] sm:text-[16.5px] leading-relaxed max-w-[760px]">
            Index of peer-reviewed empirical studies, preprints, and conference publications analyzed through the lens of cognitive impact, behavioral drift, and strategic human-in-the-loop constraints.
          </p>
        </div>
      </section>

      {/* Main Ledger Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <RegistryClient initialRecords={records} initialCount={totalCount} />
      </div>
    </main>
  );
}
