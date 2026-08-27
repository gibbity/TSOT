import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RegistryRecord, Pillar } from '@/types';
import RiskBadge from '@/components/registry/RiskBadge';
import SourceBadge from '@/components/registry/SourceBadge';
import localAiActData from '@/lib/supabase/ai_act_data.json';
import { ArrowLeft, ExternalLink, Scale } from 'lucide-react';
import { parseMarkdownToReact } from '@/components/registry/MarkdownRenderer';

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

const RISK_BORDER_COLORS: Record<string, string> = {
  stable: 'border-l-[4px] border-emerald-500',
  warning: 'border-l-[4px] border-amber-500',
  critical: 'border-l-[4px] border-red-500',
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

  if (!record) {
    const seed = SEED_AI_ACT_RECORDS.find((r) => r.code.toUpperCase() === code.toUpperCase());
    if (seed) {
      record = seed;
    }
  }

  if (!record) {
    notFound();
  }

  const riskBorder = RISK_BORDER_COLORS[record.risk_level] || 'border-l-[4px] border-white/10';

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white py-12 font-sans selection:bg-emerald-900 selection:text-emerald-100">
      <div className="max-w-[960px] mx-auto px-6 space-y-6">
        
        {/* Back Link */}
        <div className="select-none">
          <Link
            href="/ai-act"
            className="inline-flex items-center gap-2 font-mono text-[12px] text-neutral-400 hover:text-white uppercase tracking-wider transition-colors py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to EU AI Act Explorer</span>
          </Link>
        </div>

        {/* Main Article Container */}
        <article className="border border-white/10 bg-white/[0.03] rounded-[20px] shadow-2xl overflow-hidden select-text">
          
          {/* Top Header Panel Info */}
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

            {/* Left Column: Official Regulation Text (7 cols) */}
            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <h3 className="font-mono text-[10.5px] font-bold tracking-wider text-neutral-500 uppercase select-none">
                  Official Statutory Text
                </h3>
                <p className="font-sans text-[14px] text-neutral-300 leading-[1.75] whitespace-pre-line">
                  {record.human_summary}
                </p>
              </div>

              <div className="pt-6 border-t border-white/10 space-y-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500 block select-none">
                  Legal Authority
                </span>
                <p className="font-sans text-[13px] text-neutral-300 leading-snug">
                  <strong className="font-semibold text-white">European Parliament & Council</strong> (Regulation 2024/1689)
                </p>
                {record.source_url && (
                  <a
                    href={record.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-emerald-400 hover:underline font-medium transition-colors pt-1"
                  >
                    <span>View Official EUR-Lex Publication</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Right Column: Statutory Verdict & Checklist (5 cols) */}
            <div className="md:col-span-5 p-6 sm:p-8 flex flex-col gap-5 bg-white/[0.015]">
              
              {/* Verdict Panel */}
              <div className="bg-[#0f1a14] p-5 rounded-[14px] border border-emerald-500/25 space-y-3">
                <span className="font-mono text-[10px] font-bold tracking-wider text-emerald-400 uppercase block select-none">
                  Mandatory Statutory Checklist & Fix
                </span>
                <div className="font-sans text-[13.5px] text-neutral-200 leading-[1.65]">
                  {parseMarkdownToReact(record.verdict)}
                </div>
              </div>

              {/* Status Box */}
              <div className="bg-white/[0.03] p-5 rounded-[14px] border border-white/8 space-y-2">
                <span className="font-mono text-[10px] font-bold tracking-wider text-neutral-500 uppercase block select-none">
                  Statutory Classification
                </span>
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  <span className="font-['Plus_Jakarta_Sans'] text-[14px] font-bold text-white">
                    {record.pillar}
                  </span>
                </div>
                <p className="font-sans text-[12.5px] text-neutral-400 leading-relaxed">
                  Applies directly across all 27 EU Member States with phased entry into force from 2025 to 2026.
                </p>
              </div>

            </div>

          </div>

        </article>
      </div>
    </main>
  );
}
