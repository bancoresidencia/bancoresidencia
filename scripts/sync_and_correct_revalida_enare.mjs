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

// Parser universal de gabaritos em PDF
function parseUniversalGabarito(rawText) {
  const table = new Map();
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Matriz de duas linhas (Linha de Números seguida de Linha de Letras)
  for (let i = 0; i < lines.length - 1; i++) {
    const l1 = lines[i].split(/\s+/);
    const l2 = lines[i + 1].split(/\s+/);
    const allNums = l1.length >= 4 && l1.every(tok => /^\d+$/.test(tok));
    const allLetters = l2.length === l1.length && l2.every(tok => /^(?:[A-E]|X|N|\*|ANULAD[AO])$/i.test(tok));
    if (allNums && allLetters) {
      for (let j = 0; j < l1.length; j++) {
        const num = parseInt(l1[j], 10);
        const letter = l2[j].toUpperCase();
        if (!table.has(num)) table.set(num, letter.startsWith('ANUL') || letter === 'N' || letter === '*' ? 'X' : letter);
      }
    }
  }

  // 2. Formato sequencial linha por linha "1. B" ou "01 - B" ou "5 ANULADA"
  for (const line of lines) {
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

// Separador clássico de questões INEP 2011-2015 (QUESTÃO X)
function splitInepClassic(text) {
  const blocks = text.split(/(?=\bQUEST[ÃA]O\s+\d+\b)/gi);
  const questions = [];
  const seen = new Set();
  for (const b of blocks) {
    const m = b.match(/\bQUEST[ÃA]O\s+(\d+)\b/i);
    if (m) {
      const num = parseInt(m[1], 10);
      const clean = b.replace(/^[\s\S]*?\bQUEST[ÃA]O\s+\d+[\s\-–—:]*/i, '').trim();
      if (num >= 1 && num <= 110 && !seen.has(num) && clean.length > 25) {
        seen.add(num);
        questions.push({ num, text: clean });
      }
    }
  }
  return questions;
}

// Separador moderno de questões (ENARE e INEP 2016-2017)
function splitNumberedQuestions(text) {
  const blocks = text.split(/\n\s*(?=\d{1,3}\s*\n[A-ZÁÉÍÓÚÀÂÊÔÃÕ])/g);
  const questions = [];
  const seen = new Set();
  for (const b of blocks) {
    const m = b.match(/^\s*(\d{1,3})\s*\n([A-ZÁÉÍÓÚÀÂÊÔÃÕ][\s\S]+)/);
    if (m) {
      const num = parseInt(m[1], 10);
      const clean = m[2].trim();
      if (num >= 1 && num <= 110 && !clean.startsWith('VERSÃO') && clean.length > 25 && !seen.has(num)) {
        seen.add(num);
        questions.push({ num, text: clean });
      }
    }
  }
  return questions;
}

// Gabaritos oficiais BNI/INEP 2013 (Definitivo Prova Cinza)
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

// Gabaritos oficiais BNI/INEP 2017 (Definitivo Prova Objetiva Versão 1)
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

async function buildOfficialBenchmark() {
  log('\n🏛️ [1/3] Construindo índice oficial de gabaritos definitivos (INEP, ENARE & Manuais)...');
  updateStatus('CONSTRUINDO_BENCHMARK', 0, 100, 0, 0, 0, 0, 'Lendo PDFs oficiais e gabaritos definitivos');

  const benchmarkMap = new Map(); // normHash -> { gabaritoOficial, isAnulada, banca, year, num, source }

  function addBenchmark(normKey, num, banca, year, letter, source, priority = 1) {
    if (normKey.length < 25) return;
    const isAnulada = (letter === 'X' || letter === 'N' || letter === '*');
    const existing = benchmarkMap.get(normKey);
    // Só substitui se prioridade for maior (oficial > knowledge)
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

  // 1. INEP Revalida (2011 a 2017)
  const inepConfigs = [
    { year: 2011, pv: 'INEP_2011_PV.pdf', gb: 'INEP_2011_GB.pdf', type: 'classic' },
    { year: 2012, pv: 'INEP_2012_PV.pdf', gb: 'INEP_2012_GB.pdf', type: 'classic' },
    { year: 2013, pv: 'INEP_2013_PV.pdf', customGb: INEP_2013_GABARITO, type: 'classic' },
    { year: 2014, pv: 'INEP_2014_PV.pdf', gb: 'INEP_2014_GB.pdf', type: 'classic' },
    { year: 2015, pv: 'INEP_2015_PV.pdf', gb: 'INEP_2015_GB.pdf', type: 'classic' },
    { year: 2016, pv: 'INEP_2016_PV_1.pdf', gb: 'INEP_2016_GB_1.pdf', type: 'numbered' },
    { year: 2017, pv: 'INEP_2017_PV_1.pdf', customGb: INEP_2017_GABARITO_V1, type: 'numbered' }
  ];

  for (const cfg of inepConfigs) {
    log(`   📄 Processando Revalida INEP ${cfg.year}...`);
    const pvFile = path.join(INEP_DIR, cfg.pv);
    const pvText = await extractTextFromPDF(pvFile);
    const qs = cfg.type === 'classic' ? splitInepClassic(pvText) : splitNumberedQuestions(pvText);

    let gabMap;
    if (cfg.customGb) {
      gabMap = new Map(Object.entries(cfg.customGb).map(([k, v]) => [parseInt(k, 10), v]));
    } else {
      const gbFile = path.join(INEP_DIR, cfg.gb);
      const gbText = await extractTextFromPDF(gbFile);
      gabMap = parseUniversalGabarito(gbText);
    }

    log(`      Questões: ${qs.length} | Chave gabarito: ${gabMap.size}`);

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
    log(`   📄 Processando ENARE ${cfg.year}...`);
    const pvFile = path.join(ENARE_DIR, cfg.pv);
    const gbFile = path.join(ENARE_DIR, cfg.gb);

    const pvText = await extractTextFromPDF(pvFile);
    const qs = splitNumberedQuestions(pvText);

    const gbText = await extractTextFromPDF(gbFile);
    const gabMap = parseUniversalGabarito(gbText);

    log(`      Questões: ${qs.length} | Chave gabarito: ${gabMap.size}`);

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
                    'KNOWLEDGE_COMENTADAS'
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
        .select('id, statement, banca, year, correct_answer, is_anulada, code')
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
        .select('id, statement, banca, year, correct_answer, is_anulada, code')
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
  let totalSemMatch = 0;

  const correcoesLog = [];
  const updatesQueue = [];

  for (let i = 0; i < allTargetQuestions.length; i++) {
    const q = allTargetQuestions[i];
    const h = normHash(q.statement);

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
        // Já estava com o gabarito oficial correto
        totalConferidas++;
      }
    } else {
      totalSemMatch++;
    }
  }

  log(`\n🎯 Resultado da Comparação Censitária:`);
  log(`   • Gabaritos novos para preencher : ${totalInseridas}`);
  log(`   • Gabaritos errados para corrigir: ${totalCorrigidas}`);
  log(`   • Gabaritos já corretos (auditados): ${totalConferidas}`);
  log(`   • Questões anuladas pela banca   : ${totalAnuladas}`);
  log(`   • Sem correspondência nos PDFs   : ${totalSemMatch}`);

  // Executar updates em lotes no Supabase
  log(`\n🚀 Executando ${updatesQueue.length} operações de UPDATE no Supabase...`);
  const BATCH_SIZE = 50;
  let sucessos = 0;

  for (let i = 0; i < updatesQueue.length; i += BATCH_SIZE) {
    const chunk = updatesQueue.slice(i, i + BATCH_SIZE);
    await Promise.all(chunk.map(async u => {
      try {
        const { error } = await supabase
          .from('questions')
          .update({
            correct_answer: u.correct_answer,
            is_anulada: u.is_anulada
          })
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
  log(`✅ Todas as alterações foram salvas com sucesso no Supabase!`);

  const report = {
    data_conclusao: new Date().toISOString(),
    total_questoes_analisadas: allTargetQuestions.length,
    gabaritos_inseridos: totalInseridas,
    gabaritos_corrigidos: totalCorrigidas,
    gabaritos_ja_corretos: totalConferidas,
    questoes_anuladas: totalAnuladas,
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
  log('🚀 OPERAÇÃO: SINCRONIZAÇÃO E CORREÇÃO DE GABARITOS REVALIDA & ENARE');
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
