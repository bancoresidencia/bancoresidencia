import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const dbPath = path.resolve('data/supabase_tables/supabase_tables.db');
const db = new DatabaseSync(dbPath);

console.log('Iniciando auditoria profunda de imagens em questions_curated_staging...');

const totalQuestions = db.prepare('SELECT count(*) as c FROM questions_curated_staging').get().c;
console.log(`Total de questões na staging: ${totalQuestions.toLocaleString('pt-BR')}`);

// Regex patterns
const MD_IMG_REGEX = /!\[([^\]]*)\]\(([^)]+)\)/gi;
const HTML_IMG_REGEX = /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
const TAG_IMG_REGEX = /\[IMG:\s*([^\]]+)\]/gi;
const BARE_IMG_URL_REGEX = /(https?:\/\/[^\s"'<>]+\.(?:png|jpe?g|webp|gif|bmp|svg|tiff)(?:\?[^\s"'<>]*)?)/gi;
const BASE64_IMG_REGEX = /(data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=]+)/gi;

// Heuristic regex for missing image clues in statements
const CLINICAL_IMG_CLUES = [
  /observe\s+(?:a\s+)?(?:imagem|figura|foto|radiografia|tomografia|ilustra[çc][ãa]o)/i,
  /conforme\s+(?:a\s+)?(?:imagem|figura|foto|radiografia|tomografia|ilustra[çc][ãa]o)/i,
  /(?:imagem|figura|foto|radiografia|tomografia|eletrocardiograma|ecg|tc|rm|rx)\s+(?:abaixo|a\s+seguir|acima|mostrad[ao]|anex[ao]|ilustrad[ao])/i,
  /(?:abaixo|a\s+seguir|anex[ao])\s+(?:est[áa]|encontra-se|demonstrad[ao]|ilustrad[ao])\s+(?:o\s+)?(?:eletrocardiograma|ecg|radiografia|imagem|figura|tc|exame)/i,
  /(?:ilustrad[ao]|demonstrad[ao]|apresentad[ao]|reproduzid[ao])\s+(?:a\s+seguir|abaixo)/i,
  /basead[ao]\s+na\s+(?:imagem|figura|foto|radiografia)/i,
  /analise\s+(?:a\s+)?(?:imagem|figura|foto|radiografia|o\s+eletrocardiograma)/i,
  /veja\s+(?:a\s+)?(?:imagem|figura|foto)/i,
  /de\s+acordo\s+com\s+(?:a\s+)?(?:imagem|figura|foto)/i,
  /laudo\s+da\s+(?:tomografia|radiografia|resson[âa]ncia)\s+(?:abaixo|anex[ao])/i,
  /aspecto\s+(?:da\s+les[ãa]o|macrosc[óo]pico|microsc[óo]pico|tomogr[áa]fico|radiogr[áa]fico)\s+(?:abaixo|a\s+seguir|na\s+foto)/i,
  /quadro\s+cl[íi]nico\s+e\s+(?:a\s+)?(?:imagem|figura|foto)/i,
  /\bfigura\s+[1-9]\b/i,
  /\bimagem\s+[1-9]\b/i
];

function extractImagesFromText(text) {
  if (!text || typeof text !== 'string') return [];
  const urls = new Set();

  let match;
  // Markdown
  MD_IMG_REGEX.lastIndex = 0;
  while ((match = MD_IMG_REGEX.exec(text)) !== null) {
    if (match[2]) urls.add(match[2].trim());
  }

  // HTML
  HTML_IMG_REGEX.lastIndex = 0;
  while ((match = HTML_IMG_REGEX.exec(text)) !== null) {
    if (match[1]) urls.add(match[1].trim());
  }

  // [IMG: url]
  TAG_IMG_REGEX.lastIndex = 0;
  while ((match = TAG_IMG_REGEX.exec(text)) !== null) {
    if (match[1]) urls.add(match[1].trim());
  }

  // Bare image URLs
  BARE_IMG_URL_REGEX.lastIndex = 0;
  while ((match = BARE_IMG_URL_REGEX.exec(text)) !== null) {
    if (match[1]) urls.add(match[1].trim());
  }

  // Base64
  BASE64_IMG_REGEX.lastIndex = 0;
  while ((match = BASE64_IMG_REGEX.exec(text)) !== null) {
    if (match[1]) urls.add(match[1].trim().slice(0, 100) + '...[base64]');
  }

  return Array.from(urls);
}

function parseImagesColumn(raw) {
  if (!raw || raw === '[]' || raw === 'null' || raw === '""') return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(u => typeof u === 'string' && u.trim().length > 0).map(u => u.trim());
    } else if (typeof parsed === 'string' && parsed.trim().length > 0) {
      return [parsed.trim()];
    }
  } catch {
    // If not JSON, check if it's a comma separated or single URL
    if (raw.startsWith('http') || raw.startsWith('/')) {
      return [raw.trim()];
    }
  }
  return [];
}

