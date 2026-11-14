import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkAmp() {
  const { data: amp } = await supabase
    .from('questions')
    .select('id, code, year, institution, banca, correct_answer')
    .or('institution.ilike.%AMP%,banca.ilike.%AMP%,code.ilike.%AMP%');

  console.log(`Total AMP no Supabase: ${amp ? amp.length : 0}`);
  if (amp) {
    const sem = amp.filter(q => !q.correct_answer || q.correct_answer.trim() === '');
    const com = amp.filter(q => q.correct_answer && q.correct_answer.trim() !== '');
    console.log(`Com gabarito: ${com.length}`);
    console.log(`Sem gabarito: ${sem.length}`);
    const byYear = {};
    for (const q of sem) {
      byYear[q.year || 'sem ano'] = (byYear[q.year || 'sem ano'] || 0) + 1;
    }
    console.log('Sem gabarito por ano:', byYear);
  }
}

checkAmp().catch(console.error);
