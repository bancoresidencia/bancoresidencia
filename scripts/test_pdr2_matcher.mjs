import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const dbMain = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const dbPdr2 = new DatabaseSync('data/provaderesidencia_coleta_parte2.db');

const catalog = JSON.parse(fs.readFileSync('data/supabase_tables/gate6_missing_catalog.json', 'utf8')).catalog || [];

function normalizeText(str) {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

const pdr2Questoes = dbPdr2.prepare(`
  SELECT q.id, q.numero, q.enunciado, q.imagens_json, q.imagens_locais_json, p.titulo, p.ano
  FROM questoes q
  JOIN provas p ON q.prova_id = p.id
  WHERE (q.imagens_json IS NOT NULL AND q.imagens_json != '[]' AND q.imagens_json != '')
     OR (q.imagens_locais_json IS NOT NULL AND q.imagens_locais_json != '[]' AND q.imagens_locais_json != '')
`).all();

console.log(`Total de questões com imagens em provaderesidencia_coleta_parte2.db: ${pdr2Questoes.length}`);

const pdr2Index = pdr2Questoes.map(item => ({
  id: item.id,
  numero: item.numero,
  ano: item.ano,
  titulo: item.titulo,
  imagens_json: item.imagens_json || item.imagens_locais_json,
  norm_stmt: normalizeText(item.enunciado)
}));

let matched2 = [];
for (const q of catalog) {
  const stagingQ = dbMain.prepare('SELECT statement, options, year, banca FROM questions_curated_staging WHERE id = ?').get(q.id);
  if (!stagingQ || !stagingQ.statement) continue;

  const normTarget = normalizeText(stagingQ.statement);
  if (normTarget.length < 30) continue;
  const slice = normTarget.slice(0, 70);

  const found = pdr2Index.find(p => p.norm_stmt.includes(slice) || (slice.length > 50 && p.norm_stmt.includes(slice.slice(0, 50))));
  if (found) {
    matched2.push({
      question_id: q.id,
      banca: stagingQ.banca,
      year: stagingQ.year,
      pdr_id: found.id,
      pdr_prova: found.titulo,
      imagens_json: found.imagens_json
    });
  }
}

console.log(`Matches encontrados em provaderesidencia_coleta_parte2.db: ${matched2.length}`);

