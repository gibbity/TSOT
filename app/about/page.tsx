export default function AboutPage() {
  return (
    <main className="py-12 max-w-[800px] mx-auto px-6 select-text">
      {/* Title */}
      <div className="border-b border-border pb-6 mb-10">
        <h1 className="font-gambarino text-[36px] md:text-[44px] text-carbon font-normal">
          METHODOLOGY & PILLARS
        </h1>
        <p className="font-sans text-[13px] text-mid-concrete mt-2 max-w-[600px] leading-relaxed uppercase tracking-wider">
          The structural design constraints guiding TSOT paper classification.
        </p>
      </div>

      {/* Main Content */}
      <article className="prose prose-neutral max-w-none font-sans text-[14px] leading-[1.8] text-carbon flex flex-col gap-10">
        <section className="flex flex-col gap-4">
          <p className="font-gambarino text-[20px] leading-relaxed text-carbon">
            The Sign of Times (TSOT) is a research registry designed to map how current AI interface structures alter human cognition, memory recall, planning, and belief calibration.
          </p>
          <p>
            Unlike typical AI databases focused on model benchmarks or generic developer tooling, TSOT works from the outside in. We track the empirical effects of agentic design systems on the human mind, converting scientific discoveries into structured, actionable guidelines for engineers, designers, and founders.
          </p>
        </section>

        {/* The Four Pillars */}
        <section className="flex flex-col gap-6 border-t border-border pt-10">
          <h2 className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-mid-concrete">
            THE FOUR COGNITIVE PILLARS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Pillar 1 */}
            <div className="border border-border p-5 relative bg-white">
              <span className="absolute top-0 left-0 w-2 h-[1px] bg-[#534AB7]"></span>
              <span className="absolute top-0 left-0 h-2 w-[1px] bg-[#534AB7]"></span>
              <h3 className="font-sans text-[12px] font-bold tracking-wider text-[#534AB7] uppercase mb-2">
                1. COGNITIVE OFFLOADING
              </h3>
              <p className="text-[13px] text-mid-concrete leading-relaxed">
                Deals with technologies that erode human prospective memory, structural planning, logical reasoning, and long-term retention. Evaluates the long-term impact of delegating cognitive tasks to machines.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="border border-border p-5 relative bg-white">
              <span className="absolute top-0 left-0 w-2 h-[1px] bg-[#0F6E56]"></span>
              <span className="absolute top-0 left-0 h-2 w-[1px] bg-[#0F6E56]"></span>
              <h3 className="font-sans text-[12px] font-bold tracking-wider text-[#0F6E56] uppercase mb-2">
                2. FRICTION & VERIFICATION
              </h3>
              <p className="text-[13px] text-mid-concrete leading-relaxed">
                Measures interface interventions that interrupt automated habits. Focuses on productive friction design paradigms that calibrates user expectations and restores active verification loops.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="border border-border p-5 relative bg-white">
              <span className="absolute top-0 left-0 w-2 h-[1px] bg-[#854F0B]"></span>
              <span className="absolute top-0 left-0 h-2 w-[1px] bg-[#854F0B]"></span>
              <h3 className="font-sans text-[12px] font-bold tracking-wider text-[#854F0B] uppercase mb-2">
                3. TEMPORAL PERCEPTION
              </h3>
              <p className="text-[13px] text-mid-concrete leading-relaxed">
                Evaluates response timing, system latencies, and output paces. Researches how real-time streaming, latency offsets, and immediate reply structures affect human turn-taking thresholds and anthropomorphism.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="border border-border p-5 relative bg-white">
              <span className="absolute top-0 left-0 w-2 h-[1px] bg-[#993C1D]"></span>
              <span className="absolute top-0 left-0 h-2 w-[1px] bg-[#993C1D]"></span>
              <h3 className="font-sans text-[12px] font-bold tracking-wider text-[#993C1D] uppercase mb-2">
                4. EPISTEMIC AGENCY
              </h3>
              <p className="text-[13px] text-mid-concrete leading-relaxed">
                Studies how generative search formats, personalized sentiment mapping, and contextual source filtering change how users establish truth, review evidence, and shape societal beliefs.
              </p>
            </div>

          </div>
        </section>

        {/* Paper Ingestion Section */}
        <section className="flex flex-col gap-4 border-t border-border pt-10">
          <h2 className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-mid-concrete">
            INGESTION AUTOMATION & INTEGRITY
          </h2>
          <p>
            Our registry queries <strong>OpenAlex</strong> using specific target query keywords. Abstracts are parsed through <strong>Gemini 3.1 Flash Lite</strong> utilizing a strict, unyielding system schema designed to convert complex statistical data into accessible, human-centric findings.
          </p>
          <p>
            To guarantee absolute integrity, our editorial prompts forbid corporate cheerleading or alarmist framing. If a paper abstract fails to report clean, empirical metrics, it is highlighted as such. We mandate that every registry record includes direct links to its original scholarly publication source to ensure users can cross-validate all findings.
          </p>
        </section>

        {/* Adversarial auditor section */}
        <section className="flex flex-col gap-4 border-t border-border pt-10 mb-20">
          <h2 className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-mid-concrete">
            ADVERSARIAL AUDITOR ARCHITECTURE
          </h2>
          <p>
            The RAG (Retrieval-Augmented Generation) Design Auditor utilizes full-text and vector-cosine similarity indexes to query the registry. When you submit a product specifications draft, the auditor pulls the most relevant registry records as context.
          </p>
          <p>
            It then conducts a strict comparison: analyzing where your architecture presents risks (e.g., streaming conversational nodes under 200ms) against empirical HCI findings, and supplies explicit, sprint-actionable verdicts that you can implement immediately.
          </p>
        </section>
      </article>
    </main>
  );
}
