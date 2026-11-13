import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const t = line.trim();
    if (t && !t.startsWith('#')) {
      const idx = t.indexOf('=');
      if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    }
  });
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkQ1() {
  const { data } = await supabase
    .from('questions')
    .select('id, code, institution, year, correct_answer, statement, options')
    .ilike('statement', '%conjuntivite unilateral%linfadenopatia%');

  console.log('Query matches:', data?.length);
  if (data) {
    data.forEach(q => {
      console.log(`[${q.code}] (${q.institution} - ${q.year}) -> Ans: ${q.correct_answer || 'PENDING'}`);
    });
  }
}

checkQ1();
