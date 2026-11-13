import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkPsuMg() {
  const { data } = await supabase
    .from('questions')
    .select('id, code, year, correct_answer')
    .or('code.ilike.PSUMG%,code.ilike.AREMG%');

  const pending = (data || []).filter(q => !q.correct_answer || q.correct_answer.trim() === '');
  console.log(`PSU-MG / AREMG: Total = ${data?.length || 0} | Pendentes = ${pending.length}`);
  const yr = {};
  pending.forEach(q => { yr[q.year] = (yr[q.year] || 0) + 1; });
  console.log('Years pending:', yr);
}

checkPsuMg().catch(console.error);
