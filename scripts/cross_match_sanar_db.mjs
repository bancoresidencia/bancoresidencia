import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const stagingDb = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const sanarDb = new DatabaseSync('data/sanar_crawler.db');

const catData = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8'));
const watermarkedList = catData.catalog || [];

console.log('Total de questões com marca no catálogo:', watermarkedList.length);

function normalizeText(text) {
  if (!text) return '';
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// 1. Carrega as questões do Sanar que possuem imagens
console.log('Carregando questões do Sanar com imagens...');
const sanarRows = sanarDb.prepare(`
  SELECT q.sanar_id, q.enunciado_texto, q.gabarito, q.instituicao, q.ano, qi.local_webp_path, qi.original_url
  FROM questions q
  JOIN question_images qi ON q.sanar_id = qi.sanar_id
  WHERE q.has_images = 1
`).all();

console.log(`Linhas de imagens no Sanar encontradas: ${sanarRows.length}`);

// Agrupa imagens por sanar_id
const sanarMap = new Map();
for (const row of sanarRows) {
  if (!sanarMap.has(row.sanar_id)) {
    const norm = normalizeText(row.enunciado_texto);
    if (norm.length < 20) continue;
    sanarMap.set(row.sanar_id, {
      sanar_id: row.sanar_id,
      norm,
      prefix40: norm.slice(0, 40),
      prefix60: norm.slice(0, 60),
      mid40: norm.length > 80 ? norm.slice(20, 60) : norm.slice(0, 40),
      gabarito: row.gabarito,
      images: []
    });
  }
  const entry = sanarMap.get(row.sanar_id);
  if (entry) {
    entry.images.push({
      local_webp: row.local_webp_path,
      original_url: row.original_url
    });
  }
}

console.log(`Questões únicas do Sanar com imagem indexadas: ${sanarMap.size}`);

// Indexa prefixos do Sanar para busca O(1)
const prefixIndex = new Map();
for (const [sId, sData] of sanarMap.entries()) {
  if (!prefixIndex.has(sData.prefix40)) prefixIndex.set(sData.prefix40, []);
  prefixIndex.get(sData.prefix40).push(sData);
}

// 2. Cruza com as questões com marca d'água
let directMatches = [];

for (const wItem of watermarkedList) {
  const row = stagingDb.prepare('SELECT id, statement, options, correct_answer, banca, year FROM questions_curated_staging WHERE id = ?').get(wItem.id);
  if (!row || !row.statement) continue;

  const wNorm = normalizeText(row.statement);
  if (wNorm.length < 20) continue;

  const wP40 = wNorm.slice(0, 40);
  const wMid40 = wNorm.length > 80 ? wNorm.slice(20, 60) : wNorm.slice(0, 40);

  let matched = null;

  // Busca por prefixo exato O(1)
  if (prefixIndex.has(wP40)) {
    matched = prefixIndex.get(wP40)[0];
  } else {
    // Busca linear por contenção no Sanar
    for (const sData of sanarMap.values()) {
      if (wNorm.includes(sData.prefix40) || sData.norm.includes(wP40) || (wMid40.length >= 35 && sData.norm.includes(wMid40))) {
        matched = sData;
        break;
      }
    }
  }

  if (matched) {
    directMatches.push({
      question_id: row.id,
      banca: row.banca,
      year: row.year,
      sanar_id: matched.sanar_id,
      sanar_images: matched.images,
      gabarito_match: !row.correct_answer || !matched.gabarito || row.correct_answer === matched.gabarito
    });
  }
}

console.log(`\n======================================================`);
console.log(`RESULTADO DO CRUZAMENTO COM SANAR_CRAWLER.DB:`);
console.log(`Total de questões com marca d'água avaliadas: ${watermarkedList.length}`);
console.log(`Correspondências diretas encontradas com imagem limpa no Sanar: ${directMatches.length}`);
console.log(`======================================================\n`);

fs.writeFileSync('data/sanar_direct_matches_watermarked.json', JSON.stringify(directMatches, null, 2), 'utf8');
console.log('Salvo em data/sanar_direct_matches_watermarked.json');
if (directMatches.length > 0) {
  console.log('Primeiras 5 correspondências:', directMatches.slice(0, 5));
}
