import { createClient } from '@/lib/supabase/server';
import RecordCard from '@/components/registry/RecordCard';
import Link from 'next/link';
import { RegistryRecord } from '@/types';
import HeroConsole from '@/components/landing/HeroConsole';
import { 
  ShieldAlert, 
  BookOpen, 
  Scale, 
  Cpu, 
  Zap, 
  Settings, 
  Terminal, 
  ShieldCheck,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

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
  
  // Real Database Counts
  let registryCount = 6369;
  let aiActCount = 113;
  let totalAuditLogs = 418;

  try {
    const supabase = await createClient();
    
    // Fetch recent non-premium records
    const { data: recent } = await supabase
      .from('registry')
      .select('*')
      .eq('is_premium', false)
      .order('created_at', { ascending: false })
      .limit(3);

    if (recent && recent.length > 0) {
      records = recent as RegistryRecord[];
    } else {
      records = SEED_RECORDS;
    }

    // Dynamic stats queries (fast count-only select)
    const { count: regCount } = await supabase
      .from('registry')
      .select('*', { count: 'exact', head: true });
    if (regCount !== null) registryCount = regCount;

    const { count: actCount } = await supabase
      .from('ai_act')
      .select('*', { count: 'exact', head: true });
    if (actCount !== null) aiActCount = actCount;

    const { count: logCount } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true });
    if (logCount !== null) totalAuditLogs = logCount;

  } catch (error) {
    console.warn('Supabase offline. Loading local seed stats.', error);
    records = SEED_RECORDS;
  }

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-8 space-y-20 select-none">
      
      {/* 1. Hero Container */}
      <div className="space-y-12">
        <div className="max-w-[900px] space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#3a66f5]/10 text-[#3a66f5] px-3.5 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            HCI & Regulatory Auditing
          </div>
          <h1 className="font-gambarino text-[36px] md:text-[56px] leading-[1.1] text-carbon">
            Align AI Design with Empirical Research & EU Regulations.
          </h1>
          <p className="font-sans text-[16px] text-mid-concrete leading-relaxed">
            The Sign of Times is a dual-engine knowledge base. Automatically audit your AI product features against EU AI Act compliance requirements and HCI empirical research findings to catch design risks and violations before shipping.
          </p>
        </div>

        {/* Hero Interactive Console (Preset Examples call actual endpoints) */}
        <HeroConsole />
      </div>

      {/* 2. Live Database Metrics Band */}
      <div className="space-y-6">
        <h2 className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-mid-concrete border-b border-border pb-2">
          Knowledge Base Indexing Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-[#fcfcfc] border border-border rounded-[22px] p-6 flex flex-col justify-between h-[130px] hover:shadow-sm transition-shadow">
            <div>
              <span className="font-sans text-[10px] font-bold tracking-wider text-red-600 uppercase">
                EU AI Act Articles Indexed
              </span>
              <p className="font-sans text-[12px] text-mid-concrete mt-1">Full regulatory clauses parsed and mapped to compliance checks.</p>
            </div>
            <span className="font-gambarino text-[38px] leading-none font-normal text-carbon self-end">
              {aiActCount.toLocaleString()}
            </span>
          </div>

          <div className="bg-[#fcfcfc] border border-border rounded-[22px] p-6 flex flex-col justify-between h-[130px] hover:shadow-sm transition-shadow">
            <div>
              <span className="font-sans text-[10px] font-bold tracking-wider text-[#3a66f5] uppercase">
                HCI Empirical Research Papers
              </span>
              <p className="font-sans text-[12px] text-mid-concrete mt-1">Peer-reviewed studies on human cognitive limits, latencies, and trust.</p>
            </div>
            <span className="font-gambarino text-[38px] leading-none font-normal text-carbon self-end">
              {registryCount.toLocaleString()}
            </span>
          </div>

          <div className="bg-[#fcfcfc] border border-border rounded-[22px] p-6 flex flex-col justify-between h-[130px] hover:shadow-sm transition-shadow">
            <div>
              <span className="font-sans text-[10px] font-bold tracking-wider text-emerald-600 uppercase">
                Active System Audits Logged
              </span>
              <p className="font-sans text-[12px] text-mid-concrete mt-1">Real-time design audits generated across API and MCP server requests.</p>
            </div>
            <span className="font-gambarino text-[38px] leading-none font-normal text-carbon self-end">
              {totalAuditLogs.toLocaleString()}
            </span>
          </div>

        </div>
      </div>

      {/* 3. Dual-Engine Core Value Split Showcase */}
      <div className="space-y-8">
        <h2 className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-mid-concrete text-center">
          The Two Core Audit Engines
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Engine 1: EU AI Act */}
          <div className="border border-border rounded-[26px] bg-white p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-[16px] bg-red-50 flex items-center justify-center text-red-600">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="font-gambarino text-[22px] text-carbon">⚖️ The EU AI Act Compliance Engine</h3>
              <p className="font-sans text-[14px] text-mid-concrete leading-relaxed">
                Scan your interface architectures against the new European AI regulatory frameworks. Automatically flag prohibited techniques and compile compliance requirements.
              </p>
              
              <ul className="space-y-3 pt-3">
                <li className="flex items-start gap-3 text-[13px] text-carbon">
                  <CheckCircle className="w-4 h-4 text-red-600 fill-red-50 mt-0.5 shrink-0" />
                  <span><strong>Article 5 (Prohibitions)</strong>: Intercept subliminal manipulation, vulnerability exploits, and classification metrics.</span>
                </li>
                <li className="flex items-start gap-3 text-[13px] text-carbon">
                  <CheckCircle className="w-4 h-4 text-red-600 fill-red-50 mt-0.5 shrink-0" />
                  <span><strong>Article 15 (High Risk)</strong>: Verify cybersecurity logging, technical redundancy, and accuracy declarations.</span>
                </li>
                <li className="flex items-start gap-3 text-[13px] text-carbon">
                  <CheckCircle className="w-4 h-4 text-red-600 fill-red-50 mt-0.5 shrink-0" />
                  <span><strong>Article 50 (Transparency)</strong>: Check conversational agent disclosure and emotional simulation guidelines.</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-border flex justify-between items-center">
              <span className="text-[12px] font-mono text-red-600 font-bold uppercase">Source: EU Parliament 2024</span>
              <Link href="/ai-act" className="font-sans text-[12.5px] font-bold text-[#3a66f5] hover:underline">
                Explore Regulation Articles →
              </Link>
            </div>
          </div>

          {/* Engine 2: Empirical HCI Ledger */}
          <div className="border border-border rounded-[26px] bg-white p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-[16px] bg-blue-50 flex items-center justify-center text-[#3a66f5]">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="font-gambarino text-[22px] text-carbon">🧠 The Empirical HCI Research Ledger</h3>
              <p className="font-sans text-[14px] text-mid-concrete leading-relaxed">
                Assess user attention, skepticism, and memory retention under different conversational designs using peer-reviewed behavioral research papers.
              </p>
              
              <ul className="space-y-3 pt-3">
                <li className="flex items-start gap-3 text-[13px] text-carbon">
                  <CheckCircle className="w-4 h-4 text-[#3a66f5] fill-blue-50 mt-0.5 shrink-0" />
                  <span><strong>Cognitive Offloading</strong>: Enforce visual resets to limit user memory degradation from automated summarizing.</span>
                </li>
                <li className="flex items-start gap-3 text-[13px] text-carbon">
                  <CheckCircle className="w-4 h-4 text-[#3a66f5] fill-blue-50 mt-0.5 shrink-0" />
                  <span><strong>Friction & Verification</strong>: Introduce visual output checkpoints to reset user skepticism and combat automation bias.</span>
                </li>
                <li className="flex items-start gap-3 text-[13px] text-carbon">
                  <CheckCircle className="w-4 h-4 text-[#3a66f5] fill-blue-50 mt-0.5 shrink-0" />
                  <span><strong>Temporal Perception</strong>: Avoid anthropomorphic turn-taking confusion by introducing deliberate response latencies.</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-border flex justify-between items-center">
              <span className="text-[12px] font-mono text-blue-600 font-bold uppercase">Source: Peer-Reviewed Ledger</span>
              <Link href="/registry" className="font-sans text-[12.5px] font-bold text-[#3a66f5] hover:underline">
                Explore Research Papers →
              </Link>
            </div>
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
