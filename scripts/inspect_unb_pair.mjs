import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const staging = JSON.parse(fs.readFileSync('data/staging_questoes_gemeas_locais.json', 'utf8'));
const item = staging.find(q => q.code === 'UNBHUB-2016-CLM-14550');

console.log('Staged Item in Staging JSON:');
console.log(JSON.stringify(item, null, 2));

const db = new DatabaseSync('data/questoes_132k.db');

const q1 = db.prepare('SELECT id, code, institution, banca, year, tipo_prova, statement, options, correct_answer FROM questions WHERE id = ?').get(item.question_id);
const q2 = db.prepare('SELECT id, code, institution, banca, year, tipo_prova, statement, options, correct_answer FROM questions WHERE id = ?').get(item.twin_source_id);

console.log('\n--- Question 1 (Pending in Supabase) ---');
console.log('ID:', q1?.id);
console.log('Code:', q1?.code);
console.log('Inst:', q1?.institution);
console.log('Year:', q1?.year);
console.log('Tipo:', q1?.tipo_prova);
console.log('Correct Answer in SQLite:', q1?.correct_answer);
console.log('Statement:', (q1?.statement || '').slice(0, 150));
console.log('Options:', q1?.options);

console.log('\n--- Question 2 (Twin Source with Gabarito) ---');
console.log('ID:', q2?.id);
console.log('Code:', q2?.code);
console.log('Inst:', q2?.institution);
console.log('Year:', q2?.year);
console.log('Tipo:', q2?.tipo_prova);
console.log('Correct Answer in SQLite:', q2?.correct_answer);
console.log('Statement:', (q2?.statement || '').slice(0, 150));
console.log('Options:', q2?.options);
