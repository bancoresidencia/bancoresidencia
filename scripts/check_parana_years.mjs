import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkParanaYears() {
  const { data } = await supabase
    .from('questions')
    .select('id, code, year, statement')
    .or('code.ilike.HMMSJP%,code.ilike.PMFI%,code.ilike.SMSFOZ%,code.ilike.SMSCURITIBA%')
    .is('correct_answer', null);

  const byPfxYear = {};
  data.forEach(q => {
    const pfx = q.code.split('-')[0];
    const key = `${pfx} (${q.year})`;
    byPfxYear[key] = (byPfxYear[key] || 0) + 1;
  });
  console.log('Paraná pendentes por prefixo e ano:', JSON.stringify(byPfxYear, null, 2));

  console.log('\nAmostras Paraná pendentes:');
  data.slice(0, 4).forEach(q => console.log(`  [${q.code}] (${q.year}): ${q.statement.slice(0, 90)}...`));
}

checkParanaYears();

