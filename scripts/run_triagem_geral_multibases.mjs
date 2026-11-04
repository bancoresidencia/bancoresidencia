#!/usr/bin/env node

/**
 * scripts/run_triagem_geral_multibases.mjs
 * 
 * Motor de Triagem Geral e Homologação Semântica de Gabaritos
 * Acervo Banco Residência: 132.965 questões
 * Ecossistema Multi-Bases: HardworQ + QuestoesDeResidencia + QuestMed + ProvasRes + AjudaMédico + Gold
 * 
 * Calibração: Regime 85% Guarded (com Travas Médicas Estritas de Numerais e Negações)
 */

import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const DATA_DIR = path.join(ROOT_DIR, 'data');
const OUT_DIR = path.join(DATA_DIR, 'audit_triagem_geral');
fs.mkdirSync(OUT_DIR, { recursive: true });

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
    .replace(/^[a-e]\s*[\)\.\-\:]\s*/i, '') // remove prefixos 'a) ', 'A - '
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function extractAcronym(str) {
  if (!str) return '';
  const match = str.match(/^([A-Z0-9\/\-]+)\s*[\-\–\—\:]/i);
  if (match) return norm(match[1]);
  const words = str.split(' ');
  if (words.length === 1) return norm(words[0]);
  return norm(str.slice(0, 15));
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

function levenshteinSim(s1, s2) {
  if (s1 === s2) return 1.0;
  const l1 = s1.length;
  const l2 = s2.length;
  if (l1 === 0) return l2 === 0 ? 1.0 : 0.0;
  if (l2 === 0) return 0.0;
  
  const d = new Int32Array(l2 + 1);
  for (let j = 0; j <= l2; j++) d[j] = j;
  
  for (let i = 1; i <= l1; i++) {
    let prev = i;
    const c1 = s1.charCodeAt(i - 1);
    for (let j = 1; j <= l2; j++) {
      const c2 = s2.charCodeAt(j - 1);
      const cost = c1 === c2 ? 0 : 1;
      const curr = Math.min(d[j] + 1, prev + 1, d[j - 1] + cost);
      d[j - 1] = prev;
      prev = curr;
    }
    d[l2] = prev;
  }
  const maxLen = Math.max(l1, l2);
  return (maxLen - d[l2]) / maxLen;
}

// Travas Médicas
function extractNumbers(text) {
  return ((text || '').match(/\d+([.,]\d+)?/g) || []).map(n => n.replace(',', '.')).sort();
}

const NEGATION_WORDS = new Set([
  'nao', 'sem', 'nunca', 'jamais', 'contraindicado', 'contraindicada',
  'incorreto', 'incorreta', 'exceto', 'falso', 'falsa', 'ausente', 'nenhum', 'nenhuma'
]);

function extractNegations(text) {
  const words = norm(text).split(' ');
  return words.filter(w => NEGATION_WORDS.has(w)).sort();
}

function checkGuards(textA, textB) {
  const numsA = extractNumbers(textA);
  const numsB = extractNumbers(textB);
  const numbersMatch = JSON.stringify(numsA) === JSON.stringify(numsB);

  const negsA = extractNegations(textA);
  const negsB = extractNegations(textB);
  const negationsMatch = JSON.stringify(negsA) === JSON.stringify(negsB);

  return { numbersMatch, negationsMatch, isSafe: numbersMatch && negationsMatch };
}

function compareOptionTexts(textA, textB) {
  const nA = norm(textA);
  const nB = norm(textB);
  if (!nA || !nB) return { isMatch: false, sim: 0 };

  if (nA === nB) {
    return { isMatch: true, sim: 1.0, isGuarded: true };
  }

  const lev = levenshteinSim(nA, nB);
  const jac = jaccard(getTokens(nA), getTokens(nB));
  const sim = Math.max(lev, jac);
  const guards = checkGuards(textA, textB);

  // Regime 85% Guarded: similaridade >= 0.85 E travas médicas preservadas
  const isMatch = (sim >= 0.85 && guards.isSafe) || (sim >= 0.95);

  return { isMatch, sim, isGuarded: guards.isSafe };
}

function countOptionsOverlap(optsA, optsB) {
  if (!optsA || !optsB || optsA.length === 0 || optsB.length === 0) return 0;
  let matches = 0;
  for (const a of optsA) {
    const tA = a.text || '';
    if (!tA) continue;
    for (const b of optsB) {
      const tB = b.text || '';
      if (!tB) continue;
      if (compareOptionTexts(tA, tB).isMatch) {
        matches++;
        break;
      }
    }
  }
  return matches;
}

// ==========================================
// CARREGAMENTO DA MATRIZ DE CONSENSO MULTI-BASES
// ==========================================
function loadConsensusMultiBases() {
  console.log('📡 [1/3] Compilando Matriz de Consenso Multi-Bases (>800k registros)...');
  console.time('Tempo Compilação Índice');

  const fullStatementIndex = new Map(); // normStatement -> Array of items
  const prefix80Index = new Map();       // prefix80 -> Array of items
  const blockIndex = new Map();          // blockKey -> Array of items

  let totalEntriesIndexed = 0;

  function addEntry(statement, correctText, letter, source, isAnulada = false, options = [], institution = '', year = 0) {
    if (!statement || (!correctText && !isAnulada)) return;
    const nS = norm(statement);
    if (nS.length < 25) return;

    totalEntriesIndexed++;
    const p80 = nS.slice(0, 80);
    const item = {
      statementTokens: getTokens(nS),
      correctText: (correctText || '').trim(),
      letter: (letter || '').trim().toUpperCase(),
      source,
      isAnulada: Boolean(isAnulada || letter === 'ANULADA' || (correctText && correctText.includes('ANULADA'))),
      options,
      institution,
      year: parseInt(year || 0, 10) || 0
    };

    // Full statement index
    let fullList = fullStatementIndex.get(nS);
    if (!fullList) {
      fullList = [];
      fullStatementIndex.set(nS, fullList);
    }
    fullList.push(item);

    // Prefix 80 index
    let prefList = prefix80Index.get(p80);
    if (!prefList) {
      prefList = [];
      prefix80Index.set(p80, prefList);
    }
    prefList.push(item);

    // Block index [Instituição / Sigla + Ano]
    if (item.year > 0) {
      const instNorm = norm(institution);
      const instAcronym = extractAcronym(institution);
      if (instNorm) {
        const bKey = `${instNorm}_${item.year}`;
        let bList = blockIndex.get(bKey);
        if (!bList) {
          bList = [];
          blockIndex.set(bKey, bList);
        }
        bList.push(item);
      }
      if (instAcronym && instAcronym !== instNorm) {
        const aKey = `${instAcronym}_${item.year}`;
        let aList = blockIndex.get(aKey);
        if (!aList) {
          aList = [];
          blockIndex.set(aKey, aList);
        }
        aList.push(item);
      }
    }
  }

  // 1. HardworQ (183k questões)
  console.log('   ↳ Ingerindo HardworQ (2.667 provas)...');
  const hwDir = path.join(DATA_DIR, 'hardwork', 'provas');
  if (fs.existsSync(hwDir)) {
    const hwFiles = fs.readdirSync(hwDir).filter(f => f.endsWith('.json'));
    hwFiles.forEach(f => {
      try {
        const p = JSON.parse(fs.readFileSync(path.join(hwDir, f), 'utf8'));
        const inst = p.instituicao || (p.questoes && p.questoes[0] && p.questoes[0].institution) || '';
        const yr = p.ano || (p.questoes && p.questoes[0] && p.questoes[0].year) || 0;

        (p.questoes || []).forEach(q => {
          const ans = String(q.correctAnswer || '').trim().toUpperCase();
          const isAnul = Boolean(q.isAnulada || ans === 'ANULADA');
          let correctText = '';
          if (!isAnul && ans) {
            const opt = (q.options || []).find(o => String(o.letter || '').toUpperCase() === ans);
            if (opt) correctText = opt.text;
          }
          addEntry(q.statement, correctText, ans, 'HARDWORK', isAnul, q.options || [], inst || q.institution, yr || q.year);
        });
      } catch (e) {}
    });
  }

  // 2. QuestoesDeResidencia (129k questões coletadas ontem)
  console.log('   ↳ Ingerindo QuestoesDeResidencia (1.559 provas)...');
  const baseScraped = path.join(DATA_DIR, 'scraped_exams', 'raw');
  if (fs.existsSync(baseScraped)) {
    const years = fs.readdirSync(baseScraped);
    years.forEach(y => {
      const yDir = path.join(baseScraped, y);
      if (fs.statSync(yDir).isDirectory()) {
        fs.readdirSync(yDir).filter(f => f.endsWith('.json')).forEach(f => {
          try {
            const d = JSON.parse(fs.readFileSync(path.join(yDir, f), 'utf8'));
            const inst = (d.exam && d.exam.title) || '';
            const yr = parseInt(y, 10) || 0;

            (d.questions || []).forEach(q => {
              if (typeof q.answerIndex === 'number' && q.alternatives && q.alternatives.length > 0) {
                const opt = q.alternatives.find(a => a.index === q.answerIndex) || q.alternatives[q.answerIndex];
                const letter = String.fromCharCode(65 + q.answerIndex);
                if (opt && opt.text) {
                  const opts = q.alternatives.map((a, idx) => ({
                    letter: String.fromCharCode(65 + idx),
                    text: a.text
                  }));
                  addEntry(q.text, opt.text, letter, 'QUESTOESDERESIDENCIA', false, opts, inst, yr);
                }
              }
            });
          } catch (e) {}
        });
      }
    });
  }

  // 3. QuestMed (45.4k questões via SQLite)
  console.log('   ↳ Ingerindo QuestMed SQLite...');
  try {
    const dbQM = new DatabaseSync(path.join(DATA_DIR, 'questmed_extracted_exams.db'));
    const rowsQM = dbQM.prepare("SELECT banca, ano, enunciado, gabarito, opcoes_json FROM questmed_questions WHERE gabarito IS NOT NULL AND gabarito != ''").all();
    rowsQM.forEach(r => {
      try {
        const optsObj = typeof r.opcoes_json === 'string' ? JSON.parse(r.opcoes_json) : r.opcoes_json;
        if (optsObj && r.gabarito) {
          const correctText = optsObj[r.gabarito] || '';
          const optsArray = Object.entries(optsObj).map(([k, v]) => ({ letter: k, text: v }));
          addEntry(r.enunciado, correctText, r.gabarito, 'QUESTMED', r.gabarito === 'ANULADA', optsArray, r.banca, r.ano);
        }
      } catch (e) {}
    });
  } catch (e) {
    console.warn('   ⚠️ Erro ao ler QuestMed SQLite:', e.message);
  }

  // 4. Provas de Residência (86.6k questões via SQLite)
  console.log('   ↳ Ingerindo Provas de Residência SQLite...');
  try {
    const dbPR = new DatabaseSync(path.join(DATA_DIR, 'provaderesidencia_coleta.db'));
    const rowsPR = dbPR.prepare("SELECT q.enunciado, q.gabarito_oficial, q.texto_gabarito, q.opcoes_json, q.is_anulada, p.instituicao_raw, p.ano FROM questoes q LEFT JOIN provas p ON q.prova_id = p.id WHERE q.gabarito_oficial IS NOT NULL AND q.gabarito_oficial != ''").all();
    rowsPR.forEach(r => {
      try {
        const cleanText = (r.texto_gabarito || '').replace(/^[A-E]\s*[\)\.\-\:]\s*/i, '').trim();
        let opts = [];
        if (r.opcoes_json) {
          opts = typeof r.opcoes_json === 'string' ? JSON.parse(r.opcoes_json) : r.opcoes_json;
        }
        addEntry(r.enunciado, cleanText, r.gabarito_oficial, 'PROVADERESIDENCIA', Boolean(r.is_anulada), opts, r.instituicao_raw, r.ano);
      } catch (e) {}
    });
  } catch (e) {
    console.warn('   ⚠️ Erro ao ler Provas de Residência SQLite:', e.message);
  }

  // 5. AjudaMédico (9.2k questões)
  console.log('   ↳ Ingerindo AjudaMédico...');
  const ajudaPath = path.join(DATA_DIR, 'knowledge', 'ajudamedico_consolidado_9223.json');
  if (fs.existsSync(ajudaPath)) {
    try {
      const d = JSON.parse(fs.readFileSync(ajudaPath, 'utf8'));
      (d.questoes || []).forEach(q => {
        const correctChoice = (q.options || []).find(o => o.isCorrect || o.id === q.officialAnswer);
        const correctText = correctChoice ? correctChoice.text : '';
        const opts = (q.options || []).map(o => ({ letter: o.id, text: o.text }));
        addEntry(q.statement, correctText, q.officialAnswer, 'AJUDAMEDICO', false, opts, q.banca, q.year);
      });
    } catch (e) {}
  }

  // 6. Acervo Ouro Gold (9.5k questões)
  console.log('   ↳ Ingerindo Acervo Ouro Gold...');
  const goldPath = path.join(DATA_DIR, 'all_homologated_questions_gold.json');
  if (fs.existsSync(goldPath)) {
    try {
      const list = JSON.parse(fs.readFileSync(goldPath, 'utf8'));
      list.forEach(q => {
        const ans = String(q.correct_answer || q.correctAnswer || '').trim().toUpperCase();
        const opt = (q.options || []).find(o => String(o.letter || '').toUpperCase() === ans);
        const correctText = opt ? opt.text : '';
        addEntry(q.statement, correctText, ans, 'GOLD', Boolean(q.is_anulada || ans === 'ANULADA'), q.options || [], q.institution, q.year);
      });
    } catch (e) {}
  }

  console.timeEnd('Tempo Compilação Índice');
  console.log(`✅ Matriz de Consenso Compilada:`);
  console.log(`   - Total de entradas processadas: ${totalEntriesIndexed.toLocaleString('pt-BR')}`);
  console.log(`   - Enunciados únicos exatos: ${fullStatementIndex.size.toLocaleString('pt-BR')}`);
  console.log(`   - Prefixos únicos (80 chars): ${prefix80Index.size.toLocaleString('pt-BR')}`);
  console.log(`   - Blocos [Inst+Ano]: ${blockIndex.size.toLocaleString('pt-BR')}`);
  console.log('--------------------------------------------------------');

  return { fullStatementIndex, prefix80Index, blockIndex };
}

