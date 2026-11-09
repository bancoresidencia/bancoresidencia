import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/questoes_132k.db');
const q = db.prepare('SELECT id, code, statement, motivo_regra FROM questions WHERE code = ?').get('SANTACASADEL-2026-CLM-13215');
console.log('Motivo regra:', q.motivo_regra);
db.close();
