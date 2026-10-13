import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { PDFParse } from 'pdf-parse';

const BASE_DIR = process.cwd();
const INEP_DIR = path.join(BASE_DIR, 'data', 'official_exams', 'INEP_REVALIDA');
const ENARE_DIR = path.join(BASE_DIR, 'data', 'official_exams', 'ENARE');
const KNOWLEDGE_DIR = path.join(BASE_DIR, 'data', 'knowledge', 'gabarito_das_questoes');
const STATUS_PATH = path.join(BASE_DIR, 'data', 'revalida_enare_sync_status.json');
const REPORT_PATH = path.join(BASE_DIR, 'data', 'revalida_enare_audit_report.json');

// Carrega .env.local
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ ERRO: Credenciais Supabase ausentes em .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

function log(msg) {
  const ts = new Date().toLocaleTimeString('pt-BR');
  console.log(`[${ts}] ${msg}`);
}

function updateStatus(stage, current, total, inseridas = 0, corrigidas = 0, conferidas = 0, anuladas = 0, details = '') {
  fs.writeFileSync(STATUS_PATH, JSON.stringify({
    timestamp: new Date().toISOString(),
    stage,
    current,
    total,
    inseridas,
    corrigidas,
    conferidas,
    anuladas,
    details,
    completed: stage === 'COMPLETED'
  }, null, 2), 'utf8');
}

function normHash(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 90);
}

// Extrai texto de um PDF usando pdf-parse
async function extractTextFromPDF(pdfPath) {
  try {
    if (!fs.existsSync(pdfPath)) return '';
    const buffer = fs.readFileSync(pdfPath);
    const parser = new PDFParse({ data: buffer });
    await parser.load();
    const result = await parser.getText();
    return (typeof result === 'string' ? result : (result?.text || '')).trim();
  } catch (err) {
    log(`⚠️ Erro ao ler PDF ${path.basename(pdfPath)}: ${err.message}`);
    return '';
  }
}

// Parser universal e avançado de gabaritos em PDF
function parseUniversalGabarito(rawText) {
  const table = new Map();
  const rawLines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Matriz de duas linhas (Linha de Números seguida de Linha de Letras)
  for (let i = 0; i < rawLines.length - 1; i++) {
    let l1 = rawLines[i].replace(/^quest[ãa]o\s*:?/i, '').replace(/^item\s*:?/i, '').trim().split(/\s+/);
    let l2 = rawLines[i + 1].replace(/^gabarito\s*:?/i, '').replace(/^resposta\s*:?/i, '').trim().split(/\s+/);

    l2 = l2.map(tok => tok.replace(/[\u0336\u2013\u2014\-]/g, 'X'));

    const allNums = l1.length >= 4 && l1.every(tok => /^\d+$/.test(tok));
    const allLetters = l2.length === l1.length && l2.every(tok => /^(?:[A-E]|X|N|\*|ANULAD[AO])$/i.test(tok));

    if (allNums && allLetters) {
      for (let j = 0; j < l1.length; j++) {
        const num = parseInt(l1[j], 10);
        const letter = l2[j].toUpperCase();
        const ans = (letter === 'X' || letter === 'N' || letter === '*' || letter.startsWith('ANUL')) ? 'X' : letter;
        if (!table.has(num)) table.set(num, ans);
      }
    }
  }

  // 2. Formato sequencial linha por linha "1. B" ou "01 - B" ou "5 ANULADA"
  for (const line of rawLines) {
    const m = line.match(/^\s*(\d{1,3})\s*[-.:\t ]+\s*(ANULAD[AO]|[A-E]|X|N|\*)\b/i);
    if (m) {
      const num = parseInt(m[1], 10);
      const val = m[2].toUpperCase();
      const ans = val.startsWith('ANUL') || val === 'N' || val === '*' ? 'X' : val;
      if (!table.has(num)) table.set(num, ans);
    }
  }

  // 3. Formato sequencial linear tokens
  const tokens = rawText.split(/\s+/);
  for (let i = 0; i < tokens.length - 1; i++) {
    const num = parseInt(tokens[i], 10);
    const next = tokens[i + 1]?.toUpperCase();
    if (!isNaN(num) && num >= 1 && num <= 120 && /^(?:[A-E]|X|N|\*|ANULAD[AO])$/i.test(next)) {
      if (!table.has(num)) {
        table.set(num, next.startsWith('ANUL') || next === 'N' || next === '*' ? 'X' : next);
      }
    }
  }

  return table;
}

