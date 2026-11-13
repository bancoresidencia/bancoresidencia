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

// Official USCS 2025 Gabarito Definitivo extracted from PDF:
const USCS_2025_OFFICIAL = [
  null,
  'A', 'A', 'A', 'C', 'C', 'B', 'D', 'B', 'B', 'B', // 1-10
  'B', 'C', 'D', 'C', 'ANULADA', 'B', 'A', 'D', 'C', 'B', // 11-20 (15 is X)
  'ANULADA', 'A', 'C', 'D', 'B', 'A', 'A', 'D', 'C', 'B', // 21-30 (21 is X)
  'B', 'D', 'C', 'C', 'ANULADA', 'B', 'C', 'C', 'D', 'B', // 31-40 (35 is X)
  'D', 'D', 'A', 'B', 'ANULADA', 'D', 'B', 'B', 'A', 'D', // 41-50 (45 is X)
  'ANULADA', 'D', 'B', 'A', 'B', 'A', 'D', 'B', 'B', 'C', // 51-60 (51 is X)
  'B', 'C', 'D', 'D', 'C', 'D', 'A', 'ANULADA', 'ANULADA', 'C', // 61-70 (68, 69 is X)
  'C', 'D', 'B', 'B', 'A', 'D', 'D', 'B', 'B', 'D', // 71-80
  'A', 'C', 'C', 'C', 'B', 'B', 'D', 'B', 'B', 'B', // 81-90
  'C', 'C', 'C', 'A', 'A', 'B', 'A', 'B', 'C', 'B'  // 91-100
];

async function checkAlignment() {
  const { data: qs } = await supabase.from('questions')
    .select('id, code, especialidade, statement, options, correct_answer')
    .ilike('institution', '%São Caetano%')
    .eq('year', 2025);

  console.log('USCS 2025 total in DB:', qs.length);
  const bySpec = {};
  for (const q of qs) {
    bySpec[q.especialidade] = bySpec[q.especialidade] || [];
    bySpec[q.especialidade].push(q);
  }

  for (const [spec, list] of Object.entries(bySpec)) {
    list.sort((a,b) => parseInt(a.code.split('-').pop()) - parseInt(b.code.split('-').pop()));
    const known = list.map((q, idx) => ({ idx, code: q.code, ans: q.correct_answer })).filter(k => k.ans);
    console.log(`\n=== ${spec} (${list.length} questoes) ===`);
    console.log(`Known:`, known);
  }
}

checkAlignment();
