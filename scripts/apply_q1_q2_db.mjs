import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const HIGIENIZADAS_DIR = path.resolve('data/imagens_higienizadas_medq');

// 1. Update Q1: questions_189c4b71-935f-4e3f-8744-78f5cd102f2d
// Copy statement
const q1_stmt_name = 'clean_questions_189c4b71_stmt.webp';
fs.copyFileSync('data/clean_usp_189c_stmt.webp', path.join(HIGIENIZADAS_DIR, q1_stmt_name));
const q1_stmt_url = `/storage/questoes/imagens_higienizadas_medq/${q1_stmt_name}`;

// Options
const q1_opts = [
  { letter: 'A', text: `/storage/questoes/imagens_higienizadas_medq/clean_questions_189c4b71_opt_A.webp` },
  { letter: 'B', text: `/storage/questoes/imagens_higienizadas_medq/clean_questions_189c4b71_opt_B.webp` },
  { letter: 'C', text: `/storage/questoes/imagens_higienizadas_medq/clean_questions_189c4b71_opt_C.webp` },
  { letter: 'D', text: `/storage/questoes/imagens_higienizadas_medq/clean_questions_189c4b71_opt_D.webp` }
];
for (const opt of ['A', 'B', 'C', 'D']) {
  fs.copyFileSync(`data/test_usp_189c_opt_${opt}.webp`, path.join(HIGIENIZADAS_DIR, `clean_questions_189c4b71_opt_${opt}.webp`));
}

db.prepare('UPDATE questions_curated_staging SET images = ?, options = ? WHERE id = ?').run(
  JSON.stringify([q1_stmt_url]),
  JSON.stringify(q1_opts),
  'questions_189c4b71-935f-4e3f-8744-78f5cd102f2d'
);

// 2. Update Q2: questions_1aa7901f-9241-460a-af5a-39aa4c14f12d (ECG)
const q2_name = 'clean_questions_1aa7901f_ecg.webp';
fs.copyFileSync('data/clean_ecg_q2.webp', path.join(HIGIENIZADAS_DIR, q2_name));
const q2_url = `/storage/questoes/imagens_higienizadas_medq/${q2_name}`;

db.prepare('UPDATE questions_curated_staging SET images = ? WHERE id = ?').run(
  JSON.stringify([q2_url]),
  'questions_1aa7901f-9241-460a-af5a-39aa4c14f12d'
);

console.log('✅ Q1 (USP 189c4b71) e Q2 (ECG 1aa7901f) atualizadas com sucesso no banco!');