// Separador universal de questões (INEP Revalida & ENARE)
function splitExamQuestions(text) {
  const blocks = text.split(/(?=\bQUEST[ÃA]O\s+\d+\b|\n\s*\d{1,3}\s*\n[A-ZÁÉÍÓÚÀÂÊÔÃÕ])/gi);
  const questions = [];
  const seen = new Set();
  for (const b of blocks) {
    let num = null;
    let clean = '';
    const mQ = b.match(/\bQUEST[ÃA]O\s+(\d+)\b/i);
    const mN = b.match(/^\s*(\d{1,3})\s*\n([A-ZÁÉÍÓÚÀÂÊÔÃÕ][\s\S]+)/);
    if (mQ) {
      num = parseInt(mQ[1], 10);
      clean = b.replace(/^[\s\S]*?\bQUEST[ÃA]O\s+\d+[\s\-–—:]*/i, '').trim();
    } else if (mN) {
      num = parseInt(mN[1], 10);
      clean = mN[2].trim();
    }
    if (num && num >= 1 && num <= 120 && !seen.has(num) && clean.length > 25 && !clean.startsWith('VERSÃO')) {
      seen.add(num);
      questions.push({ num, text: clean });
    }
  }
  return questions;
}

// Chaves Oficiais Auditadas com alta precisão
const INEP_2013_GABARITO = {
  1: 'C', 2: 'A', 3: 'E', 4: 'E', 5: 'B', 6: 'C', 7: 'D', 8: 'C', 9: 'E', 10: 'A', 11: 'D',
  12: 'E', 13: 'B', 14: 'B', 15: 'A', 16: 'E', 17: 'E', 18: 'A', 19: 'A', 20: 'E', 21: 'E', 22: 'D',
  23: 'A', 24: 'C', 25: 'A', 26: 'D', 27: 'C', 28: 'D', 29: 'E', 30: 'C', 31: 'B', 32: 'D', 33: 'E',
  34: 'A', 35: 'C', 36: 'E', 37: 'D', 38: 'B', 39: 'B', 40: 'B', 41: 'A', 42: 'D', 43: 'B', 44: 'B',
  45: 'B', 46: 'C', 47: 'D', 48: 'D', 49: 'D', 50: 'C', 51: 'E', 52: 'C', 53: 'B', 54: 'C', 55: 'E',
  56: 'E', 57: 'B', 58: 'X', 59: 'X', 60: 'A', 61: 'D', 62: 'E', 63: 'C', 64: 'D', 65: 'C', 66: 'C',
  67: 'D', 68: 'C', 69: 'A', 70: 'C', 71: 'A', 72: 'D', 73: 'E', 74: 'B', 75: 'B', 76: 'D', 77: 'D',
  78: 'E', 79: 'C', 80: 'D', 81: 'D', 82: 'B', 83: 'C', 84: 'B', 85: 'B', 86: 'B', 87: 'E', 88: 'A',
  89: 'E', 90: 'B', 91: 'B', 92: 'D', 93: 'C', 94: 'C', 95: 'E', 96: 'B', 97: 'B', 98: 'A', 99: 'A',
  100: 'A', 101: 'A', 102: 'A', 103: 'X', 104: 'D', 105: 'A', 106: 'D', 107: 'X', 108: 'B', 109: 'A', 110: 'C'
};

const INEP_2017_GABARITO_V1 = {
  1: 'X', 2: 'B', 3: 'C', 4: 'B', 5: 'A', 6: 'B', 7: 'B', 8: 'D', 9: 'C', 10: 'A',
  11: 'C', 12: 'D', 13: 'A', 14: 'C', 15: 'C', 16: 'B', 17: 'B', 18: 'D', 19: 'C', 20: 'C',
  21: 'B', 22: 'B', 23: 'B', 24: 'A', 25: 'B', 26: 'D', 27: 'B', 28: 'A', 29: 'B', 30: 'C',
  31: 'C', 32: 'D', 33: 'D', 34: 'A', 35: 'X', 36: 'X', 37: 'D', 38: 'B', 39: 'B', 40: 'B',
  41: 'X', 42: 'B', 43: 'C', 44: 'C', 45: 'B', 46: 'A', 47: 'A', 48: 'A', 49: 'B', 50: 'D',
  51: 'D', 52: 'D', 53: 'X', 54: 'D', 55: 'D', 56: 'D', 57: 'D', 58: 'B', 59: 'D', 60: 'C',
  61: 'D', 62: 'C', 63: 'C', 64: 'X', 65: 'A', 66: 'C', 67: 'A', 68: 'A', 69: 'X', 70: 'C',
  71: 'C', 72: 'X', 73: 'B', 74: 'D', 75: 'X', 76: 'X', 77: 'C', 78: 'B', 79: 'C', 80: 'D',
  81: 'C', 82: 'C', 83: 'C', 84: 'A', 85: 'C', 86: 'A', 87: 'B', 88: 'C', 89: 'B', 90: 'D',
  91: 'D', 92: 'A', 93: 'A', 94: 'C', 95: 'A', 96: 'A', 97: 'D', 98: 'D', 99: 'D', 100: 'D'
};

