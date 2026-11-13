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

async function inspectHSC() {
  const { data, error } = await supabase
    .from('questions')
    .select('id, code, institution, banca, year, tipo_prova, modalidade, especialidade, tema, correct_answer, statement, options')
    .ilike('code', 'HSC%');

  if (error) {
    console.error('Error fetching HSC:', error);
    return;
  }

  console.log(`Total HSC questions in DB: ${data.length}`);
  
  // Breakdown by year
  const byYear = {};
  for (const q of data) {
    byYear[q.year] = byYear[q.year] || { total: 0, withAns: 0, withoutAns: 0, institutions: new Set() };
    byYear[q.year].total++;
    if (q.correct_answer && q.correct_answer.trim() !== '') {
      byYear[q.year].withAns++;
    } else {
      byYear[q.year].withoutAns++;
    }
    byYear[q.year].institutions.add(q.institution);
  }

  console.log('Breakdown by Year:');
  for (const [y, s] of Object.entries(byYear)) {
    console.log(`Year ${y}: Total=${s.total}, Com Gabarito=${s.withAns}, Pendentes=${s.withoutAns}, Inst=${[...s.institutions].join(' | ')}`);
  }

  console.log('\nSample codes:');
  console.log(data.slice(0, 10).map(q => ({ code: q.code, year: q.year, esp: q.especialidade, inst: q.institution })));
}

inspectHSC();
