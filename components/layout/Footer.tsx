export default function Footer() {
  return (
    <footer className="border-t border-border bg-white py-12 mt-20 w-full">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col gap-1">
          <p className="font-sans text-[11px] font-bold uppercase tracking-[0.1em] text-carbon">
            THE SIGN OF TIMES (TSOT)
          </p>
          <p className="font-sans text-[10px] text-mid-concrete">
            © 2026 Human-AI Interaction Research Registry. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="https://openalex.org"
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-[10px] text-mid-concrete hover:text-carbon uppercase tracking-[0.08em] underline"
          >
            Powered by OpenAlex
          </a>
          <span className="text-border">|</span>
          <span className="font-sans text-[10px] text-mid-concrete uppercase tracking-[0.08em]">
            ADVERSARIAL AI AUDIT ENGINE v1.0
          </span>
        </div>
      </div>
    </footer>
  );
}
