import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testPostgrestFilters() {
  console.log('Testing PostgREST query on questions_direto...');

  const { data, count, error } = await supabase
    .from('questions_direto')
    .select('id, code, commentary', { count: 'exact' })
    .eq('has_gabarito', true)
    .not('commentary', 'is', null)
    .neq('commentary', '')
    .ilike('commentary', '%**%')
    .limit(5);

  if (error) {
    console.error('PostgREST error:', error);
  } else {
    console.log(`Count matching gold criteria: ${count}`);
    console.log('Sample data:');
    data.forEach(q => console.log(q.code, '| len:', q.commentary.length));
  }
}

testPostgrestFilters();
