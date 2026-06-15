import { createClient } from '@supabase/supabase-js';

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Fetch all active IDs
  let allIds: number[] = [];
  let from = 0;
  const step = 1000;
  let hasMore = true;

  while (hasMore) {
    const to = from + step - 1;
    const { data, error } = await supabase
      .from('registry')
      .select('id')
      .order('id', { ascending: true })
      .range(from, to);

    if (error) {
      console.error('Error fetching IDs:', error);
      return;
    }

    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allIds = allIds.concat(data.map(r => r.id));
      if (data.length < step) {
        hasMore = false;
      } else {
        from += step;
      }
    }
  }

  console.log(`Total active records fetched: ${allIds.length}`);
  console.log(`Min ID: ${allIds[0]}, Max ID: ${allIds[allIds.length - 1]}`);

  // Find gaps
  const activeSet = new Set(allIds);
  const gaps: { start: number; end: number; count: number }[] = [];
  let currentGapStart: number | null = null;

  for (let id = 1; id <= allIds[allIds.length - 1]; id++) {
    if (!activeSet.has(id)) {
      if (currentGapStart === null) {
        currentGapStart = id;
      }
    } else {
      if (currentGapStart !== null) {
        gaps.push({
          start: currentGapStart,
          end: id - 1,
          count: id - currentGapStart
        });
        currentGapStart = null;
      }
    }
  }

  if (currentGapStart !== null) {
    gaps.push({
      start: currentGapStart,
      end: allIds[allIds.length - 1],
      count: allIds[allIds.length - 1] - currentGapStart + 1
    });
  }

  console.log('\n🔍 Missing / Deleted ID Gaps:');
  gaps.forEach(g => {
    console.log(`- Gap from ID ${g.start} to ${g.end} (Count: ${g.count})`);
  });
  console.log(`Total missing IDs: ${gaps.reduce((acc, g) => acc + g.count, 0)}`);
}

run();
