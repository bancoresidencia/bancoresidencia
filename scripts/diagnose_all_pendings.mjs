import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkPending() {
  const { count, error } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .or('correct_answer.is.null,correct_answer.eq.');

  if (error) {
    console.error('Erro ao contar pendencias:', error);
    return;
  }
  console.log('Total REAL sem gabarito no banco:', count);

  // Agora vamos paginar para pegar todos os códigos e instituições
  let allRows = [];
  const pageSize = 1000;
  for (let from = 0; from < count; from += pageSize) {
    const { data, error: pErr } = await supabase
      .from('questions')
      .select('id, code, year, institution')
      .or('correct_answer.is.null,correct_answer.eq.')
      .range(from, from + pageSize - 1);
    if (pErr) {
      console.error('Erro na paginação:', pErr);
      break;
    }
    allRows = allRows.concat(data);
  }

  const byPrefix = {};
  const byYear = {};
  const byInst = {};
  allRows.forEach(q => {
    const pfx = (q.code || 'SEM_CODIGO').split('-')[0];
    byPrefix[pfx] = (byPrefix[pfx] || 0) + 1;
    const yr = q.year || 'SEM_ANO';
    byYear[yr] = (byYear[yr] || 0) + 1;
    const inst = q.institution || 'SEM_INSTITUICAO';
    byInst[inst] = (byInst[inst] || 0) + 1;
  });

  const sortedPrefix = Object.entries(byPrefix).sort((a, b) => b[1] - a[1]);
  console.log('\nTop 35 Bancas/Prefixos sem gabarito:');
  sortedPrefix.slice(0, 35).forEach(([pfx, cnt]) => {
    console.log(`  - ${pfx}: ${cnt} pendentes`);
  });

  console.log('\nDistribuição por Ano:');
  Object.entries(byYear).sort((a, b) => b[0] - a[0]).forEach(([yr, cnt]) => {
    console.log(`  - ${yr}: ${cnt}`);
  });

  // Salvar diagnóstico
  fs.writeFileSync('data/diagnostico_todas_pendencias.json', JSON.stringify({
    total: count,
    byPrefix,
    byYear,
    byInst
  }, null, 2));
}

checkPending().catch(console.error);
