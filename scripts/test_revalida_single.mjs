import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { solveQuestionDeep } from './solve_questions_engine.mjs';

const envPath = path.resolve('.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(l => {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
  });
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY);
const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

// Seleciona 1 questão do Revalida
const q = db.prepare(`
  SELECT * FROM questions_curated_staging
  WHERE modalidade = 'Revalida'
    AND ((UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E')) OR is_anulada = 1)
    AND (commentary IS NULL OR commentary NOT LIKE '%Take-Home%')
  LIMIT 1
`).get();

console.log('Selecionada Revalida:', { id: q.id, code: q.code, ans: q.correct_answer, esp: q.especialidade });

let options = q.options;
if (typeof options === 'string') {
  try { options = JSON.parse(options); } catch { options = []; }
}

const qObj = {
  ...q,
  options,
  correctAnswer: q.correct_answer,
  specialty: q.especialidade
};

console.log('Resolvendo com solveQuestionDeep (Gemini Free Pool)...');
const res = await solveQuestionDeep(qObj, q.especialidade, null, false);
console.log('Tamanho do comentário gerado:', res.commentary?.length);
console.log('Trecho do comentário:', res.commentary?.slice(0, 150));

const plainId = q.id.replace(/^(questions_|questions_expansion_revalida_|expansion_revalida_)/, '');

// 1. Supabase questions_expansion_revalida
const { error: err1 } = await supabase
  .from('questions_expansion_revalida')
  .update({ commentary: res.commentary, options: res.options })
  .eq('id', plainId);

// 2. Supabase questions_revalida
const { error: err2 } = await supabase
  .from('questions_revalida')
  .update({ commentary: res.commentary, options: res.options })
  .eq('id', plainId);

console.log('Supabase questions_expansion_revalida:', err1 ? err1.message : '✅ 200 OK');
console.log('Supabase questions_revalida:', err2 ? err2.message : '✅ 200 OK');

// 3. SQLite
db.prepare('UPDATE questions_curated_staging SET commentary = ?, options = ? WHERE id = ?').run(
  res.commentary,
  JSON.stringify(res.options),
  q.id
);

const check = db.prepare('SELECT commentary FROM questions_curated_staging WHERE id = ?').get(q.id);
console.log('SQLite atualizado com Take-Home?', check.commentary.includes('Take-Home'));
