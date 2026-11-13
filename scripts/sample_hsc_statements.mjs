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

async function sampleStatements() {
  const { data } = await supabase
    .from('questions')
    .select('id, code, year, especialidade, statement, options, correct_answer')
    .ilike('code', 'HSC%');

  const pending2023 = data.filter(q => q.year === 2023 && (!q.correct_answer || q.correct_answer.trim() === ''));
  const pending2024 = data.filter(q => q.year === 2024 && (!q.correct_answer || q.correct_answer.trim() === ''));
  const withAns2023 = data.filter(q => q.year === 2023 && q.correct_answer && q.correct_answer.trim() !== '');
  const withAns2024 = data.filter(q => q.year === 2024 && q.correct_answer && q.correct_answer.trim() !== '');

  console.log(`2023: ${data.filter(q => q.year === 2023).length} total (${withAns2023.length} with ans, ${pending2023.length} pending)`);
  console.log(`2024: ${data.filter(q => q.year === 2024).length} total (${withAns2024.length} with ans, ${pending2024.length} pending)`);

  console.log('\n--- 3 Samples 2023 Pending ---');
  for (const q of pending2023.slice(0, 3)) {
    console.log(`[${q.code}] ${q.especialidade}: ${q.statement.slice(0, 100)}...`);
    console.log(`  Options: ${q.options?.map(o => o.letter + ') ' + o.text.slice(0, 30)).join(' | ')}`);
  }

  console.log('\n--- 3 Samples 2024 Pending ---');
  for (const q of pending2024.slice(0, 3)) {
    console.log(`[${q.code}] ${q.especialidade}: ${q.statement.slice(0, 100)}...`);
    console.log(`  Options: ${q.options?.map(o => o.letter + ') ' + o.text.slice(0, 30)).join(' | ')}`);
  }

  console.log('\n--- 3 Samples 2023 With Ans ---');
  for (const q of withAns2023.slice(0, 3)) {
    console.log(`[${q.code}] (Ans: ${q.correct_answer}) ${q.especialidade}: ${q.statement.slice(0, 100)}...`);
  }

  console.log('\n--- 3 Samples 2024 With Ans ---');
  for (const q of withAns2024.slice(0, 3)) {
    console.log(`[${q.code}] (Ans: ${q.correct_answer}) ${q.especialidade}: ${q.statement.slice(0, 100)}...`);
  }
}

sampleStatements();
