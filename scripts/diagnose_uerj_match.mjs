import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function cleanText(txt) {
  if (!txt) return '';
  return txt
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/["'“”«»]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
}

function calculateJaccard(s1, s2) {
  const words1 = new Set(cleanText(s1).split(' ').filter(w => w.length > 2));
  const words2 = new Set(cleanText(s2).split(' ').filter(w => w.length > 2));
  if (words1.size === 0 || words2.size === 0) return 0;
  let intersection = 0;
  for (const w of words1) if (words2.has(w)) intersection++;
  return intersection / new Set([...words1, ...words2]).size;
}

function parseUerjExam(text) {
  const qRegex = /(?:^|\n)(\d{1,3})\)\s+([\s\S]*?)(?=(?:\n\d{1,3}\)\s+)|$)/g;
  const questions = [];
  let match;
  while ((match = qRegex.exec(text)) !== null) {
    const qNum = parseInt(match[1], 10);
    const body = match[2].trim();
    if (qNum >= 1 && qNum <= 100 && body.length > 30) {
      const optRegex = /(?:^|\n)\s*([a-d])\)\s*([\s\S]*?)(?=(?:\n\s*[a-d]\))|$)/gi;
      let optMatch;
      const options = [];
      let firstOptIdx = body.length;
      while ((optMatch = optRegex.exec(body)) !== null) {
        if (optMatch.index < firstOptIdx) firstOptIdx = optMatch.index;
        options.push({
          letter: optMatch[1].toUpperCase(),
          text: optMatch[2].replace(/\s+/g, ' ').trim()
        });
      }
      if (options.length >= 3) {
        const statement = body.slice(0, firstOptIdx).replace(/\s+/g, ' ').trim();
        questions.push({ num: qNum, statement, options });
      }
    }
  }
  return questions;
}

async function diagnose() {
  const { data: dbUerj } = await supabase
    .from('questions')
    .select('id, code, year, institution, statement, options, correct_answer')
    .or('institution.ilike.%UERJ%,institution.ilike.%Pedro Ernesto%,code.ilike.%UERJ%')
    .or('correct_answer.is.null,correct_answer.eq.');

  const db2024 = dbUerj.filter(q => String(q.year) === '2024');
  console.log(`DB 2024 count: ${db2024.length}`);
  console.log('Sample DB 2024 statement:');
  console.log(db2024[0].code, ':', db2024[0].statement.slice(0, 250));

  const buf = new Uint8Array(fs.readFileSync('data/official_exams/UERJ/UERJ_2024_PROVA_ACESSO_DIRETO.pdf'));
  const p = new PDFParse({ data: buf });
  await p.load();
  const text = (await p.getText()).text || await p.getText();
  const examQuestions = parseUerjExam(text);
  console.log(`Exam 2024 parsed questions: ${examQuestions.length}`);

  // Test similarity between db2024[0] and all 100 exam questions
  let topSim = 0;
  let topQ = null;
  for (const exQ of examQuestions) {
    const sim = calculateJaccard(db2024[0].statement, exQ.statement);
    if (sim > topSim) {
      topSim = sim;
      topQ = exQ;
    }
  }
  console.log(`Top Jaccard for db2024[0]: ${(topSim * 100).toFixed(1)}% (Exam Q${topQ ? topQ.num : 'none'})`);
  if (topQ) {
    console.log('Top match statement in exam:');
    console.log(topQ.statement.slice(0, 250));
  }
}

diagnose().catch(console.error);
