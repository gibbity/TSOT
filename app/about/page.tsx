export default function AboutPage() {
  return (
    <main className="py-12 max-w-[800px] mx-auto px-6 select-text">
      {/* Title & Description side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-baseline pb-6 border-b border-border mb-10">
        <div className="md:col-span-1">
          <h1 className="font-gambarino text-[32px] sm:text-[38px] md:text-[42px] text-[#3a66f5] font-normal leading-none uppercase">
            Methodology & Pillars
          </h1>
        </div>
        <div className="md:col-span-2">
          <p className="font-gambarino text-[13px] sm:text-[14px] md:text-[15px] text-[#3a66f5] leading-relaxed max-w-[700px]">
            The structural design constraints guiding TSOT paper classification. Map how current AI interface structures alter human cognition, memory recall, and planning.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <article className="prose prose-neutral max-w-none font-sans text-[14px] leading-[1.8] text-carbon flex flex-col gap-10">
        <section className="flex flex-col gap-4">
          <p className="font-gambarino text-[20px] leading-relaxed text-[#3a66f5]">
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
            <div className="group bg-[#f8f8f8] p-6 rounded-[22px] shadow-[5px_7px_4px_0px_rgba(0,0,0,0.15)] border-none transition-all duration-500 hover:-translate-y-1 hover:shadow-[5px_7px_12px_0px_rgba(0,0,0,0.2)] hover:bg-[#000c4b] hover:text-white flex flex-col min-h-[190px]">
              <h3 className="font-sans text-[13px] font-bold tracking-wider text-[#534AB7] group-hover:text-white transition-colors duration-500 uppercase mb-3">
                1. COGNITIVE OFFLOADING
              </h3>
              <p className="text-[13px] text-mid-concrete group-hover:text-white/80 transition-colors duration-500 leading-relaxed">
                Deals with technologies that erode human prospective memory, structural planning, logical reasoning, and long-term retention. Evaluates the long-term impact of delegating cognitive tasks to machines.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="group bg-[#f8f8f8] p-6 rounded-[22px] shadow-[5px_7px_4px_0px_rgba(0,0,0,0.15)] border-none transition-all duration-500 hover:-translate-y-1 hover:shadow-[5px_7px_12px_0px_rgba(0,0,0,0.2)] hover:bg-[#0f1e19] hover:text-white flex flex-col min-h-[190px]">
              <h3 className="font-sans text-[13px] font-bold tracking-wider text-[#0F6E56] group-hover:text-white transition-colors duration-500 uppercase mb-3">
                2. FRICTION & VERIFICATION
              </h3>
              <p className="text-[13px] text-mid-concrete group-hover:text-white/80 transition-colors duration-500 leading-relaxed">
                Measures interface interventions that interrupt automated habits. Focuses on productive friction design paradigms that calibrates user expectations and restores active verification loops.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="group bg-[#f8f8f8] p-6 rounded-[22px] shadow-[5px_7px_4px_0px_rgba(0,0,0,0.15)] border-none transition-all duration-500 hover:-translate-y-1 hover:shadow-[5px_7px_12px_0px_rgba(0,0,0,0.2)] hover:bg-[#3e1535] hover:text-white flex flex-col min-h-[190px]">
              <h3 className="font-sans text-[13px] font-bold tracking-wider text-[#854F0B] group-hover:text-white transition-colors duration-500 uppercase mb-3">
                3. TEMPORAL PERCEPTION
              </h3>
              <p className="text-[13px] text-mid-concrete group-hover:text-white/80 transition-colors duration-500 leading-relaxed">
                Evaluates response timing, system latencies, and output paces. Researches how real-time streaming, latency offsets, and immediate reply structures affect human turn-taking thresholds and anthropomorphism.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="group bg-[#f8f8f8] p-6 rounded-[22px] shadow-[5px_7px_4px_0px_rgba(0,0,0,0.15)] border-none transition-all duration-500 hover:-translate-y-1 hover:shadow-[5px_7px_12px_0px_rgba(0,0,0,0.2)] hover:bg-[#4a0e17] hover:text-white flex flex-col min-h-[190px]">
              <h3 className="font-sans text-[13px] font-bold tracking-wider text-[#993C1D] group-hover:text-white transition-colors duration-500 uppercase mb-3">
                4. EPISTEMIC AGENCY
              </h3>
              <p className="text-[13px] text-mid-concrete group-hover:text-white/80 transition-colors duration-500 leading-relaxed">
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
