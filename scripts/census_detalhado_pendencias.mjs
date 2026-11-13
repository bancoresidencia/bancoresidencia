import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const t = line.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function detailedCensus() {
  const instYearMap = {}; // { year: { inst: count } }
  const yearCounts = {};
  const instTotalCounts = {};
  const specCounts = {};
  let totalPending = 0;
  let discursiveCount = 0;
  let multipleChoiceCount = 0;

  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase.from('questions')
      .select('id, institution, banca, year, especialidade, options')
      .or('correct_answer.is.null,correct_answer.eq.')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) { console.error('Erro na paginação:', error); break; }
    if (!data || data.length === 0) break;

    totalPending += data.length;

    for (const q of data) {
      const yr = q.year || 'SEM_ANO';
      const inst = (q.institution || q.banca || 'SEM_INSTITUICAO').trim();
      const spec = (q.especialidade || 'OUTRA').trim();
      const opts = Array.isArray(q.options) ? q.options : [];

      if (opts.length === 0) {
        discursiveCount++;
      } else {
        multipleChoiceCount++;
      }

      yearCounts[yr] = (yearCounts[yr] || 0) + 1;
      instTotalCounts[inst] = (instTotalCounts[inst] || 0) + 1;
      specCounts[spec] = (specCounts[spec] || 0) + 1;

      if (!instYearMap[yr]) instYearMap[yr] = {};
      instYearMap[yr][inst] = (instYearMap[yr][inst] || 0) + 1;
    }

    if (data.length < pageSize) break;
    page++;
  }

  // Save report data to JSON
  const report = {
    totalPending,
    discursiveCount,
    multipleChoiceCount,
    yearCounts,
    instTotalCounts,
    specCounts,
    instYearMap
  };

  fs.writeFileSync('data/relatorio_pendencias_detalhado.json', JSON.stringify(report, null, 2), 'utf8');

  console.log('=== RESUMO GERAL DAS PENDÊNCIAS ===');
  console.log(`Total exato de questões pendentes: ${totalPending}`);
  console.log(`- Múltipla Escolha (options > 0): ${multipleChoiceCount}`);
  console.log(`- Discursivas / Sem alternativas (options = 0): ${discursiveCount}`);

  console.log('\n=== DISTRIBUIÇÃO POR ANO ===');
  const sortedYears = Object.entries(yearCounts).sort((a,b) => b[0].localeCompare(a[0], undefined, { numeric: true }));
  for (const [yr, cnt] of sortedYears) {
    const pct = ((cnt / totalPending) * 100).toFixed(1);
    console.log(`Ano ${yr}: ${String(cnt).padStart(5)} questões (${pct}%)`);
  }

  console.log('\n=== TOP 35 INSTITUIÇÕES COM MAIS PENDÊNCIAS GERAIS ===');
  const sortedInsts = Object.entries(instTotalCounts).sort((a,b) => b[1] - a[1]);
  sortedInsts.slice(0, 35).forEach(([inst, cnt], idx) => {
    console.log(`${(idx + 1).toString().padStart(2)}. ${inst.padEnd(55)}: ${cnt}`);
  });

  console.log('\n=== DISTRIBUIÇÃO POR ESPECIALIDADE ===');
  Object.entries(specCounts).sort((a,b) => b[1] - a[1]).forEach(([sp, cnt]) => {
    console.log(`- ${sp.padEnd(35)}: ${cnt}`);
  });
}

detailedCensus().catch(console.error);

