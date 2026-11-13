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

async function checkInDb() {
  const queries = [
    'A coqueluche é uma doença comum da infância',
    'Segundo a SBP, qual vacina deve ser administrada',
    'Quantas consultas ao pediatra a Sociedade Brasileira',
    'Até quantos meses de vida o bebê deve ficar em aleitamento'
  ];

  for (const q of queries) {
    const { data } = await supabase
      .from('questions')
      .select('id, code, institution, year, correct_answer, statement')
      .ilike('statement', `%${q}%`);
    console.log(`Query "${q.slice(0, 30)}...": found ${data?.length || 0}`);
    if (data?.length) {
      data.forEach(item => {
        console.log(`  -> [${item.code}] (${item.institution} ${item.year}) Correct: "${item.correct_answer}"`);
      });
    }
  }
}

checkInDb();
