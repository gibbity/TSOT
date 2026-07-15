import { createClient } from '@/lib/supabase/server';
import RecordCard from '@/components/registry/RecordCard';
import Link from 'next/link';
import { RegistryRecord } from '@/types';
import HeroConsole from '@/components/landing/HeroConsole';
import { ShieldAlert, BookOpen, Compass, Cpu, Zap, Settings, Terminal, ShieldCheck } from 'lucide-react';

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
  }
];

export default async function HomePage() {
  let records: RegistryRecord[] = [];
  let criticalCount = 3;
  let warningCount = 1;
  let stableCount = 2;

  try {
    const supabase = await createClient();
    
    // Fetch recent non-premium records
    const { data } = await supabase
      .from('registry')
      .select('*')
      .eq('is_premium', false)
      .order('created_at', { ascending: false })
      .limit(6);

    if (data && data.length > 0) {
      records = data as RegistryRecord[];
      
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
    <main className="max-w-[1200px] mx-auto px-6 py-8 space-y-20 select-none">
      
      {/* 1. Hero Container */}
      <div className="space-y-12">
        <div className="max-w-[850px] space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#3a66f5]/10 text-[#3a66f5] px-3.5 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            Empirical RAG Auditing
          </div>
          <h1 className="font-gambarino text-[36px] md:text-[52px] leading-[1.1] text-carbon">
            The Stark, Actionable Ledger of Human-AI Research.
          </h1>
          <p className="font-sans text-[16px] text-mid-concrete leading-relaxed">
            No hype. No philosophy. Just empirical evidence showing how AI systems alter human memory, attention, and compliance. Equip your developers, compliance teams, and LLMs with verified design constraints.
          </p>
        </div>

        {/* Hero Interactive Console */}
        <HeroConsole />
      </div>

      {/* 2. Stats & Status Band */}
      <div className="space-y-6">
        <h2 className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-mid-concrete">
          Ledger Index Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'CRITICAL AUDIT WARNINGS', value: criticalCount, color: 'text-red-600', desc: 'Identified UX mechanisms triggering severe automation bias or safety risks.' },
            { label: 'IMPORTANT WARNING SIGNALS', value: warningCount, color: 'text-amber-600', desc: 'Interface choices altering user planning horizons or skepticism.' },
            { label: 'NECESSARY VERDICT FINDINGS', value: stableCount, color: 'text-emerald-600', desc: 'UX layouts maintaining optimal user agency and truth verification.' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#fcfcfc] border border-border rounded-[22px] p-6 flex flex-col justify-between h-[150px] hover:shadow-md transition-all duration-300">
              <div>
                <span className="font-sans text-[10px] font-bold tracking-wider text-mid-concrete uppercase">
                  {stat.label}
                </span>
                <p className="font-sans text-[11.5px] text-mid-concrete mt-1">{stat.desc}</p>
              </div>
              <span className={`font-gambarino text-[42px] leading-none font-normal self-end ${stat.color}`}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. The Four Key Pillars Showcase */}
      <div className="space-y-8">
        <div className="border-b border-border pb-3">
          <h2 className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-mid-concrete">
            Research Pillars & Evaluation Framework
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Pillar 1 */}
          <div className="border border-border rounded-[24px] p-6 bg-white hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-[12px] bg-red-100 flex items-center justify-center text-red-600">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-gambarino text-[17px] text-carbon">Cognitive Offloading</h3>
            <p className="font-sans text-[13px] text-mid-concrete leading-relaxed">
              Evaluating how much critical memory, logical formulation, and synthesis the user delegates to the AI. Helps designs enforce checkpoints to maintain user recall.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="border border-border rounded-[24px] p-6 bg-white hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-[12px] bg-amber-100 flex items-center justify-center text-amber-600">
              <Settings className="w-5 h-5" />
            </div>
            <h3 className="font-gambarino text-[17px] text-carbon">Friction & Verification</h3>
            <p className="font-sans text-[13px] text-mid-concrete leading-relaxed">
              Introducing deliberate checkpoints (visual outlines, confirm clicks) that combat automation bias and force cognitive wakefulness before executing critical workflows.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="border border-border rounded-[24px] p-6 bg-white hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-[12px] bg-blue-100 flex items-center justify-center text-blue-600">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="font-gambarino text-[17px] text-carbon">Temporal Perception</h3>
            <p className="font-sans text-[13px] text-mid-concrete leading-relaxed">
              Managing artificial delays and response latencies. Preventing anthropomorphic turn-taking confusion by avoiding sub-200ms instantaneous streaming chat.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="border border-border rounded-[24px] p-6 bg-white hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-[12px] bg-emerald-100 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-gambarino text-[17px] text-carbon">Epistemic Agency</h3>
            <p className="font-sans text-[13px] text-mid-concrete leading-relaxed">
              Preserving user search depth and vocabulary diversity. Avoiding hyper-personalized sentiment filters that cause user echo-chambers and validation seeking.
            </p>
          </div>

        </div>
      </div>

      {/* 4. Recent Entries Band */}
      <div className="space-y-8">
        <div className="flex items-baseline justify-between border-b border-border pb-3">
          <h2 className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-mid-concrete">
            RECENT LEDGER ENTRIES
          </h2>
          <Link
            href="/registry"
            className="font-sans text-[11px] font-bold text-[#3a66f5] hover:text-[#254edb] transition-colors uppercase tracking-[0.08em] hover:underline underline-offset-4"
          >
            View Full Ledger →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map(record => (
            <RecordCard key={record.id || record.code} record={record} />
          ))}
        </div>
      </div>

      {/* 5. Deploy / Developers Call-To-Action Band */}
      <div className="border border-border rounded-[24px] bg-neutral-900 text-white p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md select-none">
        <div className="space-y-2 max-w-[650px] text-center md:text-left">
          <h3 className="font-gambarino text-[22px] md:text-[26px]">Build RAG-Backed AI Products</h3>
          <p className="font-sans text-[13.5px] text-neutral-400 leading-relaxed">
            Expose these compliance verification and design optimization tools directly inside Cursor or Claude, or integrate our stateless REST API in your developer workflows today.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Link
            href="/mcp"
            className="bg-[#3a66f5] hover:bg-[#254edb] text-white text-center font-sans text-[12px] font-bold uppercase tracking-wider px-6 py-3.5 rounded-[12px] transition-colors shadow-sm whitespace-nowrap"
          >
            Setup MCP Server
          </Link>
          <Link
            href="/api-docs"
            className="bg-neutral-800 hover:bg-neutral-700 text-white text-center font-sans text-[12px] font-bold uppercase tracking-wider px-6 py-3.5 rounded-[12px] transition-colors border border-neutral-700 whitespace-nowrap"
          >
            Developer API
          </Link>
        </div>
      </div>

    </main>
  );
}
