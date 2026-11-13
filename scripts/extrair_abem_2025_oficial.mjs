import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
import { createClient } from '@supabase/supabase-js';

const STAGING_PATH = path.resolve('data/coleta_gabaritos_staging.json');
const DIR = path.resolve('data/official_exams/ABEM');

// Carrega .env.local
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
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
  for (const w of wordsA) if (wordsB.has(w)) intersection++;
  return intersection / new Set([...wordsA, ...wordsB]).size;
}

function parseCadernoText(text) {
  const questions = [];
  // Divide por "Questão X - "
  const qSplits = text.split(/(?=Questão\s+\d+\s*[-–])/g);

  for (const block of qSplits) {
    const mHeader = block.match(/Questão\s+(\d+)\s*[-–]\s*([^\n]+)/);
    if (!mHeader) continue;
    const qNum = parseInt(mHeader[1], 10);
    const area = mHeader[2].trim();

    // Extrai alternativas A), B), C), D)
    const optMatches = [...block.matchAll(/([A-D])\)\s*([^\n]+(?:\n(?![A-D]\)|Questão|--|\d+\s+of)[^\n]+)*)/g)];
    
    // O enunciado é o que vem entre o cabeçalho e a primeira alternativa
    let statement = '';
    const firstOptIdx = block.search(/[A-D]\)/);
    if (firstOptIdx !== -1) {
      statement = block.slice(mHeader[0].length, firstOptIdx).replace(/--\s*\d+\s*of\s*\d+\s*--/g, '').trim();
    }

    const options = optMatches.map(m => ({
      letter: m[1].toUpperCase(),
      text: m[2].replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim()
    }));

    if (statement && options.length > 0) {
      questions.push({ qNum, area, statement, options });
    }
  }
  return questions;
}

function parseGabaritoText(text) {
  const map = new Map();
  // Padrão: "1 B) Glicemia igual ou acima de 96 mg/dl." ou "1 \t B) Delirium misto."
  // Seguido de comentário e referência
  const qBlocks = text.split(/(?=\n\d+\s+(?:[A-D]\)|[A-D]\s|\t[A-D]\)))/g);

  for (const b of qBlocks) {
    const m = b.match(/(\d+)\s+(?:([A-D])\)|([A-D]))\s*([^\n\t]+)/);
    if (m) {
      const qNum = parseInt(m[1], 10);
      const letter = (m[2] || m[3]).toUpperCase();
      const winningText = m[4].trim();
      map.set(qNum, { letter, winningText, fullComment: b.trim() });
    }
  }
  return map;
}

function matchAlternativeSemantic(dbQuestion, winningLetter, winningText) {
  const opts = Array.isArray(dbQuestion.options) ? dbQuestion.options : [];
  if (opts.length === 0) {
    return { isValid: false, mappedLetter: null, reason: 'QUESTAO_SEM_OPCOES_NO_BANCO' };
  }

  // 1. Tenta casar pelo texto da alternativa vencedora
  if (winningText) {
    let bestOpt = null;
    let maxSim = 0;
    for (const opt of opts) {
      const sim = textSimilarity(winningText, opt.text || '');
      if (sim > maxSim) {
        maxSim = sim;
        bestOpt = opt;
      }
    }

    if (bestOpt && maxSim >= 0.65) {
      const wasRemapped = bestOpt.letter !== winningLetter;
      return {
        isValid: true,
        mappedLetter: bestOpt.letter,
        isAnulada: false,
        wasRemapped,
        confidence: Math.max(maxSim, 0.98),
        detail: wasRemapped
          ? `⚠️ Anti-Permutação: Publicado '${winningLetter}' -> No Banco é '${bestOpt.letter}'`
          : `Texto coincide com a letra '${bestOpt.letter}' (sim: ${(maxSim * 100).toFixed(1)}%)`
      };
    }
  }

  // 2. Se não casou por texto mas a letra existe
  const availableLetters = opts.map(o => (o.letter || '').toUpperCase().trim()).filter(Boolean);
  if (availableLetters.includes(winningLetter)) {
    return {
      isValid: true,
      mappedLetter: winningLetter,
      isAnulada: false,
      wasRemapped: false,
      confidence: 0.95,
      detail: `Letra '${winningLetter}' confere com opções disponíveis`
    };
  }

  return { isValid: false, mappedLetter: null, reason: 'OPCAO_NAO_ENCONTRADA_NO_BANCO' };
}

