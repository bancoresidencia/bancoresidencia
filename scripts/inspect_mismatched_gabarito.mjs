import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const stagingDb = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const sanarDb = new DatabaseSync('data/sanar_crawler.db');
const sMatches = JSON.parse(fs.readFileSync('data/sanar_direct_matches_watermarked.json', 'utf8'));

for (const qId of ['questions_c2cad4f0-5316-43eb-9d9f-0de2cf5ca0b3', 'questions_78f6e0ac-9565-4a11-b54f-b1d7a208d315']) {
  const ourQ = stagingDb.prepare('SELECT id, statement, correct_answer, options, banca, year FROM questions_curated_staging WHERE id = ?').get(qId);
  console.log('\n--- OUR QUESTION:', ourQ.id, ourQ.banca, ourQ.year, 'Gabarito:', ourQ.correct_answer);
  console.log('Statement:', ourQ.statement.slice(0, 150));

  const match = sMatches.find(m => m.question_id === qId);
  if (match) {
    const sQ = sanarDb.prepare('SELECT sanar_id, enunciado_texto, gabarito, instituicao, ano, alternativa_a, alternativa_b FROM questions WHERE sanar_id = ?').get(match.sanar_id);
    console.log('--- SANAR MATCH:', sQ.sanar_id, sQ.instituicao, sQ.ano, 'Gabarito:', sQ.gabarito);
    console.log('Sanar Statement:', sQ.enunciado_texto.slice(0, 150));
    console.log('Sanar Imgs:', match.sanar_images);
  }
}
