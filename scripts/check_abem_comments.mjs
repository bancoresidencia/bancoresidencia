import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkComments() {
  const { data } = await supabase
    .from('questions')
    .select('id, commentary, has_gabarito')
    .or('institution.ilike.%ABEM%,institution.ilike.%Progresso%,code.ilike.%TPN%,code.ilike.%ABEM%')
    .or('correct_answer.is.null,correct_answer.eq.')
    .limit(5);

  console.log('Amostra de comentários atuais:', data);
}
checkComments().catch(console.error);
