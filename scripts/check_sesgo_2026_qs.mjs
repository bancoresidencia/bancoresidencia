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

async function checkSesgo2026() {
  const { data: qs, error } = await supabase.from('questions')
    .select('id, code, year, institution, statement, options, correct_answer')
    .ilike('institution', '%SES-GO%')
    .eq('year', 2026)
    .or('correct_answer.is.null,correct_answer.eq.');

  console.log('Pending SES-GO 2026 in Supabase:', qs ? qs.length : 0);
  if (qs && qs.length > 0) {
    for (const q of qs.slice(0, 5)) {
      console.log(`Code: ${q.code} | Statement: ${q.statement.slice(0, 100)}...`);
    }
  }
}

checkSesgo2026().catch(console.error);
