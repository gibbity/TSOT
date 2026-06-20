import { createClient } from '@/lib/supabase/server';
import AiActClient from '@/components/registry/AiActClient';
import { RegistryRecord, Pillar } from '@/types';
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

export default async function AiActPage() {
  let records: RegistryRecord[] = [];
  let totalCount = 0;

  try {
    const supabase = await createClient();
    const { data, count } = await supabase
      .from('ai_act')
      .select('*', { count: 'exact' })
      .order('id', { ascending: true }) // Order sequentially by ID
      .range(0, 29);

    if (data && data.length > 0) {
      records = (data || []).map((row: any) => ({
        id: Number(row.id),
        code: String(row.code),
        pillar: row.pillar as Pillar,
        title: String(row.title),
        human_summary: String(row.human_summary),
        metric: String(row.metric || 'Compliance Checklist'),
        verdict: String(row.verdict),
        risk_level: row.risk_level as 'stable' | 'warning' | 'critical',
        source_url: row.source_url || null,
        source_type: row.source_type as any,
        paper_year: row.paper_year != null ? Number(row.paper_year) : 2024,
        authors: row.authors || 'European Parliament & Council',
        is_premium: Boolean(row.is_premium),
        created_at: row.created_at || new Date().toISOString()
      }));
      totalCount = count || data.length;
    } else {
      records = SEED_AI_ACT_RECORDS.slice(0, 30);
      totalCount = SEED_AI_ACT_RECORDS.length;
    }
  } catch (error) {
    console.warn('Supabase database unlinked. Rendering local AI Act JSON fallback.', error);
    records = SEED_AI_ACT_RECORDS.slice(0, 30);
    totalCount = SEED_AI_ACT_RECORDS.length;
  }

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-6">
      {/* Title & Description side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-baseline pb-6 border-b border-border mb-8">
        <div className="md:col-span-1">
          <h1 className="font-gambarino text-[32px] sm:text-[38px] md:text-[42px] text-[#3a66f5] font-normal leading-none">
            EU AI Act
          </h1>
        </div>
        <div className="md:col-span-2">
          <p className="font-gambarino text-[13px] sm:text-[14px] md:text-[15px] text-[#3a66f5] leading-relaxed max-w-[700px]">
            Official Regulation (EU) 2024/1689. Complete database of all 113 articles, compliance requirements, and risk level designations.
          </p>
        </div>
      </div>

      {/* Render AI Act index search client */}
      <AiActClient initialRecords={records} initialCount={totalCount} />
    </main>
  );
}
