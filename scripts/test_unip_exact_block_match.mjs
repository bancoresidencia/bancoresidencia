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
  'C', 'B', 'E', 'D', 'C', 'E', 'A', 'C', 'A', 'A', // 1-10 (Cirurgia Q1-10)
  'C', 'B', 'D', 'B', 'D', 'E', 'E', 'E', 'D', 'D', // 11-20 (Cirurgia Q11-17, etc.)
  'E', 'D', 'B', 'C', 'B', 'A', 'C', 'E', 'C', 'D', // 21-30 (Clínica Médica)
  'B', 'D', 'E', 'A', 'B', 'D', 'C', 'A', 'E', 'A', // 31-40 (Clínica Médica)
  'D', 'D', 'B', 'A', 'E', 'C', 'C', 'C', 'C', 'A', // 41-50 (GO / Obstetrícia)
  'B', 'B', 'B', 'C', 'D', 'E', 'A', 'B', 'B', 'A', // 51-60 (GO / Ginecologia)
  'B', 'B', 'C', 'A', 'D', 'C', 'C', 'C', 'B', 'C', // 61-70 (Preventiva)
  'B', 'D', 'C', 'C', 'C', 'C', 'C', 'C', 'B', 'B', // 71-80 (Preventiva)
  'C', 'B', 'C', 'A', 'E', 'D', 'B', 'D', 'E', 'D', // 81-90 (Pediatria Q81-90)
  'A', 'B', 'E', 'C', 'A', 'A', 'C', 'C', 'E', 'D'  // 91-100 (Pediatria Q91-99, 100)
];

async function checkGinecologia() {
  const { data: gin } = await supabase.from('questions')
    .select('id, code, statement, options, correct_answer')
    .ilike('institution', '%UNIP%')
    .eq('year', 2026)
    .ilike('code', '%GIN%')
    .order('code', { ascending: true });

  console.log('Ginecologia (10 questions):');
  gin.forEach((q, idx) => {
    console.log(`GIN[${idx}] ${q.code} -> ans: ${q.correct_answer}`);
  });
}

checkGinecologia();