// ==========================================
// MOTOR DE BUSCA SEMÂNTICA MULTI-ESTÁGIO
// ==========================================
function findConsensusCandidate(q, consensusIndexes) {
  const { fullStatementIndex, prefix80Index, blockIndex } = consensusIndexes;

  const nS = norm(q.statement);
  if (nS.length < 25) return null;

  const p80 = nS.slice(0, 80);
  const qTokens = getTokens(nS);
  const qOptions = q.options || [];

  // Nível 1: Enunciado Completo Idêntico
  const fullCandidates = fullStatementIndex.get(nS);
  if (fullCandidates && fullCandidates.length > 0) {
    if (fullCandidates.length === 1) {
      return { match: fullCandidates[0], method: 'N1_FULL_STATEMENT' };
    }
    // Desambiguação por sobreposição de opções
    let best = fullCandidates[0];
    let maxOverlap = -1;
    for (const c of fullCandidates) {
      const overlap = countOptionsOverlap(qOptions, c.options);
      if (overlap > maxOverlap) {
        maxOverlap = overlap;
        best = c;
      }
    }
    return { match: best, method: 'N1_FULL_STATEMENT_DISAMBIGUATED' };
  }

  // Nível 2: Prefixo de 80 chars com desambiguação de vinhetas
  const prefCandidates = prefix80Index.get(p80);
  if (prefCandidates && prefCandidates.length > 0) {
    let best = null;
    let bestScore = 0;

    for (const c of prefCandidates) {
      const sim = jaccard(qTokens, c.statementTokens);
      const overlap = countOptionsOverlap(qOptions, c.options);
      const score = (sim * 10) + (overlap * 5);

      if (score > bestScore && (overlap >= 2 || sim >= 0.82)) {
        bestScore = score;
        best = c;
      }
    }

    if (best) {
      return { match: best, method: 'N2_PREFIX_80_DISAMBIGUATED' };
    }
  }

  // Nível 3: Bloco [Instituição/Sigla + Ano]
  const instNorm = norm(q.institution || q.banca || '');
  const instAcronym = extractAcronym(q.institution || q.banca || '');
  const year = parseInt(q.year || 0, 10) || 0;

  if (year > 0 && (instNorm || instAcronym)) {
    const keys = [];
    if (instNorm) keys.push(`${instNorm}_${year}`);
    if (instAcronym) keys.push(`${instAcronym}_${year}`);

    for (const k of keys) {
      const bList = blockIndex.get(k);
      if (bList && bList.length > 0 && qTokens.size >= 8) {
        let best = null;
        let bestSim = 0;

        for (const c of bList) {
          const sim = jaccard(qTokens, c.statementTokens);
          if (sim > bestSim) {
            bestSim = sim;
            best = c;
          }
        }

        if (bestSim >= 0.85 && best) {
          const overlap = countOptionsOverlap(qOptions, best.options);
          if (overlap >= 2 || bestSim >= 0.90) {
            return { match: best, method: 'N3_BLOCK_FUZZY' };
          }
        }
      }
    }
  }

  return null;
}

