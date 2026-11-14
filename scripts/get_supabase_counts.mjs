import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function getCounts() {
  const { count: total } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true });

  const { count: semGabarito } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .or('correct_answer.is.null,correct_answer.eq.');

  const comGabarito = (total || 0) - (semGabarito || 0);

  console.log(`Total Geral: ${total}`);
  console.log(`Com Gabarito: ${comGabarito} (${((comGabarito/total)*100).toFixed(2)}%)`);
  console.log(`Pendentes Sem Gabarito: ${semGabarito}`);
  
  return { total, comGabarito, semGabarito };
}

getCounts().catch(console.error);
