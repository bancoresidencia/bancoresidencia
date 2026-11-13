import fs from 'fs';
import { PDFParse } from 'pdf-parse';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function cleanLexical(text) {
  if (!text) return '';
  return text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

async function testMatchUerj2024() {
  const { data: uerjPending } = await supabase
    .from('questions')
    .select('id, code, year, statement, options')
    .ilike('code', 'UERJ%')
    .or('correct_answer.is.null,correct_answer.eq.');

  console.log(`Total pendentes UERJ: ${uerjPending.length}`);

  const buf = new Uint8Array(fs.readFileSync('data/official_exams/UERJ/UERJ_2024_PROVA_ACESSO_DIRETO.pdf'));
  const parser = new PDFParse(buf);
  await parser.load();
  const res = await parser.getText();
  const txt = typeof res === 'string' ? res : res.text;
  const examText = txt.split(/--\s*\d+\s*of\s*\d+\s*--/).slice(1).join('\n\n');

  // Gabarito oficial UERJ 2024
  const gbBuf = new Uint8Array(fs.readFileSync('data/official_exams/UERJ/UERJ_2024_GABARITO_DEFINITIVO.pdf'));
  const gbParser = new PDFParse(gbBuf);
  await gbParser.load();
  const gbRes = await gbParser.getText();
  const gbTxt = typeof gbRes === 'string' ? gbRes : gbRes.text;
  const afterR = gbTxt.slice(gbTxt.lastIndexOf('R100') + 4);
  const letters = afterR.match(/\b([A-DX])\b/g) || [];
  const ansMap = {};
  for (let j = 0; j < Math.min(100, letters.length); j++) {
    const l = letters[j].toUpperCase();
    ansMap[j + 1] = l === 'X' ? 'ANULADA' : l;
  }
  console.log(`Gabaritos UERJ 2024 parseados: ${Object.keys(ansMap).length}`);

  // Split examText into questions
  const qRegex = /(?:^|\n)\s*(\b\d{1,3}\b)\)\s+/g;
  const matches = [...examText.matchAll(qRegex)];
  const qBlocks = {};
  for (let i = 0; i < matches.length; i++) {
    const num = parseInt(matches[i][1], 10);
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i+1].index : examText.length;
    qBlocks[num] = examText.slice(start, end);
  }

  let matchCount = 0;
  for (const q of uerjPending) {
    const cStmt = cleanLexical(q.statement);
    if (cStmt.length < 20) continue;
    const words = new Set(cStmt.split(' '));

    for (const [num, block] of Object.entries(qBlocks)) {
      const cBlock = cleanLexical(block);
      const bWords = new Set(cBlock.split(' '));
      let inter = 0;
      for (const w of words) if (bWords.has(w)) inter++;
      const recall = inter / words.size;

      if (recall >= 0.80) {
        matchCount++;
        console.log(`\n✅ [MATCH] ${q.code} (Ano: ${q.year}) -> UERJ 2024 Q#${num} (Recall: ${(recall*100).toFixed(1)}%)`);
        console.log(`   GB Oficial: ${ansMap[num]}`);
        console.log(`   DB Stmt: ${q.statement.slice(0, 90)}...`);
      }
    }
  }

  console.log(`\nTotal matches encontrados em UERJ 2024: ${matchCount}`);
}

testMatchUerj2024();

