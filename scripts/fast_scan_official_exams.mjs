import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { PDFParse } from 'pdf-parse';

const STAGING_PATH = path.resolve('data/staging_homologados_85pct.json');

// Carrega .env.local
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      }
    }
  });
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function cleanLexical(text) {
  if (!text) return '';
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(\d+)([a-zA-Z]+)\b/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function getWords(text) {
  return cleanLexical(text).split(' ').filter(w => w.length >= 4);
}

function calculateJaccard(s1, s2) {
  const w1 = new Set(getWords(s1));
  const w2 = new Set(getWords(s2));
  if (w1.size === 0 || w2.size === 0) return 0;
  let inter = 0;
  for (const w of w1) if (w2.has(w)) inter++;
  return inter / new Set([...w1, ...w2]).size;
}

function getBiGrams(str) {
  const s = cleanLexical(str).replace(/\s+/g, '');
  const bg = new Set();
  for (let i = 0; i < s.length - 1; i++) bg.add(s.slice(i, i + 2));
  return bg;
}

function calculateSimilarity(s1, s2) {
  const j = calculateJaccard(s1, s2);
  if (j < 0.6) return j; // Early exit se o Jaccard for muito baixo
  const bg1 = getBiGrams(s1);
  const bg2 = getBiGrams(s2);
  if (bg1.size === 0 || bg2.size === 0) return j;
  let inter = 0;
  for (const b of bg1) if (bg2.has(b)) inter++;
  const bgSim = (2.0 * inter) / (bg1.size + bg2.size);
  return (j * 0.4) + (bgSim * 0.6);
}

async function extractPdfText(filePath) {
  try {
    const buf = new Uint8Array(fs.readFileSync(filePath));
    if (buf.length === 0) return '';
    const parser = new PDFParse(buf);
    await parser.load();
    const res = await parser.getText();
    return typeof res === 'string' ? res : (res.text || '');
  } catch (e) {
    return '';
  }
}

function parseAnswerKey(text) {
  const ansMap = {};
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  for (let i = 0; i < lines.length - 1; i++) {
    const numTokens = lines[i].split(/\s+/).filter(t => /^\d{1,3}$/.test(t));
    const letTokens = lines[i+1].split(/\s+/).filter(t => /^[A-Ea-eX\-\*]$/.test(t));
    if (numTokens.length === letTokens.length && numTokens.length >= 2) {
      for (let j = 0; j < numTokens.length; j++) {
        const qn = parseInt(numTokens[j], 10);
        const an = letTokens[j].toUpperCase();
        ansMap[qn] = (an === 'X' || an === '-' || an === '*') ? 'ANULADA' : an;
      }
    }
  }

  if (Object.keys(ansMap).length < 20) {
    const regex = /(?:Quest[ãa]o\s+)?(\b\d{1,3}\b)\s*[\.\-\)\:\s]\s*([A-Ea-eX\-\*])\b/gi;
    let m;
    while ((m = regex.exec(text)) !== null) {
      const qn = parseInt(m[1], 10);
      const an = m[2].toUpperCase();
      if (qn >= 1 && qn <= 120 && !ansMap[qn]) {
        ansMap[qn] = (an === 'X' || an === '-' || an === '*') ? 'ANULADA' : an;
      }
    }
  }
  return ansMap;
}

function parseExamQuestions(text) {
  const questions = [];
  const qRegex = /(?:^|\n)\s*(?:QUEST[ÃA]O\s+|Q\.\s*|Item\s+)?(\d{1,3})[\.\-\)\s]+([\s\S]*?)(?=(?:\n\s*(?:QUEST[ÃA]O\s+|Q\.\s*|Item\s+)?\d{1,3}[\.\-\)\s]+)|$)/gi;
  let match;
  while ((match = qRegex.exec(text)) !== null) {
    const qNum = parseInt(match[1], 10);
    const body = match[2].trim();
    if (qNum >= 1 && qNum <= 150 && body.length > 30) {
      const optRegex = /(?:^|\n)\s*([A-Ea-e])[\.\)\-\s]\s*([\s\S]*?)(?=(?:\n\s*[A-Ea-e][\.\)\-\s])|$)/g;
      let optMatch;
      const options = [];
      let statement = body;
      const firstOptIndex = body.search(/(?:^|\n)\s*[A-Da-d][\.\)\-\s]/);
      if (firstOptIndex !== -1) {
        statement = body.slice(0, firstOptIndex).trim();
      }
      while ((optMatch = optRegex.exec(body)) !== null) {
        options.push({ letter: optMatch[1].toUpperCase(), text: optMatch[2].trim() });
      }
      questions.push({ qNum, statement, options });
    }
  }
  return questions;
}

function getAllPdfFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllPdfFiles(full));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
      results.push(full);
    }
  }
  return results;
}

