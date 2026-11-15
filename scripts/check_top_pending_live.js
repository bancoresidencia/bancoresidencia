import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const t = line.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTopPending() {
  let allPending = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase.from('questions')
      .select('institution, year')
      .or('correct_answer.is.null,correct_answer.eq.')
      .range(from, from + 999);
    if (!data || data.length === 0) break;
    allPending.push(...data);
    from += data.length;
    if (data.length < 1000) break;
  }
  console.log(`Total pendências no Supabase agora: ${allPending.length}`);

  const instCounts = {};
  for (const q of allPending) {
    const inst = q.institution || 'Desconhecida';
    instCounts[inst] = (instCounts[inst] || 0) + 1;
  }

  const sorted = Object.entries(instCounts).sort((a, b) => b[1] - a[1]);
  console.log('\nTop 20 Instituições com mais pendências no Supabase:');
  sorted.slice(0, 20).forEach(([inst, count], i) => {
    console.log(`${i+1}. ${inst}: ${count}`);
  });
}

checkTopPending();
