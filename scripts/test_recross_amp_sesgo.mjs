import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { PDFParse } from 'pdf-parse';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
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
  if (!fs.existsSync(filePath)) return '';
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

async function testMatch() {
  console.log('Testing AMP 2025, AMP 2026, SES-GO 2026 and SES-GO 2023 matches...');

  // 1. Fetch pending questions for AMP & Parana
  const { data: paranaDb } = await supabase
    .from('questions')
    .select('id, code, year, statement, options, correct_answer')
    .or('code.ilike.HMMSJP%,code.ilike.PMFI%,code.ilike.SMSFOZ%,code.ilike.SMSCURITIBA%,code.ilike.AMP%');
  
  const pendingParana = (paranaDb || []).filter(q => !q.correct_answer || q.correct_answer.trim() === '');
  console.log(`Paraná pending: ${pendingParana.length}`);

  // 2. Fetch pending questions for SES-GO
  const { data: sesgoDb } = await supabase
    .from('questions')
    .select('id, code, year, statement, options, correct_answer')
    .ilike('code', 'SESGO%');
  
  const pendingSesgo = (sesgoDb || []).filter(q => !q.correct_answer || q.correct_answer.trim() === '');
  console.log(`SES-GO pending: ${pendingSesgo.length}`);

  // --- Test SES-GO 2026 ---
  const sesgo2026Pv = 'data/official_exams/SES_GO/SES_GO_2026_PROVA_ACESSO_DIRETO.pdf';
  const sesgo2026Txt = await extractPdfText(sesgo2026Pv);
  console.log(`SES-GO 2026 text length: ${sesgo2026Txt.length}`);

  // Parse questions SES-GO: "QUESTÃO 01", "QUESTÃO 1", or "1."
  const sesgoQRegex = /(?:QUESTÃO|Questão)\s+(\d{1,3})/gi;
  const sesgoMatches = [];
  let sq;
  while ((sq = sesgoQRegex.exec(sesgo2026Txt)) !== null) {
    sesgoMatches.push({ qNum: parseInt(sq[1], 10), index: sq.index });
  }
  console.log(`SES-GO 2026 questions found in PDF: ${sesgoMatches.length}`);

  // Build answer map for SES-GO 2026
  const sesgo2026Gb = {
    1:'C', 2:'B', 3:'B', 4:'D', 5:'C', 6:'D', 7:'C', 8:'C', 9:'A', 10:'D',
    11:'B', 12:'D', 13:'C', 14:'A', 15:'C', 16:'A', 17:'D', 18:'A', 19:'C', 20:'D',
    21:'A', 22:'B', 23:'C', 24:'C', 25:'B', 26:'D', 27:'A', 28:'B', 29:'C', 30:'A',
    31:'D', 32:'B', 33:'D', 34:'D', 35:'B', 36:'A', 37:'C', 38:'B', 39:'A', 40:'C',
    41:'B', 42:'C', 43:'A', 44:'C', 45:'B', 46:'A', 47:'B', 48:'B', 49:'D', 50:'A',
    51:'D', 52:'D', 53:'B', 54:'B', 55:'A', 56:'D', 57:'B', 58:'C', 59:'C', 60:'C',
    61:'A', 62:'D', 63:'B', 64:'A', 65:'D', 66:'B', 67:'B', 68:'C', 69:'D', 70:'A',
    71:'B', 72:'C', 73:'D', 74:'C', 75:'C', 76:'D', 77:'B', 78:'D', 79:'C', 80:'B',
    81:'B', 82:'A', 83:'B', 84:'D', 85:'A', 86:'D', 87:'C', 88:'B', 89:'A', 90:'D',
    91:'C', 92:'C', 93:'D', 94:'B', 95:'A', 96:'B', 97:'D', 98:'B', 99:'A', 100:'D'
  };

  let sesgo2026Hits = 0;
  for (let i = 0; i < sesgoMatches.length; i++) {
    const qNum = sesgoMatches[i].qNum;
    const s = sesgoMatches[i].index;
    const e = i + 1 < sesgoMatches.length ? sesgoMatches[i+1].index : sesgo2026Txt.length;
    const qBody = sesgo2026Txt.slice(s, e);
    const stmt = qBody.split(/(?:^|\n)\s*\([a-d]\)|\([A-D]\)/i)[0].replace(/^(?:QUESTÃO|Questão)\s+\d{1,3}[^\n]*\n/i, '').trim();

    for (const qDb of pendingSesgo) {
      if (qDb.year !== 2026) continue;
      const sim = calculateSimilarity(qDb.statement, stmt);
      if (sim >= 0.85) {
        sesgo2026Hits++;
        console.log(`[SES-GO 2026 HIT] ${qDb.code} -> Q#${qNum} GB=${sesgo2026Gb[qNum]} (Sim: ${(sim*100).toFixed(1)}%)`);
      }
    }
  }
  console.log(`Total SES-GO 2026 Hits: ${sesgo2026Hits}`);
}

testMatch().catch(console.error);
