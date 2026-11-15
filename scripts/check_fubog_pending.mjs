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

async function checkFubog() {
  const { data: fubog, error } = await supabase.from('questions')
    .select('id, code, year, institution, statement, options, correct_answer')
    .ilike('institution', '%FUBOG%')
    .or('correct_answer.is.null,correct_answer.eq.');

  console.log('Pending FUBOG in Supabase:', fubog ? fubog.length : 0);
  if (fubog && fubog.length > 0) {
    console.log('Sample 3 FUBOG:');
    for (const q of fubog.slice(0, 3)) {
      console.log(`Code: ${q.code} | Year: ${q.year}`);
      console.log(`Statement: ${q.statement.slice(0, 150)}...`);
      console.log(`Options count: ${Array.isArray(q.options) ? q.options.length : typeof q.options}`);
    }
  }
}

checkFubog().catch(console.error);
