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
        className="block font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-mid-concrete mb-2"
      >
        Free Text Query
      </label>
      <div className="relative w-full">
        <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-4.5 h-4.5 text-carbon" />
        </span>
        <input
          id="registry-search"
          type="text"
          placeholder="SEARCH THE LEDGER..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white border border-border pl-12 pr-4 py-3 font-mono text-[12px] tracking-wider uppercase placeholder:text-mid-concrete/40 transition-colors focus:border-carbon focus:ring-0 rounded-[10px] text-carbon shadow-sm"
        />
      </div>
    </div>
  );
}
