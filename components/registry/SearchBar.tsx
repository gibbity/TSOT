import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="w-full">
      <label
        htmlFor="registry-search"
        className="block font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2"
      >
        Free Text Query
      </label>
      <div className="relative w-full">
        <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-neutral-500" />
        </span>
        <input
          id="registry-search"
          type="text"
          placeholder="SEARCH BY KEYWORD, ARTICLE, OR DILEMMA..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/[0.04] border border-white/10 pl-11 pr-4 py-3 font-mono text-[12px] tracking-wider uppercase text-white placeholder:text-neutral-600 transition-colors focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.06] rounded-[12px]"
        />
      </div>
    </div>
  );
}
