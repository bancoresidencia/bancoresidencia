import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const [k, ...v] = l.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
}
const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const t0 = Date.now();
  const { data, error } = await client.rpc('get_faceted_question_counts', {
    p_bancas: ['USP/HCFMUSP', 'SUS-SP', 'UNICAMP/HC'],
    p_years: [2024],
    p_especialidades: null,
    p_modalidades: null,
    p_dificuldades: null,
    p_tipos: null,
    p_ocultar_anuladas: false,
    p_ultimos_5_anos: false,
    p_status: 'Todas',
    p_user_id: null
  });
  console.log('⚡ Latência Warm:', Date.now() - t0, 'ms | Total Questões:', data?.totalRightCardCount, '| Focos reais calculados:', Object.keys(data?.focos || {}).length, '| Subfocos reais calculados:', Object.keys(data?.subfocos || {}).length);
}

test().catch(console.error);
