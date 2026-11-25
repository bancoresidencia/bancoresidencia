import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/sanar_crawler.db');
const colsQ = db.prepare('PRAGMA table_info(questions)').all();
console.log('Columns in questions:', colsQ.map(c => c.name));

const colsImg = db.prepare('PRAGMA table_info(question_images)').all();
console.log('Columns in question_images:', colsImg.map(c => c.name));

// Search for derrame pleural or AMRIGS 2026
const sample = db.prepare(`SELECT * FROM questions WHERE (enunciado_texto LIKE '%volumoso derrame pleural%' OR enunciado_texto LIKE '%septações%') LIMIT 5`).all();
console.log('Matching questions for derrame pleural:', sample.length);
for (const s of sample) {
  console.log('ID:', s.sanar_id, '| Banca:', s.instituicao, '| Year:', s.ano);
  console.log('Snippet:', (s.enunciado_texto || '').substring(0, 100));
  const imgs = db.prepare('SELECT * FROM question_images WHERE sanar_id = ?').all(s.sanar_id);
  console.log('Images:', imgs);
}

const amrigs2026 = db.prepare(`SELECT count(*) as c FROM questions WHERE (instituicao LIKE '%AMRIGS%' OR instituicao_sigla LIKE '%AMRIGS%') AND ano = 2026`).get();
console.log('AMRIGS 2026 questions in sanar_crawler.db:', amrigs2026.c);
