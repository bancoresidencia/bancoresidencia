import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { createClient } from '@supabase/supabase-js';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const envPath = path.resolve('.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
        env[k] = v;
      }
    }
  });
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function normalizeText(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function textSimilarity(a, b) {
  const normA = normalizeText(a);
  const normB = normalizeText(b);
  if (!normA || !normB) return 0;
  if (normA === normB) return 1.0;
  
  const wordsA = new Set(normA.split(' ').filter(w => w.length > 2));
  const wordsB = new Set(normB.split(' ').filter(w => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersection = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) intersection++;
  }
  const union = new Set([...wordsA, ...wordsB]).size;
  return intersection / union;
}

// Parser UERJ: R1 R2 ... R100 seguido das letras
function parseUerjAnswerTable(text) {
  const map = {};
  const tokens = text.trim().split(/\s+/);
  const rIndices = [];
  for (let i = 0; i < tokens.length; i++) {
    const m = tokens[i].match(/^R(\d{1,3})$/i);
    if (m) rIndices.push({ num: parseInt(m[1], 10), tokenIdx: i });
  }
  if (rIndices.length >= 50) {
    const answersStart = rIndices[rIndices.length - 1].tokenIdx + 1;
    for (let i = 0; i < rIndices.length; i++) {
      const qNum = rIndices[i].num;
      const ansToken = (tokens[answersStart + i] || '').toUpperCase();
      if (['A', 'B', 'C', 'D', 'E'].includes(ansToken)) {
        map[qNum] = ansToken;
      } else if (ansToken === 'X' || ansToken === '*' || ansToken.includes('NUL')) {
        map[qNum] = 'ANULADA';
      }
    }
  }
  return map;
}

// Parser SES-GO: 01 02 03 ... / C B B D ...
function parseSesGoAnswerTable(text) {
  const map = {};
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  for (let i = 0; i < lines.length - 1; i++) {
    const numMatches = lines[i].match(/\b0?(\d{1,3})\b/g);
    const ansMatches = lines[i + 1].match(/\b([A-E]|X|\*|ANULADA)\b/g);
    if (numMatches && ansMatches && numMatches.length === ansMatches.length && numMatches.length >= 3) {
      for (let j = 0; j < numMatches.length; j++) {
        const num = parseInt(numMatches[j], 10);
        let ans = ansMatches[j].toUpperCase();
        if (ans === 'X' || ans === '*') ans = 'ANULADA';
        map[num] = ans;
      }
    }
  }
  return map;
}

// Slicing de Questões UERJ
function splitUerjExam(text) {
  const lines = text.split(/\r?\n/);
  const questions = [];
  let currentQ = null;

  for (const line of lines) {
    const qMatch = line.match(/^(\d{1,3})\)\s+(.+)$/);
    if (qMatch) {
      const qNum = parseInt(qMatch[1], 10);
      if (qNum >= 1 && qNum <= 100) {
        if (currentQ) questions.push(currentQ);
        currentQ = {
          num: qNum,
          statement: qMatch[2].trim(),
          options: {}
        };
        continue;
      }
    }

    if (currentQ) {
      const optMatch = line.match(/^([a-d])\)\s+(.+)$/i);
      if (optMatch) {
        currentQ.options[optMatch[1].toUpperCase()] = optMatch[2].trim();
      } else if (Object.keys(currentQ.options).length === 0) {
        currentQ.statement += ' ' + line.trim();
      }
    }
  }
  if (currentQ) questions.push(currentQ);

  return questions.filter(q => Object.keys(q.options).length >= 2);
}