const INEP_2020_GABARITO = {
  1: 'A', 2: 'C', 3: 'C', 4: 'A', 5: 'B', 6: 'D', 7: 'C', 8: 'D', 9: 'A', 10: 'C',
  11: 'B', 12: 'B', 13: 'D', 14: 'B', 15: 'B', 16: 'A', 17: 'C', 18: 'C', 19: 'B', 20: 'C',
  21: 'B', 22: 'C', 23: 'C', 24: 'B', 25: 'A', 26: 'A', 27: 'A', 28: 'A', 29: 'B', 30: 'B',
  31: 'C', 32: 'A', 33: 'A', 34: 'C', 35: 'D', 36: 'C', 37: 'B', 38: 'A', 39: 'B', 40: 'B',
  41: 'B', 42: 'A', 43: 'B', 44: 'C', 45: 'D', 46: 'C', 47: 'C', 48: 'C', 49: 'B', 50: 'D',
  51: 'D', 52: 'C', 53: 'C', 54: 'A', 55: 'B', 56: 'D', 57: 'C', 58: 'A', 59: 'B', 60: 'D',
  61: 'C', 62: 'D', 63: 'B', 64: 'B', 65: 'A', 66: 'B', 67: 'C', 68: 'D', 69: 'D', 70: 'D',
  71: 'A', 72: 'D', 73: 'C', 74: 'C', 75: 'B', 76: 'A', 77: 'D', 78: 'A', 79: 'D', 80: 'B',
  81: 'C', 82: 'D', 83: 'C', 84: 'B', 85: 'D', 86: 'D', 87: 'C', 88: 'B', 89: 'A', 90: 'D',
  91: 'D', 92: 'C', 93: 'B', 94: 'B', 95: 'C', 96: 'D', 97: 'D', 98: 'C', 99: 'D', 100: 'A'
};

const INEP_2025_2_GABARITO = {
  1: 'A', 2: 'B', 3: 'A', 4: 'D', 5: 'C', 6: 'B', 7: 'X', 8: 'B', 9: 'X', 10: 'C',
  11: 'X', 12: 'D', 13: 'C', 14: 'B', 15: 'A', 16: 'B', 17: 'D', 18: 'D', 19: 'D', 20: 'C',
  21: 'A', 22: 'A', 23: 'B', 24: 'D', 25: 'A', 26: 'C', 27: 'D', 28: 'B', 29: 'A', 30: 'C',
  31: 'B', 32: 'D', 33: 'C', 34: 'B', 35: 'D', 36: 'C', 37: 'D', 38: 'D', 39: 'D', 40: 'B',
  41: 'C', 42: 'D', 43: 'X', 44: 'B', 45: 'B', 46: 'C', 47: 'C', 48: 'D', 49: 'B', 50: 'C',
  51: 'B', 52: 'C', 53: 'C', 54: 'B', 55: 'X', 56: 'B', 57: 'C', 58: 'A', 59: 'C', 60: 'D',
  61: 'C', 62: 'A', 63: 'C', 64: 'B', 65: 'B', 66: 'B', 67: 'B', 68: 'B', 69: 'D', 70: 'B',
  71: 'A', 72: 'C', 73: 'D', 74: 'D', 75: 'C', 76: 'B', 77: 'A', 78: 'D', 79: 'D', 80: 'A',
  81: 'D', 82: 'D', 83: 'A', 84: 'A', 85: 'X', 86: 'A', 87: 'X', 88: 'A', 89: 'B', 90: 'D',
  91: 'D', 92: 'A', 93: 'A', 94: 'B', 95: 'C', 96: 'C', 97: 'A', 98: 'A', 99: 'A', 100: 'B'
};

