import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const dbPath = path.resolve('data/supabase_tables/supabase_tables.db');
const db = new DatabaseSync(dbPath);

console.log('=== RELATÓRIO TÉCNICO DAS IMAGENS ===\n');

// 1. SUPABASE LIVE QUESTIONS
let liveCount = 0;
let liveWithImg = 0;
let liveImgSamples = [];
try {
  liveCount = db.prepare('SELECT count(*) as c FROM supabase_live_questions').get().c;
  liveWithImg = db.prepare("SELECT count(*) as c FROM supabase_live_questions WHERE images IS NOT NULL AND length(images) > 2 AND images != '[]'").get().c;
  liveImgSamples = db.prepare("SELECT id, images FROM supabase_live_questions WHERE images IS NOT NULL AND length(images) > 2 AND images != '[]' LIMIT 5").all();
} catch (e) {
  console.log('Erro ao ler supabase_live_questions:', e.message);
}
console.log(`Supabase Live Questions: total=${liveCount}, com imagens=${liveWithImg}`);
console.log('Amostra live images:', JSON.stringify(liveImgSamples, null, 2));

// 2. QUESTIONS_CURATED_STAGING
const totalStaging = db.prepare('SELECT count(*) as c FROM questions_curated_staging').get().c;
const stagingWithImg = db.prepare("SELECT count(*) as c FROM questions_curated_staging WHERE images IS NOT NULL AND length(images) > 2 AND images != '[]'").get().c;

console.log(`\nStaging (SSOT): total=${totalStaging}, com imagens=${stagingWithImg}`);

// Categorização das imagens na Staging
const allStagingImgs = db.prepare("SELECT id, images, options, statement, correct_answer FROM questions_curated_staging WHERE images IS NOT NULL AND length(images) > 2 AND images != '[]'").all();

let localPathWebp = 0;
let remoteSupabase = 0;
let remoteS3 = 0;
let remoteMedevo = 0;
let remoteWikimedia = 0;
let otherFormat = 0;
let urlPatterns = {};
let questionsWithOptionsImages = 0;

for (const row of allStagingImgs) {
  let imgs = [];
  try {
    imgs = JSON.parse(row.images);
    if (!Array.isArray(imgs)) imgs = [imgs];
  } catch {
    imgs = [row.images];
  }

  // Verificar se alternativas têm imagens
  const opts = row.options || '';
  if (opts.includes('http') && (opts.includes('.webp') || opts.includes('.jpg') || opts.includes('.png'))) {
    questionsWithOptionsImages++;
  }

  for (const img of imgs) {
    if (typeof img !== 'string') continue;
    const clean = img.split('?')[0].toLowerCase();
    
    // Extensão
    if (!clean.endsWith('.webp')) {
      otherFormat++;
    }

    // Domínio / Caminho
    if (img.startsWith('/storage/questoes/')) {
      localPathWebp++;
    } else if (img.includes('supabase.co')) {
      remoteSupabase++;
    } else if (img.includes('pdres.s3.amazonaws.com') || img.includes('s3.')) {
      remoteS3++;
    } else if (img.includes('medevo.com.br')) {
      remoteMedevo++;
    } else if (img.includes('wikimedia.org')) {
      remoteWikimedia++;
    }

    const domainKey = img.startsWith('/') ? 'caminho_local_storage' : (img.split('/')[2] || 'outro');
    urlPatterns[domainKey] = (urlPatterns[domainKey] || 0) + 1;
  }
}

console.log('\nDistribuição de URLs de imagens em questions_curated_staging:');
console.log(JSON.stringify(urlPatterns, null, 2));
console.log(`Imagens em formato diferente de WebP: ${otherFormat}`);
console.log(`Questões com alternativas visuais (imagens nas opções): ${questionsWithOptionsImages}`);

// 3. IMAGENS SALVAS LOCALMENTE EM DISCO
console.log('\n--- ARQUIVOS FÍSICOS EM DISCO ---');
const diskDirs = [
  { name: 'data/imagens_banco_geral', desc: 'Imagens baixadas/convertidas do banco geral' },
  { name: 'data/imagens_higienizadas_medq', desc: 'Imagens higienizadas sem marca d água' },
  { name: 'data/imagens_medq_originais', desc: 'Originais com marca d água para comparação' },
  { name: 'data/imagens_medevo_download', desc: 'Imagens baixadas da MedEvo' },
  { name: 'data/imagens_provaderesidencia', desc: 'Imagens Prova de Residência' },
  { name: 'data/imagens_resgatadas_gate6', desc: 'Imagens resgatadas de cadernos/web' },
  { name: 'data/imagens_convertidas_webp', desc: 'Convertidas legadas' },
  { name: 'data/extracted_images_webp', desc: 'Extraídas de PDFs oficiais' }
];

let totalPhysicalWebp = 0;
let totalPhysicalAll = 0;

for (const d of diskDirs) {
  const p = path.resolve(d.name);
  if (fs.existsSync(p)) {
    const files = fs.readdirSync(p);
    const webps = files.filter(f => f.endsWith('.webp')).length;
    totalPhysicalWebp += webps;
    totalPhysicalAll += files.length;
    console.log(`• ${d.name} (${d.desc}): ${files.length} arquivos (${webps} webp)`);
  }
}
console.log(`\nTotal físico de arquivos em disco nas pastas de curadoria: ${totalPhysicalAll} (${totalPhysicalWebp} WebP)`);

// 4. TABELA PROVADERESIDENCIA_IMAGENS_ARQUIVO
try {
  const pdrImgCount = db.prepare('SELECT count(*) as c FROM provaderesidencia_imagens_arquivo').get().c;
  console.log(`\nImagens brutas salvas no SQLite provaderesidencia_imagens_arquivo: ${pdrImgCount}`);
} catch (e) {
  console.log('provaderesidencia_imagens_arquivo:', e.message);
}

// 5. SCRIPTS LOCAIS DISPONÍVEIS
console.log('\n--- SCRIPTS LOCAIS RELEVANTES ---');
const scripts = fs.readdirSync('scripts').filter(f => f.includes('image') || f.includes('pdr') || f.includes('medevo') || f.includes('fetch') || f.includes('extract'));
console.log(scripts);