// Slicing de Questões SES-GO
function splitSesGoExam(text) {
  const qSplits = text.split(/QUEST[AÃ]O\s+(\d{1,3})[\.\:\-\s]/i);
  const result = [];
  for (let i = 1; i < qSplits.length; i += 2) {
    const qNum = parseInt(qSplits[i], 10);
    const content = qSplits[i + 1] || '';
    
    const optMap = {};
    const optSplits = content.split(/\n\s*([A-D])[\.\:\-\)\s]\s*/i);
    for (let j = 1; j < optSplits.length; j += 2) {
      const letter = optSplits[j].toUpperCase();
      const optText = optSplits[j + 1]?.split(/\n\s*[A-D][\.\:\-\)\s]/i)[0]?.trim() || '';
      optMap[letter] = optText;
    }

    const statement = content.split(/\n\s*[A-D][\.\:\-\)\s]/i)[0]?.trim() || '';

    result.push({
      num: qNum,
      statement,
      options: optMap
    });
  }
  return result.filter(q => Object.keys(q.options).length >= 2);
}

// Validação semântica anti-permutação
function matchAlternativeSemantic(dbQuestion, officialAnsLetter, officialOptionText = null) {
  const opts = Array.isArray(dbQuestion.options) ? dbQuestion.options : [];
  if (opts.length === 0) {
    return { isValid: false, mappedLetter: null, reason: 'QUESTAO_SEM_OPCOES_NO_BANCO' };
  }

  if (officialAnsLetter === 'ANULADA') {
    return {
      isValid: true,
      mappedLetter: 'ANULADA',
      isAnulada: true,
      wasRemapped: false,
      confidence: 1.0,
      detail: 'Questão Oficialmente Anulada pela Banca'
    };
  }

  if (officialOptionText) {
    let bestMatchLetter = null;
    let maxSim = 0;

    for (const opt of opts) {
      const sim = textSimilarity(officialOptionText, opt.text || '');
      if (sim > maxSim) {
        maxSim = sim;
        bestMatchLetter = opt.letter;
      }
    }

    if (maxSim >= 0.70) {
      const wasRemapped = bestMatchLetter !== officialAnsLetter;
      return {
        isValid: true,
        mappedLetter: bestMatchLetter,
        isAnulada: false,
        wasRemapped,
        confidence: maxSim,
        detail: wasRemapped
          ? `⚠️ Remapeamento de segurança: Oficial '${officialAnsLetter}' -> No banco é '${bestMatchLetter}' (similaridade: ${(maxSim * 100).toFixed(1)}%)`
          : `Texto coincide com a letra '${bestMatchLetter}'`
      };
    }
  }

  const availableLetters = opts.map(o => (o.letter || '').toUpperCase().trim()).filter(Boolean);
  if (availableLetters.includes(officialAnsLetter)) {
    return {
      isValid: true,
      mappedLetter: officialAnsLetter,
      isAnulada: false,
      wasRemapped: false,
      confidence: 0.95,
      detail: `Letra oficial '${officialAnsLetter}' existe entre as alternativas disponíveis (${availableLetters.join(',')})`
    };
  } else {
    return {
      isValid: false,
      mappedLetter: null,
      reason: `LETRA_FORA_DAS_OPCOES (oficial: ${officialAnsLetter}, disponiveis: ${availableLetters.join(',')})`
    };
  }
}

const STAGING_PATH = path.resolve('data/coleta_gabaritos_staging.json');
function loadStaging() {
  if (fs.existsSync(STAGING_PATH)) {
    try {
      const st = JSON.parse(fs.readFileSync(STAGING_PATH, 'utf8'));
      st.meta = st.meta || {};
      st.decisoes = st.decisoes || [];
      return st;
    } catch (e) {}
  }
  return { meta: { totalHomologados: 0, totalRemapeados: 0, totalRejeitados: 0 }, decisoes: [] };
}
function saveStaging(st) {
  fs.writeFileSync(STAGING_PATH, JSON.stringify(st, null, 2), 'utf8');
}

async function extractPdfText(filePath) {
  const buf = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: buf });
  const parsed = await parser.getText();
  return parsed.text;
}

