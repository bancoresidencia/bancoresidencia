import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const pats = ['HBO%', 'DAYHORC%', 'COSC%', 'UPO%', 'HOA%'];
  for (const pat of pats) {
    const { data } = await supabase.from('questions').select('id, code, year, correct_answer').ilike('code', pat);
    const total = data?.length || 0;
    const pend = (data || []).filter(q => !q.correct_answer || q.correct_answer.trim() === '').length;
    console.log(pat, 'Total:', total, 'Pendentes:', pend);
  }
}
check().catch(console.error);

