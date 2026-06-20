import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RegistryRecord, Pillar } from '@/types';
import RiskBadge from '@/components/registry/RiskBadge';
import SourceBadge from '@/components/registry/SourceBadge';
import localAiActData from '@/lib/supabase/ai_act_data.json';

const SEED_AI_ACT_RECORDS: RegistryRecord[] = (localAiActData as any[]).map((art, idx) => ({
  id: 10000 + idx,
  code: art.code,
  pillar: art.category as Pillar,
  title: art.title,
  human_summary: art.article_text,
  metric: 'Compliance Checklist',
  verdict: art.compliance_verdict,
  risk_level: art.risk_level as 'stable' | 'warning' | 'critical',
  source_url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689',
  source_type: 'regulation',
  paper_year: 2024,
  authors: 'European Parliament & Council',
  is_premium: false,
  created_at: new Date().toISOString()
}));

const PILLAR_COLORS: Record<string, string> = {
  'PROHIBITED PRACTICE': '#C2185B',
  'HIGH RISK': '#D32F2F',
  'LIMITED RISK': '#F57C00',
  'MINIMAL RISK': '#388E3C',
};

const RISK_BORDER_COLORS: Record<string, string> = {
  stable: 'border-l-[3px] border-[#1A7A4A]',
  warning: 'border-l-[3px] border-[#E8A020]',
  critical: 'border-l-[3px] border-[#FF3E00]',
};

export async function generateStaticParams() {
  return SEED_AI_ACT_RECORDS.map((r) => ({
    code: r.code,
  }));
}

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function AiActRecordPage({ params }: PageProps) {
  const { code } = await params;

  let record: RegistryRecord | null = null;

  // 1. Fetch from Supabase first
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('ai_act')
      .select('*')
      .eq('code', code)
      .single();

    if (data) {
      record = {
        id: Number(data.id),
        code: String(data.code),
        pillar: data.pillar as Pillar,
        title: String(data.title),
        human_summary: String(data.human_summary),
        metric: String(data.metric || 'Compliance Checklist'),
        verdict: String(data.verdict),
        risk_level: data.risk_level as 'stable' | 'warning' | 'critical',
        source_url: data.source_url || null,
        source_type: data.source_type as any,
        paper_year: data.paper_year != null ? Number(data.paper_year) : 2024,
        authors: data.authors || 'European Parliament & Council',
        is_premium: Boolean(data.is_premium),
        created_at: data.created_at || new Date().toISOString()
      } as RegistryRecord;
    }
  } catch (e) {
    console.warn('Failed to query AI Act record from Supabase, attempting fallback seeds.', e);
  }

  // 2. Fallback to local seeds
  if (!record) {
    const seed = SEED_AI_ACT_RECORDS.find((r) => r.code.toUpperCase() === code.toUpperCase());
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
      <div className="mb-8 select-none">
        <Link
          href="/ai-act"
          className="font-mono text-[11px] text-mid-concrete hover:text-[#3a66f5] uppercase tracking-widest transition-colors"
        >
          ← BACK TO ARTICLES
        </Link>
      </div>

      <article className="border border-border bg-white rounded-[22px] shadow-[5px_7px_12px_0px_rgba(0,0,0,0.15)] overflow-hidden select-text">
        {/* Top Header Panel Info */}
        <div className="border-b border-border px-6 sm:px-8 py-5 flex flex-wrap justify-between items-center bg-concrete/10 gap-4">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[13px] font-bold text-carbon">
              #{record.code}
            </span>
            <span className="text-border">|</span>
            <span
              className="font-sans text-[10.5px] font-bold uppercase tracking-normal"
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
          <h1 className="font-gambarino text-[28px] sm:text-[34px] md:text-[38px] leading-[1.15] text-[#3a66f5] font-normal">
            {record.title}
          </h1>
        </div>

        {/* Multi Column Layout Content */}
        <div className={`grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border ${riskBorder}`}>

          {/* Left Column: Article Text */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <h3 className="font-sans text-[10px] font-bold tracking-normal text-mid-concrete uppercase mb-4 select-none">
                OFFICIAL REGULATION TEXT
              </h3>
              <p className="font-sans text-[14px] text-carbon leading-[1.7] whitespace-pre-line">
                {record.human_summary}
              </p>
            </div>
            {record.authors && (
              <div className="mt-8 pt-4 border-t border-border/60">
                <span className="font-sans text-[9px] font-bold uppercase tracking-normal text-mid-concrete block mb-1 select-none">
                  REGULATORY SOURCE
                </span>
                <span className="font-sans text-[12px] text-carbon italic block">
                  {record.authors} ({record.paper_year})
                </span>
                {record.source_url && (
                  <a
                    href={record.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[10px] text-signal hover:text-signal/80 hover:underline uppercase block mt-2 tracking-normal transition-colors"
                  >
                    View EUR-Lex Regulation Document ↗
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Actionable Verdict & Metadata */}
          <div className="p-6 sm:p-8 flex flex-col gap-6 bg-concrete/5 justify-between">
            <div className="flex flex-col gap-6">
              {/* Metric Panel */}
              <div className="bg-[#f8f8f8] p-5 rounded-[15px] shadow-[2px_2px_4px_0px_rgba(0,0,0,0.03)] border-none">
                <span className="font-sans text-[9px] font-bold tracking-normal text-mid-concrete uppercase block mb-3 select-none">
                  EMPIRICAL METRIC RECORDED
                </span>
                <p className="font-sans text-[14px] font-bold text-carbon leading-snug">
                  {record.metric}
                </p>
              </div>

              {/* Actionable Verdict Panel */}
              <div className="bg-[#f8f8f8] p-5 rounded-[15px] relative shadow-[2px_2px_4px_0px_rgba(0,0,0,0.03)] border-l-4 border-l-signal border-y-none border-r-none">
                <span className="font-sans text-[9px] font-bold tracking-normal text-signal uppercase block mb-3 select-none">
                  COMPLIANCE VERDICT
                </span>
                <p className="font-sans text-[13px] text-carbon leading-[1.6]">
                  {record.verdict}
                </p>
              </div>
            </div>
          </div>

        </div>
      </article>
    </main>
  );
}
