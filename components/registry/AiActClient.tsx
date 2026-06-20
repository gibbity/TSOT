'use client';

import { useState, useEffect, useRef } from 'react';
import { RegistryRecord, Pillar } from '@/types';
import SearchBar from './SearchBar';
import PillarFilter from './PillarFilter';
import { Sparkles, X, Send, ArrowRight, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import localAiActData from '@/lib/supabase/ai_act_data.json';
import { parseMarkdownToReact } from './MarkdownRenderer';

const AI_ACT_OPTIONS = [
  { value: 'ALL', label: 'All Risks' },
  { value: 'PROHIBITED PRACTICE', label: 'Prohibited' },
  { value: 'HIGH RISK', label: 'High Risk' },
  { value: 'LIMITED RISK', label: 'Limited' },
  { value: 'MINIMAL RISK', label: 'Minimal' }
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

const PILLAR_COLORS: Record<string, string> = {
  'PROHIBITED PRACTICE': 'text-[#c2185b]',
  'HIGH RISK': 'text-[#d32f2f]',
  'LIMITED RISK': 'text-[#f57c00]',
  'MINIMAL RISK': 'text-[#388e3c]',
};

const PILLAR_BG_BADGES: Record<string, string> = {
  'PROHIBITED PRACTICE': 'bg-[#c2185b]/10 text-[#c2185b] border-[#c2185b]/20',
  'HIGH RISK': 'bg-[#d32f2f]/10 text-[#d32f2f] border-[#d32f2f]/20',
  'LIMITED RISK': 'bg-[#f57c00]/10 text-[#f57c00] border-[#f57c00]/20',
  'MINIMAL RISK': 'bg-[#388e3c]/10 text-[#388e3c] border-[#388e3c]/20',
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

const verdictBgs: Record<string, string> = {
  'PROHIBITED PRACTICE': 'bg-[#c2185b]/5 border-l-[#c2185b]',
  'HIGH RISK': 'bg-[#d32f2f]/5 border-l-[#d32f2f]',
  'LIMITED RISK': 'bg-[#f57c00]/5 border-l-[#f57c00]',
  'MINIMAL RISK': 'bg-[#388e3c]/5 border-l-[#388e3c]',
};

const verdictTextColors: Record<string, string> = {
  'PROHIBITED PRACTICE': 'text-[#c2185b]',
  'HIGH RISK': 'text-[#d32f2f]',
  'LIMITED RISK': 'text-[#f57c00]',
  'MINIMAL RISK': 'text-[#388e3c]',
};

function ArticleRow({ record }: { record: RegistryRecord }) {
  const [isOpen, setIsOpen] = useState(false);
  const badgeStyle = PILLAR_BG_BADGES[record.pillar] || 'bg-concrete/20 text-carbon border-border';
  const cleanTitle = record.title.replace(/^Article\s+\d+:\s*/i, '');
  const artNumberMatch = record.code.match(/ART-(\d+)/);
  const artNumber = artNumberMatch ? `Art. ${artNumberMatch[1]}` : record.code;

  const verdictTextColor = verdictTextColors[record.pillar] || 'text-[#3a66f5]';

  return (
    <div className="border border-border bg-white rounded-[15px] overflow-hidden transition-all duration-300 hover:shadow-[3px_5px_8px_0px_rgba(0,0,0,0.08)]">
      {/* Clickable Row Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-5 flex items-center justify-between gap-4 cursor-pointer select-none bg-concrete/5 hover:bg-[#3a66f5]/5 transition-colors"
      >
        <div className="flex items-center gap-4 flex-grow min-w-0">
          <span className="font-mono text-[13px] font-bold text-[#3a66f5] bg-[#3a66f5]/10 px-2.5 py-1 rounded-[6px] shrink-0">
            {artNumber}
          </span>
          <h3 className="font-sans text-[15px] sm:text-[16px] font-semibold text-carbon truncate pr-4">
            {cleanTitle}
          </h3>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <span className={`font-sans text-[10px] font-bold uppercase tracking-wider px-3 py-1 border rounded-full ${badgeStyle}`}>
            {record.pillar === 'PROHIBITED PRACTICE' ? 'PROHIBITED' : record.pillar.replace(' RISK', '')}
          </span>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-mid-concrete" />
          ) : (
            <ChevronDown className="w-5 h-5 text-mid-concrete" />
          )}
        </div>
      </div>

      {/* Expandable Content Panel */}
      {isOpen && (
        <div className="border-t border-border p-6 flex flex-col md:flex-row gap-6 bg-[#fafafa] animate-fade-in">
          {/* Left Column: Full Text */}
          <div className="flex-grow [flex-basis:55%] md:max-w-[55%]">
            <div className="border border-border bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col h-[400px] overflow-hidden">
              <div className="px-5 py-3 border-b border-border/60 bg-concrete/15 flex items-center gap-2 select-none">
                <span className="font-mono text-[10px] font-bold text-mid-concrete uppercase tracking-wider">
                  Official Legislative Text
                </span>
              </div>
              <div className="p-5 flex-grow overflow-y-auto pr-3 scrollbar-thin bg-[#FAF9F5]">
                <div className="font-serif text-[14.5px] text-carbon leading-[1.75] whitespace-pre-wrap">
                  {record.human_summary}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Compliance Verdict & Action */}
          <div className="flex-grow [flex-basis:45%] md:max-w-[45%]">
            <div className="border border-border bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col h-[400px] overflow-hidden">
              <div className="px-5 py-3 border-b border-border/60 flex items-center justify-between bg-white select-none">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    record.pillar === 'PROHIBITED PRACTICE' ? 'bg-[#c2185b]' : 
                    record.pillar === 'HIGH RISK' ? 'bg-[#d32f2f]' : 
                    record.pillar === 'LIMITED RISK' ? 'bg-[#f57c00]' : 'bg-[#388e3c]'
                  }`} />
                  <span className="font-sans text-[10px] font-bold tracking-wider uppercase text-carbon">
                    Compliance Actions & Requirements
                  </span>
                </div>
                <span className={`font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-full ${badgeStyle}`}>
                  {record.pillar === 'PROHIBITED PRACTICE' ? 'PROHIBITED' : record.pillar.replace(' RISK', '')}
                </span>
              </div>
              
              <div className={`p-5 flex-grow overflow-y-auto scrollbar-thin border-l-4 ${
                record.pillar === 'PROHIBITED PRACTICE' ? 'border-l-[#c2185b]' : 
                record.pillar === 'HIGH RISK' ? 'border-l-[#d32f2f]' : 
                record.pillar === 'LIMITED RISK' ? 'border-l-[#f57c00]' : 'border-l-[#388e3c]'
              }`}>
                <div className="space-y-3">
                  <span className={`font-sans text-[10px] font-bold tracking-wider uppercase block mb-1 select-none ${verdictTextColor}`}>
                    {record.pillar === 'PROHIBITED PRACTICE' ? 'PROHIBITED' : record.pillar.replace(' RISK', ' risk')} obligations checklist
                  </span>
                  <div className="text-[13px] text-carbon leading-[1.65]">
                    {parseMarkdownToReact(record.verdict)}
                  </div>
                </div>
              </div>
              
              <div className="px-5 py-3.5 bg-concrete/5 border-t border-border/80 flex items-center justify-between shrink-0 select-none">
                <span className="font-mono text-[10.5px] text-mid-concrete">
                  Citation: {record.code}
                </span>
                <Link
                  href={`/ai-act/${record.code}`}
                  className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-[#3a66f5] hover:text-[#254edb] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  View Article Brief <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
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

  // Auto-scroll follow-up chat to bottom
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
      setPage(0);
      setIsFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search trigger (skip on initial render since server delivered initial state)
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

  // Trigger RAG Synthesis
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

  // Handle follow-up chat submit
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
      {/* Search & Filter Header Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-6 border-b border-border select-none">
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
        <div className="flex flex-wrap items-center justify-between gap-4 border border-premium/20 bg-[#EEEDFE]/20 p-4 -mt-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-premium animate-pulse" />
            <span className="font-sans text-[12.5px] font-medium text-premium">
              Fuzzy semantic query matched {totalCount} compliance articles. Let AI compile a regulatory brief for you.
            </span>
          </div>
          <button
            onClick={handleTriggerSynthesis}
            className="px-4 py-2 border border-premium bg-white text-premium hover:bg-premium hover:text-white font-mono text-[10px] font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer shadow-[2px_2px_0px_#534AB7] whitespace-nowrap select-none"
          >
            Synthesize Requirements
          </button>
        </div>
      )}

      {/* Results Title Banner */}
      <div className="flex justify-between items-baseline border-b border-border pb-2">
        <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-mid-concrete">
          Article Index ({totalCount} Articles{isLoading && ' - Synchronizing...'})
        </h3>
        <span className="font-mono text-[10px] text-mid-concrete uppercase tracking-[0.08em]">
          Sort: {searchQuery.trim() !== '' ? 'Semantic Relevance' : 'Article Number'}
        </span>
      </div>

      {/* Document Accordion list */}
      {records.length > 0 ? (
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            {records.map((record) => (
              <ArticleRow key={record.code} record={record} />
            ))}
          </div>

          {/* Load More Button */}
          {records.length < totalCount && (
            <div className="flex justify-center mt-4 mb-20 select-none">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="px-8 py-3.5 border border-border bg-white text-carbon hover:bg-carbon hover:text-white font-mono text-[11px] font-bold tracking-widest uppercase transition-colors duration-200 cursor-pointer disabled:bg-concrete disabled:text-mid-concrete disabled:border-border disabled:cursor-not-allowed select-none"
              >
                {isLoading ? 'LOADING ADDITIONAL ENTRIES...' : 'LOAD MORE ARTICLES'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="border border-dashed border-border py-20 text-center bg-white mb-20">
          <p className="font-mono text-[12px] uppercase text-mid-concrete tracking-widest mb-2">
            No Articles Located
          </p>
          <p className="font-sans text-[13px] text-mid-concrete max-w-[400px] mx-auto leading-relaxed">
            {isLoading ? 'Searching compliance database...' : 'The search query did not match any articles in the regulatory index. Refine your filters or search terms.'}
          </p>
        </div>
      )}

      {/* RAG Synthesis Drawer */}
      {isSynthesisDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-carbon/50 backdrop-blur-xs flex justify-end animate-fade-in select-text">
          <div className="absolute inset-0" onClick={() => setIsSynthesisDrawerOpen(false)}></div>
          <div className="relative w-full max-w-[580px] h-screen bg-white shadow-2xl border-l-2 border-carbon flex flex-col justify-between animate-slide-left select-text">
            
            {/* Drawer Header */}
            <div className="border-b border-carbon px-6 py-5 flex justify-between items-center bg-concrete">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-premium animate-pulse" />
                <span className="font-mono text-[11px] font-bold text-premium uppercase tracking-[0.15em]">
                  AI Act Synthesis
                </span>
                <span className="text-border">|</span>
                <span className="font-mono text-[10px] text-mid-concrete uppercase">
                  Topic: {searchQuery.slice(0, 20)}{searchQuery.length > 20 && '...'}
                </span>
              </div>
              <button 
                onClick={() => setIsSynthesisDrawerOpen(false)}
                className="text-mid-concrete hover:text-carbon cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col gap-6">
              
              {/* Primary Synthesis Content */}
              <div className="prose prose-neutral max-w-none text-carbon font-sans leading-relaxed text-[13.5px]">
                {synthesisResult ? (
                  <div className="border border-border p-5 bg-white select-text">
                    <span className="font-mono text-[9px] font-bold text-mid-concrete uppercase tracking-widest block mb-3 border-b border-border pb-1">
                      Aggregated Compliance Verdict
                    </span>
                    <div className="select-text font-normal font-sans text-carbon leading-[1.7]">
                      {parseMarkdownToReact(synthesisResult)}
                    </div>
                  </div>
                ) : isSynthesizing && chatThread.length === 0 ? (
                  <div className="flex flex-col gap-3 py-16 text-center select-none animate-pulse">
                    <Sparkles className="w-8 h-8 text-premium/30 mx-auto animate-spin" />
                    <span className="font-mono text-[10px] uppercase text-mid-concrete tracking-widest">
                      Synthesizing requirements across matched articles...
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Follow-up chat thread */}
              {chatThread.length > 0 && (
                <div className="border-t border-border pt-6 flex flex-col gap-5 select-text">
                  <span className="font-mono text-[10px] font-bold text-mid-concrete uppercase tracking-wider block mb-1">
                    Follow-up Discussion
                  </span>
                  
                  {chatThread.map((msg, idx) => {
                    if (idx === 0 && msg.role === 'assistant') return null; // skip initial summary
                    return (
                      <div 
                        key={idx} 
                        className={`p-4 border select-text ${
                          msg.role === 'user' 
                            ? 'bg-concrete/45 border-border border-l-4 border-l-carbon' 
                            : 'bg-white border-carbon border-l-4 border-l-premium'
                        }`}
                      >
                        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-mid-concrete block mb-2 select-none">
                          {msg.role === 'user' ? 'Legal Query' : 'Compliance Officer'}
                        </span>
                        <div className="font-sans text-[13px] leading-relaxed text-carbon select-text">
                          {parseMarkdownToReact(msg.content)}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Loading dot state */}
                  {isSynthesizing && chatThread.length > 0 && (
                    <div className="p-4 border bg-white border-carbon border-l-4 border-l-premium animate-pulse select-none">
                      <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-mid-concrete block mb-2">
                        Officer responding...
                      </span>
                      <div className="flex gap-1.5 items-center py-1">
                        <span className="w-2 h-2 rounded-full bg-premium animate-bounce"></span>
                        <span className="w-2 h-2 rounded-full bg-premium animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-2 h-2 rounded-full bg-premium animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Drawer Footer / Input Box */}
            <div className="border-t border-border p-4 bg-concrete/20">
              <form onSubmit={handleFollowUpSubmit} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder={isSynthesizing ? "Generating response..." : "Ask follow-up questions about these requirements..."}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-grow bg-white border border-border px-3 py-2 text-[12.5px] focus:outline-none focus:border-premium text-carbon rounded-none"
                  disabled={isSynthesizing}
                  required
                />
                <button
                  type="submit"
                  disabled={isSynthesizing || !chatInput.trim()}
                  className="bg-premium border border-premium text-white hover:bg-white hover:text-premium transition-colors px-4 py-2.5 font-mono text-[10px] font-bold uppercase select-none rounded-none cursor-pointer disabled:bg-border disabled:text-mid-concrete"
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
