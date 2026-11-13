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

async function fullPendingCensus() {
  const instCounts = {};
  const yearCounts = {};
  let total = 0;
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase.from('questions')
      .select('institution, banca, year')
      .or('correct_answer.is.null,correct_answer.eq.')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) { console.error(error); break; }
    if (!data || data.length === 0) break;

    total += data.length;
    for (const q of data) {
      const key = (q.institution || q.banca || 'N/A').trim();
      instCounts[key] = (instCounts[key] || 0) + 1;
      yearCounts[q.year] = (yearCounts[q.year] || 0) + 1;
    }

    if (data.length < pageSize) break;
    page++;
  }

  const sorted = Object.entries(instCounts).sort((a,b) => b[1] - a[1]);
  console.log(`Total exato de pendentes contadas: ${total}`);
  console.log('\nTop 30 Instituições com mais pendências no Banco:');
  sorted.slice(0, 30).forEach(([inst, cnt], i) => {
    console.log(`${(i+1).toString().padStart(2)}. ${inst.padEnd(55)}: ${cnt}`);
  });
  console.log('\nDistribuição Geral por Ano:');
  Object.entries(yearCounts).sort((a,b) => b[0] - a[0]).forEach(([yr, cnt]) => {
    console.log(`- ${yr}: ${cnt}`);
  });
}
fullPendingCensus();
