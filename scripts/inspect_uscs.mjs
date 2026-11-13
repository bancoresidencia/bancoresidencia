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

async function inspect() {
  const { data, error } = await supabase.from('questions')
    .select('id, code, year, institution, statement, correct_answer, options')
    .ilike('institution', '%São Caetano%')
    .order('year', { ascending: false })
    .limit(10);

  if (error) {
    console.error(error);
    return;
  }
  console.log('Sample USCS questions count:', data.length);
  for (const q of data) {
    console.log({
      id: q.id,
      code: q.code,
      year: q.year,
      correct: q.correct_answer,
      statement: q.statement ? q.statement.slice(0, 80) : '',
      optionsCount: Array.isArray(q.options) ? q.options.length : 0
    });
  }

  // Count by year and pending
  const { data: allUscs } = await supabase.from('questions')
    .select('id, year, correct_answer')
    .ilike('institution', '%São Caetano%');

  const stats = {};
  for (const q of allUscs || []) {
    const y = q.year || 'unknown';
    if (!stats[y]) stats[y] = { total: 0, withGabarito: 0, pending: 0 };
    stats[y].total++;
    if (q.correct_answer && q.correct_answer.trim()) {
      stats[y].withGabarito++;
    } else {
      stats[y].pending++;
    }
  }
  console.log('USCS Stats by year in DB:', stats);
}

inspect();
