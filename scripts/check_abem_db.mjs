import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkAbem() {
  const { data } = await supabase
    .from('questions')
    .select('id, code, year, statement, options')
    .ilike('code', 'ABEM%')
    .or('correct_answer.is.null,correct_answer.eq.');

  console.log(`Total ABEM pendentes: ${data.length}`);
  const byYr = {};
  data.forEach(q => byYr[q.year] = (byYr[q.year] || 0) + 1);
  console.log('Por ano:', JSON.stringify(byYr, null, 2));
  data.slice(0, 3).forEach(q => {
    console.log(`\n[${q.code}] (Ano: ${q.year})`);
    console.log(`Stmt: ${q.statement.slice(0, 120)}...`);
    if (q.options) {
      console.log(`Opt A: ${q.options[0]?.text?.slice(0, 60)}`);
    }
  });
}

checkAbem();

