'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, ArrowRight, BookOpen, Scale, Cpu, Terminal, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface OpenAlexSearchProps {
  initialRegistryCount: number;
  initialAiActCount: number;
  initialAuditCount: number;
}

export default function OpenAlexSearch({
  initialRegistryCount,
  initialAiActCount,
  initialAuditCount
}: OpenAlexSearchProps) {
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<'all' | 'corpus' | 'ai_act'>('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Trigger search on query or source change
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        let fetchedResults: any[] = [];
        
        if (source === 'all' || source === 'corpus') {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&source=corpus&limit=5`);
          const data = await res.json();
          if (data.records) {
            fetchedResults = fetchedResults.concat(
              data.records.map((r: any) => ({ ...r, type: 'design' }))
            );
          }
        }

        if (source === 'all' || source === 'ai_act') {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&source=ai_act&limit=5`);
          const data = await res.json();
          if (data.records) {
            fetchedResults = fetchedResults.concat(
              data.records.map((r: any) => ({ ...r, type: 'compliance' }))
            );
          }
        }

        // Sort results by score if available
        fetchedResults.sort((a, b) => (b.score || 0) - (a.score || 0));
        setResults(fetchedResults);
        setHasSearched(true);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query, source]);

  return (
    <div className="w-full space-y-10">
      
      {/* Search Console Area */}
      <div className="max-w-[800px] mx-auto text-center space-y-6">
        
        {/* Entity Tabs */}
        <div className="flex justify-center gap-1.5 p-1 bg-neutral-100 rounded-full w-fit mx-auto select-none">
          {[
            { id: 'all', label: 'All Catalog' },
            { id: 'corpus', label: 'HCI Papers' },
            { id: 'ai_act', label: 'EU AI Act' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSource(tab.id as any)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                source === tab.id
                  ? 'bg-white text-carbon shadow-sm'
                  : 'text-mid-concrete hover:text-carbon'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Search Input */}
        <div className="relative shadow-md rounded-[20px] overflow-hidden border border-border bg-white group focus-within:ring-2 focus-within:ring-[#3a66f5]/20 focus-within:border-[#3a66f5] transition-all">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-mid-concrete group-focus-within:text-[#3a66f5] transition-colors">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 6,400+ HCI studies, cognitive pillars, risk levels, or EU AI Act articles..."
            className="w-full pl-14 pr-6 py-5 text-[15px] font-sans text-carbon focus:outline-none placeholder-mid-concrete bg-transparent"
          />
        </div>

        {/* Entity Counters Band */}
        <div className="grid grid-cols-3 divide-x divide-border pt-4 text-center select-none">
          <div>
            <div className="font-gambarino text-[24px] sm:text-[30px] text-carbon font-semibold">
              {initialRegistryCount.toLocaleString()}
            </div>
            <div className="text-[11px] font-bold uppercase text-mid-concrete tracking-wider">HCI Papers</div>
          </div>
          <div>
            <div className="font-gambarino text-[24px] sm:text-[30px] text-carbon font-semibold">
              {initialAiActCount.toLocaleString()}
            </div>
            <div className="text-[11px] font-bold uppercase text-mid-concrete tracking-wider">EU AI Act Articles</div>
          </div>
          <div>
            <div className="font-gambarino text-[24px] sm:text-[30px] text-carbon font-semibold">
              {initialAuditCount.toLocaleString()}
            </div>
            <div className="text-[11px] font-bold uppercase text-mid-concrete tracking-wider">System Audits Logged</div>
          </div>
        </div>

      </div>

      {/* Dynamic Results Display Area */}
      {hasSearched && (
        <div className="bg-white border border-border rounded-[24px] p-6 shadow-sm space-y-4 max-w-[950px] mx-auto select-text">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-[11px] font-bold text-mid-concrete uppercase tracking-wider">
              Search Results ({results.length} matched)
            </span>
            <Link 
              href={source === 'ai_act' ? '/ai-act' : '/registry'} 
              className="text-[11px] font-bold text-[#3a66f5] hover:underline uppercase tracking-wider"
            >
              Browse Full Catalog →
            </Link>
          </div>

          {results.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="font-sans text-[14px] text-mid-concrete">No exact catalog results found for "{query}".</p>
              <p className="font-sans text-[12px] text-neutral-400">Try searching for keywords like "latency", "offloading", "Article 5", or "cybersecurity".</p>
            </div>
          ) : (
            <div className="divide-y divide-border select-text">
              {results.map((item) => (
                <div key={item.code} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11.5px] font-bold bg-neutral-100 text-carbon px-2 py-0.5 rounded">
                        #{item.code}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        item.type === 'compliance' 
                          ? 'bg-red-50 text-red-600' 
                          : 'bg-blue-50 text-[#3a66f5]'
                      }`}>
                        {item.type === 'compliance' ? 'Regulation' : 'HCI Paper'}
                      </span>
                      <span className="text-neutral-300">|</span>
                      <span className="text-[11.5px] font-bold text-mid-concrete uppercase tracking-normal">
                        {item.pillar}
                      </span>
                    </div>
                    
                    <h4 className="font-gambarino text-[15px] sm:text-[17px] text-[#3a66f5] hover:text-[#254edb] leading-snug font-semibold">
                      <Link href={item.type === 'compliance' ? `/ai-act/${item.code}` : `/registry/${item.code}`}>
                        {item.title}
                      </Link>
                    </h4>
                    
                    <p className="font-sans text-[13px] text-mid-concrete line-clamp-2 leading-relaxed">
                      {item.human_summary}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-end gap-2 shrink-0 self-start sm:self-auto">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      item.risk_level === 'critical'
                        ? 'bg-red-100 text-red-700'
                        : item.risk_level === 'warning'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {item.risk_level}
                    </span>
                    <Link
                      href={item.type === 'compliance' ? `/ai-act/${item.code}` : `/registry/${item.code}`}
                      className="text-[#3a66f5] hover:text-[#254edb] flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider mt-1.5"
                    >
                      Inspect <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
