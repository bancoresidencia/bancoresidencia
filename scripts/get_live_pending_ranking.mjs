import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      }
    }
  });
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function getLivePendingRanking() {
  console.log('Consultando Supabase para o ranking real de pendências...');

  // Busca todas as questões sem gabarito (apenas id e institution para ser super rápido)
  let allMissing = [];
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('questions')
      .select('institution')
      .or('correct_answer.is.null,correct_answer.eq.')
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('Erro:', error);
      break;
    }
    allMissing = allMissing.concat(data);
    if (data.length < pageSize) hasMore = false;
    else from += pageSize;
    console.log(`Carregadas ${allMissing.length} pendências do Supabase...`);
  }

  console.log(`\nTotal real de pendências no Supabase: ${allMissing.length}`);

  const counts = {};
  allMissing.forEach(q => {
    const inst = q.institution || 'Sem Instituição';
    counts[inst] = (counts[inst] || 0) + 1;
  });

  const ranking = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([institution, pendentes], i) => ({ rank: i + 1, institution, pendentes }));

  console.log('\n=== TOP 20 REAL DE PENDÊNCIAS NO SUPABASE ===');
  ranking.slice(0, 20).forEach(r => console.log(`${r.rank.toString().padStart(2, ' ')}. ${r.institution}: ${r.pendentes}`));

  fs.writeFileSync('data/ranking_supabase_real_live.json', JSON.stringify({
    data: new Date().toISOString(),
    totalGeralPendentes: allMissing.length,
    ranking
  }, null, 2), 'utf8');
}

getLivePendingRanking().catch(console.error);
