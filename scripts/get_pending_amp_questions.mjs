import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function getPendingAmp() {
  const { data, error } = await supabase
    .from('questions')
    .select('id, code, institution, year, especialidade, tema, foco, statement, options, correct_answer')
    .ilike('code', 'AMP-%')
    .or('correct_answer.is.null,correct_answer.eq.""');

  if (error) {
    console.error('Erro:', error);
    return;
  }

  console.log(`Total pendentes no Supabase com código AMP-: ${data.length}`);
  fs.writeFileSync('data/pending_amp_questions.json', JSON.stringify(data, null, 2));
  console.log('Salvo em data/pending_amp_questions.json');
}

getPendingAmp();

