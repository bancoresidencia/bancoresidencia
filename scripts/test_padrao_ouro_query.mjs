import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  console.log('Testing query on questions_direto with commentary_tier = padrao_ouro...');

  const t0 = Date.now();
  const { data, count, error } = await supabase
    .from('questions_direto')
    .select('id, code, banca, year, statement, correct_answer, commentary, commentary_tier', { count: 'exact' })
    .eq('has_gabarito', true)
    .eq('commentary_tier', 'padrao_ouro')
    .order('year', { ascending: false })
    .range(0, 19);

  console.log(`Query completed in ${Date.now() - t0}ms:`);
  console.log('Count:', count);
  console.log('Returned rows:', data?.length);
  if (error) {
    console.error('Error:', error);
  } else if (data && data.length > 0) {
    console.log('\n--- First 5 questions returned ---');
    data.slice(0, 5).forEach((q, i) => {
      console.log(`\n[${i + 1}] ID: ${q.id} | Code: ${q.code} | Banca: ${q.banca} (${q.year})`);
      console.log(`Tier: ${q.commentary_tier} | Gabarito: ${q.correct_answer}`);
      console.log(`Comentário (${q.commentary?.length} chars): ${q.commentary?.slice(0, 150)}...`);
    });
  }
}

testQuery();
