import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const t = line.trim();
    if (t && !t.startsWith('#')) {
      const idx = t.indexOf('=');
      if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    }
  });
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data, error } = await supabase
    .from('questions')
    .select('id, code, institution, year, statement, correct_answer')
    .eq('year', 2026)
    .or('institution.ilike.%AMP%,institution.ilike.%HMMSJP%,institution.ilike.%Angelina Caron%,institution.ilike.%UEM%')
    .limit(10);
  
  if (error) {
    console.error(error);
    return;
  }
  console.log(`Found ${data.length} sample 2026 questions:`);
  for (const q of data) {
    console.log(`[${q.institution} - ${q.code}] (correct: ${q.correct_answer}): ${q.statement.slice(0, 150)}...`);
  }
}

main();