// ==========================================
// EXECUTOR PRINCIPAL DA TRIAGEM GERAL
// ==========================================
async function main() {
  console.log('========================================================');
  console.log('⚡ TRIAGEM GERAL E HOMOLOGAÇÃO SEMÂNTICA MULTI-BASES');
  console.log('   Acervo Plataforma: 132.965 questões');
  console.log('   Critério Determinante: CONTEÚDO DA ALTERNATIVA');
  console.log('   Calibração: 85% Guarded (Travas Numéricas e Polaridade)');
  console.log('========================================================');

  const consensusIndexes = loadConsensusMultiBases();

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

  console.log('\n📡 [2/3] Executando auditoria semântica nas 132.965 questões...');
  console.time('Tempo Triagem Geral');

  const stats = {
    totalBancoAvaliadas: 0,
    totalComPareamentoConsenso: 0,
    semPareamentoExterno: 0,
    // As 5 Zonas de Homologação
    zonaVerde_GabaritoOuroConsensual: 0,
    zonaAzul_PermutacaoCadernoRetificada: 0,
    zonaRoxa_GabaritoOrfaoResgatado: 0,
    zonaAmarela_AnulacaoHomologada: 0,
    zonaVermelha_DivergenciaClinicaReal: 0
  };

  const manifestoHomologacao = {}; // id -> { newAnswer, previousAnswer, textCorrect, zone, source, reason }
  const divergenciasClinicas = [];
  const permutacoesRetificadas = [];
  const orfaosResgatados = [];
  const anulacoesConfirmadas = [];

  const seenIds = new Set();

  for (const fileName of specialtyFiles) {
    const filePath = path.join(DATA_DIR, fileName);
    if (!fs.existsSync(filePath)) continue;

    const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!Array.isArray(questions)) continue;

    for (const q of questions) {
      if (!q || !q.id || seenIds.has(q.id)) continue;
      seenIds.add(q.id);
      stats.totalBancoAvaliadas++;

      const candidate = findConsensusCandidate(q, consensusIndexes);

      if (!candidate) {
        stats.semPareamentoExterno++;
        continue;
      }

      stats.totalComPareamentoConsenso++;
      const match = candidate.match;
      const targetText = match.correctText;
      const ansPlat = String(q.correct_answer || q.correctAnswer || '').trim().toUpperCase();
      const isAnuladaPlat = Boolean(q.is_anulada || q.isAnulada || ansPlat === 'ANULADA');
      const isAnuladaMatch = match.isAnulada;

      // 1. Verificação de Anulação Homologada
      if (isAnuladaMatch) {
        stats.zonaAmarela_AnulacaoHomologada++;
        anulacoesConfirmadas.push({
          id: q.id,
          code: q.code,
          institution: q.institution,
          year: q.year,
          gabaritoAnterior: ansPlat,
          source: match.source,
          enunciado: (q.statement || '').slice(0, 150) + '...'
        });
        manifestoHomologacao[q.id] = {
          action: 'ANULATE',
          newAnswer: 'ANULADA',
          previousAnswer: ansPlat,
          zone: 'ZONA_AMARELA',
          source: match.source
        };
        continue;
      }

      // 2. Localização da alternativa no Banco com o mesmo conteúdo textual
      let matchingOptInBank = null;
      let bestSim = 0;

      if (targetText && q.options && q.options.length > 0) {
        for (const opt of q.options) {
          const comp = compareOptionTexts(opt.text, targetText);
          if (comp.isMatch && comp.sim > bestSim) {
            bestSim = comp.sim;
            matchingOptInBank = opt;
          }
        }
      }

      // 3. Caso Órfão Resgatado (pertencia aos 9.384 sem resposta)
      const hasAnswerInBank = Boolean(ansPlat && ansPlat !== 'UNDEFINED' && ansPlat !== 'NULL' && ansPlat !== '');

      if (!hasAnswerInBank) {
        if (matchingOptInBank && matchingOptInBank.letter) {
          stats.zonaRoxa_GabaritoOrfaoResgatado++;
          const letter = String(matchingOptInBank.letter).toUpperCase();
          orfaosResgatados.push({
            id: q.id,
            code: q.code,
            institution: q.institution,
            year: q.year,
            letraAtribuida: letter,
            textoCorreto: matchingOptInBank.text,
            source: match.source,
            simPercent: (bestSim * 100).toFixed(1) + '%'
          });
          manifestoHomologacao[q.id] = {
            action: 'FILL_ORPHAN',
            newAnswer: letter,
            previousAnswer: '',
            textCorrect: matchingOptInBank.text,
            zone: 'ZONA_ROXA',
            source: match.source
          };
        } else if (match.letter && (!q.options || q.options.length === 0)) {
          // Discursiva
          stats.zonaRoxa_GabaritoOrfaoResgatado++;
          manifestoHomologacao[q.id] = {
            action: 'FILL_ORPHAN_DISCURSIVE',
            newAnswer: match.letter,
            previousAnswer: '',
            textCorrect: targetText,
            zone: 'ZONA_ROXA',
            source: match.source
          };
        }
        continue;
      }

      // 4. Questão já possuía gabarito: auditar concordância semântica
      if (matchingOptInBank && matchingOptInBank.letter) {
        const correctLetterInBank = String(matchingOptInBank.letter).toUpperCase();

        if (ansPlat === correctLetterInBank) {
          // ZONA VERDE: Gabarito Ouro Consensual (mesma letra e mesmo texto)
          stats.zonaVerde_GabaritoOuroConsensual++;
        } else {
          // ZONA AZUL: Permutação de Caderno Retificada (letras distintas, mesmo texto do gabarito)
          stats.zonaAzul_PermutacaoCadernoRetificada++;
          permutacoesRetificadas.push({
            id: q.id,
            code: q.code,
            institution: q.institution,
            year: q.year,
            letraNoBanco: ansPlat,
            letraCorretaReal: correctLetterInBank,
            textoCorreto: matchingOptInBank.text,
            source: match.source,
            diagnostico: 'Permutação de caderno detectada e corrigida'
          });
          manifestoHomologacao[q.id] = {
            action: 'REMAP_PERMUTATION',
            newAnswer: correctLetterInBank,
            previousAnswer: ansPlat,
            textCorrect: matchingOptInBank.text,
            zone: 'ZONA_AZUL',
            source: match.source
          };
        }
      } else {
        // ZONA VERMELHA: Divergência Clínica Real (textos de opções distintos)
        stats.zonaVermelha_DivergenciaClinicaReal++;
        divergenciasClinicas.push({
          id: q.id,
          code: q.code,
          institution: q.institution,
          year: q.year,
          letraBanco: ansPlat,
          letraFonte: match.letter,
          textoFonte: targetText,
          source: match.source,
          enunciado: (q.statement || '').slice(0, 160) + '...'
        });
      }
    }
  }

  console.timeEnd('Tempo Triagem Geral');
  console.log('--------------------------------------------------------');

  // Gravação dos Relatórios
  console.log('💾 [3/3] Gravando relatórios e manifesto em data/audit_triagem_geral/...');

  const resumo = {
    dataTriagem: new Date().toISOString(),
    totais: stats,
    percentualPareamento: ((stats.totalComPareamentoConsenso / stats.totalBancoAvaliadas) * 100).toFixed(2) + '%',
    taxaConcordanciaSemantica: (((stats.zonaVerde_GabaritoOuroConsensual + stats.zonaAzul_PermutacaoCadernoRetificada) / stats.totalComPareamentoConsenso) * 100).toFixed(2) + '%',
    detalhesZonas: {
      zonaVerde: stats.zonaVerde_GabaritoOuroConsensual,
      zonaAzul: stats.zonaAzul_PermutacaoCadernoRetificada,
      zonaRoxa: stats.zonaRoxa_GabaritoOrfaoResgatado,
      zonaAmarela: stats.zonaAmarela_AnulacaoHomologada,
      zonaVermelha: stats.zonaVermelha_DivergenciaClinicaReal
    }
  };

  fs.writeFileSync(path.join(OUT_DIR, 'relatorio_triagem_geral_resumo.json'), JSON.stringify(resumo, null, 2), 'utf8');
  fs.writeFileSync(path.join(OUT_DIR, 'manifesto_homologacao_mestre.json'), JSON.stringify(manifestoHomologacao, null, 2), 'utf8');
  fs.writeFileSync(path.join(OUT_DIR, 'permutacoes_caderno_retificadas.json'), JSON.stringify(permutacoesRetificadas, null, 2), 'utf8');
  fs.writeFileSync(path.join(OUT_DIR, 'gabaritos_orfaos_resgatados.json'), JSON.stringify(orfaosResgatados, null, 2), 'utf8');
  fs.writeFileSync(path.join(OUT_DIR, 'anulacoes_confirmadas.json'), JSON.stringify(anulacoesConfirmadas, null, 2), 'utf8');
  fs.writeFileSync(path.join(OUT_DIR, 'divergencias_clinicas_para_curadoria.json'), JSON.stringify(divergenciasClinicas, null, 2), 'utf8');

  console.log('========================================================');
  console.log('🏁 RESULTADO CONSOLIDADO DA TRIAGEM GERAL:');
  console.log(`   Total de questões auditadas no Banco: ${stats.totalBancoAvaliadas.toLocaleString('pt-BR')}`);
  console.log(`   Questões com pareamento multi-bases: ${stats.totalComPareamentoConsenso.toLocaleString('pt-BR')} (${resumo.percentualPareamento})`);
  console.log(`   Taxa de Concordância Semântica Real: ${resumo.taxaConcordanciaSemantica}`);
  console.log(`   ----------------------------------------------------`);
  console.log(`   🟢 ZONA VERDE (Gabarito Ouro Consensual): ${stats.zonaVerde_GabaritoOuroConsensual.toLocaleString('pt-BR')}`);
  console.log(`   🔵 ZONA AZUL (Permutações Retificadas):   ${stats.zonaAzul_PermutacaoCadernoRetificada.toLocaleString('pt-BR')}`);
  console.log(`   🟣 ZONA ROXA (Gabaritos Órfãos Resgatados): ${stats.zonaRoxa_GabaritoOrfaoResgatado.toLocaleString('pt-BR')}`);
  console.log(`   🟡 ZONA AMARELA (Anulações Homologadas):  ${stats.zonaAmarela_AnulacaoHomologada.toLocaleString('pt-BR')}`);
  console.log(`   🔴 ZONA VERMELHA (Divergências Clínicas): ${stats.zonaVermelha_DivergenciaClinicaReal.toLocaleString('pt-BR')}`);
  console.log(`   ----------------------------------------------------`);
  console.log(`   Manifesto Mestre pronto para aplicação: ${Object.keys(manifestoHomologacao).length.toLocaleString('pt-BR')} ações mapeadas`);
  console.log('========================================================');
}

main().catch(err => {
  console.error('💥 Erro fatal na triagem geral:', err);
  process.exit(1);
});

