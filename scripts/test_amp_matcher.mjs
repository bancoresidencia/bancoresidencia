import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const t = line.trim();
    if (t && !t.startsWith('#')) {
      const idx = t.indexOf('=');
      if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    }
  });
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function cleanText(txt) {
  if (!txt) return '';
  return txt
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
}

function calculateJaccard(s1, s2) {
  const words1 = new Set(cleanText(s1).split(' ').filter(w => w.length > 2));
  const words2 = new Set(cleanText(s2).split(' ').filter(w => w.length > 2));
  if (words1.size === 0 || words2.size === 0) return 0;
  let intersection = 0;
  for (const w of words1) {
    if (words2.has(w)) intersection++;
  }
  const union = new Set([...words1, ...words2]).size;
  return union === 0 ? 0 : intersection / union;
}

async function parseExamPdf(pdfPath) {
  const p = new PDFParse({ data: fs.readFileSync(pdfPath) });
  await p.load();
  const rawText = (await p.getText()).text || await p.getText();
  
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const questions = [];
  let currentQ = null;
  let currentOpt = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('--') && line.endsWith('--')) continue;
    if (line.includes('ASSOCIAÇÃO MÉDICA DO PARANÁ')) continue;
    if (line.includes('EXAME AMP 2026')) continue;

    const qMatch = line.match(/^(\d{1,3})\)\s+(.*)/);
    if (qMatch) {
      if (currentQ) {
        if (currentOpt) currentQ.options.push(currentOpt);
        questions.push(currentQ);
      }
      currentQ = {
        num: parseInt(qMatch[1], 10),
        statement: qMatch[2],
        options: []
      };
      currentOpt = null;
      continue;
    }

    const optMatch = line.match(/^([A-E])\)\s+(.*)/);
    if (optMatch && currentQ) {
      if (currentOpt) currentQ.options.push(currentOpt);
      currentOpt = {
        letter: optMatch[1],
        text: optMatch[2]
      };
      continue;
    }

    if (currentOpt) {
      currentOpt.text += ' ' + line;
    } else if (currentQ) {
      currentQ.statement += ' ' + line;
    }
  }

  if (currentQ) {
    if (currentOpt) currentQ.options.push(currentOpt);
    questions.push(currentQ);
  }

  return questions;
}

async function parseGabarito(gbPath) {
  const p = new PDFParse({ data: fs.readFileSync(gbPath) });
  await p.load();
  const rawText = (await p.getText()).text || await p.getText();

  const sectionIdx = rawText.indexOf('PROVA GERAL - 2026');
  if (sectionIdx === -1) return new Map();

  const nextSectionIdx = rawText.indexOf('PROVA ESPECÍFICA', sectionIdx + 20);
  const generalText = rawText.slice(sectionIdx, nextSectionIdx !== -1 ? nextSectionIdx : undefined);

  const gbMap = new Map();
  const matches = [...generalText.matchAll(/(\d{1,3})\s+([A-E])/g)];
  for (const m of matches) {
    gbMap.set(parseInt(m[1], 10), m[2]);
  }
  return gbMap;
}

async function getAllPendingQuestions() {
  let all = [];
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('questions')
      .select('id, code, institution, year, statement, options, correct_answer')
      .is('correct_answer', null)
      .range(page * pageSize, (page + 1) * pageSize - 1);
    
    if (error) {
      console.error('Error fetching page', page, error);
      break;
    }
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < pageSize) break;
    page++;
  }
  return all;
}

async function run() {
  console.log('Parsing AMP 2026 PROVA GERAL...');
  const questions = await parseExamPdf('data/official_exams/AMP_PARANA/AMP_2026_PROVA_GERAL.pdf');
  const gabarito = await parseGabarito('data/official_exams/AMP_PARANA/AMP_2026_GABARITOS_OFICIAIS.pdf');

  console.log(`Parsed ${questions.length} questions from PDF.`);
  console.log(`Parsed ${gabarito.size} answers from Gabarito.`);

  console.log('Fetching ALL pending questions from Supabase (paginated)...');
  const dbQuestions = await getAllPendingQuestions();
  console.log(`Loaded ${dbQuestions.length} pending questions from DB.`);

  let matchedCount = 0;
  const matches = [];

  for (const q of questions) {
    const officialAnswer = gabarito.get(q.num);
    if (!officialAnswer) continue;

    const officialWinningOpt = q.options.find(o => o.letter === officialAnswer);
    if (!officialWinningOpt) continue;

    for (const dbQ of dbQuestions) {
      const stmtSim = calculateJaccard(q.statement, dbQ.statement);
      if (stmtSim >= 0.85) {
        let bestOptSim = 0;
        let matchedDbLetter = null;
        if (Array.isArray(dbQ.options)) {
          for (const dbOpt of dbQ.options) {
            const optSim = calculateJaccard(officialWinningOpt.text, dbOpt.text || dbOpt.descricao || '');
            if (optSim > bestOptSim) {
              bestOptSim = optSim;
              matchedDbLetter = dbOpt.letter;
            }
          }
        }

        if (bestOptSim >= 0.85) {
          matchedCount++;
          matches.push({
            dbId: dbQ.id,
            dbCode: dbQ.code,
            institution: dbQ.institution,
            year: dbQ.year,
            pdfQNum: q.num,
            officialAnswer,
            matchedDbLetter,
            stmtSim: stmtSim.toFixed(4),
            optSim: bestOptSim.toFixed(4)
          });
          console.log(`MATCH! [${dbQ.code}] Q${q.num} -> Ans: ${matchedDbLetter} (Stmt: ${stmtSim.toFixed(2)}, Opt: ${bestOptSim.toFixed(2)})`);
        }
      }
    }
  }

  console.log(`Total Matches Found with Dual-Gate >= 85%: ${matchedCount}`);
}

run();
