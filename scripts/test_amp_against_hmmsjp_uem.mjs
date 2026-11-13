import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { parseAmpGabarito, parseAmpExamPdf } from './parse_amp_booklet.mjs';

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
  let inter = 0;
  for (const w of words1) if (words2.has(w)) inter++;
  return inter / (words1.size + words2.size - inter);
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

async function testAmpAgainstHmmsjpAndUem() {
  console.log('Testing existing AMP 2026 & 2025 booklets against HMMSJP and UEM pendings...');

  const booklets = [
    { dir: 'data/official_exams/AMP_PARANA', gb: 'AMP_2026_GABARITOS_OFICIAIS.pdf', pv: 'AMP_2026_PROVA_GERAL.pdf', name: 'AMP 2026 Geral', year: 2026, header: 'PROVA GERAL - 2026' },
    { dir: 'data/official_exams/AMP_PARANA', gb: 'AMP_2026_GABARITOS_OFICIAIS.pdf', pv: 'AMP_2026_PROVA_CLINICA_MEDICA.pdf', name: 'AMP 2026 Clinica', year: 2026, header: 'CLÍNICA MÉDICA' },
    { dir: 'data/official_exams/AMP_PARANA', gb: 'AMP_2026_GABARITOS_OFICIAIS.pdf', pv: 'AMP_2026_PROVA_CIRURGIA_GERAL.pdf', name: 'AMP 2026 Cirurgia', year: 2026, header: 'CIRURGIA GERAL' },
    { dir: 'data/official_exams/AMP_PARANA', gb: 'AMP_2026_GABARITOS_OFICIAIS.pdf', pv: 'AMP_2026_PROVA_PEDIATRIA.pdf', name: 'AMP 2026 Pediatria', year: 2026, header: 'PEDIATRIA' },
    { dir: 'data/official_exams/AMP_PARANA', gb: 'AMP_2025_GABARITO_RETIFICADO.pdf', pv: 'AMP_2025_PROVA_GERAL.pdf', name: 'AMP 2025 Geral', year: 2025, header: 'PROVA GERAL' },
  ];

  const allBookletQuestions = [];
  for (const b of booklets) {
    const gbPath = `${b.dir}/${b.gb}`;
    const pvPath = `${b.dir}/${b.pv}`;
    if (!fs.existsSync(gbPath) || !fs.existsSync(pvPath)) {
      console.log('Skipping missing:', gbPath, pvPath);
      continue;
    }
    const answers = await parseAmpGabarito(gbPath, b.header);
    const questions = await parseAmpExamPdf(pvPath);
    let count = 0;
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
        count++;
      }
    }
    console.log(`Loaded ${count} questions from ${b.name}`);
  }
  console.log(`Total official AMP questions loaded: ${allBookletQuestions.length}`);

  // Fetch pending HMMSJP & UEM
  const { data: hmmsjp } = await supabase
    .from('questions')
    .select('id, code, institution, year, especialidade, statement, options')
    .or('correct_answer.is.null,correct_answer.eq.')
    .ilike('code', 'HMMSJP%');

  const { data: uem } = await supabase
    .from('questions')
    .select('id, code, institution, year, especialidade, statement, options')
    .or('correct_answer.is.null,correct_answer.eq.')
    .ilike('code', 'UEM%');

  const pendings = [...(hmmsjp || []), ...(uem || [])];
  console.log(`Fetched ${pendings.length} pendings from HMMSJP and UEM.`);

  let matches = 0;
  for (const p of pendings) {
    const pStmt = cleanHtml(p.statement);
    for (const bq of allBookletQuestions) {
      const sim = calculateSimilarity(pStmt, bq.statement);
      if (sim >= 0.85) {
        matches++;
        console.log(`MATCH [${(sim*100).toFixed(1)}%] Pending ${p.code} (Ano ${p.year}) <=> Booklet ${bq.caderno} Q${bq.qNum}`);
      }
    }
  }
  console.log(`\nTotal preliminary matches found: ${matches}`);
}

testAmpAgainstHmmsjpAndUem();
