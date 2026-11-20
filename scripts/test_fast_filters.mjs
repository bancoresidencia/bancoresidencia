import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFastFilters() {
  console.log('Testing fast filters on questions_direto...');

  // Test 1: has_gabarito eq true
  const t0 = Date.now();
  const { data: d1, count: c1, error: e1 } = await supabase
    .from('questions_direto')
    .select('id, code, commentary', { count: 'exact' })
    .eq('has_gabarito', true)
    .not('commentary', 'is', null)
    .neq('commentary', '')
    .order('year', { ascending: false })
    .range(0, 19);

  console.log('Test 1 (has_gabarito + commentary not null/empty):', {
    timeMs: Date.now() - t0,
    count: c1,
    rows: d1?.length,
    error: e1
  });

  if (d1 && d1.length > 0) {
    console.log('Sample lengths of first 5 rows:');
    d1.slice(0, 5).forEach(r => console.log(r.code, '| len:', r.commentary?.length));
  }
}

testFastFilters();
