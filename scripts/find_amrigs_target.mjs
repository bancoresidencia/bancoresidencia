import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/sanar_crawler.db');
const rows = db.prepare(`SELECT sanar_id, enunciado_texto, has_images FROM questions WHERE (instituicao LIKE '%AMRIGS%' OR instituicao_sigla LIKE '%AMRIGS%') AND ano = 2026`).all();
console.log('Total AMRIGS 2026:', rows.length);

for (const r of rows) {
  if (r.enunciado_texto.includes('Escolar') || r.enunciado_texto.includes('febril') || r.enunciado_texto.includes('derrame') || r.enunciado_texto.includes('tórax') || r.has_images) {
    console.log(`- ${r.sanar_id} (has_images=${r.has_images}): ${r.enunciado_texto.substring(0, 120)}`);
    const imgs = db.prepare('SELECT * FROM question_images WHERE sanar_id = ?').all(r.sanar_id);
    if (imgs.length > 0) {
      console.log('  -> Images:', imgs);
    }
  }
}
