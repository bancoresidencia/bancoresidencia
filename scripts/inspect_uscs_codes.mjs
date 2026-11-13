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

async function inspectCodes() {
  const { data: q2026 } = await supabase.from('questions')
    .select('id, code, year, especialidade, correct_answer')
    .ilike('institution', '%São Caetano%')
    .eq('year', 2026)
    .order('code', { ascending: true });

  console.log(`USCS 2026 total: ${q2026.length}`);
  const specs2026 = {};
  for (const q of q2026) {
    const p = q.code.split('-')[2] || 'NONE';
    specs2026[p] = (specs2026[p] || 0) + 1;
  }
  console.log('2026 by code prefix:', specs2026);
  console.log('First 5 2026 codes:', q2026.slice(0, 5).map(q => q.code));
  console.log('Last 5 2026 codes:', q2026.slice(-5).map(q => q.code));

  const { data: q2025 } = await supabase.from('questions')
    .select('id, code, year, especialidade, correct_answer')
    .ilike('institution', '%São Caetano%')
    .eq('year', 2025)
    .order('code', { ascending: true });

  console.log(`\nUSCS 2025 total: ${q2025.length}`);
  const specs2025 = {};
  for (const q of q2025) {
    const p = q.code.split('-')[2] || 'NONE';
    specs2025[p] = (specs2025[p] || 0) + 1;
  }
  console.log('2025 by code prefix:', specs2025);
  console.log('First 5 2025 codes:', q2025.slice(0, 5).map(q => q.code));
  console.log('Last 5 2025 codes:', q2025.slice(-5).map(q => q.code));
}

inspectCodes();
