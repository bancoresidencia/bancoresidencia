import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { parseVerbenaGabarito, parseVerbenaCaderno } from './parse_verbena_booklet.mjs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const t = line.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function cleanHtml(str) {
  if (!str) return '';
  return str.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

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

function calculateJaccard(s1, s2) {
  const words1 = new Set(normalizeText(s1).split(' ').filter(w => w.length > 2));
  const words2 = new Set(normalizeText(s2).split(' ').filter(w => w.length > 2));
  if (words1.size === 0 || words2.size === 0) return 0;
  let intersection = 0;
  for (const w of words1) if (words2.has(w)) intersection++;
  return intersection / new Set([...words1, ...words2]).size;
}

function getBiGrams(str) {
  const s = normalizeText(str).replace(/\s+/g, '');
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
  for (const bg of bg1) if (bg2.has(bg)) inter++;
  const bgSim = (2.0 * inter) / (bg1.size + bg2.size);
  return (jaccard * 0.4) + (bgSim * 0.6);
}

const allBookletConfigs = [
  // 2026
  { dir: 'data/official_exams/SES_GO_2026', gb: 'GB_ACESSO_DIRETO_A.pdf', pv: 'PV_ACESSO_DIRETO_A.pdf', name: 'SES-GO 2026 Acesso Direto', year: 2026 },
  { dir: 'data/official_exams/SES_GO_2026', gb: 'GB_CLINICA_MEDICA_A.pdf', pv: 'PV_CLINICA_MEDICA_A.pdf', name: 'SES-GO 2026 R1 Clinica Medica', year: 2026 },
  { dir: 'data/official_exams/SES_GO_2026', gb: 'GB_CIRURGIA_GERAL_A.pdf', pv: 'PV_CIRURGIA_GERAL_A.pdf', name: 'SES-GO 2026 R1 Cirurgia Geral', year: 2026 },
  { dir: 'data/official_exams/SES_GO_2026', gb: 'GB_GIN_OBS_A.pdf', pv: 'PV_GIN_OBS_A.pdf', name: 'SES-GO 2026 R1 Ginecologia e Obstetricia', year: 2026 },
  { dir: 'data/official_exams/SES_GO_2026', gb: 'GB_PEDIATRIA_A.pdf', pv: 'PV_PEDIATRIA_A.pdf', name: 'SES-GO 2026 R1 Pediatria', year: 2026 },
  { dir: 'data/official_exams/SES_GO_2026', gb: 'GB_GASTRO_A.pdf', pv: 'PV_GASTRO_A.pdf', name: 'SES-GO 2026 R1 Gastroenterologia', year: 2026 },
  { dir: 'data/official_exams/SES_GO_2026', gb: 'GB_NEURO_A.pdf', pv: 'PV_NEURO_A.pdf', name: 'SES-GO 2026 R1 Neurologia', year: 2026 },
  { dir: 'data/official_exams/SES_GO_2026', gb: 'GB_ANEST_CIR_CAB_A.pdf', pv: 'PV_ANEST_CIR_CAB_A.pdf', name: 'SES-GO 2026 R1 Anestesiologia e Cabeca/Pescoco', year: 2026 },
  { dir: 'data/official_exams/SES_GO_2026', gb: 'GB_CIR_BAS_GERAL_CLM_A.pdf', pv: 'PV_CIR_BAS_GERAL_CLM_A.pdf', name: 'SES-GO 2026 R1 Cirurgia Basica/Geral/Clinica', year: 2026 },

  // 2025
  { dir: 'data/official_exams/SES_GO_2025', gb: 'GB_ACESSO_DIRETO_2025.pdf', pv: 'PV_ACESSO_DIRETO_2025.pdf', name: 'SES-GO 2025 Acesso Direto', year: 2025 },
  { dir: 'data/official_exams/SES_GO_2025', gb: 'GB_PEDIATRIA_2025.pdf', pv: 'PV_PEDIATRIA_2025.pdf', name: 'SES-GO 2025 R1 Pediatria', year: 2025 },
  { dir: 'data/official_exams/SES_GO_2025', gb: 'GB_CLINICA_MEDICA_2025.pdf', pv: 'PV_CLINICA_MEDICA_2025.pdf', name: 'SES-GO 2025 R1 Clinica Medica', year: 2025 },
  { dir: 'data/official_exams/SES_GO_2025', gb: 'GB_GIN_OBS_2025.pdf', pv: 'PV_GIN_OBS_2025.pdf', name: 'SES-GO 2025 R1 Ginecologia e Obstetricia', year: 2025 },

  // 2024
  { dir: 'data/official_exams/SES_GO_2024', gb: 'GB_ACESSO_DIRETO_2024.pdf', pv: 'PV_ACESSO_DIRETO_2024.pdf', name: 'SES-GO 2024 Acesso Direto', year: 2024 },
  { dir: 'data/official_exams/SES_GO_2024', gb: 'GB_CLINICA_MEDICA_2024.pdf', pv: 'PV_CLINICA_MEDICA_2024.pdf', name: 'SES-GO 2024 R1 Clinica Medica', year: 2024 },
  { dir: 'data/official_exams/SES_GO_2024', gb: 'GB_CIRURGIA_GERAL_2024.pdf', pv: 'PV_CIRURGIA_GERAL_2024.pdf', name: 'SES-GO 2024 R1 Cirurgia Geral', year: 2024 },
  { dir: 'data/official_exams/SES_GO_2024', gb: 'GB_GIN_OBS_2024.pdf', pv: 'PV_GIN_OBS_2024.pdf', name: 'SES-GO 2024 R1 Ginecologia e Obstetricia', year: 2024 }
];

