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

async function findInDb() {
  const searchPhrases = [
    'hepatectomia',
    'cascata de reparo de feridas',
    'úlceras de pressão são complicações',
    'apneia obstrutiva do sono'
  ];

  for (const phrase of searchPhrases) {
    const { data } = await supabase.from('questions')
      .select('id, code, banca, institution, year, correct_answer, statement')
      .ilike('statement', `%${phrase}%`);
    console.log(`\nBusca por '${phrase}': encontrados ${data?.length} registros:`);
    for (const q of data || []) {
      console.log(`- [${q.code}] (${q.banca} / ${q.institution} - ${q.year}) ans: ${q.correct_answer || 'PENDENTE'}`);
      console.log(`  Stmt: ${q.statement.slice(0, 80)}...`);
    }
  }
}

findInDb();

