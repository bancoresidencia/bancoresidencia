import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { PDFParse } from 'pdf-parse';

const INCOMING_DIR = path.resolve('data/incoming_exams');
const PROCESSED_DIR = path.join(INCOMING_DIR, 'processed');
const STAGING_PATH = path.resolve('data/staging_homologados_85pct.json');

if (!fs.existsSync(PROCESSED_DIR)) fs.mkdirSync(PROCESSED_DIR, { recursive: true });

// Carrega variáveis
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

function calculateJaccard(s1, s2) {
  const w1 = new Set(cleanLexical(s1).split(' ').filter(w => w.length > 2));
  const w2 = new Set(cleanLexical(s2).split(' ').filter(w => w.length > 2));
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
  // Formato tabela: números em uma linha, letras na linha de baixo
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

  // Formato inline padrão: "01 A" ou "1) A" ou "1 - A" ou "Questão 1: A"
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
  const qMatches = [];
  const qRegex = /(?:^|\n)\s*(?:QUEST[ÃA]O\s+|Quest[ãa]o\s+)?(\b\d{1,3}\b)\s*[\.\-\)]\s+/gi;
  let qm;
  while ((qm = qRegex.exec(text)) !== null) {
    const num = parseInt(qm[1], 10);
    if (num >= 1 && num <= 120) {
      qMatches.push({ qNum: num, index: qm.index });
    }
  }

  const questions = [];
  for (let i = 0; i < qMatches.length; i++) {
    const qNum = qMatches[i].qNum;
    const s = qMatches[i].index;
    const e = i + 1 < qMatches.length ? qMatches[i+1].index : text.length;
    const qBody = text.slice(s, e);
    const stmt = qBody
      .split(/(?:^|\n)\s*(?:\([a-e]\)|[a-e]\s*[\)\.\-])/i)[0]
      .replace(/^\s*(?:QUEST[ÃA]O\s+|Quest[ãa]o\s+)?\d{1,3}\s*[\.\-\)]\s*/i, '')
      .trim();

    const optRegex = /(?:^|\n)\s*(?:\(([a-e])\)|([a-e])\s*[\)\.\-])\s+([^\n\r]+)/gi;
    const opts = [];
    let om;
    while ((om = optRegex.exec(qBody)) !== null) {
      const letter = (om[1] || om[2]).toUpperCase();
      opts.push({ letter, text: om[3].trim() });
    }

    questions.push({ qNum, statement: stmt, options: opts, rawBody: qBody });
  }
  return questions;
}

async function processDropFolder() {
  const files = fs.readdirSync(INCOMING_DIR).filter(f => f.endsWith('.pdf'));
  if (files.length === 0) {
    console.log(`[Drop Folder] Nenhum PDF pendente em ${INCOMING_DIR}.`);
    return 0;
  }

  console.log(`[Drop Folder] Detectados ${files.length} arquivo(s) PDF para ingestão em lote!`);

  // Agrupar arquivos por prova e gabarito
  let staging = { ultimaAtualizacao: new Date().toISOString(), totalHomologados: 0, decisoes: [] };
  if (fs.existsSync(STAGING_PATH)) {
    staging = JSON.parse(fs.readFileSync(STAGING_PATH, 'utf8').replace(/^\uFEFF/, ''));
  }

  // Carrega pendências do Supabase
  const { data: pendingQuestions } = await supabase
    .from('questions')
    .select('id, code, year, statement, options, correct_answer')
    .or('correct_answer.is.null,correct_answer.eq.');

  console.log(`[Drop Folder] Pendências ativas no banco: ${pendingQuestions?.length || 0}`);

  let totalMatched = 0;
  for (const f of files) {
    const filePath = path.join(INCOMING_DIR, f);
    const text = await extractPdfText(filePath);
    if (!text || text.length < 50) continue;

    console.log(`\n📄 Processando: ${f} (${text.length} caracteres extraídos)`);

    // Detecta se é prova ou gabarito
    const isGabarito = /gabarito|retifica[cç][aã]o|ata de recursos/i.test(f) || /gabarito preliminar|gabarito definitivo/i.test(text.slice(0, 1000));
    
    if (isGabarito) {
      const ansMap = parseAnswerKey(text);
      console.log(`   🎯 Gabarito identificado com ${Object.keys(ansMap).length} respostas mapeadas.`);
      // Procura prova correspondente
      const baseName = f.replace(/gabarito|gb/gi, '').replace(/\.pdf$/, '').trim();
      const provaFile = files.find(x => x !== f && x.toLowerCase().includes(baseName.toLowerCase()));
      if (provaFile) {
        const pvText = await extractPdfText(path.join(INCOMING_DIR, provaFile));
        const parsedQs = parseExamQuestions(pvText);
        console.log(`   📚 Casando com caderno ${provaFile}: ${parsedQs.length} questões estruturadas.`);

        for (const pq of parsedQs) {
          const officialAns = ansMap[pq.qNum];
          if (!officialAns) continue;

          for (const qDb of pendingQuestions) {
            if (staging.decisoes.some(d => d.code === qDb.code)) continue;

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
                  caderno: f,
                  qNum: pq.qNum,
                  similaridadeEnunciado: Math.round(stmtSim * 1000) / 1000,
                  similaridadeAlternativa: Math.round(optSim * 1000) / 1000,
                  gabaritoOficialExtraido: officialAns,
                  gabaritoMapeadoNoBanco: officialAns,
                  foiRemapeado: false,
                  isAnulada: officialAns === 'ANULADA',
                  dataHomologacao: new Date().toISOString()
                });
                totalMatched++;
                console.log(`   ✅ [HOMOLOGADA] ${qDb.code} -> Q#${pq.qNum} GB=${officialAns} (Stmt: ${(stmtSim*100).toFixed(1)}%)`);
              }
            }
          }
        }
      }
    }
  }

  if (totalMatched > 0) {
    staging.totalHomologados = staging.decisoes.length;
    staging.ultimaAtualizacao = new Date().toISOString();
    fs.writeFileSync(STAGING_PATH, JSON.stringify(staging, null, 2));
    console.log(`\n🎉 Ingestão concluída: ${totalMatched} novas questões salvas em ${STAGING_PATH}`);
  }

  return totalMatched;
}

// Execução
const isWatchMode = process.argv.includes('--watch');

if (isWatchMode) {
  console.log(`👀 Monitorando ativamente a pasta ${INCOMING_DIR}...`);
  console.log('📌 Qualquer PDF salvo nesta pasta será ingerido e cruzado em tempo real!');
  fs.watch(INCOMING_DIR, (eventType, filename) => {
    if (filename && filename.endsWith('.pdf')) {
      console.log(`🔔 Evento detectado: ${filename} (${eventType}). Aguardando término do download...`);
      setTimeout(() => processDropFolder().catch(console.error), 2000);
    }
  });
} else {
  processDropFolder().catch(console.error);
}

