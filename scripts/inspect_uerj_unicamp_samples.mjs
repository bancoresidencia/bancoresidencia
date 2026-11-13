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

async function inspectSample() {
  const { data: uerj } = await supabase
    .from('questions')
    .select('code, year, statement, options')
    .ilike('institution', '%UERJ%')
    .eq('year', 2024)
    .or('correct_answer.is.null,correct_answer.eq.')
    .limit(3);

  console.log('=== SAMPLE UERJ 2024 PENDENTES ===');
  uerj.forEach(q => {
    console.log(`[${q.code}] ${q.statement}`);
    console.log('Options:', q.options);
  });

  const { data: unicamp } = await supabase
    .from('questions')
    .select('code, year, statement, options')
    .ilike('institution', '%UNICAMP%')
    .eq('year', 2026)
    .or('correct_answer.is.null,correct_answer.eq.')
    .limit(3);

  console.log('\n=== SAMPLE UNICAMP 2026 PENDENTES ===');
  unicamp.forEach(q => {
    console.log(`[${q.code}] ${q.statement}`);
    console.log('Options:', q.options);
  });
}

inspectSample();

