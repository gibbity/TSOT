'use client';

import { useState } from 'react';
import { RegistryRecord, Pillar } from '@/types';
import SearchBar from './SearchBar';
import PillarFilter from './PillarFilter';
import RecordCard from './RecordCard';

interface RegistryClientProps {
  initialRecords: RegistryRecord[];
}

export default function RegistryClient({ initialRecords }: RegistryClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<Pillar | 'ALL'>('ALL');

  const filteredRecords = initialRecords.filter((record) => {
    // 1. Pillar filter
    if (selectedPillar !== 'ALL' && record.pillar !== selectedPillar) {
      return false;
    }

    // 2. Search query filter (search across title, summary, verdict, and code)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = record.title.toLowerCase().includes(q);
      const matchSummary = record.human_summary.toLowerCase().includes(q);
      const matchVerdict = record.verdict.toLowerCase().includes(q);
      const matchCode = record.code.toLowerCase().includes(q);
      const matchMetric = record.metric.toLowerCase().includes(q);
      return matchTitle || matchSummary || matchVerdict || matchCode || matchMetric;
    }

    return true;
  });

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
        <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-mid-concrete">
          Registry Ledger ({filteredRecords.length} Records)
        </h3>
        <span className="font-mono text-[10px] text-mid-concrete uppercase tracking-[0.08em]">
          Sort: Chronological
        </span>
      </div>

      {/* Grid container */}
      {filteredRecords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-border bg-white mb-20">
          {filteredRecords.map((record) => (
            <RecordCard key={record.code} record={record} />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-border py-20 text-center bg-white mb-20">
          <p className="font-mono text-[12px] uppercase text-mid-concrete tracking-widest mb-2">
            No Records Located
          </p>
          <p className="font-sans text-[13px] text-mid-concrete max-w-[400px] mx-auto leading-relaxed">
            The search query did not match any findings in the index ledger. Refine your filters or search terms.
          </p>
        </div>
      )}
    </div>
  );
}
