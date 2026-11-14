import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectHslBrasilia() {
  const { data } = await supabase
    .from('questions')
    .select('id, code, year, statement, correct_answer')
    .ilike('code', 'HSLBRASLIA%')
    .or('correct_answer.is.null,correct_answer.eq.')
    .limit(5);

  console.log(`Amostra de 5 pendentes HSL Brasília:`);
  for (const q of data) {
    console.log(`\nCODE: ${q.code} | ANO: ${q.year}`);
    console.log(`STMT: ${q.statement ? q.statement.slice(0, 150) : ''}`);
  }
}

inspectHslBrasilia().catch(console.error);
