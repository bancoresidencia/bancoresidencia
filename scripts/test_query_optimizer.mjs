import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const t = l.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function cleanText(s) {
  if (!s) return '';
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function stripIntro(s) {
  let clean = cleanText(s);
  const intros = [
    /^(?:atencao:?\s*)?leia o caso clinico a seguir:?\s*/i,
    /^(?:atencao:?\s*)?leia o texto a seguir:?\s*/i,
    /^com base no caso clinico a seguir:?\s*/i,
    /^considere o caso clinico a seguir:?\s*/i,
    /^baseado no texto a seguir:?\s*/i,
    /^questao\s+\d+[\.\-\s:]+/i
  ];
  for (const re of intros) {
    clean = clean.replace(re, '').trim();
  }
  return clean;
}

function buildOptimizedQueries(statement, options) {
  const rawClean = stripIntro(statement);
  const words = rawClean.split(' ').filter(Boolean);

  let nuclearStmt = '';
  if (words.length <= 15) {
    nuclearStmt = `"${words.join(' ')}"`;
  } else {
    // Pega as primeiras 12 a 16 palavras mais significativas
    nuclearStmt = `"${words.slice(0, 14).join(' ')}"`;
  }

  let optPhrase = '';
  if (options && Array.isArray(options) && options.length > 0) {
    const optText = cleanText(options[0].text);
    const optWords = optText.split(' ').filter(Boolean);
    if (optWords.length <= 8) {
      optPhrase = optWords.join(' ');
    } else {
      optPhrase = optWords.slice(0, 6).join(' ');
    }
  }

  const queryC1 = `${nuclearStmt} ${optPhrase}`.trim();
  const queryC2 = `${nuclearStmt}`.trim();
  return { queryC1, queryC2 };
}

async function test() {
  const { data: qs } = await supabase.from('questions')
    .select('code, statement, options')
    .or('correct_answer.is.null,correct_answer.eq.')
    .limit(5);

  for (const q of qs) {
    console.log(`\n--- ${q.code} ---`);
    console.log('Original stmt:', q.statement.slice(0, 100));
    const { queryC1, queryC2 } = buildOptimizedQueries(q.statement, q.options);
    console.log('Query C1 (Enunciado + Alt):', queryC1);
    console.log('Query C2 (Só Enunciado):', queryC2);
  }
}

test();
