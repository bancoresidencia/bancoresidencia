import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function rankPending() {
  console.log('Buscando todas as questões pendentes no Supabase...');
  
  // Vamos buscar em blocos para ter todos os 10.402 registros
  let allPending = [];
  let from = 0;
  const step = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('questions')
      .select('id, code, institution, banca, year')
      .or('correct_answer.is.null,correct_answer.eq.')
      .range(from, from + step - 1);

    if (error) {
      console.error('Erro na busca:', error);
      break;
    }
    if (!data || data.length === 0) break;
    allPending.push(...data);
    from += step;
    if (data.length < step) break;
  }

  console.log(`Total de pendentes carregadas: ${allPending.length}`);

  const countsByInst = {};
  for (const q of allPending) {
    const inst = q.institution || q.banca || 'SEM INSTITUIÇÃO';
    countsByInst[inst] = (countsByInst[inst] || 0) + 1;
  }

  const sorted = Object.entries(countsByInst).sort((a, b) => b[1] - a[1]);

  console.log('\n=== TOP 20 INSTITUIÇÕES COM MAIS PENDÊNCIAS ===');
  sorted.slice(0, 20).forEach(([inst, count], idx) => {
    console.log(`${idx + 1}. ${inst}: ${count} questões`);
  });

  fs.writeFileSync('data/ranking_pendencias_atualizado.json', JSON.stringify({
    data: new Date().toISOString(),
    totalGeralPendentes: allPending.length,
    ranking: sorted
  }, null, 2), 'utf8');
}

rankPending().catch(console.error);
