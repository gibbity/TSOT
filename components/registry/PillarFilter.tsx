import { Pillar } from '@/types';

interface PillarFilterProps {
  selected: Pillar | 'ALL';
  onChange: (pillar: Pillar | 'ALL') => void;
  options: { value: Pillar | 'ALL'; label: string }[];
}

export default function PillarFilter({ selected, onChange, options }: PillarFilterProps) {
  return (
    <div className="w-full">
      <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2 lg:text-right select-none">
        Filter by Criteria
      </span>
      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        {options.map((p) => {
          const isActive = selected === p.value;
          return (
            <button
              key={p.value}
              onClick={() => onChange(p.value)}
              className={`font-sans text-[12.5px] transition-all duration-200 cursor-pointer select-none rounded-full px-3.5 py-1.5 border ${
                isActive
                  ? 'bg-white text-[#0a0a0c] font-semibold border-white shadow-sm'
                  : 'bg-white/[0.03] text-neutral-400 border-white/10 hover:border-white/25 hover:text-white'
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
