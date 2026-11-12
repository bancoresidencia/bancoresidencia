import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const OUT_DIR = path.resolve('data/imagens_convertidas_webp');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);

console.log('='.repeat(80));
console.log('🚀 INICIANDO GATE 1: CONVERSÃO UNIVERSAL PARA WEBP');
console.log('='.repeat(80));

// 1. Passo 0: Checkpoint de Segurança
console.log('\n📦 Passo 0: Criando Checkpoint de Segurança da tabela staging...');
const backupTableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='questions_curated_staging_pre_images_backup'").get();
if (!backupTableCheck) {
  db.exec('CREATE TABLE "questions_curated_staging_pre_images_backup" AS SELECT * FROM "questions_curated_staging"');
  const countBackup = db.prepare('SELECT count(*) as c FROM "questions_curated_staging_pre_images_backup"').get().c;
  console.log(`✅ Checkpoint criado com sucesso: ${countBackup.toLocaleString('pt-BR')} registros salvos.`);
} else {
  console.log('ℹ️ Checkpoint já existe. Preservando backup original.');
}

// 2. Passo 1: Validação dos 1.136 arquivos WebP locais de Prova de Residência
console.log('\n🔍 Passo 1: Validando integridade física dos 1.136 arquivos em data/imagens_provaderesidencia/...');
const pdrRows = db.prepare(`
  SELECT id, questao_id, url, local_path, mime_type
  FROM provaderesidencia_imagens_arquivo
`).all();

let pdrValid = 0;
let pdrCorrupt = 0;
const pdrUrlToLocalWebp = new Map();

