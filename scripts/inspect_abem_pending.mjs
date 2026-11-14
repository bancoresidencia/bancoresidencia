import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectPending() {
  const { data, error } = await supabase
    .from('questions')
    .select('id, code, year, institution, statement, options, correct_answer')
    .or('institution.ilike.%ABEM%,institution.ilike.%Progresso%,code.ilike.%TPN%,code.ilike.%ABEM%')
    .or('correct_answer.is.null,correct_answer.eq.')
    .limit(3);

  if (error) {
    console.error('Erro:', error);
    return;
  }
  console.log(`Encontradas: ${data.length}`);
  if (data.length > 0) {
    console.log('Exemplo 1 ID:', data[0].id, 'Code:', data[0].code, 'Ano:', data[0].year);
    console.log('Statement:', data[0].statement ? data[0].statement.slice(0, 100) : 'null');
    console.log('Options:', JSON.stringify(data[0].options, null, 2));
  }
}

inspectPending().catch(console.error);
