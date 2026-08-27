'use client';

import { useState, useEffect, useRef } from 'react';
import { RegistryRecord, Pillar } from '@/types';
import SearchBar from './SearchBar';
import PillarFilter from './PillarFilter';
import { Sparkles, X, Send, ArrowRight, ChevronDown, ChevronUp, ExternalLink, Scale, ShieldAlert, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import localAiActData from '@/lib/supabase/ai_act_data.json';
import { parseMarkdownToReact } from './MarkdownRenderer';

const AI_ACT_OPTIONS = [
  { value: 'ALL', label: 'All Articles' },
  { value: 'PROHIBITED PRACTICE', label: 'Prohibited Practices' },
  { value: 'HIGH RISK', label: 'High-Risk Systems' },
  { value: 'LIMITED RISK', label: 'Limited Risk' },
  { value: 'MINIMAL RISK', label: 'Minimal Risk' }
] as { value: Pillar | 'ALL'; label: string }[];

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

const CATEGORY_CONFIG: Record<string, { badge: string; icon: React.ReactNode; label: string; border: string; glow: string }> = {
  'PROHIBITED PRACTICE': {
    badge: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
    icon: <ShieldAlert className="w-3.5 h-3.5 text-pink-400" />,
    label: 'PROHIBITED',
    border: 'border-l-4 border-l-pink-500 hover:border-pink-500/40',
    glow: 'from-pink-500/5 to-transparent',
  },
  'HIGH RISK': {
    badge: 'bg-red-500/15 text-red-400 border-red-500/30',
    icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400" />,
    label: 'HIGH RISK',
    border: 'border-l-4 border-l-red-500 hover:border-red-500/40',
    glow: 'from-red-500/5 to-transparent',
  },
  'LIMITED RISK': {
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    icon: <Info className="w-3.5 h-3.5 text-amber-400" />,
    label: 'LIMITED RISK',
    border: 'border-l-4 border-l-amber-500 hover:border-amber-500/40',
    glow: 'from-amber-500/5 to-transparent',
  },
  'MINIMAL RISK': {
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
    label: 'MINIMAL RISK',
    border: 'border-l-4 border-l-emerald-500 hover:border-emerald-500/40',
    glow: 'from-emerald-500/5 to-transparent',
  },
};

const PAGE_SIZE = 30;

interface AiActClientProps {
  initialRecords: RegistryRecord[];
  initialCount: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function ArticleCard({ record }: { record: RegistryRecord }) {
  const [showFullText, setShowFullText] = useState(false);
  const config = CATEGORY_CONFIG[record.pillar] || CATEGORY_CONFIG['MINIMAL RISK'];

  // Clean article number for badge (e.g. "Art. 5")
  const articleNum = record.code.replace('EU-ACT-ART-', 'Art. ');

  return (
    <article className={`relative overflow-hidden rounded-[20px] bg-[#111115] border border-white/10 ${config.border} transition-all duration-300 p-6 sm:p-7 space-y-5 shadow-lg hover:shadow-2xl`}>
      
      {/* Background Gradient Tint */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.glow} pointer-events-none`} />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[12px] font-bold text-white bg-white/10 px-2.5 py-1 rounded-md border border-white/15">
            {articleNum}
          </span>
          <span className="text-neutral-500 text-[12px]">|</span>
          <span className="font-mono text-[11px] text-neutral-400">
            Regulation (EU) 2024/1689
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 font-mono text-[10.5px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${config.badge}`}>
            {config.icon}
            <span>{config.label}</span>
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="relative z-10">
        <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] sm:text-[21px] font-bold text-white leading-snug tracking-tight">
          {record.title}
        </h2>
      </div>

      {/* Structured Statutory Requirements & Verdict */}
      <div className="relative z-10 space-y-3 bg-white/[0.03] border border-white/8 rounded-[14px] p-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10.5px] font-bold tracking-wider uppercase text-neutral-400">
            Mandatory Compliance Obligations
          </span>
          <span className="font-mono text-[10px] text-emerald-400">
            Statutory Checklist
          </span>
        </div>
        <div className="text-[14px] text-neutral-200 leading-[1.7] font-sans">
          {parseMarkdownToReact(record.verdict)}
        </div>
      </div>

      {/* Expandable Official Legislative Text Recital */}
      <div className="relative z-10">
        <button
          onClick={() => setShowFullText(!showFullText)}
          className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-neutral-400 hover:text-white transition-colors cursor-pointer py-1 select-none"
        >
          {showFullText ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>{showFullText ? 'Hide Official Legislative Recital' : 'View Official Legislative Text (EUR-Lex)'}</span>
        </button>

        {showFullText && (
          <div className="mt-3 p-5 rounded-[14px] bg-[#0c0c10] border border-white/10 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/8 pb-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                EUR-Lex Official Legal Record
              </span>
              <a
                href={record.source_url || 'https://eur-lex.europa.eu'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[10.5px] text-emerald-400 hover:underline"
              >
                <span>EUR-Lex Publication</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="font-sans text-[13px] text-neutral-400 leading-[1.8] whitespace-pre-wrap max-h-[350px] overflow-y-auto pr-2 scrollbar-thin">
              {record.human_summary}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="relative z-10 pt-4 border-t border-white/8 flex flex-wrap items-center justify-between gap-3 select-none">
        <span className="font-mono text-[11px] text-neutral-500">
          ID: {record.code}
        </span>

        <Link
          href={`/ai-act/${record.code}`}
          className="inline-flex items-center gap-1.5 font-mono text-[11.5px] font-bold text-white hover:text-emerald-400 transition-colors uppercase tracking-wider"
        >
          <span>Inspect Technical Brief</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </article>
  );
}

export default function AiActClient({ initialRecords, initialCount }: AiActClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<Pillar | 'ALL'>('ALL');
  const [records, setRecords] = useState<RegistryRecord[]>(initialRecords);
  const [totalCount, setTotalCount] = useState<number>(initialCount);
  const [page, setPage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFallback, setIsFallback] = useState<boolean>(false);

  // AI Synthesis Drawer States
  const [isSynthesisDrawerOpen, setIsSynthesisDrawerOpen] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState('');
  const [chatThread, setChatThread] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');

  const isMounted = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatThread, isSynthesizing]);

  const performSearch = async (search: string, pillar: Pillar | 'ALL') => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(search)}&pillar=${encodeURIComponent(pillar)}&limit=${PAGE_SIZE}&page=0&source=ai_act`
      );
      if (!res.ok) throw new Error('Search API failed');
      const data = await res.json();
      
      setRecords(data.records || []);
      setTotalCount(data.count || 0);
      setPage(0);
      setIsFallback(false);
    } catch (err) {
      console.warn('API search query failed, falling back to local filtration:', err);
      const fallbackSource = SEED_AI_ACT_RECORDS;
      const filtered = fallbackSource.filter((record) => {
        if (pillar !== 'ALL' && record.pillar !== pillar) return false;
        if (search.trim() !== '') {
          const q = search.toLowerCase();
          const matchTitle = record.title.toLowerCase().includes(q);
          const matchSummary = record.human_summary.toLowerCase().includes(q);
          const matchVerdict = record.verdict.toLowerCase().includes(q);
          const matchCode = record.code.toLowerCase().includes(q);
          return matchTitle || matchSummary || matchVerdict || matchCode;
        }
        return true;
      });
      setRecords(filtered);
      setTotalCount(filtered.length);
      setIsFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    const timer = setTimeout(() => {
      performSearch(searchQuery, selectedPillar);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedPillar]);

  const handleLoadMore = async () => {
    if (isLoading) return;

    const nextPage = page + 1;
    setIsLoading(true);

    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&pillar=${encodeURIComponent(selectedPillar)}&limit=${PAGE_SIZE}&page=${nextPage}&source=ai_act`
      );
      if (!res.ok) throw new Error('Load more failed');
      const data = await res.json();

      if (data.records && data.records.length > 0) {
        setRecords((prev) => [...prev, ...data.records]);
        setPage(nextPage);
        setTotalCount(data.count || 0);
      }
      setIsFallback(false);
    } catch (err) {
      console.warn('Failed to load more records from API:', err);
      setIsFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerSynthesis = async () => {
    setIsSynthesisDrawerOpen(true);
    setIsSynthesizing(true);
    setSynthesisResult('');
    setChatThread([]);
    setChatInput('');

    try {
      const res = await fetch('/api/search/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: records.slice(0, 10),
          queryText: searchQuery
        })
      });

      if (!res.ok) throw new Error('Synthesis failed');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('Streaming not supported.');

      let done = false;
      let text = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          text += chunk;
          setSynthesisResult(text);
        }
      }

      setChatThread([{ role: 'assistant', content: text }]);
    } catch (err) {
      console.error('Synthesis error:', err);
      setSynthesisResult('Error generating synthesis. Please verify your GEMINI_API_KEY config.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSynthesizing) return;

    const userMessage: ChatMessage = { role: 'user', content: chatInput };
    const updatedHistory = [...chatThread, userMessage];
    
    setChatThread(updatedHistory);
    setChatInput('');
    setIsSynthesizing(true);

    try {
      const res = await fetch('/api/search/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: records.slice(0, 10),
          queryText: searchQuery,
          chatHistory: updatedHistory
        })
      });

      if (!res.ok) throw new Error('Follow-up synthesis failed');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('Streaming not supported.');

      let done = false;
      let text = '';

      setChatThread([...updatedHistory, { role: 'assistant', content: '' }]);

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          text += chunk;
          setChatThread([...updatedHistory, { role: 'assistant', content: text }]);
        }
      }
    } catch (err) {
      console.error('Follow-up chat error:', err);
      setChatThread([
        ...updatedHistory,
        { role: 'assistant', content: 'Failed to process follow-up. Please try again.' }
      ]);
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 relative">
      
      {/* Category Summary Stats Band */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 select-none">
        <button
          onClick={() => setSelectedPillar('PROHIBITED PRACTICE')}
          className={`p-4 rounded-[16px] border text-left transition-all cursor-pointer ${
            selectedPillar === 'PROHIBITED PRACTICE'
              ? 'bg-pink-500/15 border-pink-500 text-white shadow-lg shadow-pink-950/30'
              : 'bg-white/[0.025] border-white/8 hover:border-pink-500/40 text-neutral-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-pink-400 font-bold">Prohibited</span>
            <ShieldAlert className="w-4 h-4 text-pink-400" />
          </div>
          <div className="font-['Plus_Jakarta_Sans'] text-[24px] font-bold text-white">8</div>
          <span className="text-[11.5px] text-neutral-400">Strictly banned AI practices</span>
        </button>

        <button
          onClick={() => setSelectedPillar('HIGH RISK')}
          className={`p-4 rounded-[16px] border text-left transition-all cursor-pointer ${
            selectedPillar === 'HIGH RISK'
              ? 'bg-red-500/15 border-red-500 text-white shadow-lg shadow-red-950/30'
              : 'bg-white/[0.025] border-white/8 hover:border-red-500/40 text-neutral-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-red-400 font-bold">High Risk</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="font-['Plus_Jakarta_Sans'] text-[24px] font-bold text-white">28</div>
          <span className="text-[11.5px] text-neutral-400">Conformity assessments</span>
        </button>

        <button
          onClick={() => setSelectedPillar('LIMITED RISK')}
          className={`p-4 rounded-[16px] border text-left transition-all cursor-pointer ${
            selectedPillar === 'LIMITED RISK'
              ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-950/30'
              : 'bg-white/[0.025] border-white/8 hover:border-amber-500/40 text-neutral-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400 font-bold">Limited Risk</span>
            <Info className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-['Plus_Jakarta_Sans'] text-[24px] font-bold text-white">15</div>
          <span className="text-[11.5px] text-neutral-400">Transparency obligations</span>
        </button>

        <button
          onClick={() => setSelectedPillar('MINIMAL RISK')}
          className={`p-4 rounded-[16px] border text-left transition-all cursor-pointer ${
            selectedPillar === 'MINIMAL RISK'
              ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-950/30'
              : 'bg-white/[0.025] border-white/8 hover:border-emerald-500/40 text-neutral-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-bold">Minimal Risk</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-['Plus_Jakarta_Sans'] text-[24px] font-bold text-white">62</div>
          <span className="text-[11.5px] text-neutral-400">Voluntary codes of conduct</span>
        </button>
      </div>

      {/* Search & Filter Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/8 select-none">
        <div className="w-full lg:max-w-[450px]">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
        <div className="w-full lg:w-auto">
          <PillarFilter 
            selected={selectedPillar} 
            onChange={setSelectedPillar} 
            options={AI_ACT_OPTIONS}
          />
        </div>
      </div>

      {/* Synthesis Trigger Button Band */}
      {searchQuery.trim() !== '' && records.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 border border-emerald-500/25 bg-[#0f1a14] p-4 -mt-6 rounded-[14px]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="font-sans text-[13px] font-medium text-emerald-300">
              Fuzzy semantic query matched {totalCount} compliance articles. Let AI compile a regulatory brief for you.
            </span>
          </div>
          <button
            onClick={handleTriggerSynthesis}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-[#0a0a0c] font-mono text-[11px] font-bold tracking-wider uppercase transition-all cursor-pointer rounded-full whitespace-nowrap select-none shadow-sm"
          >
            Synthesize Requirements
          </button>
        </div>
      )}

      {/* Results Header */}
      <div className="flex justify-between items-baseline border-b border-white/8 pb-2">
        <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest text-neutral-500">
          Statutory Index ({totalCount} Articles{isLoading && ' · Syncing...'})
        </h3>
        <span className="font-mono text-[10.5px] text-neutral-600 uppercase tracking-wider">
          Sort: {searchQuery.trim() !== '' ? 'Semantic Relevance' : 'Sequential Order'}
        </span>
      </div>

      {/* Article Cards Grid */}
      {records.length > 0 ? (
        <div className="flex flex-col gap-10">
          <div className="grid grid-cols-1 gap-6">
            {records.map((record) => (
              <ArticleCard key={record.code} record={record} />
            ))}
          </div>

          {/* Load More Button */}
          {records.length < totalCount && (
            <div className="flex justify-center mt-4 mb-20 select-none">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="px-8 py-3.5 border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white font-mono text-[11.5px] font-bold tracking-widest uppercase transition-all rounded-full cursor-pointer disabled:opacity-40 select-none"
              >
                {isLoading ? 'LOADING ADDITIONAL ARTICLES...' : 'LOAD MORE ARTICLES'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="border border-dashed border-white/10 py-20 text-center bg-white/[0.02] rounded-[20px] mb-20">
          <p className="font-mono text-[12px] uppercase text-neutral-400 tracking-widest mb-2">
            No Articles Located
          </p>
          <p className="text-[13.5px] text-neutral-500 max-w-[400px] mx-auto leading-relaxed font-sans">
            {isLoading ? 'Searching compliance database...' : 'The search query did not match any articles in the regulatory index. Refine your filters or search terms.'}
          </p>
        </div>
      )}

      {/* RAG Synthesis Drawer */}
      {isSynthesisDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end animate-fade-in select-text">
          <div className="absolute inset-0" onClick={() => setIsSynthesisDrawerOpen(false)}></div>
          <div className="relative w-full max-w-[600px] h-screen bg-[#111114] shadow-2xl border-l border-white/10 flex flex-col justify-between animate-slide-left select-text">
            
            {/* Drawer Header */}
            <div className="border-b border-white/10 px-6 py-5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="font-mono text-[11px] font-bold text-emerald-400 uppercase tracking-[0.15em]">
                  AI Act Synthesis
                </span>
                <span className="text-white/15">|</span>
                <span className="font-mono text-[10px] text-neutral-500 uppercase">
                  Topic: {searchQuery.slice(0, 20)}{searchQuery.length > 20 && '...'}
                </span>
              </div>
              <button 
                onClick={() => setIsSynthesisDrawerOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer p-1 rounded-md hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col gap-6">
              
              {/* Primary Synthesis Content */}
              <div className="prose prose-invert max-w-none text-neutral-200 font-sans leading-relaxed text-[14px]">
                {synthesisResult ? (
                  <div className="border border-white/10 p-5 bg-white/[0.025] rounded-[14px] select-text">
                    <span className="font-mono text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest block mb-3 border-b border-white/10 pb-1">
                      Aggregated Compliance Verdict
                    </span>
                    <div className="select-text font-normal font-sans text-neutral-200 leading-[1.7]">
                      {parseMarkdownToReact(synthesisResult)}
                    </div>
                  </div>
                ) : isSynthesizing && chatThread.length === 0 ? (
                  <div className="flex flex-col gap-3 py-16 text-center select-none animate-pulse">
                    <Sparkles className="w-8 h-8 text-emerald-400/40 mx-auto animate-spin" />
                    <span className="font-mono text-[10px] uppercase text-neutral-500 tracking-widest">
                      Synthesizing requirements across matched articles...
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Follow-up chat thread */}
              {chatThread.length > 0 && (
                <div className="border-t border-white/10 pt-6 flex flex-col gap-5 select-text">
                  <span className="font-mono text-[10.5px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                    Follow-up Discussion
                  </span>
                  
                  {chatThread.map((msg, idx) => {
                    if (idx === 0 && msg.role === 'assistant') return null;
                    return (
                      <div 
                        key={idx} 
                        className={`p-4 border select-text rounded-[12px] ${
                          msg.role === 'user' 
                            ? 'bg-white/[0.04] border-white/10 border-l-4 border-l-neutral-400 text-white' 
                            : 'bg-[#0f1a14] border-emerald-500/20 border-l-4 border-l-emerald-500 text-neutral-200'
                        }`}
                      >
                        <span className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-neutral-500 block mb-2 select-none">
                          {msg.role === 'user' ? 'Legal Query' : 'Compliance Officer'}
                        </span>
                        <div className="font-sans text-[13.5px] leading-relaxed select-text">
                          {parseMarkdownToReact(msg.content)}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Loading dot state */}
                  {isSynthesizing && chatThread.length > 0 && (
                    <div className="p-4 border bg-white/[0.02] border-white/10 border-l-4 border-l-emerald-500 animate-pulse select-none rounded-[12px]">
                      <span className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-neutral-500 block mb-2">
                        Officer responding...
                      </span>
                      <div className="flex gap-1.5 items-center py-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"></span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Drawer Footer / Input Box */}
            <div className="border-t border-white/10 p-4 bg-white/[0.02]">
              <form onSubmit={handleFollowUpSubmit} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder={isSynthesizing ? "Generating response..." : "Ask follow-up questions about these requirements..."}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-grow bg-white/[0.04] border border-white/10 px-4 py-2.5 text-[13px] focus:outline-none focus:border-emerald-500/50 text-white rounded-[10px] placeholder:text-neutral-600"
                  disabled={isSynthesizing}
                  required
                />
                <button
                  type="submit"
                  disabled={isSynthesizing || !chatInput.trim()}
                  className="bg-emerald-500 hover:bg-emerald-600 text-[#0a0a0c] transition-all px-4 py-2.5 font-mono text-[10.5px] font-bold uppercase select-none rounded-[10px] cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
