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

async function inspectHmmsjp2026() {
  const { data } = await supabase
    .from('questions')
    .select('id, code, year, especialidade, statement, options')
    .ilike('institution', '%HMMSJP%')
    .eq('year', 2026)
    .or('correct_answer.is.null,correct_answer.eq.')
    .limit(5);

  console.log('5 Pending HMMSJP 2026:');
  for (const q of data) {
    console.log('--- ' + q.code + ' (' + q.especialidade + ') ---');
    console.log('Statement:', q.statement);
    console.log('Options:', q.options);
  }
}

inspectHmmsjp2026();