async function processCaderno({ banca, ano, provaPath, gabaritoPath, parserType }) {
  console.log(`\n========================================================================`);
  console.log(`🎯 PROCESSANDO: [${banca} — ${ano}] via arquivos oficiais locais`);
  console.log(`========================================================================`);

  if (!fs.existsSync(provaPath) || !fs.existsSync(gabaritoPath)) {
    console.log(`  ⚠️ Arquivos não encontrados para ${banca} ${ano}.`);
    return;
  }

  const staging = loadStaging();
  const processedIds = new Set(staging.decisoes.map(d => d.id));

  // 1. Busca pendências no Supabase
  const { data: dbQuestions, error } = await supabase
    .from('questions')
    .select('id, code, banca, institution, year, statement, options, correct_answer')
    .eq('is_anulada', false)
    .or('correct_answer.is.null,correct_answer.eq.')
    .eq('year', ano)
    .or(`banca.ilike.%${banca}%,institution.ilike.%${banca}%`);

  if (error || !dbQuestions || dbQuestions.length === 0) {
    console.log(`  ℹ️ Nenhuma questão pendente no banco para ${banca} ${ano}.`);
    return;
  }

  const pending = dbQuestions.filter(q => !processedIds.has(q.id));
  console.log(`  📦 Total de pendentes no banco: ${pending.length} (de ${dbQuestions.length} questões)`);
  if (pending.length === 0) {
    console.log(`  ✅ Todas já homologadas.`);
    return;
  }

  // 2. Extrai respostas
  const gText = await extractPdfText(gabaritoPath);
  const answerMap = parserType === 'UERJ' ? parseUerjAnswerTable(gText) : parseSesGoAnswerTable(gText);
  console.log(`  📋 Respostas oficiais extraídas: ${Object.keys(answerMap).length}`);

  // 3. Fatiamento de enunciados e opções
  const pText = await extractPdfText(provaPath);
  const examQuestions = parserType === 'UERJ' ? splitUerjExam(pText) : splitSesGoExam(pText);
  console.log(`  📖 Questões oficiais fatiadas: ${examQuestions.length}`);

  let matched = 0;
  let remapped = 0;
  let rejected = 0;

  for (const q of pending) {
    let matchedOfficialNum = null;
    let matchedOptionText = null;

    let maxSim = 0;
    for (const eq of examQuestions) {
      const sim = textSimilarity(q.statement, eq.statement);
      if (sim > maxSim) {
        maxSim = sim;
        if (sim >= 0.55) {
          matchedOfficialNum = eq.num;
          const offLetter = answerMap[eq.num];
          if (offLetter && eq.options && eq.options[offLetter]) {
            matchedOptionText = eq.options[offLetter];
          }
        }
      }
    }

    if (!matchedOfficialNum) {
      const m = (q.code || '').match(/-(\d{1,3})$/);
      matchedOfficialNum = m ? parseInt(m[1], 10) : null;
    }

    if (matchedOfficialNum && answerMap[matchedOfficialNum]) {
      const offLetter = answerMap[matchedOfficialNum];
      const matchResult = matchAlternativeSemantic(q, offLetter, matchedOptionText);

      if (matchResult.isValid) {
        matched++;
        if (matchResult.wasRemapped) {
          remapped++;
          console.log(`    ⚠️ REMAPEAMENTO: ${q.code}: Oficial '${offLetter}' -> No Banco '${matchResult.mappedLetter}'`);
        } else {
          console.log(`    ✅ Homologada ${q.code} (Q${matchedOfficialNum}) -> Gabarito '${matchResult.mappedLetter}'`);
        }

        staging.decisoes.push({
          id: q.id,
          code: q.code,
          table: 'questions',
          caderno: `${banca} — ${ano}`,
          fase: 'Fase 1: Oficial Master Local',
          numeroQuestao: matchedOfficialNum,
          gabaritoOficialExtraido: offLetter,
          gabaritoMapeadoNoBanco: matchResult.mappedLetter,
          foiRemapeado: matchResult.wasRemapped,
          isAnulada: matchResult.isAnulada,
          confianca: matchResult.confidence,
          fonte: provaPath,
          data: new Date().toISOString()
        });
        processedIds.add(q.id);
      } else {
        rejected++;
        console.log(`    ⛔ Rejeitada ${q.code}: ${matchResult.reason}`);
      }
    }
  }

  staging.meta.totalHomologados = (staging.meta.totalHomologados || 0) + matched;
  staging.meta.totalRemapeados = (staging.meta.totalRemapeados || 0) + remapped;
  staging.meta.totalRejeitados = (staging.meta.totalRejeitados || 0) + rejected;
  saveStaging(staging);

  console.log(`  🎉 Caderno Concluído: ${matched} homologadas | ${remapped} remapeadas | ${rejected} rejeitadas`);
}

