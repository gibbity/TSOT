import { Pillar } from '@/types';

interface PillarFilterProps {
  selected: Pillar | 'ALL';
  onChange: (pillar: Pillar | 'ALL') => void;
}

const PILLARS: { value: Pillar | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Criteria' },
  { value: 'COGNITIVE OFFLOADING', label: 'Reasoning' },
  { value: 'FRICTION & VERIFICATION', label: 'User Experience' },
  { value: 'TEMPORAL PERCEPTION', label: 'Attention' },
  { value: 'EPISTEMIC AGENCY', label: 'Ethics' },
];

export default function PillarFilter({ selected, onChange }: PillarFilterProps) {
  return (
    <div className="w-full">
      <span className="block font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-mid-concrete mb-2 lg:text-right select-none">
        Filter by Criteria
      </span>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:justify-end">
        {PILLARS.map((p) => {
          const isActive = selected === p.value;
          return (
            <button
              key={p.value}
              onClick={() => onChange(p.value)}
              className={`font-sans text-[13px] font-bold transition-all duration-200 cursor-pointer select-none border-none outline-none ${
                isActive
                  ? 'bg-[#3a66f5] text-white rounded-[10px] px-5 py-2.5 shadow-sm'
                  : 'bg-transparent text-carbon hover:text-[#3a66f5] py-2 px-1'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
