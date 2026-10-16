import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/gabaritos_nacional.db');
const q = db.prepare(`
  SELECT f.sigla, d.ano, d.modalidade, count(qg.id) as total
  FROM questoes_gabarito qg
  JOIN gabaritos g ON qg.gabarito_id = g.id
  JOIN documentos d ON g.documento_id = d.id
  JOIN fontes f ON d.fonte_id = f.id
  GROUP BY f.sigla, d.ano, d.modalidade
`).all();

console.log('--- RESUMO DE GABARITOS NO SQLITE ---');
for (const row of q) {
  console.log(`[${row.sigla}] Ano ${row.ano} (${row.modalidade}): ${row.total} gabaritos`);
}
