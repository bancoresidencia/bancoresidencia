import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { injectDeterministicImageTags } from './test_gate4_full_pipeline.mjs';

const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const PDR1_PATH = path.resolve('data/provaderesidencia_coleta.db');
const OUT_DIR = path.resolve('data/imagens_resgatadas_gate6');
const CATALOG_PATH = path.resolve('data/supabase_tables/gate6_missing_catalog.json');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);
const dbPdr1 = new DatabaseSync(PDR1_PATH);

console.log('='.repeat(80));
console.log('🚀 GATE 6: RESGATE DE IMAGENS VIA PROVADERESIDENCIA & STORAGE LOCAL');
console.log('='.repeat(80));

const catalogData = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
const catalog = catalogData.catalog || [];
console.log(`Catálogo inicial de faltantes: ${catalog.length} questões.`);

function normalizeText(str) {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

// 1. Carregar índice das 3.033 questões com imagem do PDR
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

// Localizar matches de alta precisão (>90% de correspondência)
const matchesToRecover = [];

for (const q of catalog) {
  const stagingQ = db.prepare('SELECT id, statement, options, year, banca FROM questions_curated_staging WHERE id = ?').get(q.id);
  if (!stagingQ || !stagingQ.statement) continue;

  const normTarget = normalizeText(stagingQ.statement);
  if (normTarget.length < 35) continue;
  const slice = normTarget.slice(0, 70);

  const found = pdrIndex.find(p => p.norm_stmt.includes(slice) || (slice.length > 50 && p.norm_stmt.includes(slice.slice(0, 50))));
  if (found) {
    matchesToRecover.push({
      staging_id: stagingQ.id,
      statement: stagingQ.statement,
      pdr_id: found.id,
      banca: stagingQ.banca,
      year: stagingQ.year,
      url: found.imagem_url
    });
  }
}

console.log(`Matches confirmados para download e conversão para WebP: ${matchesToRecover.length}`);

// 2. Download e conversão para WebP
let downloadedCount = 0;
let failedCount = 0;
const recoveryResults = [];

for (let i = 0; i < matchesToRecover.length; i++) {
  const item = matchesToRecover[i];
  const url = item.url;
  const baseName = `resgatada_pdr_${item.pdr_id}_${path.basename(url.split('?')[0]).replace(/\.[^.]+$/, '')}.webp`;
  const outPath = path.join(OUT_DIR, baseName);

  try {
    let inputBuffer;

    // Verificar se já existe na pasta de convertidas ou no PDR local
    const pdrLocalMatch = db.prepare(`SELECT local_path FROM provaderesidencia_imagens_arquivo WHERE url = ?`).get(url);
    if (pdrLocalMatch && fs.existsSync(path.resolve(pdrLocalMatch.local_path))) {
      inputBuffer = fs.readFileSync(path.resolve(pdrLocalMatch.local_path));
    } else {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      inputBuffer = Buffer.from(await res.arrayBuffer());
    }

    // Converter para WebP com sharp
    const meta = await sharp(inputBuffer).metadata();
    const isEcgOrChart = meta.channels === 1 || meta.format === 'png' && (meta.width < 1000 && meta.height < 600);

    let webpBuffer;
    if (meta.format === 'webp') {
      webpBuffer = inputBuffer;
    } else if (isEcgOrChart) {
      webpBuffer = await sharp(inputBuffer).webp({ lossless: true, effort: 6 }).toBuffer();
    } else {
      webpBuffer = await sharp(inputBuffer).webp({ quality: 88, effort: 6, smartSubsample: true }).toBuffer();
    }

    fs.writeFileSync(outPath, webpBuffer);

    recoveryResults.push({
      staging_id: item.staging_id,
      statement: item.statement,
      image_filename: baseName,
      canonical_url: `/storage/questoes/${baseName}`,
      pdr_id: item.pdr_id
    });

    downloadedCount++;
    if (downloadedCount % 20 === 0 || downloadedCount === matchesToRecover.length) {
      console.log(` -> Progresso de resgate: ${downloadedCount} / ${matchesToRecover.length}`);
    }
  } catch (err) {
    console.error(`❌ Erro no resgate da questão ${item.staging_id} (${url}):`, err.message);
    failedCount++;
  }
}

console.log(`\n✅ Download e conversão concluídos: ${downloadedCount} imagens salvas em ${OUT_DIR}`);

// 3. Atualizar questions_curated_staging sob transação atômica
console.log('\n⚡ Atualizando questions_curated_staging com as imagens resgatadas e injeção da tag [IMAGEM 1]...');

db.exec('BEGIN TRANSACTION');

const updateStmt = db.prepare(`
  UPDATE questions_curated_staging
  SET images = ?, statement = ?
  WHERE id = ?
`);

let updatedInDb = 0;
const recoveredIds = new Set();

try {
  for (const r of recoveryResults) {
    const imagesJson = JSON.stringify([r.canonical_url]);
    // Injetar a tag [IMAGEM 1] contextualmente no enunciado
    const { newStmt } = injectDeterministicImageTags(r.statement, 1);

    updateStmt.run(imagesJson, newStmt, r.staging_id);
    recoveredIds.add(r.staging_id);
    updatedInDb++;
  }

  db.exec('COMMIT');
  console.log(`✅ Sucesso! ${updatedInDb} questões atualizadas no banco de dados com imagem e tag [IMAGEM 1].`);
} catch (err) {
  db.exec('ROLLBACK');
  console.error('❌ ERRO ao atualizar banco de dados! Rollback executado:', err);
  process.exit(1);
}

// 4. Atualizar catálogo gate6_missing_catalog.json
console.log('\n📋 Atualizando catálogo de faltantes do Gate 6...');
const remainingCatalog = catalog.filter(q => !recoveredIds.has(q.id));

fs.writeFileSync(CATALOG_PATH, JSON.stringify({
  total: remainingCatalog.length,
  catalog: remainingCatalog
}, null, 2), 'utf-8');

console.log(`✅ Catálogo atualizado: de ${catalog.length} para ${remainingCatalog.length} questões pendentes.`);
console.log(`🎉 ${recoveredIds.size} questões foram resgatadas com sucesso no Gate 6!`);

