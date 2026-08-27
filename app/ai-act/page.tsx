import { createClient } from '@/lib/supabase/server';
import AiActClient from '@/components/registry/AiActClient';
import { RegistryRecord, Pillar } from '@/types';
import localAiActData from '@/lib/supabase/ai_act_data.json';
import { Scale } from 'lucide-react';

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

const GRID_STYLE = {
  backgroundImage: `
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
  `,
  backgroundSize: '48px 48px',
};

export default async function AiActPage() {
  let records: RegistryRecord[] = [];
  let totalCount = 0;

  try {
    const supabase = await createClient();
    const { data, count } = await supabase
      .from('ai_act')
      .select('*', { count: 'exact' })
      .order('id', { ascending: true })
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
            <Scale className="w-3.5 h-3.5" />
            <span>Statutory Regulation</span>
            <span className="text-neutral-600">|</span>
            <span className="text-neutral-300 font-normal">Regulation (EU) 2024/1689</span>
          </div>

          <h1 className="font-['Plus_Jakarta_Sans'] text-[34px] sm:text-[46px] font-normal leading-[1.08] tracking-[-1.2px] text-white">
            EU AI Act Explorer
          </h1>

          <p className="text-neutral-400 text-[15px] sm:text-[16.5px] leading-relaxed max-w-[760px]">
            Official statutory database of all 113 articles and recitals under Regulation (EU) 2024/1689, parsed into statutory compliance requirements and structured risk classifications.
          </p>
        </div>
      </section>

      {/* Main EU AI Act Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <AiActClient initialRecords={records} initialCount={totalCount} />
      </div>
    </main>
  );
}
