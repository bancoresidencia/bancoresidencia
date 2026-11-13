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

async function check() {
  const { data } = await supabase.from('questions')
    .select('id, code, statement, options, correct_answer')
    .ilike('institution', '%UNIP%')
    .eq('year', 2026)
    .or('correct_answer.is.null,correct_answer.eq.')
    .limit(5);

  for (const q of data || []) {
    console.log(q.code, '->', q.statement.slice(0, 100));
  }
}

check();