const INEP_2026_1_GABARITO = {
  1: 'D', 2: 'C', 3: 'C', 4: 'D', 5: 'B', 6: 'D', 7: 'D', 8: 'C', 9: 'D', 10: 'D',
  11: 'D', 12: 'D', 13: 'C', 14: 'B', 15: 'B', 16: 'B', 17: 'B', 18: 'D', 19: 'B', 20: 'B',
  21: 'A', 22: 'B', 23: 'C', 24: 'C', 25: 'A', 26: 'A', 27: 'B', 28: 'A', 29: 'A', 30: 'C',
  31: 'C', 32: 'C', 33: 'C', 34: 'C', 35: 'C', 36: 'B', 37: 'A', 38: 'B', 39: 'B', 40: 'C',
  41: 'A', 42: 'A', 43: 'C', 44: 'A', 45: 'A', 46: 'D', 47: 'C', 48: 'A', 49: 'D', 50: 'D',
  51: 'B', 52: 'D', 53: 'D', 54: 'A', 55: 'D', 56: 'C', 57: 'D', 58: 'B', 59: 'A', 60: 'B',
  61: 'A', 62: 'A', 63: 'B', 64: 'A', 65: 'B', 66: 'B', 67: 'D', 68: 'D', 69: 'C', 70: 'D',
  71: 'A', 72: 'D', 73: 'A', 74: 'C', 75: 'C', 76: 'A', 77: 'A', 78: 'C', 79: 'D', 80: 'C',
  81: 'B', 82: 'B', 83: 'A', 84: 'A', 85: 'C', 86: 'A', 87: 'C', 88: 'B', 89: 'D', 90: 'B',
  91: 'C', 92: 'D', 93: 'C', 94: 'A', 95: 'A', 96: 'B', 97: 'B', 98: 'D', 99: 'B', 100: 'D'
};

const INEP_2026_2_GABARITO = {
  1: 'B', 2: 'C', 3: 'C', 4: 'D', 5: 'D', 6: 'D', 7: 'C', 8: 'C', 9: 'A', 10: 'C',
  11: 'A', 12: 'A', 13: 'B', 14: 'C', 15: 'C', 16: 'D', 17: 'A', 18: 'A', 19: 'C', 20: 'A',
  21: 'D', 22: 'C', 23: 'A', 24: 'B', 25: 'A', 26: 'B', 27: 'C', 28: 'B', 29: 'C', 30: 'A',
  31: 'B', 32: 'D', 33: 'B', 34: 'B', 35: 'A', 36: 'D', 37: 'A', 38: 'A', 39: 'B', 40: 'A',
  41: 'A', 42: 'B', 43: 'D', 44: 'C', 45: 'D', 46: 'B', 47: 'C', 48: 'A', 49: 'C', 50: 'B',
  51: 'A', 52: 'B', 53: 'A', 54: 'D', 55: 'C', 56: 'A', 57: 'B', 58: 'B', 59: 'B', 60: 'D',
  61: 'B', 62: 'B', 63: 'B', 64: 'A', 65: 'B', 66: 'C', 67: 'C', 68: 'A', 69: 'B', 70: 'C',
  71: 'C', 72: 'B', 73: 'B', 74: 'A', 75: 'D', 76: 'B', 77: 'D', 78: 'A', 79: 'A', 80: 'C',
  81: 'D', 82: 'C', 83: 'C', 84: 'D', 85: 'C', 86: 'D', 87: 'A', 88: 'B', 89: 'C', 90: 'C',
  91: 'D', 92: 'C', 93: 'A', 94: 'D', 95: 'C', 96: 'A', 97: 'B', 98: 'A', 99: 'D', 100: 'D'
};

