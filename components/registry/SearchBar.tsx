interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="w-full relative">
      <label
        htmlFor="registry-search"
        className="block font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-mid-concrete mb-2"
      >
        Free Text Query
      </label>
      <input
        id="registry-search"
        type="text"
        placeholder="SEARCH THE LEDGER..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-border px-4 py-3 font-mono text-[13px] tracking-wider uppercase placeholder:text-mid-concrete/50 transition-colors focus:border-carbon focus:ring-0 rounded-none text-carbon"
      />
    </div>
  );
}
