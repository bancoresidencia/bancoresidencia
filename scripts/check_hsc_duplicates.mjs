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

function cleanText(text) {
  if (!text) return '';
  return text.toLowerCase()
    .replace(/[^\w\sáéíóúâêîôûãõçà]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function checkHscDuplicatesInDb() {
  console.log('Buscando todas as questões HSC...');
  const { data: hscData, error: errHsc } = await supabase
    .from('questions')
    .select('id, code, year, statement, options, correct_answer')
    .ilike('code', 'HSC%');

  if (errHsc) {
    console.error('Erro:', errHsc);
    return;
  }

  const pendingHsc = hscData.filter(q => !q.correct_answer || q.correct_answer.trim() === '');
  console.log(`HSC total: ${hscData.length}, Pendentes: ${pendingHsc.length}`);

  // Test first 10 pending against DB with text search
  console.log('Testando busca de similaridade no banco para as pendentes...');
  let foundMatches = 0;

  for (const q of pendingHsc.slice(0, 15)) {
    const stmtClean = cleanText(q.statement);
    const firstWords = stmtClean.split(' ').slice(0, 8).join(' ');
    
    // search in db for questions with similar beginning
    const { data: matches } = await supabase
      .from('questions')
      .select('id, code, institution, year, statement, options, correct_answer')
      .ilike('statement', `%${firstWords.slice(0, 40)}%`)
      .not('code', 'ilike', 'HSC%')
      .not('correct_answer', 'is', null);

    if (matches && matches.length > 0) {
      for (const m of matches) {
        if (!m.correct_answer || m.correct_answer.trim() === '') continue;
        const mClean = cleanText(m.statement);
        if (stmtClean.includes(mClean.slice(0, 80)) || mClean.includes(stmtClean.slice(0, 80))) {
          console.log(`\n>>> MATCH ENCONTRADO para ${q.code}!`);
          console.log(`  HSC: ${q.statement.slice(0, 80)}...`);
          console.log(`  Match em ${m.code} (${m.institution} ${m.year}): ans=${m.correct_answer}`);
          foundMatches++;
        }
      }
    }
  }

  console.log(`\nMatches encontrados na amostra: ${foundMatches}`);
}

checkHscDuplicatesInDb();
