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

const UNIP_OFFICIAL = [
  null,
  'C', 'B', 'E', 'D', 'C', 'E', 'A', 'C', 'A', 'A', // 1-10
  'C', 'B', 'D', 'B', 'D', 'E', 'E', 'E', 'D', 'D', // 11-20
  'E', 'D', 'B', 'C', 'B', 'A', 'C', 'E', 'C', 'D', // 21-30
  'B', 'D', 'E', 'A', 'B', 'D', 'C', 'A', 'E', 'A', // 31-40
  'D', 'D', 'B', 'A', 'E', 'C', 'C', 'C', 'C', 'A', // 41-50
  'B', 'B', 'B', 'C', 'D', 'E', 'A', 'B', 'B', 'A', // 51-60
  'B', 'B', 'C', 'A', 'D', 'C', 'C', 'C', 'B', 'C', // 61-70
  'B', 'D', 'C', 'C', 'C', 'C', 'C', 'C', 'B', 'B', // 71-80
  'C', 'B', 'C', 'A', 'E', 'D', 'B', 'D', 'E', 'D', // 81-90
  'A', 'B', 'E', 'C', 'A', 'A', 'C', 'C', 'E', 'D'  // 91-100
];

async function checkAll() {
  const { data: qs } = await supabase.from('questions')
    .select('id, code, especialidade, statement, options, correct_answer')
    .ilike('institution', '%UNIP%')
    .eq('year', 2026);

  console.log('Total UNIP questions:', qs.length);
  const bySpec = {};
  for (const q of qs) {
    bySpec[q.especialidade] = bySpec[q.especialidade] || [];
    bySpec[q.especialidade].push(q);
  }

  for (const [spec, list] of Object.entries(bySpec)) {
    list.sort((a,b) => parseInt(a.code.split('-').pop()) - parseInt(b.code.split('-').pop()));
    console.log(`\n=== ${spec} (${list.length} questoes) ===`);
    const pending = list.filter(q => !q.correct_answer);
    console.log(`Pendentes: ${pending.length} / ${list.length}`);
    if (pending.length > 0) {
      console.log(`First pending: [${pending[0].code}] -> ${pending[0].statement.slice(0, 60)}...`);
      console.log(`Last pending: [${pending[pending.length - 1].code}] -> ${pending[pending.length - 1].statement.slice(0, 60)}...`);
    }
  }
}

checkAll();
