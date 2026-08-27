'use client';

import { useState, useEffect, useRef } from 'react';
import { RegistryRecord, Pillar } from '@/types';
import SearchBar from './SearchBar';
import PillarFilter from './PillarFilter';
import RecordCard from './RecordCard';
import { Sparkles, X, Send } from 'lucide-react';
import { parseMarkdownToReact } from './MarkdownRenderer';

const CORPUS_OPTIONS = [
  { value: 'ALL', label: 'All Criteria' },
  { value: 'COGNITIVE OFFLOADING', label: 'Reasoning' },
  { value: 'FRICTION & VERIFICATION', label: 'User Experience' },
  { value: 'TEMPORAL PERCEPTION', label: 'Attention' },
  { value: 'EPISTEMIC AGENCY', label: 'Ethics' },
] as { value: Pillar | 'ALL'; label: string }[];

interface RegistryClientProps {
  initialRecords: RegistryRecord[];
  initialCount: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const PAGE_SIZE = 30;

export default function RegistryClient({ initialRecords, initialCount }: RegistryClientProps) {
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
        `/api/search?q=${encodeURIComponent(search)}&pillar=${encodeURIComponent(pillar)}&limit=${PAGE_SIZE}&page=0&source=corpus`
      );
      if (!res.ok) throw new Error('Search API failed');
      const data = await res.json();
      
      setRecords(data.records || []);
      setTotalCount(data.count || 0);
      setPage(0);
      setIsFallback(false);
    } catch (err) {
      console.warn('API search query failed, falling back to local filtration:', err);
      const filtered = initialRecords.filter((record) => {
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
        `/api/search?q=${encodeURIComponent(searchQuery)}&pillar=${encodeURIComponent(selectedPillar)}&limit=${PAGE_SIZE}&page=${nextPage}&source=corpus`
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
      {/* Search & Filter Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-6 border-b border-white/8 select-none">
        <div className="w-full lg:max-w-[450px]">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
        <div className="w-full lg:w-auto">
          <PillarFilter 
            selected={selectedPillar} 
            onChange={setSelectedPillar} 
            options={CORPUS_OPTIONS}
          />
        </div>
      </div>

      {/* Synthesis Trigger Button Band */}
      {searchQuery.trim() !== '' && records.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 border border-emerald-500/25 bg-[#0f1a14] p-4 -mt-6 rounded-[14px]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="font-sans text-[13px] font-medium text-emerald-300">
              Fuzzy semantic query matched {totalCount} findings. Let AI compile a research brief for you.
            </span>
          </div>
          <button
            onClick={handleTriggerSynthesis}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-[#0a0a0c] font-mono text-[11px] font-bold tracking-wider uppercase transition-all cursor-pointer rounded-full whitespace-nowrap select-none shadow-sm"
          >
            Synthesize Findings
          </button>
        </div>
      )}

      {/* Results Header */}
      <div className="flex justify-between items-baseline border-b border-white/8 pb-2">
        <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest text-neutral-500">
          Registry Ledger ({totalCount.toLocaleString()} Records{isLoading && ' · Syncing...'})
        </h3>
        <span className="font-mono text-[10.5px] text-neutral-600 uppercase tracking-wider">
          Sort: {searchQuery.trim() !== '' ? 'Semantic Relevance' : 'Chronological'}
        </span>
      </div>

      {/* Grid Container */}
      {records.length > 0 ? (
        <div className="flex flex-col gap-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-transparent">
            {records.map((record) => (
              <RecordCard key={record.code} record={record} />
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
                {isLoading ? 'LOADING ADDITIONAL ENTRIES...' : 'LOAD MORE LEDGER ENTRIES'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="border border-dashed border-white/10 py-20 text-center bg-white/[0.02] rounded-[20px] mb-20">
          <p className="font-mono text-[12px] uppercase text-neutral-400 tracking-widest mb-2">
            No Records Located
          </p>
          <p className="text-[13.5px] text-neutral-500 max-w-[400px] mx-auto leading-relaxed font-sans">
            {isLoading ? 'Searching database ledger...' : 'The search query did not match any findings in the index ledger. Refine your filters or search terms.'}
          </p>
        </div>
      )}

      {/* DUAL SLIDE-OUT PANEL (AI Search Synthesis Drawer) */}
      {isSynthesisDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end animate-fade-in select-text">
          <div className="absolute inset-0" onClick={() => setIsSynthesisDrawerOpen(false)}></div>
          <div className="relative w-full max-w-[600px] h-screen bg-[#111114] shadow-2xl border-l border-white/10 flex flex-col justify-between animate-slide-left select-text">
            
            {/* Drawer Header */}
            <div className="border-b border-white/10 px-6 py-5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="font-mono text-[11px] font-bold text-emerald-400 uppercase tracking-[0.15em]">
                  AI Research Synthesis
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
                      Aggregated Summary
                    </span>
                    <div className="select-text font-normal font-sans text-neutral-200 leading-[1.7]">
                      {parseMarkdownToReact(synthesisResult)}
                    </div>
                  </div>
                ) : isSynthesizing && chatThread.length === 0 ? (
                  <div className="flex flex-col gap-3 py-16 text-center select-none animate-pulse">
                    <Sparkles className="w-8 h-8 text-emerald-400/40 mx-auto animate-spin" />
                    <span className="font-mono text-[10px] uppercase text-neutral-500 tracking-widest">
                      Synthesizing findings across matched papers...
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
                          {msg.role === 'user' ? 'Research Question' : 'Librarian Answer'}
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
                        Librarian responding...
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
                  placeholder={isSynthesizing ? "Generating response..." : "Ask follow-up questions about these findings..."}
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
