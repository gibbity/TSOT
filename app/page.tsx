import { createClient } from '@/lib/supabase/server';
import RecordCard from '@/components/registry/RecordCard';
import Link from 'next/link';
import { RegistryRecord } from '@/types';

// Fallback seed records to display when database is empty or unlinked
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

export default async function HomePage() {
  let records: RegistryRecord[] = [];
  let criticalCount = 3;
  let warningCount = 1;
  let stableCount = 2;

  try {
    const supabase = await createClient();
    
    // Attempt to load from Supabase
    const { data } = await supabase
      .from('registry')
      .select('*')
      .eq('is_premium', false)
      .order('created_at', { ascending: false })
      .limit(12);

    if (data && data.length > 0) {
      records = data as RegistryRecord[];
      
      // Dynamic counts from real database
      const { data: allRecords } = await supabase
        .from('registry')
        .select('risk_level');
        
      if (allRecords) {
        criticalCount = allRecords.filter(r => r.risk_level === 'critical').length;
        warningCount = allRecords.filter(r => r.risk_level === 'warning').length;
        stableCount = allRecords.filter(r => r.risk_level === 'stable').length;
      }
    } else {
      records = SEED_RECORDS;
    }
  } catch (error) {
    console.warn('Supabase not connected. Loading local seed records.', error);
    records = SEED_RECORDS;
  }

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-12">
      {/* Above the fold editorial statement */}
      <div className="border-b border-border pb-8 mb-10">
        <p className="font-gambarino text-[28px] md:text-[36px] leading-[1.3] text-[#3a66f5] max-w-[900px]">
          A stark, empirical ledger of what the research actually says about artificial intelligence and the human psyche. No hype. No philosophy. Just actionable constraints.
        </p>
      </div>

      {/* Stats ledger band */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 select-none bg-transparent">
        {[
          { label: 'CRITICAL WARNINGS', value: criticalCount, color: 'text-[#3e1535]' },
          { label: 'IMPORTANT SIGNALS', value: warningCount, color: 'text-[#000c4b]' },
          { label: 'NECESSARY FINDINGS', value: stableCount, color: 'text-[#0f1e19]' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#f8f8f8] rounded-[22px] shadow-[5px_7px_4px_0px_rgba(0,0,0,0.15)] px-7 py-6 flex flex-col justify-between h-[130px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[5px_7px_12px_0px_rgba(0,0,0,0.2)]">
            <span className="font-sans text-[10px] font-bold tracking-normal text-[#3a66f5] uppercase">
              {stat.label}
            </span>
            <span className={`font-gambarino text-[48px] leading-none font-normal self-end ${stat.color}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Grid title */}
      <div className="flex items-baseline justify-between mb-8 border-b border-border pb-2">
        <h2 className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-mid-concrete">
          RECENT ENTRIES IN THE REGISTRY
        </h2>
        <Link
          href="/registry"
          className="font-sans text-[11px] font-bold text-[#3a66f5] hover:text-[#254edb] transition-colors uppercase tracking-[0.08em] hover:underline underline-offset-4"
        >
          View Full Ledger →
        </Link>
      </div>

      {/* Ledger open grid (delicate border delimiters separating cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-transparent mb-12">
        {records.map(record => (
          <RecordCard key={record.id || record.code} record={record} />
        ))}
      </div>
    </main>
  );
}
