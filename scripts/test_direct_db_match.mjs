import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { DatabaseSync } from 'node:sqlite';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      }
    }
  });
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const dbPath = path.resolve('data/questoes_132k.db');
const localDb = new DatabaseSync(dbPath, { readOnly: true });

async function run() {
  console.log('1. Buscando questoes sem gabarito no Supabase...');
  // Pega uma amostra de 1000 questoes sem gabarito
  const { data: pending, error } = await supabase
    .from('questions')
    .select('id, code, statement')
    .or('correct_answer.is.null,correct_answer.eq.""')
    .limit(1000);

  if (error) {
    console.error('Erro Supabase:', error);
    return;
  }
  console.log(`Carregadas ${pending.length} pendências do Supabase.`);

  // Prepara busca no sqlite por ID e CODE
  const stmtById = localDb.prepare("SELECT id, code, correct_answer FROM questions WHERE id = ? AND correct_answer IS NOT NULL AND correct_answer != ''");
  const stmtByCode = localDb.prepare("SELECT id, code, correct_answer FROM questions WHERE code = ? AND correct_answer IS NOT NULL AND correct_answer != ''");

  let matchById = 0;
  let matchByCode = 0;
  const samples = [];

  for (const q of pending) {
    let found = stmtById.get(q.id);
    if (found) {
      matchById++;
      if (samples.length < 5) samples.push({ origem: 'ID', code: q.code, ans: found.correct_answer });
      continue;
    }
    if (q.code) {
      found = stmtByCode.get(q.code);
      if (found) {
        matchByCode++;
        if (samples.length < 5) samples.push({ origem: 'CODE', code: q.code, ans: found.correct_answer });
      }
    }
  }

  console.log(`\nResultado da amostra de ${pending.length} pendências:`);
  console.log(`- Match direto por ID no questoes_132k.db: ${matchById}`);
  console.log(`- Match direto por CODE no questoes_132k.db: ${matchByCode}`);
  console.log('Amostras encontradas:', samples);
}

run();

