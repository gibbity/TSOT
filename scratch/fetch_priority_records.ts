import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchRecord(code: string) {
  const { data } = await supabase
    .from('registry')
    .select('code, title, human_summary, verdict, pillar')
    .eq('code', code)
    .single();
  return data;
}

async function run() {
  // Pull key records for the most interesting niches
  const priorityCodes = [
    // CHILDREN & EDUCATION
    'SOT-N6ZPFM', // Programming Education Must Evolve Beyond AI-Assisted Code Generation
    'SOT-TMXDAU', // AI Tutors Boost Learning but Risk Creating Dependency
    'SOT-9PV66P', // The Hidden Cost of AI Dependency in Higher Education
    'SOT-MR2EGC', // AI Improves Writing Fluency But Weakens Critical Engagement
    'SOT-X3W43I', // Students Trade Critical Thinking for AI-Driven Academic Efficiency
    'SOT-IUZI1W', // Transparency is not enough to stop AI over-reliance in classrooms

    // MENTAL HEALTH
    'SOT-IJKVYF', // Virtual Sleep Coaches Can Improve Adherence to Therapy
    'SOT-H1PGKG', // Social Media Use Actively Inhibits Your Ability to Reach Flow States
    'SOT-NKFSSI', // How AI Companions Create Dependency Through Feedback Loops

    // AI COMPANIONS / RELATIONSHIPS
    'SOT-7EQHMS', // Social Robots That Know Who You Are Change Group Dynamics
    'SOT-OR3SN3', // Why We Anthropomorphize AI and Why It Matters for Trust

    // DEMENTIA / OLDER ADULTS
    'SOT-QTU2YT', // Designing AI to Support Personhood in Dementia Care
    'SOT-YZ96CI', // The Enrichment Paradox: When AI Help Becomes a Capability Collapse

    // BIAS / GENDER / RACE
    'SOT-8YZVJN', // Explainable AI Does Not Automatically Fix Human Hiring Bias
    'SOT-TVV2M4', // Why We Trust AI Bias More Than Human Bias

    // JOURNALISM / MISINFORMATION
    'SOT-EIDNWX', // The Erosion of Journalistic Trust Through Opaque AI Authorship
    'SOT-VODNH7', // How Social Media Habits Shape Our Ability to Spot Falsehoods
    'SOT-CWTI1P', // How Conspiracy Narratives Use Prophecy to Make Chaos Feel Inevitable

    // CREATIVITY
    'SOT-AS3R8Y', // The Future of Design Thinking in an AI-Augmented World
    'SOT-XJ2UR2', // Students Struggle to Balance AI Efficiency with Creative Originality
    'SOT-7KWXA4', // How AI Homogenizes Human Thought and Erodes Originality

    // IDENTITY / SELF
    'SOT-DHP04I', // AI as a Double-Edged Sword for Human Cognitive Vitality
    'SOT-GDIL9G', // The Hidden Cost of AI: Why Efficiency Erodes Your Self-Belief

    // WORKPLACE
    'SOT-O2WFDS', // When AI Controls Your Schedule, You Fight to Keep Your Agency
    'SOT-WFL5FZ', // The Quiet Normalization of AI-Generated Communication in Professional Life

    // MEDICAL TRAINING
    'SOT-N83Y4N', // AI Reliance in Medical Training Correlates With Metacognitive Laziness
  ];

  for (const code of priorityCodes) {
    const r = await fetchRecord(code);
    if (r) {
      console.log(`\n${'─'.repeat(60)}`);
      console.log(`[${r.code}] ${r.title}`);
      console.log(`PILLAR: ${r.pillar}`);
      console.log(`VERDICT: ${r.verdict}`);
      console.log(`SUMMARY:\n${r.human_summary?.slice(0, 500)}...`);
    }
  }
}

run();
