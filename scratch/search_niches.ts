import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Thematic keyword clusters for different niches
const nicheQueries = [
  { niche: 'CHILDREN & EDUCATION', keywords: ['child', 'children', 'student', 'school', 'learning', 'education', 'classroom', 'adolescent', 'youth', 'teen', 'teenager', 'pedagogy'] },
  { niche: 'MENTAL HEALTH & WELLBEING', keywords: ['mental health', 'depression', 'anxiety', 'wellbeing', 'stress', 'burnout', 'emotional', 'therapy', 'loneliness', 'emotion'] },
  { niche: 'RELATIONSHIPS & SOCIAL CONNECTION', keywords: ['relationship', 'social', 'loneliness', 'empathy', 'connection', 'companion', 'chatbot relationship', 'romantic'] },
  { niche: 'WORKPLACE & PRODUCTIVITY', keywords: ['workplace', 'worker', 'productivity', 'employee', 'job', 'career', 'knowledge worker', 'remote work', 'labor', 'work'] },
  { niche: 'HEALTHCARE & CLINICAL AI', keywords: ['clinical', 'doctor', 'patient', 'medical', 'diagnosis', 'healthcare', 'nurse', 'radiolog', 'clinician'] },
  { niche: 'CREATIVITY & ART', keywords: ['creative', 'creativity', 'art', 'writing', 'design', 'music', 'artist', 'storytelling', 'generative art'] },
  { niche: 'DEMOCRACY & MISINFORMATION', keywords: ['misinformation', 'democracy', 'fake news', 'political', 'election', 'trust', 'disinformation', 'deepfake', 'propaganda'] },
  { niche: 'AGING & OLDER ADULTS', keywords: ['older adult', 'elderly', 'aging', 'senior', 'dementia', 'age', 'gerontology'] },
  { niche: 'SLEEP & ATTENTION', keywords: ['sleep', 'attention', 'focus', 'distraction', 'cognitive load', 'memory', 'fatigue', 'night'] },
  { niche: 'ETHICS & BIAS', keywords: ['bias', 'fairness', 'ethical', 'discrimination', 'race', 'gender', 'inequality', 'justice', 'harm'] },
  { niche: 'ADDICTION & COMPULSIVE USE', keywords: ['addiction', 'compulsive', 'dopamine', 'habit', 'scrolling', 'engagement', 'hooked', 'persuasive'] },
  { niche: 'PRIVACY & SURVEILLANCE', keywords: ['privacy', 'surveillance', 'tracking', 'data', 'monitor', 'biometric', 'facial recognition'] },
];

interface NicheRecord {
  code: string;
  title: string;
  human_summary: string;
  verdict: string;
  pillar: string;
}

async function run() {
  const results: Record<string, {niche: string, records: NicheRecord[]}> = {};
  
  for (const { niche, keywords } of nicheQueries) {
    const orFilter = keywords.map(kw => `human_summary.ilike.%${kw}%,title.ilike.%${kw}%`).join(',');
    
    const { data, error } = await supabase
      .from('registry')
      .select('code, title, human_summary, verdict, pillar')
      .or(orFilter)
      .limit(5);

    if (error) {
      console.error(`Error fetching niche "${niche}":`, error.message);
      results[niche] = { niche, records: [] };
    } else {
      results[niche] = { niche, records: data || [] };
    }
  }

  // Output results in a structured way
  for (const [niche, { records }] of Object.entries(results)) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`NICHE: ${niche}`);
    console.log(`RECORD COUNT: ${records.length}`);
    console.log('='.repeat(70));
    for (const r of records) {
      console.log(`\n  [${r.code}] ${r.title}`);
      console.log(`  PILLAR: ${r.pillar}`);
      console.log(`  VERDICT: ${r.verdict?.slice(0, 200)}...`);
      const summarySnippet = r.human_summary?.slice(0, 300);
      console.log(`  SUMMARY: ${summarySnippet}...`);
    }
  }
}

run();
