import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspect2024() {
  const { data, error } = await supabase
    .from('questions')
    .select('id, code, year, especialidade, tema, institution, statement, correct_answer')
    .ilike('code', 'UERJ%')
    .or('correct_answer.is.null,correct_answer.eq.');

  if (error) {
    console.error('Supabase query error:', error);
    return;
  }
  console.log('Total returned:', data.length);
  const db2024 = data.filter(q => String(q.year) === '2024' && (!q.correct_answer || q.correct_answer === ''));
  console.log(`UERJ 2024 pendentes (${db2024.length} questões):`);
  db2024.forEach((q, i) => {
    console.log(`${i+1}. [${q.code}] [${q.especialidade} / ${q.tema}] ${q.statement.slice(0, 100)}...`);
  });
}

inspect2024().catch(console.error);
