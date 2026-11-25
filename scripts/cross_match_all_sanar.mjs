import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const stagingDb = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const sanarDb = new DatabaseSync('data/sanar_crawler.db');

const rows = stagingDb.prepare(`
  SELECT id, banca, year, images, statement, options, correct_answer 
  FROM questions_curated_staging 
  WHERE images IS NOT NULL AND images != '[]' AND images != ''
`).all();

console.log('Total de questões com imagem no Banco Residência:', rows.length);

function normalizeText(text) {
  if (!text) return '';
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

console.log('Carregando e indexando Sanar com imagens...');
const sanarRows = sanarDb.prepare(`
  SELECT q.sanar_id, q.enunciado_texto, q.gabarito, q.instituicao, q.ano, qi.local_webp_path, qi.original_url
  FROM questions q
  JOIN question_images qi ON q.sanar_id = qi.sanar_id
  WHERE q.has_images = 1
`).all();

const sanarMap = new Map();
for (const row of sanarRows) {
  if (!sanarMap.has(row.sanar_id)) {
    const norm = normalizeText(row.enunciado_texto);
    if (norm.length < 20) continue;
    sanarMap.set(row.sanar_id, {
      sanar_id: row.sanar_id,
      norm,
      prefix40: norm.slice(0, 40),
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

const prefixIndex = new Map();
for (const [sId, sData] of sanarMap.entries()) {
  if (!prefixIndex.has(sData.prefix40)) prefixIndex.set(sData.prefix40, []);
  prefixIndex.get(sData.prefix40).push(sData);
}

let allMatches = [];
for (const r of rows) {
  const norm = normalizeText(r.statement);
  if (norm.length < 20) continue;

  const p40 = norm.slice(0, 40);
  const mid40 = norm.length > 80 ? norm.slice(20, 60) : norm.slice(0, 40);

  let match = null;
  if (prefixIndex.has(p40)) {
    match = prefixIndex.get(p40)[0];
  } else {
    for (const sData of sanarMap.values()) {
      if (norm.includes(sData.prefix40) || sData.norm.includes(p40) || (mid40.length >= 35 && sData.norm.includes(mid40))) {
        match = sData;
        break;
      }
    }
  }

  if (match) {
    allMatches.push({
      question_id: r.id,
      banca: r.banca,
      year: r.year,
      sanar_id: match.sanar_id,
      sanar_images: match.images
    });
  }
}

console.log(`\n======================================================`);
console.log(`CRUZAMENTO TOTAL COM SANAR_CRAWLER.DB:`);
console.log(`Total de questões com imagem avaliadas: ${rows.length}`);
console.log(`Total de questões com imagens correspondentes no Sanar: ${allMatches.length}`);
console.log(`======================================================\n`);

fs.writeFileSync('data/sanar_all_matches_complete.json', JSON.stringify(allMatches, null, 2), 'utf8');
