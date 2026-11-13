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

async function extractPdfText(filePath) {
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

async function checkHoaMatch() {
  const { data: hoaQs } = await supabase
    .from('questions')
    .select('id, code, year, statement, options, correct_answer')
    .ilike('code', 'HOA-2026%')
    .or('correct_answer.is.null,correct_answer.eq.');

  console.log(`HOA 2026 pendentes: ${hoaQs.length}`);
  hoaQs.slice(0, 5).forEach(q => console.log('HOA sample:', q.code, q.statement.slice(0, 100)));
  const pvTxt = await extractPdfText('data/official_exams/FUBOG/PV_FUBOG_V1A.pdf');
  console.log(`FUBOG PV text length: ${pvTxt.length}`);

  let matches = 0;
  for (const q of hoaQs) {
    const j = calculateJaccard(q.statement, pvTxt);
    // test snippet search
    const words = cleanLexical(q.statement).split(' ').filter(w => w.length > 4);
    if (words.length > 4) {
      const sample = words.slice(0, 5).join(' ');
      if (cleanLexical(pvTxt).includes(sample)) {
        matches++;
        console.log(`MATCH HOA 2026 -> FUBOG: ${q.code}`);
      }
    }
  }
  console.log(`Total matches HOA -> FUBOG: ${matches}`);
}

checkHoaMatch().catch(console.error);
