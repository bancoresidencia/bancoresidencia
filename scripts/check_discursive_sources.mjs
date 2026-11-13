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

async function checkDiscursive() {
  const { data } = await supabase.from('questions')
    .select('id, code, banca, institution, year, statement, options')
    .or('correct_answer.is.null,correct_answer.eq.');

  const disc = data.filter(q => !Array.isArray(q.options) || q.options.length === 0);
  console.log(`Total de questões discursivas (sem opções A-E): ${disc.length}`);
  const byInstYear = {};
  for (const q of disc) {
    const k = `${q.institution || q.banca || 'N/A'} (${q.year})`;
    byInstYear[k] = (byInstYear[k] || 0) + 1;
  }
  Object.entries(byInstYear).sort((a,b) => b[1] - a[1]).slice(0, 15).forEach(([k, c]) => {
    console.log(`- ${k.padEnd(65)}: ${c}`);
  });
}

checkDiscursive().catch(console.error);

