import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
import { createClient } from '@supabase/supabase-js';

const STAGING_PATH = path.resolve('data/coleta_gabaritos_staging.json');
const DIR = path.resolve('data/official_exams/SES_GO_2026');

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

function parseVerbenaGabaritoGrid(text) {
  const map = new Map();
  // Formato da grade Verbena:
  // 01 02 03 04 05
  // A D B B C
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  for (let i = 0; i < lines.length - 1; i++) {
    const numMatch = lines[i].match(/^\d{2}\s+\d{2}\s+\d{2}\s+\d{2}\s+\d{2}$/);
    if (numMatch) {
      const nums = lines[i].split(/\s+/).map(n => parseInt(n, 10));
      const letters = lines[i+1].split(/\s+/);
      if (nums.length === letters.length) {
        for (let j = 0; j < nums.length; j++) {
          const l = letters[j].toUpperCase();
          map.set(nums[j], l === 'X' ? 'ANULADA' : l);
        }
      }
    }
  }
  return map;
}

function parseVerbenaQuestions(text) {
  const questions = [];
  // No Instituto Verbena, cada questão começa com:
  // QUESTÃO 01
  // QUESTÃO 02
  const qSplits = text.split(/(?=QUESTÃO\s+\d{2})/gi);
  for (const block of qSplits) {
    const m = block.match(/QUESTÃO\s+(\d{2})([\s\S]*)/i);
    if (!m) continue;
    const qNum = parseInt(m[1], 10);
    const body = m[2];

    // Extrai (A), (B), (C), (D)
    const optMatches = [...body.matchAll(/\(([A-D])\)\s*([^\n]+(?:\n(?!\([A-D]\)|QUESTÃO|R1\s+COM)[^\n]+)*)/g)];
    const firstOpt = body.search(/\([A-D]\)/);
    const statement = firstOpt !== -1 ? body.slice(0, firstOpt).trim() : body.trim();

    const options = optMatches.map(om => ({
      letter: om[1].toUpperCase(),
      text: om[2].replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim()
    }));

    questions.push({ qNum, statement, options });
  }
  return questions;
}

async function runSesGoPediatria() {
  console.log('========================================================================');
  console.log('🏛️ EXTRAÇÃO OFICIAL TOP-DOWN: SES-GO 2026 (PEDIATRIA / R3)');
  console.log('========================================================================\n');

  const pCaderno = new PDFParse({ data: fs.readFileSync(path.join(DIR, 'SES_GO_2026_PV_PEDIATRIA_A.pdf')) });
  const pGabarito = new PDFParse({ data: fs.readFileSync(path.join(DIR, 'SES_GO_2026_GB_PEDIATRIA_A.pdf')) });

  const cText = (await pCaderno.getText()).text;
  const gText = (await pGabarito.getText()).text;

  const questions = parseVerbenaQuestions(cText);
  const gabaritoMap = parseVerbenaGabaritoGrid(gText);

  console.log(`Parseadas ${questions.length} questões da prova.`);
  console.log(`Parseadas ${gabaritoMap.size} respostas do gabarito oficial.`);

  // Carrega staging
  let staging = { meta: { totalHomologados: 0, totalRemapeados: 0 }, decisoes: [] };
  if (fs.existsSync(STAGING_PATH)) {
    staging = JSON.parse(fs.readFileSync(STAGING_PATH, 'utf8'));
  }
  const processedIds = new Set(staging.decisoes.map(d => d.id));

  // Busca questões pendentes do SES-GO 2026
  const { data: dbQs, error } = await supabase.from('questions')
    .select('id, code, especialidade, statement, options')
    .ilike('institution', '%SES-GO%')
    .eq('year', 2026)
    .or('correct_answer.is.null,correct_answer.eq.');

  if (error) {
    console.error('Erro ao buscar do Supabase:', error);
    return;
  }

  const toProcess = dbQs.filter(q => !processedIds.has(q.id));
  console.log(`Questões pendentes no Supabase para SES-GO 2026: ${dbQs.length} (Não homologadas: ${toProcess.length})\n`);

  let countHomologadas = 0;
  let countRemapeadas = 0;

  for (const dbQ of toProcess) {
    // Procura match no PDF
    let bestMatch = null;
    let maxSim = 0;

    for (const offQ of questions) {
      const sim = textSimilarity(dbQ.statement, offQ.statement);
      if (sim > maxSim) {
        maxSim = sim;
        bestMatch = offQ;
      }
    }

    if (bestMatch && maxSim >= 0.70) {
      const officialAns = gabaritoMap.get(bestMatch.qNum);
      if (!officialAns) continue;

      const isAnulada = officialAns === 'ANULADA';
      let mappedLetter = officialAns;
      let wasRemapped = false;
      let confidence = 0.98;

      if (!isAnulada) {
        const offOpt = bestMatch.options.find(o => o.letter === officialAns);
        const winningText = offOpt ? offOpt.text : null;

        if (winningText && Array.isArray(dbQ.options)) {
          let bestDbOpt = null;
          let maxOptSim = 0;
          for (const opt of dbQ.options) {
            const sim = textSimilarity(winningText, opt.text || '');
            if (sim > maxOptSim) {
              maxOptSim = sim;
              bestDbOpt = opt;
            }
          }
          if (bestDbOpt && maxOptSim >= 0.65) {
            mappedLetter = bestDbOpt.letter;
            wasRemapped = mappedLetter !== officialAns;
            confidence = Math.max(maxOptSim, 0.98);
          }
        }
      }

      countHomologadas++;
      if (wasRemapped) countRemapeadas++;

      staging.decisoes.push({
        id: dbQ.id,
        code: dbQ.code,
        table: 'questions',
        caderno: `SES-GO 2026 (Pediatria Tipo A) Questão ${bestMatch.qNum}`,
        fase: 'Fase 1: Extração Top-Down Oficial Verbena SES-GO PDF',
        gabaritoOficialExtraido: officialAns,
        gabaritoMapeadoNoBanco: mappedLetter,
        foiRemapeado: wasRemapped,
        isAnulada,
        confianca: confidence,
        fonte: 'https://sistemas.institutoverbena.ufg.br/2026/coreme-ses/sistema/provas_gabaritos/gabaritos_finais/Gabarito%20Final%20-%20R1%20com%20pre-requisito%20em%20Pediatria%20todos%20Tipo%20A.pdf',
        data: new Date().toISOString()
      });
      processedIds.add(dbQ.id);

      console.log(`✅ [${dbQ.code}] -> Gabarito '${mappedLetter}' (Q${bestMatch.qNum} Tipo A) | ${wasRemapped ? '⚠️ Remapeada' : 'OK'}`);
    }
  }

  staging.meta.totalHomologados = staging.decisoes.length;
  staging.meta.totalRemapeados = staging.decisoes.filter(d => d.foiRemapeado).length;
  staging.meta.ultimaAtualizacao = new Date().toISOString();
  fs.writeFileSync(STAGING_PATH, JSON.stringify(staging, null, 2), 'utf8');

  console.log('\n========================================================================');
  console.log('📊 BALANÇO SES-GO 2026 PEDIATRIA:');
  console.log(`• Novas homologadas: ${countHomologadas}`);
  console.log(`• Remapeadas: ${countRemapeadas}`);
  console.log(`• Total acumulado em staging: ${staging.decisoes.length}`);
  console.log(`📁 Auditoria salva em: data/coleta_gabaritos_staging.json`);
  console.log('========================================================================\n');
}

runSesGoPediatria().catch(console.error);

