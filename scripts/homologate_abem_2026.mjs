import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
import { createClient } from '@supabase/supabase-js';

const WRITE_TO_SUPABASE = false; // MODO SEGURO: STAGING PURO
const SIMILARITY_THRESHOLD = 0.85; // DUPLA TRAVA >= 85%

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function cleanText(txt) {
  if (!txt) return '';
  return txt
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/["'“”«»]/g, ' ')
    .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
}

function calculateJaccard(s1, s2) {
  const words1 = new Set(cleanText(s1).split(' ').filter(w => w.length > 2));
  const words2 = new Set(cleanText(s2).split(' ').filter(w => w.length > 2));
  if (words1.size === 0 || words2.size === 0) return 0;
  let intersection = 0;
  for (const w of words1) {
    if (words2.has(w)) intersection++;
  }
  const union = new Set([...words1, ...words2]).size;
  return union === 0 ? 0 : intersection / union;
}

function getBiGrams(str) {
  const s = cleanText(str).replace(/\s+/g, '');
  const bigrams = new Set();
  for (let i = 0; i < s.length - 1; i++) {
    bigrams.add(s.slice(i, i + 2));
  }
  return bigrams;
}

function calculateSimilarity(s1, s2) {
  const jaccard = calculateJaccard(s1, s2);
  const bg1 = getBiGrams(s1);
  const bg2 = getBiGrams(s2);
  if (bg1.size === 0 || bg2.size === 0) return jaccard;
  let inter = 0;
  for (const bg of bg1) {
    if (bg2.has(bg)) inter++;
  }
  const bgSim = (2.0 * inter) / (bg1.size + bg2.size);
  return (jaccard * 0.4) + (bgSim * 0.6);
}

async function parseExamPdf2026(pdfPath) {
  const buf = new Uint8Array(fs.readFileSync(pdfPath));
  const p = new PDFParse({ data: buf });
  await p.load();
  let rawText = (await p.getText()).text || await p.getText();

  // Limpa números de página e rodapés ANTES de fatiar as questões
  rawText = rawText.replace(/--\s*\d+\s*of\s*\d+\s*--/gi, '');

  const qRegex = /Quest[aã]o\s+(\d{1,3})\s*[-–]\s*([^\n]+)/gi;
  const matches = [...rawText.matchAll(qRegex)];
  
  const parsed = [];
  for (let i = 0; i < matches.length; i++) {
    const startIdx = matches[i].index + matches[i][0].length;
    const endIdx = (i < matches.length - 1) ? matches[i+1].index : rawText.length;
    const block = rawText.slice(startIdx, endIdx);
    
    // Procura as alternativas A), B), C), D)
    const optRegex = /(?:^|\n|\s)([A-D])\)\s+([\s\S]*?)(?=(?:(?:\n|\s)[A-D]\)|$))/g;
    const optMatches = [...block.matchAll(optRegex)];
    
    const firstOptIdx = optMatches.length > 0 ? optMatches[0].index : block.length;
    const statement = block.slice(0, firstOptIdx).trim();
    
    const options = optMatches.map(m => ({
      letter: m[1].toUpperCase(),
      text: m[2].replace(/\s+/g, ' ').trim()
    }));

    parsed.push({
      num: parseInt(matches[i][1], 10),
      especialidade: matches[i][2].trim(),
      statement: statement.replace(/\s+/g, ' '),
      options
    });
  }
  return parsed;
}

