import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: allAbem, error } = await supabase
    .from('questions')
    .select('id, code, year, correct_answer, commentary, has_gabarito')
    .ilike('code', 'ABEMTESTEDEP%');

  if (error) {
    console.error(error);
    return;
  }

  console.log(`Total de questões com código ABEMTESTEDEP: ${allAbem.length}`);
  const semGabarito = allAbem.filter(q => !q.correct_answer || q.correct_answer.trim() === '');
  const comGabarito = allAbem.filter(q => q.correct_answer && q.correct_answer.trim() !== '');
  console.log(`Com gabarito: ${comGabarito.length}`);
  console.log(`Sem gabarito: ${semGabarito.length}`);

  console.log('\nAmostra de 3 questões atualizadas agora:');
  comGabarito.slice(0, 3).forEach(q => {
    console.log(`- ${q.code} (Ano ${q.year}) -> Gabarito: ${q.correct_answer} | has_gabarito: ${q.has_gabarito}`);
    console.log(`  Comentário: ${q.commentary ? q.commentary.slice(0, 100) + '...' : 'sem comentário'}`);
  });
}

main().catch(console.error);