function getFormat(url) {
  if (url.startsWith('data:image/')) {
    const ext = url.split(';')[0].replace('data:image/', '').toLowerCase();
    return `base64 (${ext})`;
  }
  const cleanUrl = url.split('?')[0].toLowerCase();
  if (cleanUrl.endsWith('.webp')) return 'webp';
  if (cleanUrl.endsWith('.jpg') || cleanUrl.endsWith('.jpeg')) return 'jpg/jpeg';
  if (cleanUrl.endsWith('.png')) return 'png';
  if (cleanUrl.endsWith('.gif')) return 'gif';
  if (cleanUrl.endsWith('.svg')) return 'svg';
  if (cleanUrl.endsWith('.bmp')) return 'bmp';
  if (cleanUrl.endsWith('.tiff') || cleanUrl.endsWith('.tif')) return 'tiff';
  return 'outro/sem_extensao';
}

function getDomain(url) {
  if (url.startsWith('data:image/')) return 'inline_base64';
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return 'caminho_local_ou_invalido';
  }
}

// Counters and stats
let questionsWithAnyImage = 0;
let questionsWithColImages = 0;
let questionsWithStmtImages = 0;
let questionsWithOptsImages = 0;

let totalImagesFound = 0;
let distinctImageUrls = new Set();

let imagesLocation = {
  statementOnly: 0,
  optionsOnly: 0,
  bothStmtAndOpts: 0,
  colOnly: 0, // only in images column, not in text
  inTextAndCol: 0
};

let imageFormats = {};
let imageDomains = {};

let imagesPerQuestionDist = {
  0: 0,
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  '6+': 0
};

// Missing image analysis
let questionsWithMissingClues = 0; // statement has image text clue, but 0 images found
let questionsWithOptionsVerImagemNoImg = 0; // option says (VER IMAGEM), but no image
let missingClueSamples = [];
let optionsMissingSamples = [];

// Sample watermarked / domain suspect
let suspiciousDomains = {};

// Process in batches
const BATCH_SIZE = 50000;
let offset = 0;

console.log('Lendo dados em lotes...');

