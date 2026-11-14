import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const boards = [
  { name: 'SURCE', pattern: '%SURCE%' },
  { name: 'UERJ', pattern: '%UERJ%' },
  { name: 'SES-GO', pattern: '%SES-GO%' },
  { name: 'UNICAMP', pattern: '%UNICAMP%' },
  { name: 'ENARE', pattern: '%ENARE%' },
  { name: 'AMP', pattern: '%AMP%' },
  { name: 'INEP / Revalida', pattern: '%Revalida%' }
];

async function checkPendingLocalBoards() {
  console.log('=== PENDÊNCIAS EM BANCAS COM PROVAS LOCAIS ===\n');
  for (const b of boards) {
    const { data } = await supabase
      .from('questions')
      .select('id, code, year, institution, correct_answer')
      .or(`institution.ilike.${b.pattern},banca.ilike.${b.pattern},code.ilike.${b.pattern}`)
      .or('correct_answer.is.null,correct_answer.eq.');

    const count = data ? data.length : 0;
    console.log(`[${b.name}] Pendentes sem gabarito: ${count}`);
    if (count > 0) {
      const byYear = {};
      for (const q of data) {
        byYear[q.year || 'sem ano'] = (byYear[q.year || 'sem ano'] || 0) + 1;
      }
      console.log(`  -> Anos:`, byYear);
    }
  }
}

checkPendingLocalBoards().catch(console.error);
