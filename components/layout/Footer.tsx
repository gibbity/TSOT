import Link from 'next/link';

const GRID_STYLE = {
  backgroundImage: `
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
  `,
  backgroundSize: '48px 48px',
};

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0c] border-t border-white/8 w-full relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={GRID_STYLE} />
      <div className="relative max-w-[1200px] mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-500">
            THE SIGN OF TIMES (TSOT)
          </p>
          <p className="font-sans text-[11px] text-neutral-700">
            © 2026 Human-AI Interaction Research Registry. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="https://openalex.org"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] text-neutral-700 hover:text-neutral-400 uppercase tracking-[0.08em] transition-colors"
          >
            Powered by OpenAlex
          </a>
          <span className="text-neutral-800">|</span>
          <span className="font-mono text-[11px] text-neutral-700 uppercase tracking-[0.08em]">
            MCP Server v1.0.1
          </span>
        </div>
      </div>
    </footer>
  );
}
