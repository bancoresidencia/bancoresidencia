import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectHMMSJP() {
  const { data } = await supabase
    .from('questions')
    .select('id, code, year, institution, statement, options')
    .ilike('code', 'HMMSJP%')
    .limit(5);

  for (const q of data) {
    console.log(`\n================================`);
    console.log(`CODE: ${q.code} | ANO: ${q.year}`);
    console.log(`STATEMENT: ${q.statement ? q.statement.slice(0, 200) : ''}`);
    console.log('OPTIONS:', q.options);
  }
}

inspectHMMSJP().catch(console.error);
