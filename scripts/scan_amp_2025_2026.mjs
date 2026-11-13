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

async function run() {
  console.log('Fetching pending questions for Paraná municipal boards...');
  const { data: paranaDb } = await supabase
    .from('questions')
    .select('id, code, year, statement, options, correct_answer')
    .or('code.ilike.HMMSJP%,code.ilike.PMFI%,code.ilike.SMSFOZ%,code.ilike.SMSCURITIBA%,code.ilike.AMP%');

  const pending = (paranaDb || []).filter(q => !q.correct_answer || q.correct_answer.trim() === '');
  console.log(`Total Paraná pending: ${pending.length}`);

  // 1. AMP 2026 Prova Geral
  const pv2026 = await extractPdfText('data/official_exams/AMP_PARANA/AMP_2026_PROVA_GERAL.pdf');
  const gb2026 = {
    1:'D', 2:'B', 3:'E', 4:'B', 5:'C', 6:'A', 7:'C', 8:'A', 9:'B', 10:'A',
    11:'B', 12:'E', 13:'A', 14:'E', 15:'B', 16:'D', 17:'C', 18:'B', 19:'C', 20:'C',
    21:'C', 22:'C', 23:'B', 24:'E', 25:'B', 26:'A', 27:'D', 28:'D', 29:'E', 30:'C',
    31:'E', 32:'A', 33:'E', 34:'A', 35:'D', 36:'E', 37:'D', 38:'C', 39:'C', 40:'C',
    41:'B', 42:'C', 43:'A', 44:'E', 45:'C', 46:'D', 47:'C', 48:'E', 49:'D', 50:'E',
    51:'E', 52:'A', 53:'E', 54:'E', 55:'B', 56:'A', 57:'D', 58:'A', 59:'C', 60:'B',
    61:'E', 62:'B', 63:'B', 64:'A', 65:'A', 66:'E', 67:'C', 68:'E', 69:'A', 70:'D',
    71:'A', 72:'C', 73:'B', 74:'E', 75:'D', 76:'D', 77:'B', 78:'C', 79:'C', 80:'B',
    81:'C', 82:'E', 83:'B', 84:'C', 85:'D', 86:'D', 87:'E', 88:'B', 89:'C', 90:'D',
    91:'C', 92:'D', 93:'A', 94:'E', 95:'A', 96:'D', 97:'D', 98:'B', 99:'D', 100:'B'
  };

  // 2. AMP 2025 Prova Geral
  const pv2025 = await extractPdfText('data/official_exams/AMP_PARANA/AMP_2025_PROVA_GERAL.pdf');
  const gb2025 = {
    1:'E', 2:'D', 3:'A', 4:'D', 5:'B', 6:'E', 7:'C', 8:'C', 9:'D', 10:'E',
    11:'A', 12:'C', 13:'ANULADA', 14:'ANULADA', 15:'D', 16:'E', 17:'A', 18:'C', 19:'E', 20:'D',
    21:'E', 22:'A', 23:'B', 24:'E', 25:'D', 26:'E', 27:'A', 28:'E', 29:'C', 30:'A',
    31:'D', 32:'E', 33:'D', 34:'C', 35:'C', 36:'B', 37:'E', 38:'E', 39:'E', 40:'D',
    41:'B', 42:'E', 43:'B', 44:'D', 45:'E', 46:'E', 47:'D', 48:'B', 49:'E', 50:'A',
    51:'E', 52:'A', 53:'B', 54:'A', 55:'A', 56:'E', 57:'ANULADA', 58:'D', 59:'B', 60:'C',
    61:'C', 62:'A', 63:'A', 64:'D', 65:'E', 66:'A', 67:'E', 68:'D', 69:'D', 70:'A',
    71:'E', 72:'D', 73:'C', 74:'A', 75:'E', 76:'E', 77:'C', 78:'A', 79:'E', 80:'E',
    81:'C', 82:'C', 83:'A', 84:'C', 85:'E', 86:'D', 87:'C', 88:'ANULADA', 89:'C', 90:'A',
    91:'D', 92:'B', 93:'E', 94:'D', 95:'C', 96:'D', 97:'E', 98:'D', 99:'D', 100:'D'
  };

  function matchBooklet(txt, gbMap, yearLabel, bookletName) {
    console.log(`\nScanning ${bookletName}...`);
    // Regex for questions in AMP: "01 -" or "1 -" or "1." or "01."
    const qMatches = [];
    const qRegex = /(?:^|\n)\s*(\b\d{1,3}\b)\s*[\.\-\)]\s+/g;
    let qm;
    while ((qm = qRegex.exec(txt)) !== null) {
      const n = parseInt(qm[1], 10);
      if (n >= 1 && n <= 100) qMatches.push({ qNum: n, index: qm.index });
    }
    console.log(`Found ${qMatches.length} question markers in ${bookletName}`);

    let hits = 0;
    const results = [];
    for (let i = 0; i < qMatches.length; i++) {
      const qNum = qMatches[i].qNum;
      const s = qMatches[i].index;
      const e = i + 1 < qMatches.length ? qMatches[i+1].index : txt.length;
      const qBody = txt.slice(s, e);
      const stmt = qBody.split(/(?:^|\n)\s*[a-e]\s*[\)\.\-]/i)[0].replace(/^\s*\d{1,3}\s*[\.\-\)]\s*/, '').trim();

      // extract options
      const optRegex = /(?:^|\n)\s*([a-e])\s*[\)\.\-]\s+([^\n\r]+)/gi;
      const opts = [];
      let om;
      while ((om = optRegex.exec(qBody)) !== null) {
        opts.push({ letter: om[1].toUpperCase(), text: om[2].trim() });
      }

      for (const qDb of pending) {
        if (Math.abs(qDb.year - yearLabel) > 1) continue;

        const stmtSim = calculateSimilarity(qDb.statement, stmt);
        if (stmtSim >= 0.85) {
          const gbOficial = gbMap[qNum];
          if (!gbOficial) continue;

          let optSim = 1.0;
          if (gbOficial !== 'ANULADA' && opts.length > 0 && qDb.options) {
            const pdfOpt = opts.find(o => o.letter === gbOficial);
            const dbOpt = qDb.options.find(o => o.letter === gbOficial);
            if (pdfOpt && dbOpt) {
              optSim = calculateSimilarity(dbOpt.text, pdfOpt.text);
            } else {
              optSim = 0.5; // penalty if option doesn't exist
            }
          }

          if (optSim >= 0.85) {
            hits++;
            results.push({
              id: qDb.id,
              code: qDb.code,
              year: qDb.year,
              caderno: bookletName,
              qNum,
              stmtSim: Math.round(stmtSim * 1000) / 1000,
              optSim: Math.round(optSim * 1000) / 1000,
              gabarito: gbOficial
            });
            console.log(`  ✅ [HIT >=85%] ${qDb.code} -> Q#${qNum} GB=${gbOficial} (Stmt: ${(stmtSim*100).toFixed(1)}%, Opt: ${(optSim*100).toFixed(1)}%)`);
          }
        }
      }
    }
    console.log(`[${bookletName}] Total Hits: ${hits}`);
    return results;
  }

  const hits2026 = matchBooklet(pv2026, gb2026, 2026, 'AMP 2026 Prova Geral');
  const hits2025 = matchBooklet(pv2025, gb2025, 2025, 'AMP 2025 Prova Geral');

  console.log(`\n======================================================`);
  console.log(`TOTAL PARANÁ NEW HITS: ${hits2026.length + hits2025.length}`);
  console.log(`======================================================`);
}

run().catch(console.error);