async function run() {
  console.log('=== MASTER GOIÁS / VERBENA MATCHER (2024, 2025, 2026) ===');

  // 1. Load staging
  const stagingPath = path.resolve('data/staging_homologados_85pct.json');
  let staging = {
    ultimaAtualizacao: new Date().toISOString(),
    regra: "DUPLA_TRAVA_85_PORCENTO",
    threshold: 0.85,
    totalHomologados: 0,
    modo: "STAGING_PURO_SEM_ESCRITA_SUPABASE",
    decisoes: []
  };
  if (fs.existsSync(stagingPath)) {
    staging = JSON.parse(fs.readFileSync(stagingPath, 'utf8'));
  }
  const existingIds = new Set(staging.decisoes.map(d => d.id));
  console.log(`Initial staging items: ${staging.decisoes.length}`);

  // 2. Load all booklet questions into memory
  const allBookletQuestions = [];
  for (const b of allBookletConfigs) {
    const gbPath = path.resolve(b.dir, b.gb);
    const pvPath = path.resolve(b.dir, b.pv);
    if (!fs.existsSync(gbPath) || !fs.existsSync(pvPath)) {
      console.log(`[SKIP] Missing file for ${b.name}`);
      continue;
    }

    try {
      const answers = await parseVerbenaGabarito(gbPath);
      const questions = await parseVerbenaCaderno(pvPath);

      let loadedForBooklet = 0;
      for (const [qNumStr, qData] of Object.entries(questions)) {
        const qNum = parseInt(qNumStr, 10);
        const officialAnswer = answers[qNum] || null;
        if (officialAnswer) {
          allBookletQuestions.push({
            caderno: b.name,
            year: b.year,
            qNum,
            statement: qData.statement,
            options: qData.options,
            officialAnswer
          });
          loadedForBooklet++;
        }
      }
      console.log(`[LOADED] ${b.name}: ${loadedForBooklet} questions with official answers.`);
    } catch (e) {
      console.error(`Error loading ${b.name}:`, e.message);
    }
  }
  console.log(`\nTotal official booklet questions ready for matching: ${allBookletQuestions.length}`);

  // 3. Fetch pending questions per target pattern
  const targetPatterns = [
    { type: 'institution', val: '%SES-GO%' },
    { type: 'institution', val: '%FUBOG%' },
    { type: 'institution', val: '%IOG%' },
    { type: 'institution', val: '%PSU-GO%' },
    { type: 'code', val: 'SESGO%' }
  ];

  const pendingMap = new Map();
  for (const pat of targetPatterns) {
    let q = supabase
      .from('questions')
      .select('id, code, institution, year, especialidade, statement, options')
      .or('correct_answer.is.null,correct_answer.eq.');

    if (pat.type === 'institution') {
      q = q.ilike('institution', pat.val);
    } else {
      q = q.ilike('code', pat.val);
    }

    const { data, error } = await q;
    if (error) {
      console.error(`Error querying ${pat.val}:`, error.message);
    } else if (data) {
      data.forEach(item => pendingMap.set(item.id, item));
    }
  }

  const pending = Array.from(pendingMap.values());
  console.log(`Fetched ${pending.length} unique pending Goiás questions from Supabase.`);

  let newHomologations = 0;

  for (const q of pending) {
    if (existingIds.has(q.id)) continue;

    const cleanDbStmt = cleanHtml(q.statement);
    if (!cleanDbStmt || cleanDbStmt.length < 15) continue;

    // Search against all booklet questions
    let bestMatch = null;
    let maxStmtSim = 0;

    for (const bq of allBookletQuestions) {
      const sim = calculateSimilarity(cleanDbStmt, bq.statement);
      if (sim > maxStmtSim) {
        maxStmtSim = sim;
        bestMatch = bq;
      }
    }

    // Trava 1: Enunciado >= 0.85
    if (maxStmtSim >= 0.85 && bestMatch) {
      const officialAns = bestMatch.officialAnswer;

      // Handle Anulada
      if (officialAns === 'X') {
        const decisao = {
          id: q.id,
          code: q.code,
          ano: q.year,
          caderno: bestMatch.caderno,
          qNum: bestMatch.qNum,
          similaridadeEnunciado: Math.round(maxStmtSim * 1000) / 1000,
          similaridadeAlternativa: 1.0,
          gabaritoOficialExtraido: "X",
          gabaritoMapeadoNoBanco: "X",
          foiRemapeado: false,
          isAnulada: true,
          dataHomologacao: new Date().toISOString()
        };
        staging.decisoes.push(decisao);
        existingIds.add(q.id);
        newHomologations++;
        console.log(`[HOMOLOGADA ANULADA] ${q.code} | Stmt: ${(maxStmtSim*100).toFixed(1)}% | ${bestMatch.caderno} Q${bestMatch.qNum}`);
        continue;
      }

      // Winning alternative text from booklet
      const winningOptText = bestMatch.options[officialAns];
      if (!winningOptText) {
        continue;
      }

      // Trava 2: Similaridade de Alternativa no DB >= 0.85 & Anti-permutação
      let bestOptSim = 0;
      let matchedLetter = null;

      if (Array.isArray(q.options)) {
        for (const opt of q.options) {
          const optText = cleanHtml(opt.text || opt.descricao || '');
          const sim = calculateSimilarity(winningOptText, optText);
          if (sim > bestOptSim) {
            bestOptSim = sim;
            matchedLetter = opt.letter;
          }
        }
      }

      if (bestOptSim >= 0.85 && matchedLetter) {
        const foiRemapeado = (matchedLetter !== officialAns);
        const decisao = {
          id: q.id,
          code: q.code,
          ano: q.year,
          caderno: bestMatch.caderno,
          qNum: bestMatch.qNum,
          similaridadeEnunciado: Math.round(maxStmtSim * 1000) / 1000,
          similaridadeAlternativa: Math.round(bestOptSim * 1000) / 1000,
          gabaritoOficialExtraido: officialAns,
          gabaritoMapeadoNoBanco: matchedLetter,
          foiRemapeado,
          isAnulada: false,
          dataHomologacao: new Date().toISOString()
        };
        staging.decisoes.push(decisao);
        existingIds.add(q.id);
        newHomologations++;
        console.log(`[HOMOLOGADA] ${q.code} -> Gab: ${matchedLetter} (Oficial: ${officialAns}${foiRemapeado ? ' REMAPEADA' : ''}) | Stmt: ${(maxStmtSim*100).toFixed(1)}% | Opt: ${(bestOptSim*100).toFixed(1)}% | Q${bestMatch.qNum} ${bestMatch.caderno}`);
      } else {
        console.log(`[REJEITADA TRAVA 2] ${q.code} | Stmt: ${(maxStmtSim*100).toFixed(1)}% | Opt: ${(bestOptSim*100).toFixed(1)}% < 85%`);
      }
    }
  }

  // Update staging metadata & save locally
  staging.totalHomologados = staging.decisoes.length;
  staging.ultimaAtualizacao = new Date().toISOString();
  fs.writeFileSync(stagingPath, JSON.stringify(staging, null, 2), 'utf8');

  console.log('\n=== RESULTADO STAGING LOCAL ===');
  console.log(`Novas homologações adicionadas: ${newHomologations}`);
  console.log(`Total acumulado no Staging: ${staging.totalHomologados}`);
  console.log(`Modo ativo: ${staging.modo} (NENHUM COMMIT AO SUPABASE REALIZADO)`);
}

run();