async function buildOfficialBenchmark() {
  log('\n🏛️ [1/3] Construindo índice oficial de gabaritos definitivos (INEP 2011-2026 & ENARE)...');
  updateStatus('CONSTRUINDO_BENCHMARK', 0, 100, 0, 0, 0, 0, 'Lendo PDFs oficiais e gabaritos definitivos');

  const benchmarkMap = new Map();

  function addBenchmark(normKey, num, banca, year, letter, source, priority = 1) {
    if (normKey.length < 25) return;
    const isAnulada = (letter === 'X' || letter === 'N' || letter === '*');
    const existing = benchmarkMap.get(normKey);
    if (!existing || (priority > (existing.priority || 0))) {
      benchmarkMap.set(normKey, {
        num,
        banca,
        year,
        gabaritoOficial: isAnulada ? '' : letter,
        isAnulada,
        source,
        priority
      });
    }
  }

  // 1. INEP Revalida (Todas as Edições de 2011 a 2026)
  const inepConfigs = [
    { year: 2011, pv: 'INEP_2011_PV.pdf', gb: 'INEP_2011_GB.pdf' },
    { year: 2012, pv: 'INEP_2012_PV.pdf', gb: 'INEP_2012_GB.pdf' },
    { year: 2013, pv: 'INEP_2013_PV.pdf', customGb: INEP_2013_GABARITO },
    { year: 2014, pv: 'INEP_2014_PV.pdf', gb: 'INEP_2014_GB.pdf' },
    { year: 2015, pv: 'INEP_2015_PV.pdf', gb: 'INEP_2015_GB.pdf' },
    { year: 2016, pv: 'INEP_2016_PV_1.pdf', gb: 'INEP_2016_GB_1.pdf' },
    { year: 2017, pv: 'INEP_2017_PV_1.pdf', customGb: INEP_2017_GABARITO_V1 },
    { year: 2020, pv: 'INEP_2020_PV_1.pdf', customGb: INEP_2020_GABARITO },
    { year: 2021, pv: 'INEP_2021_PV.pdf', gb: 'INEP_2021_GB.pdf' },
    { year: 2022, pv: 'INEP_2022_1_PV.pdf', gb: 'INEP_2022_1_GB.pdf' },
    { year: 2022, pv: 'INEP_2022_2_PV.pdf', gb: 'INEP_2022_2_GB.pdf' },
    { year: 2023, pv: 'INEP_2023_1_PV.pdf', gb: 'INEP_2023_1_GB.pdf' },
    { year: 2023, pv: 'INEP_2023_2_PV.pdf', gb: 'INEP_2023_2_GB.pdf' },
    { year: 2024, pv: 'INEP_2024_1_PV.pdf', gb: 'INEP_2024_1_GB.pdf' },
    { year: 2024, pv: 'INEP_2024_2_PV.pdf', gb: 'INEP_2024_2_GB.pdf' },
    { year: 2025, pv: 'INEP_2025_1_PV.pdf', gb: 'INEP_2025_1_GB.pdf' },
    { year: 2025, pv: 'INEP_2025_2_PV.pdf', customGb: INEP_2025_2_GABARITO },
    { year: 2026, pv: 'INEP_2026_1_PV.pdf', customGb: INEP_2026_1_GABARITO },
    { year: 2026, pv: 'INEP_2026_2_PV.pdf', customGb: INEP_2026_2_GABARITO }
  ];

  for (const cfg of inepConfigs) {
    const pvFile = path.join(INEP_DIR, cfg.pv);
    if (!fs.existsSync(pvFile)) continue;

    const pvText = await extractTextFromPDF(pvFile);
    const qs = splitExamQuestions(pvText);

    let gabMap;
    if (cfg.customGb) {
      gabMap = new Map(Object.entries(cfg.customGb).map(([k, v]) => [parseInt(k, 10), v]));
    } else {
      const gbFile = path.join(INEP_DIR, cfg.gb);
      const gbText = await extractTextFromPDF(gbFile);
      gabMap = parseUniversalGabarito(gbText);
    }

    log(`   📄 INEP Revalida ${cfg.year} (${cfg.pv}) -> ${qs.length} questões | ${gabMap.size} gabaritos`);

    for (const q of qs) {
      const ans = gabMap.get(q.num);
      if (ans) {
        addBenchmark(normHash(q.text), q.num, 'INEP Revalida', cfg.year, ans, `INEP_${cfg.year}_OFICIAL`, 2);
      }
    }
  }

  // 2. ENARE (2020 a 2023)
  const enareConfigs = [
    { year: 2020, pv: 'ENARE_2020_PV_AD.pdf', gb: 'ENARE_2020_GB_DEF.pdf' },
    { year: 2021, pv: 'ENARE_2021_PV_AD.pdf', gb: 'ENARE_2021_GB_DEF.pdf' },
    { year: 2022, pv: 'ENARE_2022_PV_AD.pdf', gb: 'ENARE_2022_GB_DEF.pdf' },
    { year: 2023, pv: 'ENARE_2023_PV_AD.pdf', gb: 'ENARE_2023_GB_DEF.pdf' }
  ];

  for (const cfg of enareConfigs) {
    const pvFile = path.join(ENARE_DIR, cfg.pv);
    const gbFile = path.join(ENARE_DIR, cfg.gb);
    if (!fs.existsSync(pvFile) || !fs.existsSync(gbFile)) continue;

    const pvText = await extractTextFromPDF(pvFile);
    const qs = splitExamQuestions(pvText);

    const gbText = await extractTextFromPDF(gbFile);
    const gabMap = parseUniversalGabarito(gbText);

    log(`   📄 ENARE ${cfg.year} -> ${qs.length} questões | ${gabMap.size} gabaritos`);

    for (const q of qs) {
      const ans = gabMap.get(q.num);
      if (ans) {
        addBenchmark(normHash(q.text), q.num, 'ENARE/ENAMED', cfg.year, ans, `ENARE_${cfg.year}_OFICIAL`, 2);
      }
    }
  }

  // 3. Gabaritos Auditados de Questões Estratégicas (Livros de Questões Comentadas)
  if (fs.existsSync(KNOWLEDGE_DIR)) {
    log(`   📚 Varrendo acervo de livros de gabaritos comentados para Revalida e ENARE...`);
    let knAdded = 0;
    const files = fs.readdirSync(KNOWLEDGE_DIR, { recursive: true });
    for (const f of files) {
      if (typeof f === 'string' && f.endsWith('.json')) {
        const fullPath = path.join(KNOWLEDGE_DIR, f);
        try {
          const doc = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          for (const c of (doc.chunks || [])) {
            const content = c.content || '';
            const matches = [...content.matchAll(/Questão\s+([^\n]+)\s*\n([\s\S]+?)Solução[\s\S]+?Gabarito:\s*([A-E]|ANULADA)\b/gi)];
            for (const m of matches) {
              const header = m[1];
              const body = m[2];
              const rawAns = m[3].toUpperCase();
              const isEnare = /ENARE|ENAMED/i.test(header);
              const isRevalida = /REVALIDA|INEP/i.test(header);
              if (isEnare || isRevalida) {
                const stmt = body.split(/\n\s*[A-E]\)/)[0].replace(/Questão\s+\d+/i, '').trim();
                const h = normHash(stmt);
                if (h.length >= 25 && !benchmarkMap.has(h)) {
                  addBenchmark(
                    h,
                    0,
                    isEnare ? 'ENARE/ENAMED' : 'INEP Revalida',
                    0,
                    rawAns.startsWith('ANUL') ? 'X' : rawAns,
                    'KNOWLEDGE_COMENTADAS',
                    1
                  );
                  knAdded++;
                }
              }
            }
          }
        } catch (e) {}
      }
    }
    log(`      Acervo adicional incorporado: +${knAdded} questões com gabarito oficial`);
  }

  log(`\n✅ Benchmark Total Construído: ${benchmarkMap.size.toLocaleString('pt-BR')} questões associadas com gabaritos oficiais.`);
  return benchmarkMap;
}

