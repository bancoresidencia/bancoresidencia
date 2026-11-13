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

async function testUnipBlocks() {
  const { data: qs } = await supabase.from('questions')
    .select('id, code, especialidade, statement, options, correct_answer')
    .ilike('institution', '%UNIP%')
    .eq('year', 2026);

  const bySpec = {};
  for (const q of qs) {
    bySpec[q.especialidade] = bySpec[q.especialidade] || [];
    bySpec[q.especialidade].push(q);
  }

  // Sort all by suffix
  for (const list of Object.values(bySpec)) {
    list.sort((a,b) => parseInt(a.code.split('-').pop()) - parseInt(b.code.split('-').pop()));
  }

  // 1. Cirurgia: 20712 to 20728 -> Q1 to Q17
  console.log('=== Cirurgia (Q1 - Q17) ===');
  const cir = bySpec['Cirurgia'];
  cir.forEach((q, idx) => {
    const qNum = 1 + idx;
    const off = UNIP_OFFICIAL[qNum];
    console.log(`Q${qNum} (${q.code}) [off: ${off} | db: ${q.correct_answer || 'NONE'}]: ${q.statement.slice(0, 50)}...`);
  });

  // 2. Obstetrícia: 13715 to 13724 -> Q41 to Q50 or Q51 to Q60?
  // Check Q48 in Obstetrícia: 13718 has correct_answer = 'ANULADA'!
  // In UNIP official, which question is ANULADA or changed?
  console.log('\n=== Obstetrícia 13718 check ===');
  const obs18 = qs.find(q => q.code === 'UNIVERSIDADE-2026-OBS-13718');
  console.log('OBS 13718 statement:', obs18?.statement);
}

testUnipBlocks();