async function main() {
  console.log('=== HOMOLOGAÇÃO ABEM 2026 (DUPLA TRAVA >= 85%) ===');
  
  // 1. Carrega gabaritos oficiais extraídos do XLSX
  const allGabs = JSON.parse(fs.readFileSync('data/abem_gabaritos_2024_2025_2026.json', 'utf8'));
  const gabs2026 = allGabs['2026'];
  console.log(`Gabaritos 2026 carregados: ${Object.keys(gabs2026).length} questões.`);

  // 2. Extrai questões do caderno oficial PDF 2026
  const pdfPath = 'C:/Users/cnath/.gemini/antigravity/brain/9618f204-3788-45d2-8b60-26cb27d0dbd1/.user_uploaded/media_1794604731740_a22389df.pdf';
  console.log(`Lendo caderno oficial 2026 de ${pdfPath}...`);
  const examQuestions = await parseExamPdf2026(pdfPath);
  console.log(`Questões extraídas do caderno: ${examQuestions.length}`);

  // 3. Busca as 96 pendentes no Supabase
  const { data: dbQuestions, error } = await supabase
    .from('questions')
    .select('id, code, year, institution, statement, options, correct_answer')
    .or('institution.ilike.%ABEM%,institution.ilike.%Progresso%,code.ilike.%TPN%,code.ilike.%ABEM%')
    .or('correct_answer.is.null,correct_answer.eq.');

  if (error) {
    console.error('Erro ao buscar do Supabase:', error);
    return;
  }
  console.log(`Questões pendentes no Supabase para homologação: ${dbQuestions.length}`);

  const homologadas = [];
  const naoEncontradas = [];

  for (const dbQ of dbQuestions) {
    let bestMatch = null;
    let highestSim = 0;

    for (const exQ of examQuestions) {
      const sim = calculateSimilarity(dbQ.statement, exQ.statement);
      if (sim > highestSim) {
        highestSim = sim;
        bestMatch = exQ;
      }
    }

    if (!bestMatch || highestSim < SIMILARITY_THRESHOLD) {
      naoEncontradas.push({
        id: dbQ.id,
        code: dbQ.code,
        highestSim,
        statement: dbQ.statement ? dbQ.statement.slice(0, 100) : ''
      });
      continue;
    }

    // Trava 1 passou! Agora Trava 2 (Anti-Permutação de Alternativas)
    const gabEntry = gabs2026[bestMatch.num];
    if (!gabEntry) {
      console.warn(`Questão ${bestMatch.num} sem gabarito correspondente no XLSX!`);
      continue;
    }

    // Texto da alternativa vencedora oficial (do gabarito ou do PDF)
    let officialWinText = gabEntry.opt_text;
    if (!officialWinText) {
      const winOpt = bestMatch.options.find(o => o.letter === gabEntry.letter);
      if (winOpt) officialWinText = winOpt.text;
    }

    // Encontra qual alternativa do Supabase corresponde ao texto da vencedora
    let bestOptSim = 0;
    let matchedDbLetter = null;
    let matchedDbOptText = null;

    if (Array.isArray(dbQ.options)) {
      for (const opt of dbQ.options) {
        const oText = opt.text || opt.descricao || '';
        const oSim = calculateSimilarity(officialWinText, oText);
        if (oSim > bestOptSim) {
          bestOptSim = oSim;
          matchedDbLetter = opt.letter;
          matchedDbOptText = oText;
        }
      }
    }

    if (bestOptSim >= SIMILARITY_THRESHOLD && matchedDbLetter) {
      homologadas.push({
        id: dbQ.id,
        code: dbQ.code,
        year: dbQ.year,
        numOficial: bestMatch.num,
        gabaritoOficial: gabEntry.letter,
        gabaritoDb: matchedDbLetter,
        permutou: gabEntry.letter !== matchedDbLetter,
        simEnunciado: parseFloat(highestSim.toFixed(4)),
        simAlternativa: parseFloat(bestOptSim.toFixed(4)),
        enunciadoDbSnippet: dbQ.statement ? dbQ.statement.slice(0, 120) : '',
        textoAlternativaDbSnippet: matchedDbOptText ? matchedDbOptText.slice(0, 100) : '',
        comentarioOficial: gabEntry.commentary ? gabEntry.commentary.slice(0, 200) + '...' : ''
      });
    } else {
      naoEncontradas.push({
        id: dbQ.id,
        code: dbQ.code,
        reason: 'Falha na Trava 2 (Alternativa)',
        simEnunciado: highestSim,
        bestOptSim,
        statement: dbQ.statement ? dbQ.statement.slice(0, 100) : ''
      });
    }
  }

  console.log(`\n========================================================`);
  console.log(`RESULTADO DA HOMOLOGAÇÃO:`);
  console.log(`Total analisadas: ${dbQuestions.length}`);
  console.log(`Total homologadas com Dupla Trava >= 85%: ${homologadas.length}`);
  console.log(`Permutações de alternativas detectadas e corrigidas: ${homologadas.filter(h => h.permutou).length}`);
  console.log(`Não homologadas / sob suspeita: ${naoEncontradas.length}`);
  console.log(`========================================================\n`);

  // Salva no staging local
  const stagingFile = 'data/staging_abem_homologados.json';
  fs.writeFileSync(stagingFile, JSON.stringify({
    data: new Date().toISOString(),
    regra: "DUPLA_TRAVA_GE_85",
    totalHomologadas: homologadas.length,
    homologadas,
    naoEncontradas
  }, null, 2), 'utf8');
  console.log(`Staging salvo em ${stagingFile}`);

  if (homologadas.length > 0) {
    console.log('\nAmostra de 5 homologações:');
    homologadas.slice(0, 5).forEach((h, idx) => {
      console.log(`\n[${idx + 1}] ${h.code} (Q${h.numOficial})`);
      console.log(`  Enunciado: "${h.enunciadoDbSnippet}..."`);
      console.log(`  Gabarito Oficial: ${h.gabaritoOficial} | Gabarito DB: ${h.gabaritoDb} ${h.permutou ? '(PERMUTAÇÃO CORRIGIDA!)' : ''}`);
      console.log(`  Alternativa DB: "${h.textoAlternativaDbSnippet}..."`);
      console.log(`  Similaridade Enunciado: ${(h.simEnunciado * 100).toFixed(1)}% | Alternativa: ${(h.simAlternativa * 100).toFixed(1)}%`);
    });
  }
}

main().catch(console.error);
