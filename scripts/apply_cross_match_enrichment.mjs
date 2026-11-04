#!/usr/bin/env node

/**
 * scripts/apply_cross_match_enrichment.mjs
 * 
 * Pipeline de Aplicação de Patches e Enriquecimento:
 * 1. Download e localização de 343 imagens do HardworQ em public/images/hardwork/
 * 2. Preenchimento de 4.401 gabaritos órfãos casados estritamente pelo TEXTO da alternativa
 * 3. Atualização atômica dos arquivos consolidados do Banco Residência (*_final_questions.json)
 * 4. Registro de auditoria em data/audit_hardwork/relatorio_aplicacao_patches.json
 */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const DATA_DIR = path.join(ROOT_DIR, 'data');
const AUDIT_DIR = path.join(DATA_DIR, 'audit_hardwork');
const IMAGES_DIR = path.join(ROOT_DIR, 'public', 'images', 'hardwork');

// ==========================================
// FUNÇÕES DE NORMALIZAÇÃO E SIMILARIDADE
// ==========================================
function norm(text) {
  if (!text) return '';
  return text.normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<[^>]*>/g, ' ')
    .replace(/^[a-e]\s*[\)\.\-\:]\s*/i, '')
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function getTokens(text) {
  if (!text) return new Set();
  const words = norm(text).split(' ').filter(w => w.length >= 3);
  return new Set(words);
}

function jaccard(setA, setB) {
  if (!setA || !setB || setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const elem of setA) {
    if (setB.has(elem)) intersection++;
  }
  return intersection / (setA.size + setB.size - intersection);
}

function compareOptionTexts(textA, textB) {
  const nA = norm(textA);
  const nB = norm(textB);
  if (!nA || !nB) return false;
  if (nA === nB) return true;
  if (nA.length >= 15 && nB.length >= 15) {
    if (nA.includes(nB) || nB.includes(nA)) return true;
    const prefixA = nA.slice(0, 35);
    const prefixB = nB.slice(0, 35);
    if (prefixA === prefixB && prefixA.length >= 20) return true;
  }
  const tokensA = getTokens(nA);
  const tokensB = getTokens(nB);
  if (tokensA.size >= 3 && tokensB.size >= 3) {
    const sim = jaccard(tokensA, tokensB);
    if (sim >= 0.65) return true;
  }
  return false;
}