async function runAbemExtraction() {
  console.log('========================================================================');
  console.log('🏛️ EXTRAÇÃO OFICIAL TOP-DOWN: ABEM — TESTE DE PROGRESSO NACIONAL 2025');
  console.log('========================================================================\n');

  // Carrega e analisa PDFs 09h00
  console.log('📖 Carregando PDFs da Sessão 09h00...');
  const c09 = new PDFParse({ data: fs.readFileSync(path.join(DIR, 'TPN25_Caderno_Prova_09h00.pdf')) });
  const g09 = new PDFParse({ data: fs.readFileSync(path.join(DIR, 'TPN25_Gabarito_Prova_09h00.pdf')) });
  const q09List = parseCadernoText((await c09.getText()).text);
  const g09Map = parseGabaritoText((await g09.getText()).text);
  console.log(`  -> Caderno 09h00: ${q09List.length} questões parseadas.`);
  console.log(`  -> Gabarito 09h00: ${g09Map.size} respostas parseadas.`);

  // Carrega e analisa PDFs 19h30
  console.log('📖 Carregando PDFs da Sessão 19h30...');
  const c19 = new PDFParse({ data: fs.readFileSync(path.join(DIR, 'TPN25_Caderno_Prova_19h30.pdf')) });
  const g19 = new PDFParse({ data: fs.readFileSync(path.join(DIR, 'TPN25_Gabarito_Prova_19h30.pdf')) });
  const q19List = parseCadernoText((await c19.getText()).text);
  const g19Map = parseGabaritoText((await g19.getText()).text);
  console.log(`  -> Caderno 19h30: ${q19List.length} questões parseadas.`);
  console.log(`  -> Gabarito 19h30: ${g19Map.size} respostas parseadas.\n`);

  // Monta pool oficial consolidado
  const officialPool = [];
  for (const q of q09List) {
    const ans = g09Map.get(q.qNum);
    if (ans) {
      officialPool.push({
        session: '09h00',
        qNum: q.qNum,
        statement: q.statement,
        options: q.options,
        winningLetter: ans.letter,
        winningText: ans.winningText,
        sourceUrl: 'https://website.abem-educmed.org.br/wp-content/uploads/2025/12/TPN25_Gabarito_Prova_09h00.pdf'
      });
    }
  }
  for (const q of q19List) {
    const ans = g19Map.get(q.qNum);
    if (ans) {
      officialPool.push({
        session: '19h30',
        qNum: q.qNum,
        statement: q.statement,
        options: q.options,
        winningLetter: ans.letter,
        winningText: ans.winningText,
        sourceUrl: 'https://website.abem-educmed.org.br/wp-content/uploads/2025/12/TPN25_Gabarito_Prova_19h30.pdf'
      });
    }
  }
  console.log(`🎯 Pool oficial total: ${officialPool.length} questões com gabarito e enunciado.\n`);

  // Carrega staging
  let staging = { meta: { totalHomologados: 0, totalRemapeados: 0 }, decisoes: [] };
  if (fs.existsSync(STAGING_PATH)) {
    staging = JSON.parse(fs.readFileSync(STAGING_PATH, 'utf8'));
  }
  const processedIds = new Set(staging.decisoes.map(d => d.id));

  // Busca questões pendentes da ABEM 2025 no Supabase
  let page = 0;
  const pageSize = 500;
  const dbPending = [];
  while (true) {
    const { data, error } = await supabase.from('questions')
      .select('id, code, banca, institution, year, especialidade, statement, options')
      .ilike('institution', '%ABEM%')
      .eq('year', 2025)
      .or('correct_answer.is.null,correct_answer.eq.')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error || !data || data.length === 0) break;
    dbPending.push(...data);
    if (data.length < pageSize) break;
    page++;
  }

  const toProcess = dbPending.filter(q => !processedIds.has(q.id));
  console.log(`📦 Questões pendentes da ABEM 2025 no Supabase: ${dbPending.length} (Não homologadas: ${toProcess.length})\n`);

  let homologadas = 0;
  let remapeadas = 0;

  for (const dbQ of toProcess) {
    // Busca no pool oficial
    let bestMatch = null;
    let maxSim = 0;

    for (const offQ of officialPool) {
      const sim = textSimilarity(dbQ.statement, offQ.statement);
      if (sim > maxSim) {
        maxSim = sim;
        bestMatch = offQ;
      }
    }

    if (bestMatch && maxSim >= 0.70) {
      const semMatch = matchAlternativeSemantic(dbQ, bestMatch.winningLetter, bestMatch.winningText);
      if (semMatch.isValid) {
        homologadas++;
        if (semMatch.wasRemapped) remapeadas++;

        staging.decisoes.push({
          id: dbQ.id,
          code: dbQ.code,
          table: 'questions',
          caderno: `ABEM — TPN 2025 (${bestMatch.session}) Questão ${bestMatch.qNum}`,
          fase: 'Fase 1: Extração Top-Down Oficial ABEM PDF',
          gabaritoOficialExtraido: bestMatch.winningLetter,
          gabaritoMapeadoNoBanco: semMatch.mappedLetter,
          foiRemapeado: semMatch.wasRemapped,
          isAnulada: false,
          confianca: semMatch.confidence,
          fonte: bestMatch.sourceUrl,
          data: new Date().toISOString()
        });
        processedIds.add(dbQ.id);

        console.log(`✅ [${dbQ.code}] -> Gabarito '${semMatch.mappedLetter}' (Sessão ${bestMatch.session} Q${bestMatch.qNum}) | ${semMatch.detail}`);
      }
    }
  }

  staging.meta.totalHomologados = staging.decisoes.length;
  staging.meta.totalRemapeados = staging.decisoes.filter(d => d.foiRemapeado).length;
  staging.meta.ultimaAtualizacao = new Date().toISOString();
  fs.writeFileSync(STAGING_PATH, JSON.stringify(staging, null, 2), 'utf8');

  console.log('\n========================================================================');
  console.log('📊 BALANÇO DA EXTRAÇÃO OFICIAL ABEM 2025:');
  console.log(`• Novas questões homologadas: ${homologadas}`);
  console.log(`• Questões com remapeamento anti-permutação: ${remapeadas}`);
  console.log(`• Total acumulado em staging: ${staging.decisoes.length}`);
  console.log(`📁 Auditoria salva em: data/coleta_gabaritos_staging.json`);
  console.log('========================================================================\n');
}

runAbemExtraction().catch(console.error);

