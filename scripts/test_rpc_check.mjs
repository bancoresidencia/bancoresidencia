import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRpc() {
  console.log('Testando get_specialty_facets RPC...');
  const t0 = performance.now();
  const { data, error } = await supabase.rpc('get_specialty_facets', {
    p_banca: 'ENARE/ENAMED',
    p_year: 2024
  });
  const dur = (performance.now() - t0).toFixed(1);
  console.log('Resultado RPC:', data, '| Tempo:', dur + 'ms', '| Erro:', error);
}

testRpc().catch(console.error);
