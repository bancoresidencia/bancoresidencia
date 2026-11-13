import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

const pSample = JSON.parse(fs.readFileSync('data/pediatria_final_questions.json', 'utf8'))[0];
console.log('Amostra Pediatria local:');
console.log({ id: pSample.id, code: pSample.code });

const sSample = db.prepare("SELECT id, code, modalidade FROM questions_curated_staging LIMIT 3").all();
console.log('Amostras Staging:');
console.table(sSample);

const checkMatch = db.prepare("SELECT id, code, modalidade FROM questions_curated_staging WHERE id = ? OR code = ?").all(pSample.id, pSample.code);
console.log('Match encontrado para o primeiro item de Pediatria?:', checkMatch);

