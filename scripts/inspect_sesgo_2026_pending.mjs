import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectSesgo() {
  const { data } = await supabase
    .from('questions')
    .select('id, code, year, institution, especialidade, statement, correct_answer')
    .ilike('institution', '%SES-GO%')
    .eq('year', 2026)
    .or('correct_answer.is.null,correct_answer.eq.');

  console.log(`SES-GO 2026 pendentes: ${data.length}`);
  const byEsp = {};
  for (const q of data) {
    byEsp[q.especialidade || 'sem esp'] = (byEsp[q.especialidade || 'sem esp'] || 0) + 1;
  }
  console.log('Por especialidade:', byEsp);
  console.log('\nAmostra de 3 questões:', data.slice(0, 3).map(q => ({
    code: q.code,
    esp: q.especialidade,
    stmt: q.statement ? q.statement.slice(0, 100) : ''
  })));
}

inspectSesgo().catch(console.error);
