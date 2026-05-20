'use client';

import { useState, useEffect, useRef } from 'react';
import { RegistryRecord, Pillar } from '@/types';
import SearchBar from './SearchBar';
import PillarFilter from './PillarFilter';
import RecordCard from './RecordCard';
import { createClient } from '@/lib/supabase/client';

interface RegistryClientProps {
  initialRecords: RegistryRecord[];
  initialCount: number;
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

  const isMounted = useRef(false);

  const performSearch = async (search: string, pillar: Pillar | 'ALL') => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from('registry')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (pillar !== 'ALL') {
        query = query.eq('pillar', pillar);
      }

      if (search.trim() !== '') {
        const searchKeywords = search.trim().split(/\s+/).filter(Boolean).join(' & ');
        if (searchKeywords) {
          query = query.textSearch('fts', searchKeywords, {
            config: 'english',
            type: 'plain'
          });
        }
      }

      const { data, count, error } = await query.range(0, PAGE_SIZE - 1);
      if (error) throw error;

      setRecords(data || []);
      setTotalCount(count || 0);
      setPage(0);
      setIsFallback(false);
    } catch (err) {
      console.warn('Supabase query failed, falling back to local filtration:', err);
      // Local filtering fallback using initialRecords
      const filtered = initialRecords.filter((record) => {
        if (pillar !== 'ALL' && record.pillar !== pillar) return false;
        if (search.trim() !== '') {
          const q = search.toLowerCase();
          const matchTitle = record.title.toLowerCase().includes(q);
          const matchSummary = record.human_summary.toLowerCase().includes(q);
          const matchVerdict = record.verdict.toLowerCase().includes(q);
          const matchCode = record.code.toLowerCase().includes(q);
          const matchMetric = record.metric.toLowerCase().includes(q);
          return matchTitle || matchSummary || matchVerdict || matchCode || matchMetric;
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
      const supabase = createClient();
      let query = supabase
        .from('registry')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (selectedPillar !== 'ALL') {
        query = query.eq('pillar', selectedPillar);
      }

      if (searchQuery.trim() !== '') {
        const searchKeywords = searchQuery.trim().split(/\s+/).filter(Boolean).join(' & ');
        if (searchKeywords) {
          query = query.textSearch('fts', searchKeywords, {
            config: 'english',
            type: 'plain'
          });
        }
      }

      const fromRange = nextPage * PAGE_SIZE;
      const toRange = fromRange + PAGE_SIZE - 1;

      const { data, count, error } = await query.range(fromRange, toRange);
      if (error) throw error;

      if (data && data.length > 0) {
        setRecords((prev) => [...prev, ...data]);
        setPage(nextPage);
        if (count !== null) setTotalCount(count);
      }
      setIsFallback(false);
    } catch (err) {
      console.warn('Failed to load more records from Supabase:', err);
      setIsFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Search & Filter Header Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white border border-border p-6 select-none">
        <div className="lg:col-span-1">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
        <div className="lg:col-span-2">
          <PillarFilter selected={selectedPillar} onChange={setSelectedPillar} />
        </div>
      </div>

      {/* Results Title Banner */}
      <div className="flex justify-between items-baseline border-b border-border pb-2">
        <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-mid-concrete animate-fade-in">
          Registry Ledger ({totalCount} Records{isLoading && ' - Synchronizing...'})
        </h3>
        <span className="font-mono text-[10px] text-mid-concrete uppercase tracking-[0.08em]">
          Sort: Chronological
        </span>
      </div>

      {/* Grid container */}
      {records.length > 0 ? (
        <div className="flex flex-col gap-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-border bg-white">
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
                className="px-8 py-3.5 border border-border bg-white text-carbon hover:bg-carbon hover:text-white font-mono text-[11px] font-bold tracking-widest uppercase transition-colors duration-200 cursor-pointer disabled:bg-concrete disabled:text-mid-concrete disabled:border-border disabled:cursor-not-allowed select-none"
              >
                {isLoading ? 'LOADING ADDITIONAL ENTRIES...' : 'LOAD MORE LEDGER ENTRIES'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="border border-dashed border-border py-20 text-center bg-white mb-20">
          <p className="font-mono text-[12px] uppercase text-mid-concrete tracking-widest mb-2">
            No Records Located
          </p>
          <p className="font-sans text-[13px] text-mid-concrete max-w-[400px] mx-auto leading-relaxed">
            {isLoading ? 'Searching database ledger...' : 'The search query did not match any findings in the index ledger. Refine your filters or search terms.'}
          </p>
        </div>
      )}
    </div>
  );
}
