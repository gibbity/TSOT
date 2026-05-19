'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Helper to parse citations like [#SOT-COMP-2026] and turn them into links
function renderAuditorText(text: string) {
  if (!text) return null;

  // Match codes like [#SOT-COMP-2026] or [#SOT-3D4F5A]
  const regex = /(\[#SOT-[A-Z0-9-]{4,10}\])/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (regex.test(part)) {
      // Extract code: SOT-COMP-2026
      const code = part.replace(/[\[#\]]/g, '');
      return (
        <Link
          key={index}
          href={`/registry/${code}`}
          className="text-signal underline hover:text-carbon font-mono font-bold mx-1 inline-block select-all"
        >
          {part}
        </Link>
      );
    }
    return <span key={index} className="whitespace-pre-line">{part}</span>;
  });
}

export default function AuditorPage() {
  const [productDesc, setProductDesc] = useState('');
  const [byokKey, setByokKey] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditOutput, setAuditOutput] = useState('');
  const [sessionRemaining, setSessionRemaining] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Hydrate BYOK Key from localStorage on load
  useEffect(() => {
    const savedKey = localStorage.getItem('tsot_byok_key');
    if (savedKey) setByokKey(savedKey);

    // Initial limit guess from cookie parsing
    const countCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('tsot_audit_count='));
    if (countCookie) {
      const count = parseInt(countCookie.split('=')[1]);
      setSessionRemaining(Math.max(0, 5 - count));
    } else {
      setSessionRemaining(5);
    }
  }, []);

  // Save BYOK Key to localStorage
  const handleSaveKey = (val: string) => {
    setByokKey(val);
    if (val) {
      localStorage.setItem('tsot_byok_key', val);
    } else {
      localStorage.removeItem('tsot_byok_key');
    }
  };

  const runAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productDesc.trim()) return;

    setIsAuditing(true);
    setAuditOutput('');
    setErrorMsg('');

    try {
      const response = await fetch('/api/auditor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: productDesc,
          byok_key: byokKey.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate audit.');
      }

      // Read session header
      const remainingHeader = response.headers.get('X-Session-Remaining');
      if (remainingHeader !== null) {
        setSessionRemaining(parseInt(remainingHeader));
      }

      // Stream the response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Streaming not supported by browser.');
      }

      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          setAuditOutput((prev) => prev + chunk);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during auditing.');
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-12 select-text">
      {/* Title Header */}
      <div className="border-b border-border pb-6 mb-10">
        <h1 className="font-gambarino text-[36px] md:text-[44px] tracking-[-0.02em] font-bold text-carbon">
          Adversarial Design Auditor
        </h1>
        <p className="font-sans text-[13px] text-mid-concrete mt-2 max-w-[600px] leading-relaxed">
          Input your AI system design, feature set, or latencies. Our auditor reviews your system architectures against real-world human-AI interaction registry briefs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-20">
        {/* Left Input Form Panel (Cols 1-5) */}
        <form onSubmit={runAudit} className="lg:col-span-5 bg-white border border-border p-6 flex flex-col gap-6 select-none">
          <div>
            <label
              htmlFor="product-desc"
              className="block font-sans text-[10px] font-bold uppercase tracking-[0.12em] text-carbon mb-2"
            >
              AI Product Architecture / Spec
            </label>
            <textarea
              id="product-desc"
              rows={8}
              placeholder="Describe your design, feature workflows, streaming latencies, or prospective agent actions..."
              value={productDesc}
              onChange={(e) => setProductDesc(e.target.value)}
              className="w-full bg-white border border-border p-4 font-sans text-[13px] leading-relaxed placeholder:text-mid-concrete/50 focus:border-carbon focus:ring-0 rounded-none text-carbon resize-y"
              disabled={isAuditing}
              required
            />
          </div>

          {/* BYOK and session key limits */}
          <div className="border-t border-border pt-4">
            <div className="flex justify-between items-baseline mb-2">
              <label
                htmlFor="byok-key"
                className="font-sans text-[10px] font-bold uppercase tracking-[0.12em] text-mid-concrete"
              >
                Personal Gemini API Key (BYOK)
              </label>
              <span className="font-mono text-[9px] text-[#534AB7] uppercase font-bold">
                Bypasses daily limit
              </span>
            </div>
            <input
              id="byok-key"
              type="password"
              placeholder="PASTE GEMINI_API_KEY..."
              value={byokKey}
              onChange={(e) => handleSaveKey(e.target.value)}
              className="w-full bg-white border border-border px-3 py-2 font-mono text-[11px] placeholder:text-mid-concrete/40 focus:border-carbon focus:ring-0 rounded-none text-carbon"
              disabled={isAuditing}
            />
            <p className="font-sans text-[10px] text-mid-concrete mt-1.5 leading-normal">
              Keys are processed entirely client-side. Bypasses the daily session counter.
            </p>
          </div>

          {/* Rate limiting session info */}
          {!byokKey && sessionRemaining !== null && (
            <div className="bg-concrete/30 border border-border px-4 py-3 flex items-center justify-between">
              <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-mid-concrete">
                Free Audits Remaining:
              </span>
              <span className="font-mono text-[12px] font-bold text-carbon">
                {sessionRemaining} / 5
              </span>
            </div>
          )}

          {/* Form Action Button */}
          <button
            type="submit"
            disabled={isAuditing || !productDesc.trim()}
            className="w-full font-mono text-[12px] font-bold tracking-wider uppercase px-4 py-3 border select-none transition-colors rounded-none bg-carbon text-white border-carbon hover:bg-white hover:text-carbon disabled:bg-concrete disabled:text-mid-concrete disabled:border-border disabled:cursor-not-allowed cursor-pointer"
          >
            {isAuditing ? 'AUDITING SYSTEM...' : 'EXECUTE SYSTEM AUDIT'}
          </button>
        </form>

        {/* Right Output Panel (Cols 6-12) */}
        <div className="lg:col-span-7 bg-white border border-border min-h-[460px] flex flex-col relative overflow-hidden">
          {/* Header Panel Tab */}
          <div className="border-b border-border px-6 py-3 flex justify-between items-center bg-concrete/20 select-none">
            <span className="font-mono text-[10px] font-bold tracking-wider text-mid-concrete uppercase">
              AUDIT FEED CONSOLE
            </span>
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-border"></span>
              <span className={`w-2 h-2 rounded-full ${isAuditing ? 'bg-signal animate-pulse' : 'bg-border'}`}></span>
            </div>
          </div>

          {/* Main output console body */}
          <div className="p-8 flex-1 flex flex-col justify-start overflow-y-auto leading-relaxed select-text">
            {errorMsg && (
              <div className="border-l-2 border-critical px-4 py-2 bg-critical/5 mb-6 text-[13px] text-critical select-none">
                <span className="font-bold uppercase block mb-1">AUDIT FAILED</span>
                {errorMsg}
              </div>
            )}

            {auditOutput ? (
              <div className="font-sans text-[14px] text-carbon leading-[1.7] prose select-text prose-sm max-w-none">
                {renderAuditorText(auditOutput)}
                {isAuditing && (
                  <span className="inline-block w-1.5 h-4 bg-signal ml-1 animate-pulse align-middle"></span>
                )}
              </div>
            ) : (
              <div className="my-auto text-center py-12 select-none">
                <span className="font-mono text-[11px] uppercase tracking-widest text-mid-concrete block mb-2">
                  Console Standby
                </span>
                <p className="font-sans text-[13px] text-mid-concrete max-w-[340px] mx-auto leading-relaxed">
                  Provide your product architecture parameters and execute the audit routine to stream HCI design metrics.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
