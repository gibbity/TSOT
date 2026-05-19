import { Pillar } from '@/types';

interface PillarFilterProps {
  selected: Pillar | 'ALL';
  onChange: (pillar: Pillar | 'ALL') => void;
}

const PILLARS: { value: Pillar | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'ALL CRITERIA' },
  { value: 'COGNITIVE OFFLOADING', label: 'REASONING' },
  { value: 'FRICTION & VERIFICATION', label: 'USER EXPERIENCE' },
  { value: 'TEMPORAL PERCEPTION', label: 'ATTENTION' },
  { value: 'EPISTEMIC AGENCY', label: 'ETHICS' },
];

export default function PillarFilter({ selected, onChange }: PillarFilterProps) {
  return (
    <div className="w-full">
      <span className="block font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-mid-concrete mb-2">
        Filter by Pillar
      </span>
      <div className="flex flex-wrap gap-2">
        {PILLARS.map((p) => {
          const isActive = selected === p.value;
          return (
            <button
              key={p.value}
              onClick={() => onChange(p.value)}
              className={`font-mono text-[11px] font-bold tracking-wider uppercase px-4 py-2 border select-none transition-colors rounded-none ${
                isActive
                  ? 'bg-carbon text-white border-carbon'
                  : 'bg-white text-mid-concrete border-border hover:border-carbon hover:text-carbon'
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