for (const row of pdrRows) {
  const filePath = path.resolve(row.local_path);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Arquivo não encontrado no disco: ${row.local_path}`);
    pdrCorrupt++;
    continue;
  }
  try {
    const meta = await sharp(filePath).metadata();
    if (meta.format !== 'webp') {
      console.warn(`⚠️ Arquivo não é WebP: ${row.local_path} (${meta.format})`);
      pdrCorrupt++;
    } else {
      pdrValid++;
      pdrUrlToLocalWebp.set(row.url, {
        local_path: row.local_path,
        width: meta.width,
        height: meta.height,
        size: fs.statSync(filePath).size,
        questao_id: row.questao_id
      });
    }
  } catch (err) {
    console.error(`❌ Erro ao validar ${row.local_path}:`, err.message);
    pdrCorrupt++;
  }
}

console.log(`✅ Validação de arquivos PDR concluída: ${pdrValid} íntegros, ${pdrCorrupt} com erro.`);

// 3. Passo 2: Coleta de todas as URLs não-WebP restantes na staging
console.log('\n🔍 Passo 2: Mapeando URLs não-WebP fora do PDR na tabela staging...');
const allRows = db.prepare(`
  SELECT id, images, statement, options
  FROM questions_curated_staging
  WHERE (images IS NOT NULL AND images != '[]' AND images != '')
     OR (options LIKE '%http%')
     OR (statement LIKE '%[IMG:%' OR statement LIKE '%<img%' OR statement LIKE '%![%')
`).all();

const nonWebpUrlsToDownload = new Map();

function checkUrl(url, qId) {
  if (!url || typeof url !== 'string') return;
  url = url.trim();
  const clean = url.split('?')[0].toLowerCase();
  if (clean.endsWith('.webp')) return;
  if (clean.includes('pdres.s3.amazonaws.com')) return; // Já tratado via pdrUrlToLocalWebp

  // Se tem extensão legada ou é link externo não webp
  if (clean.endsWith('.jpg') || clean.endsWith('.jpeg') || clean.endsWith('.png') || clean.endsWith('.bmp') || clean.endsWith('.gif') || clean.includes('/images/questoes/')) {
    if (!nonWebpUrlsToDownload.has(url)) {
      nonWebpUrlsToDownload.set(url, []);
    }
    nonWebpUrlsToDownload.get(url).push(qId);
  }
}

for (const r of allRows) {
  // Check images col
  if (r.images) {
    try {
      const parsed = JSON.parse(r.images);
      if (Array.isArray(parsed)) {
        parsed.forEach(u => checkUrl(u, r.id));
      } else if (typeof parsed === 'string') {
        checkUrl(parsed, r.id);
      }
    } catch {
      if (r.images.startsWith('http')) checkUrl(r.images, r.id);
    }
  }

  // Check options
  if (r.options && r.options.includes('http')) {
    try {
      const opts = JSON.parse(r.options);
      if (Array.isArray(opts)) {
        for (const opt of opts) {
          if (opt.text && opt.text.startsWith('http')) checkUrl(opt.text, r.id);
          if (Array.isArray(opt.images)) {
            opt.images.forEach(u => checkUrl(typeof u === 'string' ? u : u?.url, r.id));
          }
        }
      }
    } catch {}
  }
}

console.log(`Total de URLs não-WebP a baixar e converter: ${nonWebpUrlsToDownload.size}`);

// 4. Passo 3: Download e Conversão com sharp
console.log('\n⚡ Passo 3: Baixando e convertendo para WebP com calibragem clínica...');
const conversionManifest = [];
let convertedCount = 0;
let failedCount = 0;

let idx = 0;
for (const [url, qIds] of nonWebpUrlsToDownload.entries()) {
  idx++;
  let fetchUrl = url;
  if (url.startsWith('/images/questoes/')) {
    // Caminho relativo local antigo, verificar se existe em public ou subpastas
    const localRel = path.resolve('.' + url);
    const localPublic = path.resolve('public' + url);
    if (fs.existsSync(localRel)) {
      fetchUrl = 'file://' + localRel;
    } else if (fs.existsSync(localPublic)) {
      fetchUrl = 'file://' + localPublic;
    } else {
      console.warn(`[${idx}/${nonWebpUrlsToDownload.size}] Arquivo relativo local não encontrado: ${url}`);
      failedCount++;
      continue;
    }
  }

  try {
    let inputBuffer;
    if (fetchUrl.startsWith('file://')) {
      inputBuffer = fs.readFileSync(fetchUrl.replace('file://', ''));
    } else {
      const res = await fetch(fetchUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      const arrayBuffer = await res.arrayBuffer();
      inputBuffer = Buffer.from(arrayBuffer);
    }

    const img = sharp(inputBuffer);
    const meta = await img.metadata();

    // Determinar se é traçado/gráfico (poucas cores, padrão ECG) ou imagem contínua
    const isEcgOrChart = meta.channels === 1 || meta.format === 'png' && (meta.width < 1000 && meta.height < 600);
    
    let webpBuffer;
    if (isEcgOrChart) {
      webpBuffer = await sharp(inputBuffer).webp({ lossless: true, effort: 6 }).toBuffer();
    } else {
      webpBuffer = await sharp(inputBuffer).webp({ quality: 88, effort: 6, smartSubsample: true }).toBuffer();
    }

    // Salvar localmente
    const baseName = `converted_${idx}_${path.basename(url.split('?')[0]).replace(/\.[^.]+$/, '')}.webp`;
    const outFilePath = path.join(OUT_DIR, baseName);
    fs.writeFileSync(outFilePath, webpBuffer);

    conversionManifest.push({
      original_url: url,
      converted_file: baseName,
      converted_path: path.relative(process.cwd(), outFilePath).replace(/\\/g, '/'),
      width: meta.width,
      height: meta.height,
      orig_format: meta.format,
      orig_size: inputBuffer.length,
      webp_size: webpBuffer.length,
      reduction_pct: (((inputBuffer.length - webpBuffer.length) / inputBuffer.length) * 100).toFixed(1) + '%',
      affected_questions: qIds
    });

    convertedCount++;
    if (idx % 25 === 0 || idx === nonWebpUrlsToDownload.size) {
      console.log(` -> Progresso: ${idx} / ${nonWebpUrlsToDownload.size} (${convertedCount} convertidas com sucesso)`);
    }
  } catch (err) {
    console.error(`❌ Erro ao converter [${idx}] ${url}:`, err.message);
    failedCount++;
  }
}

// 5. Salvar Manifesto do Gate 1
const manifestPath = path.resolve('data/supabase_tables/gate1_conversion_manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  pdr_validated: pdrValid,
  external_converted: convertedCount,
  external_failed: failedCount,
  manifest: conversionManifest
}, null, 2), 'utf-8');

console.log('\n' + '='.repeat(80));
console.log('🏁 GATE 1 CONCLUÍDO!');
console.log(`- Imagens PDR locais validadas: ${pdrValid.toLocaleString('pt-BR')}`);
console.log(`- Imagens legadas convertidas para WebP: ${convertedCount.toLocaleString('pt-BR')}`);
console.log(`- Falhas de download/conversão: ${failedCount}`);
console.log(`- Manifesto de conversão gravado em: ${manifestPath}`);
console.log('='.repeat(80));