async function run() {
  // UERJ 2024, 2023
  await processCaderno({
    banca: 'UERJ',
    ano: 2024,
    provaPath: 'data/official_exams/UERJ/UERJ_2024_PROVA_ACESSO_DIRETO.pdf',
    gabaritoPath: 'data/official_exams/UERJ/UERJ_2024_GABARITO_DEFINITIVO.pdf',
    parserType: 'UERJ'
  });

  await processCaderno({
    banca: 'UERJ',
    ano: 2023,
    provaPath: 'data/official_exams/UERJ/UERJ_2023_PROVA_ACESSO_DIRETO.pdf',
    gabaritoPath: 'data/official_exams/UERJ/UERJ_2023_GABARITO_DEFINITIVO.pdf',
    parserType: 'UERJ'
  });

  // SES-GO 2026, 2024, 2023
  await processCaderno({
    banca: 'SES-GO',
    ano: 2026,
    provaPath: 'data/official_exams/SES_GO/SES_GO_2026_PROVA_ACESSO_DIRETO.pdf',
    gabaritoPath: 'data/official_exams/SES_GO/SES_GO_2026_GABARITO_DEFINITIVO.pdf',
    parserType: 'SES-GO'
  });

  await processCaderno({
    banca: 'SES-GO',
    ano: 2024,
    provaPath: 'data/official_exams/SES_GO/SES_GO_2024_PROVA_ACESSO_DIRETO.pdf',
    gabaritoPath: 'data/official_exams/SES_GO/SES_GO_2024_GABARITO_DEFINITIVO.pdf',
    parserType: 'SES-GO'
  });

  await processCaderno({
    banca: 'SES-GO',
    ano: 2023,
    provaPath: 'data/official_exams/SES_GO/SES_GO_2023_PROVA_ACESSO_DIRETO.pdf',
    gabaritoPath: 'data/official_exams/SES_GO/SES_GO_2023_GABARITO_DEFINITIVO.pdf',
    parserType: 'SES-GO'
  });

  // Consolidação final
  const staging = loadStaging();
  const relatorio = {
    geradoEm: new Date().toISOString(),
    totalDecisoesHomologadas: staging.decisoes.length,
    totalRemapeamentosSeguranca: staging.decisoes.filter(d => d.foiRemapeado).length,
    totalQuestoesAnuladas: staging.decisoes.filter(d => d.isAnulada).length,
    porFase: {
      oficialMasterLocal: staging.decisoes.filter(d => d.fase && d.fase.includes('Master Local')).length,
      topDownPdfWeb: staging.decisoes.filter(d => d.fase && d.fase.includes('Top-Down PDF')).length,
      groundingPreceptor: staging.decisoes.filter(d => d.fase && d.fase.includes('Grounding')).length
    },
    porCaderno: {},
    ultimasDecisoes: staging.decisoes.slice(-10)
  };
  staging.decisoes.forEach(d => {
    relatorio.porCaderno[d.caderno] = (relatorio.porCaderno[d.caderno] || 0) + 1;
  });

  fs.writeFileSync('data/relatorio_final_coleta_gabaritos.json', JSON.stringify(relatorio, null, 2), 'utf8');

  console.log(`\n========================================================================`);
  console.log(`🚀 BALANÇO GERAL: ${staging.decisoes.length} DECISÕES HOMOLOGADAS EM STAGING!`);
  console.log(`📄 Relatório gravado em: data/relatorio_final_coleta_gabaritos.json`);
  console.log(`========================================================================\n`);
}

run().catch(console.error);
