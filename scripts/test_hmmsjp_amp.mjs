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

function cleanText(s) {
  if (!s) return '';
  return s.toLowerCase().replace(/<[^>]+>/g, ' ').replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

function diceSimilarity(s1, s2) {
  const t1 = cleanText(s1);
  const t2 = cleanText(s2);
  if (t1 === t2) return 1.0;
  const w1 = new Set(t1.split(' '));
  const w2 = new Set(t2.split(' '));
  let inter = 0;
  for (const w of w1) if (w2.has(w)) inter++;
  return (2.0 * inter) / (w1.size + w2.size);
}

async function run() {
  console.log('Carregando pendências de HMMSJP...');
  const { data: hmmsjp, error } = await supabase.from('questions')
    .select('id, code, year, institution, statement, options')
    .ilike('institution', '%São José dos Pinhais%')
    .or('correct_answer.is.null,correct_answer.eq.');

  if (error || !hmmsjp) {
    console.error('Erro ao carregar HMMSJP:', error);
    return;
  }
  console.log(`HMMSJP pendentes: ${hmmsjp.length}`);

  console.log('Carregando base da AMP com gabarito preenchido...');
  let ampAll = [];
  let page = 0;
  while (true) {
    const { data: ampData, error: err2 } = await supabase.from('questions')
      .select('id, code, year, institution, statement, options, correct_answer')
      .ilike('institution', '%Associação Médica do Paraná%')
      .not('correct_answer', 'is', null)
      .neq('correct_answer', '')
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (err2 || !ampData || ampData.length === 0) break;
    ampAll.push(...ampData);
    if (ampData.length < 1000) break;
    page++;
  }
  console.log(`AMP com gabarito carregadas: ${ampAll.length}`);

  let matches = 0;
  for (const h of hmmsjp) {
    const hStmt = cleanText(h.statement);
    for (const a of ampAll) {
      if (h.year && a.year && Math.abs(h.year - a.year) > 1) continue;
      const sim = diceSimilarity(h.statement, a.statement);
      if (sim >= 0.85) {
        matches++;
        console.log(`\n✅ MATCH FOUND (${(sim*100).toFixed(1)}%)!`);
        console.log(`   HMMSJP: [${h.code}] (${h.year}) - ${h.statement.slice(0, 60)}`);
        console.log(`   AMP:    [${a.code}] (${a.year}) - GAB: ${a.correct_answer}`);
        break;
      }
    }
    if (matches >= 5) break;
  }
  console.log(`\nTotal testado: ${matches} matches confirmados na amostra.`);
}
run();