while (true) {
  const rows = db.prepare(`
    SELECT id, code, institution, banca, year, statement, options, images
    FROM questions_curated_staging
    LIMIT ${BATCH_SIZE} OFFSET ${offset}
  `).all();

  if (rows.length === 0) break;

  for (const r of rows) {
    const colImgs = parseImagesColumn(r.images);
    const stmtImgs = extractImagesFromText(r.statement);

    // Options analysis
    const optsImgs = [];
    let hasVerImagemInOpts = false;
    let hasOptWithNoImgWhenExpected = false;

    if (r.options) {
      try {
        const opts = typeof r.options === 'string' ? JSON.parse(r.options) : r.options;
        if (Array.isArray(opts)) {
          for (const opt of opts) {
            const optText = opt.text || '';
            if (/\(ver\s+imagem\)|\[ver\s+imagem\]/i.test(optText)) {
              hasVerImagemInOpts = true;
            }
            // Check images property inside option
            if (Array.isArray(opt.images) && opt.images.length > 0) {
              for (const imgItem of opt.images) {
                if (typeof imgItem === 'string' && imgItem.trim().length > 0) {
                  optsImgs.push(imgItem.trim());
                } else if (imgItem && typeof imgItem === 'object' && imgItem.url) {
                  optsImgs.push(imgItem.url.trim());
                }
              }
            } else if (hasVerImagemInOpts) {
              hasOptWithNoImgWhenExpected = true;
            }

            // Also check text inside option for markdown/html images
            const imgsInOptText = extractImagesFromText(optText);
            for (const img of imgsInOptText) {
              optsImgs.push(img);
            }
          }
        }
      } catch (e) {
        // parse error
      }
    }

    // Combine all distinct images for this question
    const allQImgs = new Set([...colImgs, ...stmtImgs, ...optsImgs]);
    const qImgCount = allQImgs.size;

    if (qImgCount === 0) {
      imagesPerQuestionDist[0]++;

      // Check if statement clues suggest an image was supposed to be here!
      let hasClue = false;
      let matchedClue = '';
      if (r.statement) {
        for (const clueRegex of CLINICAL_IMG_CLUES) {
          const match = clueRegex.exec(r.statement);
          if (match) {
            hasClue = true;
            matchedClue = match[0];
            break;
          }
        }
      }

      if (hasClue) {
        questionsWithMissingClues++;
        if (missingClueSamples.length < 15) {
          missingClueSamples.push({
            id: r.id,
            banca: r.banca,
            institution: r.institution,
            year: r.year,
            clue: matchedClue,
            snippet: r.statement.slice(0, 200) + '...'
          });
        }
      }

      if (hasVerImagemInOpts) {
        questionsWithOptionsVerImagemNoImg++;
        if (optionsMissingSamples.length < 15) {
          optionsMissingSamples.push({
            id: r.id,
            banca: r.banca,
            institution: r.institution,
            year: r.year,
            snippet: r.statement.slice(0, 150) + '...'
          });
        }
      }

    } else {
      questionsWithAnyImage++;
      if (colImgs.length > 0) questionsWithColImages++;
      if (stmtImgs.length > 0) questionsWithStmtImages++;
      if (optsImgs.length > 0) questionsWithOptsImages++;

      if (stmtImgs.length > 0 && optsImgs.length > 0) {
        imagesLocation.bothStmtAndOpts++;
      } else if (stmtImgs.length > 0) {
        imagesLocation.statementOnly++;
      } else if (optsImgs.length > 0) {
        imagesLocation.optionsOnly++;
      }

      if (colImgs.length > 0 && stmtImgs.length === 0 && optsImgs.length === 0) {
        imagesLocation.colOnly++;
      } else if (colImgs.length > 0 && (stmtImgs.length > 0 || optsImgs.length > 0)) {
        imagesLocation.inTextAndCol++;
      }

      if (qImgCount === 1) imagesPerQuestionDist[1]++;
      else if (qImgCount === 2) imagesPerQuestionDist[2]++;
      else if (qImgCount === 3) imagesPerQuestionDist[3]++;
      else if (qImgCount === 4) imagesPerQuestionDist[4]++;
      else if (qImgCount === 5) imagesPerQuestionDist[5]++;
      else imagesPerQuestionDist['6+']++;

      totalImagesFound += qImgCount;

      for (const imgUrl of allQImgs) {
        distinctImageUrls.add(imgUrl);

        const fmt = getFormat(imgUrl);
        imageFormats[fmt] = (imageFormats[fmt] || 0) + 1;

        const dom = getDomain(imgUrl);
        imageDomains[dom] = (imageDomains[dom] || 0) + 1;
      }
    }
  }

  offset += BATCH_SIZE;
  console.log(`Processados ${Math.min(offset, totalQuestions).toLocaleString('pt-BR')} / ${totalQuestions.toLocaleString('pt-BR')}...`);
}

