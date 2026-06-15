import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Get full output of niche sweeps with more records
  const niches = [
    { niche: 'CHILDREN_EDUCATION', filter: `human_summary.ilike.%child%,title.ilike.%child%,human_summary.ilike.%student%,title.ilike.%student%,human_summary.ilike.%school%,human_summary.ilike.%adolescent%,human_summary.ilike.%teen%,human_summary.ilike.%youth%,human_summary.ilike.%classroom%` },
    { niche: 'MENTAL_HEALTH', filter: `human_summary.ilike.%mental health%,human_summary.ilike.%depression%,human_summary.ilike.%anxiety%,human_summary.ilike.%wellbeing%,human_summary.ilike.%stress%,human_summary.ilike.%burnout%,human_summary.ilike.%loneliness%,human_summary.ilike.%emotional regulation%,title.ilike.%mental health%` },
    { niche: 'RELATIONSHIPS_SOCIAL', filter: `human_summary.ilike.%relationship%,human_summary.ilike.%lonely%,human_summary.ilike.%loneliness%,human_summary.ilike.%companion%,human_summary.ilike.%romantic%,human_summary.ilike.%social bond%,human_summary.ilike.%attachment%,title.ilike.%relationship%,title.ilike.%companion%` },
    { niche: 'PARENTING', filter: `human_summary.ilike.%parent%,human_summary.ilike.%parenting%,human_summary.ilike.%mother%,human_summary.ilike.%father%,human_summary.ilike.%family%,human_summary.ilike.%caregiver%` },
    { niche: 'HEALTHCARE_MEDICAL', filter: `human_summary.ilike.%doctor%,human_summary.ilike.%patient%,human_summary.ilike.%medical%,human_summary.ilike.%clinical%,human_summary.ilike.%diagnosis%,human_summary.ilike.%nurse%,human_summary.ilike.%hospital%,human_summary.ilike.%radiolog%` },
    { niche: 'SLEEP_BRAIN', filter: `human_summary.ilike.%sleep%,title.ilike.%sleep%,human_summary.ilike.%brain%,human_summary.ilike.%neuroscience%,human_summary.ilike.%EEG%,human_summary.ilike.%cortex%,human_summary.ilike.%cogniti%` },
    { niche: 'CREATIVITY_ART', filter: `human_summary.ilike.%creative%,human_summary.ilike.%creativity%,human_summary.ilike.%art%,human_summary.ilike.%music%,human_summary.ilike.%writing%,human_summary.ilike.%storytelling%,human_summary.ilike.%generative art%` },
    { niche: 'POLITICS_DEMOCRACY', filter: `human_summary.ilike.%democracy%,human_summary.ilike.%political%,human_summary.ilike.%election%,human_summary.ilike.%misinformation%,human_summary.ilike.%disinformation%,human_summary.ilike.%fake news%,human_summary.ilike.%propaganda%,title.ilike.%democracy%` },
    { niche: 'OLDER_ADULTS_AGING', filter: `human_summary.ilike.%older adult%,human_summary.ilike.%elderly%,human_summary.ilike.%aging%,human_summary.ilike.%senior%,human_summary.ilike.%dementia%,title.ilike.%older%,title.ilike.%aging%,title.ilike.%elderly%` },
    { niche: 'GENDER_RACE_BIAS', filter: `human_summary.ilike.%gender%,human_summary.ilike.%race%,human_summary.ilike.%racial%,human_summary.ilike.%bias%,human_summary.ilike.%discrimination%,human_summary.ilike.%marginalized%,human_summary.ilike.%inequality%,human_summary.ilike.%diversity%` },
    { niche: 'ADDICTION_ENGAGEMENT', filter: `human_summary.ilike.%addict%,human_summary.ilike.%compulsive%,human_summary.ilike.%dopamine%,human_summary.ilike.%scroll%,human_summary.ilike.%engagement loop%,human_summary.ilike.%persuasive%,human_summary.ilike.%hooked%,human_summary.ilike.%habit form%` },
    { niche: 'GRIEF_DEATH_LOSS', filter: `human_summary.ilike.%grief%,human_summary.ilike.%death%,human_summary.ilike.%loss%,human_summary.ilike.%bereavement%,human_summary.ilike.%mourn%,human_summary.ilike.%terminal%` },
    { niche: 'DISABILITY_ACCESSIBILITY', filter: `human_summary.ilike.%disability%,human_summary.ilike.%accessible%,human_summary.ilike.%impairment%,human_summary.ilike.%blind%,human_summary.ilike.%deaf%,human_summary.ilike.%assistive%` },
    { niche: 'SELF_IDENTITY_PERSONHOOD', filter: `human_summary.ilike.%identity%,human_summary.ilike.%self-image%,human_summary.ilike.%personhood%,human_summary.ilike.%sense of self%,human_summary.ilike.%agency%,human_summary.ilike.%autonomy%` },
    { niche: 'DATING_LOVE_AI_COMPANIONS', filter: `human_summary.ilike.%dating%,human_summary.ilike.%romantic AI%,human_summary.ilike.%love%,human_summary.ilike.%AI girlfriend%,human_summary.ilike.%AI boyfriend%,human_summary.ilike.%virtual companion%,human_summary.ilike.%social robot%` },
  ];

  for (const { niche, filter } of niches) {
    const { data, error } = await supabase
      .from('registry')
      .select('code, title, verdict, pillar')
      .or(filter)
      .limit(8);

    if (error) {
      console.error(`Error fetching niche ${niche}:`, error);
      process.exit(1);
    }
    const count = data?.length ?? 0;
    console.log(`${niche}: ${count} records`);
    if (data && data.length > 0) {
      for (const r of data) {
        console.log(`  [${r.code}] [${r.pillar}] ${r.title}`);
      }
    }
    console.log('');
  }
  process.exit(0);
}

run();