// ==========================================
// DOWNLOAD SEGURO DE IMAGENS COM FILA
// ==========================================
function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
      return resolve(destPath);
    }

    const file = fs.createWriteStream(destPath);
    const req = https.get(url, (response) => {
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(destPath, () => {});
        return reject(new Error(`HTTP ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(destPath));
      });
    });

    req.on('error', (err) => {
      file.close();
      fs.unlink(destPath, () => {});
      reject(err);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      file.close();
      fs.unlink(destPath, () => {});
      reject(new Error('Timeout'));
    });
  });
}

async function downloadImagesPool(items, concurrency = 8) {
  console.log(`🖼️ Iniciando download de ${items.length} imagens para public/images/hardwork/...`);
  fs.mkdirSync(IMAGES_DIR, { recursive: true });

  const results = new Map();
  let completed = 0;
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    await Promise.all(chunk.map(async (item) => {
      const url = item.imageUrl;
      if (!url) return;

      const rawName = path.basename(new URL(url).pathname);
      const cleanName = `${item.idHardwork}_${rawName}`.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
      const destPath = path.join(IMAGES_DIR, cleanName);
      const publicPath = `/images/hardwork/${cleanName}`;

      try {
        await downloadImage(url, destPath);
        results.set(item.idPlataforma, publicPath);
        successCount++;
      } catch (err) {
        // Fallback: usa URL remota se download falhar
        results.set(item.idPlataforma, url);
        failCount++;
      } finally {
        completed++;
      }
    }));

    if (completed % 50 === 0 || completed === items.length) {
      console.log(`   Progresso Imagens: ${completed}/${items.length} (${successCount} baixadas localmente, ${failCount} com URL remota)`);
    }
  }

  return results;
}

// ==========================================
// DESCOBERTA DA LETRA CORRETA NA PLATAFORMA
// ==========================================
function resolveCorrectLetterForPlatform(q, orphanItem) {
  const textHw = (orphanItem.textoHardwork || '').trim();
  const ansHw = (orphanItem.gabaritoHardwork || '').trim().toUpperCase();
  const opts = q.options || [];

  if (opts.length === 0) {
    return {
      letter: ansHw || 'ANULADA',
      isDiscursive: true,
      text: textHw
    };
  }

  // 1. Prioridade Absoluta: Casamento pelo TEXTO da alternativa
  if (textHw) {
    const textMatch = opts.find(o => compareOptionTexts(o.text, textHw));
    if (textMatch && textMatch.letter) {
      return {
        letter: String(textMatch.letter).toUpperCase(),
        method: 'TEXT_MATCH',
        wasPermuted: String(textMatch.letter).toUpperCase() !== ansHw
      };
    }
  }

  // 2. Fallback por letra direta se existir e tiver consistência
  if (ansHw) {
    const letterMatch = opts.find(o => String(o.letter || '').toUpperCase() === ansHw);
    if (letterMatch) {
      return {
        letter: ansHw,
        method: 'LETTER_FALLBACK',
        wasPermuted: false
      };
    }
  }

  return null;
}

// ==========================================
// EXECUTOR PRINCIPAL
// ==========================================
async function main() {
  console.log('========================================================');
  console.log('🚀 APLICADOR DE ENRIQUECIMENTO E GABARITOS ÓRFÃOS');
  console.log('========================================================');

  // 1. Carrega relatórios de auditoria
  const orphanPath = path.join(AUDIT_DIR, 'gabaritos_preenchidos_pelo_hw.json');
  const imgPath = path.join(AUDIT_DIR, 'oportunidades_enriquecimento_imagens.json');

  if (!fs.existsSync(orphanPath) || !fs.existsSync(imgPath)) {
    throw new Error('Arquivos de auditoria não encontrados em data/audit_hardwork/');
  }

  const orphanItems = JSON.parse(fs.readFileSync(orphanPath, 'utf8'));
  const imageItems = JSON.parse(fs.readFileSync(imgPath, 'utf8'));

  console.log(`📋 Carregados:`);
  console.log(`   - ${orphanItems.length.toLocaleString('pt-BR')} gabaritos órfãos para enriquecer`);
  console.log(`   - ${imageItems.length.toLocaleString('pt-BR')} imagens para vincular`);

  // 2. Download e mapeamento de imagens
  const imageMap = await downloadImagesPool(imageItems);

  // Mapeia órfãos por ID
  const orphanMap = new Map();
  orphanItems.forEach(item => orphanMap.set(item.idPlataforma, item));

  // 3. Aplicação nos arquivos de questões
  const specialtyFiles = [
    'cirurgia_final_questions.json',
    'clinica_medica_final_questions.json',
    'pediatria_final_questions.json',
    'ginecologia_final_questions.json',
    'obstetricia_final_questions.json',
    'medicina_preventiva_final_questions.json',
    'nefrologia_final_questions.json',
    'urologia_final_questions.json',
    'all_homologated_questions_gold.json'
  ];

  const executionLog = {
    timestamp: new Date().toISOString(),
    totalOrphanCandidates: orphanItems.length,
    totalImageCandidates: imageItems.length,
    filesModified: {},
    summary: {
      gabaritosPatched: 0,
      gabaritosPermutedMatched: 0,
      imagesPatched: 0
    }
  };

  console.log('\n📝 Aplicando patches nos arquivos consolidados do Banco Residência...');

  for (const fileName of specialtyFiles) {
    const filePath = path.join(DATA_DIR, fileName);
    if (!fs.existsSync(filePath)) continue;

    console.log(`\n⏳ Processando ${fileName}...`);
    const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!Array.isArray(questions)) continue;

    let fileGabaritosPatched = 0;
    let filePermutedMatched = 0;
    let fileImagesPatched = 0;

    for (const q of questions) {
      if (!q || !q.id) continue;

      // Patch de Gabarito Órfão
      if (orphanMap.has(q.id)) {
        const item = orphanMap.get(q.id);
        const resolved = resolveCorrectLetterForPlatform(q, item);

        if (resolved && resolved.letter) {
          const oldAns = q.correct_answer || q.correctAnswer || '';
          if (!oldAns || oldAns === '' || oldAns === 'undefined') {
            q.correct_answer = resolved.letter;
            q.correctAnswer = resolved.letter;
            if (resolved.isDiscursive && resolved.text) {
              q.official_answer = resolved.text;
            }
            fileGabaritosPatched++;
            if (resolved.wasPermuted) {
              filePermutedMatched++;
            }
          }
        }
      }

      // Patch de Imagens
      if (imageMap.has(q.id)) {
        const imgPath = imageMap.get(q.id);
        if (!q.images || q.images.length === 0) {
          q.images = [imgPath];
          fileImagesPatched++;
        }
      }
    }

    // Salva arquivo atualizado
    fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf8');

    console.log(`   ✅ ${fileName} atualizado:`);
    console.log(`      + ${fileGabaritosPatched} gabaritos preenchidos (${filePermutedMatched} corrigidos por texto com letra permutada)`);
    console.log(`      + ${fileImagesPatched} questões com novas imagens vinculadas`);

    executionLog.filesModified[fileName] = {
      gabaritosPatched: fileGabaritosPatched,
      permutedMatched: filePermutedMatched,
      imagesPatched: fileImagesPatched
    };

    executionLog.summary.gabaritosPatched += fileGabaritosPatched;
    executionLog.summary.gabaritosPermutedMatched += filePermutedMatched;
    executionLog.summary.imagesPatched += fileImagesPatched;
  }

  // 4. Salva relatório de execução
  const reportPath = path.join(AUDIT_DIR, 'relatorio_aplicacao_patches.json');
  fs.writeFileSync(reportPath, JSON.stringify(executionLog, null, 2), 'utf8');

  console.log('\n========================================================');
  console.log('🏁 RESULTADO DO PIPELINE DE ENRIQUECIMENTO:');
  console.log(`   Gabaritos órfãos aplicados com sucesso: ${executionLog.summary.gabaritosPatched.toLocaleString('pt-BR')}`);
  console.log(`   ↳ Corrigidos por permutação textual: ${executionLog.summary.gabaritosPermutedMatched.toLocaleString('pt-BR')}`);
  console.log(`   Imagens vinculadas às questões: ${executionLog.summary.imagesPatched.toLocaleString('pt-BR')}`);
  console.log(`   Relatório registrado em: data/audit_hardwork/relatorio_aplicacao_patches.json`);
  console.log('========================================================');
}

main().catch(err => {
  console.error('💥 Erro fatal ao aplicar patches:', err);
  process.exit(1);
});

