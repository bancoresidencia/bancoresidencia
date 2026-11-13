import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const k = trimmed.slice(0, idx).trim();
      const v = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      env[k] = v;
    }
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// Official 100 answers from unip.br:
const UNIP_OFFICIAL = [
  null, // 1-based index
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

async function checkUnipBlocks() {
  const { data: qs } = await supabase.from('questions')
    .select('id, code, especialidade, statement, options, correct_answer')
    .ilike('institution', '%UNIP%')
    .eq('year', 2026);

  console.log('Total UNIP questions in DB:', qs.length);
  
  // Group by especialidade
  const bySpec = {};
  for (const q of qs) {
    bySpec[q.especialidade] = bySpec[q.especialidade] || [];
    bySpec[q.especialidade].push(q);
  }

  for (const [spec, list] of Object.entries(bySpec)) {
    list.sort((a,b) => parseInt(a.code.split('-').pop()) - parseInt(b.code.split('-').pop()));
    console.log(`\n=== ${spec} (${list.length} questões) ===`);
    console.log(`Suffixes: ${list[0].code.split('-').pop()} to ${list[list.length-1].code.split('-').pop()}`);
    // Check if any in this list already has correct_answer
    const withAns = list.filter(q => q.correct_answer);
    console.log(`With answer: ${withAns.length}`);
    withAns.forEach(q => {
      console.log(`  [${q.code}] ans: ${q.correct_answer} | Stmt: ${q.statement.slice(0, 50)}...`);
    });
  }
}

checkUnipBlocks();

