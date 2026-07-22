import { createClient } from '@supabase/supabase-js';

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // 1. Total papers in registry
  const { count: totalRegistry, error: err1 } = await supabase
    .from('registry')
    .select('id', { count: 'exact', head: true });

  // 2. Papers with quality_score
  const { count: withQualityScore, error: err2 } = await supabase
    .from('registry')
    .select('id', { count: 'exact', head: true })
    .not('quality_score', 'is', null);

  // 3. Papers with null quality_score
  const { count: nullQualityScore, error: err3 } = await supabase
    .from('registry')
    .select('id', { count: 'exact', head: true })
    .is('quality_score', null);

  // 4. Papers with "RESEARCH METHODOLOGY" in summary
  const { count: withMethodology, error: err4 } = await supabase
    .from('registry')
    .select('id', { count: 'exact', head: true })
    .like('human_summary', '%RESEARCH METHODOLOGY%');

  // 5. Total papers in ai_act
  const { count: totalAiAct, error: err5 } = await supabase
    .from('ai_act')
    .select('id', { count: 'exact', head: true });

  // 6. Papers in ai_act with quality_score
  const { count: aiActWithQualityScore, error: err6 } = await supabase
    .from('ai_act')
    .select('id', { count: 'exact', head: true })
    .not('quality_score', 'is', null);

  if (err1 || err2 || err3 || err4 || err5 || err6) {
    console.error('Errors querying database:', { err1, err2, err3, err4, err5, err6 });
    return;
  }

  console.log('--- DATABASE STATUS REPORT ---');
  console.log(`Registry Table:`);
  console.log(`  Total records:                ${totalRegistry}`);
  console.log(`  With quality score:           ${withQualityScore}`);
  console.log(`  Without quality score:        ${nullQualityScore}`);
  console.log(`  With methodology in summary:  ${withMethodology}`);
  console.log(`  Without methodology:          ${totalRegistry! - withMethodology!}`);
  console.log(`\nAI Act Table:`);
  console.log(`  Total records:                ${totalAiAct}`);
  console.log(`  With quality score:           ${aiActWithQualityScore}`);
  console.log(`  Without quality score:        ${totalAiAct! - aiActWithQualityScore!}`);
}

run();