// Check provaderesidencia_imagens_arquivo linkability
console.log('Cruzando com provaderesidencia_imagens_arquivo...');
const pdrImgsCount = db.prepare('SELECT count(*) as c FROM provaderesidencia_imagens_arquivo').get().c;
const pdrQuestionsWithImg = db.prepare('SELECT count(DISTINCT questao_id) as c FROM provaderesidencia_imagens_arquivo').get().c;

// Check how many pdr_ IDs in staging can be resolved by questao_id
const pdrStagingCount = db.prepare("SELECT count(*) as c FROM questions_curated_staging WHERE id LIKE 'pdr_%'").get().c;

const pdrMatched = db.prepare(`
  SELECT count(DISTINCT s.id) as c
  FROM questions_curated_staging s
  JOIN provaderesidencia_imagens_arquivo img
    ON s.id = 'pdr_' || img.questao_id
`).get().c;

const report = {
  timestamp: new Date().toISOString(),
  totalQuestions,
  questionsWithAnyImage,
  pctQuestionsWithAnyImage: ((questionsWithAnyImage / totalQuestions) * 100).toFixed(2) + '%',
  totalImageOccurrences: totalImagesFound,
  distinctImageUrls: distinctImageUrls.size,
  breakdownByColumnAndText: {
    questionsWithColImages,
    questionsWithStmtImages,
    questionsWithOptsImages,
    locationDistribution: imagesLocation
  },
  imagesPerQuestionDistribution: imagesPerQuestionDist,
  formatsBreakdown: imageFormats,
  domainsBreakdown: imageDomains,
  missingImagesAudit: {
    questionsWithMissingCluesInStatement: questionsWithMissingClues,
    questionsWithOptionsVerImagemNoImg: questionsWithOptionsVerImagemNoImg,
    missingClueSamples,
    optionsMissingSamples
  },
  provaderesidenciaArchive: {
    totalArchiveImages: pdrImgsCount,
    distinctArchiveQuestions: pdrQuestionsWithImg,
    pdrQuestionsInStaging: pdrStagingCount,
    stagingQuestionsMatchedDirectly: pdrMatched
  }
};

const outReportPath = path.resolve('data/supabase_tables/staging_images_deep_report.json');
fs.writeFileSync(outReportPath, JSON.stringify(report, null, 2), 'utf-8');

console.log('='.repeat(80));
console.log('AUDITORIA CONCLUÍDA COM SUCESSO!');
console.log(`Relatório salvo em: ${outReportPath}`);
console.log('='.repeat(80));
console.log(`Questões com imagem: ${questionsWithAnyImage.toLocaleString('pt-BR')} (${report.pctQuestionsWithAnyImage})`);
console.log(`Total de ocorrências de imagem: ${totalImagesFound.toLocaleString('pt-BR')}`);
console.log(`URLs de imagem distintas: ${distinctImageUrls.size.toLocaleString('pt-BR')}`);
console.log(`Formatos:`, imageFormats);
console.log(`Principais Domínios:`, Object.entries(imageDomains).sort((a,b) => b[1] - a[1]).slice(0, 10));
console.log(`Questões com indícios de imagem faltante no enunciado: ${questionsWithMissingClues.toLocaleString('pt-BR')}`);
console.log(`Questões com '(VER IMAGEM)' nas alternativas sem imagem: ${questionsWithOptionsVerImagemNoImg.toLocaleString('pt-BR')}`);
console.log(`Imagens arquivadas em provaderesidencia_imagens_arquivo: ${pdrImgsCount} (casam com ${pdrMatched} questões pdr_ da staging)`);

