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

async function checkUnipCirurgiaMatch() {
  const { data: cir } = await supabase.from('questions')
    .select('id, code, statement, options, correct_answer')
    .ilike('institution', '%UNIP%')
    .eq('year', 2026)
    .ilike('code', '%CIR%')
    .order('code', { ascending: true });

  console.log(`Cirurgia UNIP: ${cir.length} questões.`);
  // Test slug for Q1 (code 20712)
  const q1 = cir[0];
  console.log(`Q1: ${q1.code} -> ${q1.statement.slice(0, 80)}...`);
  // Try finding q1 on Sanar or web to see the exact question number on the exam
  const slug = q1.statement
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9\s]/g, '').split(/\s+/).slice(0, 6).join('-');
  const res = await fetch(`https://sanarmed.com/q/${slug}/`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  console.log(`Sanar fetch for Q1 (${slug}): HTTP ${res.status}`);
  if (res.ok) {
    const html = await res.text();
    const ldRegex = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    let m;
    while ((m = ldRegex.exec(html)) !== null) {
      try {
        const d = JSON.parse(m[1]);
        if (d['@type'] === 'QAPage' || d.mainEntity?.['@type'] === 'Question') {
          console.log('Sanar Answer text:', d.mainEntity?.acceptedAnswer?.text);
          console.log('Sanar Comment:', d.mainEntity?.acceptedAnswer?.comment?.text);
        }
      } catch (_) {}
    }
  }
}

checkUnipCirurgiaMatch();