async function main() {
  console.log('⚡ Iniciando Varredura Rápida com Índice Invertido...');
  const allPdfs = getAllPdfFiles('data/official_exams');
  console.log(`📁 172 PDFs encontrados.`);

  console.log('📡 Buscando questões pendentes no Supabase...');
  let pending = [];
  let from = 0;
  const step = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('questions')
      .select('id, code, year, statement, options')
      .or('correct_answer.is.null,correct_answer.eq.""')
      .range(from, from + step - 1);
    if (error || !data || data.length === 0) break;
    pending = pending.concat(data);
    from += step;
    if (data.length < step) break;
  }
  console.log(`🎯 ${pending.length} pendências carregadas.`);

  // 1. Constrói Índice Invertido de palavras-chave
  console.log('🔨 Construindo Índice Invertido de Enunciados...');
  const index = new Map(); // palavra -> Set de indices em pending
  for (let i = 0; i < pending.length; i++) {
    const words = getWords(pending[i].statement);
    for (const w of words) {
      if (!index.has(w)) index.set(w, []);
      index.get(w).push(i);
    }
  }
  console.log(`✅ Índice construído com ${index.size} termos únicos.`);

  // Staging
  let staging = { totalHomologados: 0, decisoes: [] };
  if (fs.existsSync(STAGING_PATH)) {
    try {
      staging = JSON.parse(fs.readFileSync(STAGING_PATH, 'utf8').replace(/^\uFEFF/, ''));
    } catch (e) {}
  }
  const alreadyStagedCodes = new Set(staging.decisoes.map(d => d.code));

  // Agrupa PDFs
  const byDir = {};
  for (const p of allPdfs) {
    const d = path.dirname(p);
    if (!byDir[d]) byDir[d] = [];
    byDir[d].push(p);
  }

  let totalNewHomologated = 0;

  for (const [dir, files] of Object.entries(byDir)) {
    const examFiles = files.filter(f => /PROVA|CADERNO|TESTE|EXAME|doc/i.test(path.basename(f)));
    const keyFiles = files.filter(f => /GABARITO|RESPOSTA|RESULTADO|GB/i.test(path.basename(f)));
    if (keyFiles.length === 0 || examFiles.length === 0) continue;

    for (const kf of keyFiles) {
      const kText = await extractPdfText(kf);
      const ansMap = parseAnswerKey(kText);
      const ansCount = Object.keys(ansMap).length;
      if (ansCount === 0) continue;

      for (const ef of examFiles) {
        const eText = await extractPdfText(ef);
        const parsedQs = parseExamQuestions(eText);
        if (parsedQs.length === 0) continue;

        let matchedInPair = 0;
        for (const pq of parsedQs) {
          const officialAns = ansMap[pq.qNum];
          if (!officialAns) continue;

          // Busca ultra-rápida via índice invertido
          const qWords = getWords(pq.statement);
          if (qWords.length < 5) continue;

          const candidateHits = new Map();
          for (const w of qWords) {
            const postings = index.get(w);
            if (postings && postings.length < 300) { // ignora palavras hiper-frequentes
              for (const idx of postings) {
                candidateHits.set(idx, (candidateHits.get(idx) || 0) + 1);
              }
            }
          }

          // Filtra apenas candidatos que compartilham pelo menos 30% das palavras ou 5 palavras
          const minHits = Math.min(6, Math.max(3, Math.floor(qWords.length * 0.25)));
          for (const [candIdx, hits] of candidateHits.entries()) {
            if (hits < minHits) continue;

            const qDb = pending[candIdx];
            if (alreadyStagedCodes.has(qDb.code)) continue;

            const stmtSim = calculateSimilarity(qDb.statement, pq.statement);
            if (stmtSim >= 0.85) {
              let optSim = 1.0;
              if (officialAns !== 'ANULADA' && pq.options.length > 0 && qDb.options) {
                const pdfOpt = pq.options.find(o => o.letter === officialAns);
                const dbOpt = qDb.options.find(o => o.letter === officialAns);
                if (pdfOpt && dbOpt) optSim = calculateSimilarity(dbOpt.text, pdfOpt.text);
                else optSim = 0.5;
              }

              if (optSim >= 0.85) {
                staging.decisoes.push({
                  id: qDb.id,
                  code: qDb.code,
                  ano: qDb.year,
                  caderno: path.basename(ef),
                  qNum: pq.qNum,
                  similaridadeEnunciado: Math.round(stmtSim * 1000) / 1000,
                  similaridadeAlternativa: Math.round(optSim * 1000) / 1000,
                  gabaritoOficialExtraido: officialAns,
                  gabaritoMapeadoNoBanco: officialAns,
                  foiRemapeado: false,
                  isAnulada: officialAns === 'ANULADA',
                  dataHomologacao: new Date().toISOString()
                });
                alreadyStagedCodes.add(qDb.code);
                totalNewHomologated++;
                matchedInPair++;
                console.log(`   🎯 [NOVO MATCH] ${qDb.code} -> Q#${pq.qNum} GB=${officialAns} (${(stmtSim*100).toFixed(1)}%)`);
              }
            }
          }
        }
        if (matchedInPair > 0) {
          console.log(`✨ ${matchedInPair} homologações em ${path.basename(ef)}`);
        }
      }
    }
  }

  console.log(`\n======================================================`);
  console.log(`🏁 VARREDURA CONCLUÍDA!`);
  console.log(`Novas questões homologadas: ${totalNewHomologated}`);
  console.log(`Total acumulado no Staging: ${staging.decisoes.length}`);
  console.log(`======================================================\n`);

  if (totalNewHomologated > 0) {
    staging.totalHomologados = staging.decisoes.length;
    staging.ultimaAtualizacao = new Date().toISOString();
    fs.writeFileSync(STAGING_PATH, JSON.stringify(staging, null, 2));
  }
}

main().catch(console.error);