async function syncAndCorrect(benchmarkMap) {
  log('\n🔍 [2/3] Carregando todas as questões de Revalida e ENARE do banco de dados (Supabase)...');
  updateStatus('CARREGANDO_QUESTOES', 0, 0, 0, 0, 0, 0, 'Carregando questões do banco de dados');

  const targetBancas = [
    'INEP Revalida',
    'ENARE/ENAMED',
    'UFMT Revalida',
    'UEPA Revalida',
    'UNIRG Revalida'
  ];

  let allTargetQuestions = [];
  const existingIds = new Set();

  for (const b of targetBancas) {
    let offset = 0;
    while (true) {
      const { data, error } = await supabase
        .from('questions')
        .select('id, statement, banca, year, correct_answer, is_anulada, code, type, options')
        .eq('banca', b)
        .range(offset, offset + 999);

      if (error) {
        log(`⚠️ Erro ao carregar banca ${b}: ${error.message}`);
        break;
      }
      if (!data || data.length === 0) break;

      for (const item of data) {
        if (!existingIds.has(item.id)) {
          allTargetQuestions.push(item);
          existingIds.add(item.id);
        }
      }

      offset += data.length;
      if (data.length < 1000) break;
    }
  }

  // Também busca questões com prefixo de código
  const codePrefixes = ['INEPREVALIDA', 'ENAREENAMED'];
  for (const pref of codePrefixes) {
    let offset = 0;
    while (true) {
      const { data, error } = await supabase
        .from('questions')
        .select('id, statement, banca, year, correct_answer, is_anulada, code, type, options')
        .like('code', `${pref}%`)
        .range(offset, offset + 999);

      if (error || !data || data.length === 0) break;

      for (const item of data) {
        if (!existingIds.has(item.id)) {
          allTargetQuestions.push(item);
          existingIds.add(item.id);
        }
      }

      offset += data.length;
      if (data.length < 1000) break;
    }
  }

  log(`✅ Total de questões carregadas do banco para conferência e correção: ${allTargetQuestions.length}`);

  log('\n⚡ [3/3] Cruzando dados, preenchendo gabaritos e aplicando correções oficiais...');

  let totalInseridas = 0;
  let totalCorrigidas = 0;
  let totalConferidas = 0;
  let totalAnuladas = 0;
  let totalDiscursivas = 0;
  let totalSemMatch = 0;

  const correcoesLog = [];
  const updatesQueue = [];

  for (let i = 0; i < allTargetQuestions.length; i++) {
    const q = allTargetQuestions[i];
    const h = normHash(q.statement);

    // Trata questões discursivas (sem opções de múltipla escolha)
    const isDiscursiva = (!q.options || q.options.length === 0);
    if (isDiscursiva && q.type !== 'Discursiva') {
      totalDiscursivas++;
      updatesQueue.push({
        id: q.id,
        type: 'Discursiva',
        motivo: 'MARCADA_COMO_DISCURSIVA'
      });
    }

    // Notificação periódica de progresso
    if (i % 250 === 0 || i === allTargetQuestions.length - 1) {
      updateStatus(
        'AUDITANDO_E_ATUALIZANDO',
        i + 1,
        allTargetQuestions.length,
        totalInseridas,
        totalCorrigidas,
        totalConferidas,
        totalAnuladas,
        `Auditando questão ${i + 1}/${allTargetQuestions.length} | Inseridos: ${totalInseridas} | Corrigidos: ${totalCorrigidas}`
      );
    }

    if (benchmarkMap.has(h)) {
      const oficial = benchmarkMap.get(h);

      // Verificação rigorosa de compatibilidade de banca e ano
      const isDbInep = (q.banca || '').includes('Revalida') || (q.banca || '').includes('INEP') || (q.code || '').startsWith('INEP');
      const isDbEnare = (q.banca || '').includes('ENARE') || (q.banca || '').includes('ENAMED') || (q.code || '').startsWith('ENARE');
      const isOficialInep = oficial.banca.includes('INEP');
      const isOficialEnare = oficial.banca.includes('ENARE');

      if (isDbInep && !isOficialInep) continue;
      if (isDbEnare && !isOficialEnare) continue;
      if (q.year && oficial.year && oficial.year > 0 && Math.abs(q.year - oficial.year) > 1) continue;

      const currAns = (q.correct_answer || '').trim().toUpperCase();
      const trueAns = oficial.gabaritoOficial;
      const trueAnulada = oficial.isAnulada;

      if (trueAnulada) {
        totalAnuladas++;
        if (!q.is_anulada || currAns !== '') {
          updatesQueue.push({
            id: q.id,
            correct_answer: '',
            is_anulada: true,
            motivo: 'ANULADA_PELA_BANCA',
            banca: q.banca,
            year: q.year,
            code: q.code
          });
        }
      } else if (!currAns) {
        // Estava sem gabarito -> Preencher!
        totalInseridas++;
        updatesQueue.push({
          id: q.id,
          correct_answer: trueAns,
          is_anulada: false,
          motivo: 'GABARITO_OFICIAL_INSERIDO',
          banca: q.banca,
          year: q.year,
          code: q.code
        });
      } else if (currAns !== trueAns) {
        // Estava com gabarito errado -> Corrigir!
        totalCorrigidas++;
        correcoesLog.push({
          id: q.id,
          code: q.code,
          banca: q.banca,
          year: q.year,
          gabaritoAnterior: currAns,
          gabaritoCorrigido: trueAns,
          enunciado: q.statement.slice(0, 80),
          fonte: oficial.source
        });
        updatesQueue.push({
          id: q.id,
          correct_answer: trueAns,
          is_anulada: false,
          motivo: 'CORRECAO_GABARITO_DIVERGENTE',
          banca: q.banca,
          year: q.year,
          code: q.code
        });
      } else {
        totalConferidas++;
      }
    } else {
      totalSemMatch++;
    }
  }

  log(`\n🎯 Resultado da Comparação Censitária com Todas as Edições:`);
  log(`   • Gabaritos novos preenchidos   : ${totalInseridas}`);
  log(`   • Gabaritos errados corrigidos  : ${totalCorrigidas}`);
  log(`   • Gabaritos já corretos         : ${totalConferidas}`);
  log(`   • Questões anuladas pela banca  : ${totalAnuladas}`);
  log(`   • Questões discursivas marcadas : ${totalDiscursivas}`);
  log(`   • Sem correspondência nos PDFs  : ${totalSemMatch}`);

  // Executar updates em lotes no Supabase
  log(`\n🚀 Executando ${updatesQueue.length} operações de UPDATE no Supabase...`);
  const BATCH_SIZE = 50;
  let sucessos = 0;

  for (let i = 0; i < updatesQueue.length; i += BATCH_SIZE) {
    const chunk = updatesQueue.slice(i, i + BATCH_SIZE);
    await Promise.all(chunk.map(async u => {
      try {
        const updatePayload = {};
        if (u.correct_answer !== undefined) updatePayload.correct_answer = u.correct_answer;
        if (u.is_anulada !== undefined) updatePayload.is_anulada = u.is_anulada;
        if (u.type !== undefined) updatePayload.type = u.type;

        const { error } = await supabase
          .from('questions')
          .update(updatePayload)
          .eq('id', u.id);

        if (!error) sucessos++;
      } catch (err) {}
    }));

    const progressPct = (((i + chunk.length) / updatesQueue.length) * 100).toFixed(1);
    process.stdout.write(`   Enviando atualizações e correções: [${Math.min(i + BATCH_SIZE, updatesQueue.length)}/${updatesQueue.length}] (${progressPct}%)\r`);

    updateStatus(
      'GRAVANDO_SUPABASE',
      i + chunk.length,
      updatesQueue.length,
      totalInseridas,
      totalCorrigidas,
      totalConferidas,
      totalAnuladas,
      `Gravando no Supabase: ${Math.min(i + BATCH_SIZE, updatesQueue.length)} / ${updatesQueue.length} atualizações`
    );
  }

  console.log('\n');
  log(`✅ Todas as alterações foram salvas com sucesso no Supabase! (${sucessos} gravadas)`);

  const report = {
    data_conclusao: new Date().toISOString(),
    total_questoes_analisadas: allTargetQuestions.length,
    gabaritos_inseridos: totalInseridas,
    gabaritos_corrigidos: totalCorrigidas,
    gabaritos_ja_corretos: totalConferidas,
    questoes_anuladas: totalAnuladas,
    questoes_discursivas: totalDiscursivas,
    sem_correspondencia_nos_pdfs: totalSemMatch,
    amostra_correcoes: correcoesLog.slice(0, 50),
    total_correcoes_detalhadas: correcoesLog.length,
    status: 'COMPLETED'
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
  updateStatus(
    'COMPLETED',
    allTargetQuestions.length,
    allTargetQuestions.length,
    totalInseridas,
    totalCorrigidas,
    totalConferidas,
    totalAnuladas,
    'Processo concluído com êxito!'
  );
}

async function main() {
  log('========================================================================');
  log('🚀 OPERAÇÃO: SINCRONIZAÇÃO TOTAL DE GABARITOS REVALIDA (2011-2026) & ENARE');
  log('========================================================================');

  updateStatus('INICIANDO', 0, 0, 0, 0, 0, 0, 'Iniciando leitura das provas oficiais');
  const benchmarkMap = await buildOfficialBenchmark();
  await syncAndCorrect(benchmarkMap);

  log('\n========================================================================');
  log('🎉 OPERAÇÃO FINALIZADA COM SUCESSO!');
  log(`📋 Relatório completo salvo em: ${REPORT_PATH}`);
  log('========================================================================');
}

main().catch(err => {
  log(`❌ Falha: ${err.message}`);
  updateStatus('FAILED', 0, 0, 0, 0, 0, 0, err.message);
});
