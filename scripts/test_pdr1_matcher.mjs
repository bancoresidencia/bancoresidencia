import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

const dbMain = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const dbPdr1 = new DatabaseSync('data/provaderesidencia_coleta.db');

const catalog = JSON.parse(fs.readFileSync('data/supabase_tables/gate6_missing_catalog.json', 'utf8')).catalog || [];
console.log(`Cruzando ${catalog.length} questões faltantes contra as 3.033 questões com imagem de provaderesidencia_coleta.db...`);

function normalizeText(str) {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Carregar as 3.033 questões de provaderesidencia_coleta.db que têm imagem_url
const pdrImgs = dbPdr1.prepare(`
  SELECT q.id, q.numero, q.enunciado, q.imagem_url, p.titulo, p.ano
  FROM questoes q
  JOIN provas p ON q.prova_id = p.id
  WHERE q.imagem_url IS NOT NULL AND q.imagem_url != ''
`).all();

const pdrIndex = pdrImgs.map(item => ({
  id: item.id,
  numero: item.numero,
  ano: item.ano,
  titulo: item.titulo,
  imagem_url: item.imagem_url,
  norm_stmt: normalizeText(item.enunciado)
}));

let matched = [];

for (const q of catalog) {
  // Buscar no staging o statement completo
  const stagingQ = dbMain.prepare('SELECT statement, options, year, banca FROM questions_curated_staging WHERE id = ?').get(q.id);
  if (!stagingQ || !stagingQ.statement) continue;

  const normTarget = normalizeText(stagingQ.statement);
  if (normTarget.length < 30) continue;

  // Pegar uma fatia de 50 caracteres limpos
  const slice = normTarget.slice(0, 70);

  // Buscar no índice do PDR
  const found = pdrIndex.find(p => p.norm_stmt.includes(slice) || (slice.length > 50 && p.norm_stmt.includes(slice.slice(0, 50))));
  if (found) {
    matched.push({
      question_id: q.id,
      banca: stagingQ.banca,
      year: stagingQ.year,
      pdr_id: found.id,
      pdr_prova: found.titulo,
      imagem_url: found.imagem_url,
      stmt_preview: stagingQ.statement.slice(0, 100) + '...'
    });
  }
}

console.log(`\n🎉 MATCHES ENCONTRADOS: ${matched.length} questões das 737 faltantes foram localizadas em provaderesidencia_coleta.db!`);
if (matched.length > 0) {
  console.log('Amostra de 5 matches:');
  console.log(matched.slice(0, 5));
}

