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

const booklets = [
  { id: 'ACESSO_DIRETO', gb: 'GB_ACESSO_DIRETO_A.pdf', pv: 'PV_ACESSO_DIRETO_A.pdf', name: 'SES-GO 2026 Acesso Direto' },
  { id: 'CLINICA_MEDICA', gb: 'GB_CLINICA_MEDICA_A.pdf', pv: 'PV_CLINICA_MEDICA_A.pdf', name: 'SES-GO 2026 R1 Clinica Medica' },
  { id: 'CIRURGIA_GERAL', gb: 'GB_CIRURGIA_GERAL_A.pdf', pv: 'PV_CIRURGIA_GERAL_A.pdf', name: 'SES-GO 2026 R1 Cirurgia Geral' },
  { id: 'GIN_OBS', gb: 'GB_GIN_OBS_A.pdf', pv: 'PV_GIN_OBS_A.pdf', name: 'SES-GO 2026 R1 Ginecologia e Obstetricia' },
  { id: 'PEDIATRIA', gb: 'GB_PEDIATRIA_A.pdf', pv: 'PV_PEDIATRIA_A.pdf', name: 'SES-GO 2026 R1 Pediatria' },
  { id: 'GASTRO', gb: 'GB_GASTRO_A.pdf', pv: 'PV_GASTRO_A.pdf', name: 'SES-GO 2026 R1 Gastroenterologia' },
  { id: 'NEURO', gb: 'GB_NEURO_A.pdf', pv: 'PV_NEURO_A.pdf', name: 'SES-GO 2026 R1 Neurologia' }
];

async function run() {
  console.log('=== MATCHING SES-GO 2026 BOOKLETS TO STAGING (DUAL-GATE >= 85%) ===');
  const dir = path.resolve('data/official_exams/SES_GO_2026');

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
  for (const b of booklets) {
    const gbPath = path.join(dir, b.gb);
    const pvPath = path.join(dir, b.pv);
    if (!fs.existsSync(gbPath) || !fs.existsSync(pvPath)) continue;

    const answers = await parseVerbenaGabarito(gbPath);
    const questions = await parseVerbenaCaderno(pvPath);

    for (const [qNumStr, qData] of Object.entries(questions)) {
      const qNum = parseInt(qNumStr, 10);
      const officialAnswer = answers[qNum] || null;
      allBookletQuestions.push({
        caderno: b.name,
        qNum,
        statement: qData.statement,
        options: qData.options,
        officialAnswer
      });
    }
  }
  console.log(`Loaded ${allBookletQuestions.length} booklet questions into memory.`);

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

    // Search against booklet questions
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
        console.log(`[HOMOLOGADA ANULADA] ${q.code} | Stmt Sim: ${(maxStmtSim*100).toFixed(1)}% | Caderno: ${bestMatch.caderno} Q${bestMatch.qNum}`);
        continue;
      }

      // Winning alternative text from booklet
      const winningOptText = bestMatch.options[officialAns];
      if (!winningOptText) {
        console.log(`[WARN] No winning option text for Q${bestMatch.qNum} ans ${officialAns}`);
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
        console.log(`[REJEITADA TRAVA 2] ${q.code} | Stmt: ${(maxStmtSim*100).toFixed(1)}% | Mas Opt: ${(bestOptSim*100).toFixed(1)}% < 85%`);
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
