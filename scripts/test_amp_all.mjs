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

async function parseGabaritos() {
  const p = new PDFParse({ data: fs.readFileSync('data/official_exams/AMP_PARANA/AMP_2026_GABARITOS_OFICIAIS.pdf') });
  await p.load();
  const rawText = (await p.getText()).text || await p.getText();

  const sections = {
    'GERAL': 'PROVA GERAL - 2026',
    'CIRURGIA': 'PROVA ESPECÍFICA CIRURGIA - 2026',
    'CLINICA': 'PROVA ESPECÍFICA CLÍNICA MÉDICA - 2026',
    'PEDIATRIA': 'PROVA ESPECÍFICA PEDIATRIA - 2026',
    'ENDOSCOPIA': 'PROVA ESPECÍFICA ENDOSCOPIA - 2026',
    'MASTOLOGIA': 'PROVA ESPECÍFICA MASTOLOGIA - 2026'
  };

  const gabaritos = {};
  const secNames = Object.keys(sections);

  for (let i = 0; i < secNames.length; i++) {
    const key = secNames[i];
    const header = sections[key];
    const sIdx = rawText.indexOf(header);
    if (sIdx === -1) {
      console.log(`Header not found for ${key}`);
      continue;
    }
    const nextHeader = i < secNames.length - 1 ? sections[secNames[i + 1]] : null;
    const endIdx = nextHeader ? rawText.indexOf(nextHeader, sIdx + 10) : rawText.length;
    const chunk = rawText.slice(sIdx, endIdx !== -1 ? endIdx : undefined);

    const map = new Map();
    const matches = [...chunk.matchAll(/(\d{1,3})\s+([A-E])/g)];
    for (const m of matches) {
      map.set(parseInt(m[1], 10), m[2]);
    }
    gabaritos[key] = map;
    console.log(`Gabarito ${key}: ${map.size} questions.`);
  }

  return gabaritos;
}

async function get2026PendingQuestions() {
  let all = [];
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('questions')
      .select('id, code, institution, year, statement, options, correct_answer')
      .eq('year', 2026)
      .or('correct_answer.is.null,correct_answer.eq.')
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
  console.log('Loading gabaritos...');
  const gabaritos = await parseGabaritos();

  console.log('Loading 2026 pending questions from DB...');
  const dbPending2026 = await get2026PendingQuestions();
  console.log(`Total 2026 pending questions in DB: ${dbPending2026.length}`);

  const pdfDir = 'data/official_exams/AMP_PARANA';
  const examMap = [
    { key: 'GERAL', file: 'AMP_2026_PROVA_GERAL.pdf' },
    { key: 'CIRURGIA', file: 'AMP_2026_PROVA_CIRURGIA_GERAL.pdf' },
    { key: 'CLINICA', file: 'AMP_2026_PROVA_CLINICA_MEDICA.pdf' },
    { key: 'PEDIATRIA', file: 'AMP_2026_PROVA_PEDIATRIA.pdf' },
    { key: 'ENDOSCOPIA', file: 'AMP_2026_PROVA_ENDOSCOPIA.pdf' },
    { key: 'MASTOLOGIA', file: 'AMP_2026_PROVA_MASTOLOGIA.pdf' }
  ];

  let totalMatches = 0;
  const matches = [];

  for (const item of examMap) {
    const filePath = path.join(pdfDir, item.file);
    if (!fs.existsSync(filePath)) continue;

    console.log(`\n--- Parsing and matching ${item.file} (${item.key}) ---`);
    const questions = await parseExamPdf(filePath);
    const gb = gabaritos[item.key];
    console.log(`Parsed ${questions.length} questions from ${item.file}. Gabarito has ${gb ? gb.size : 0} items.`);

    if (!gb) continue;

    for (const q of questions) {
      const officialAnswer = gb.get(q.num);
      if (!officialAnswer) continue;

      const officialWinningOpt = q.options.find(o => o.letter === officialAnswer);
      if (!officialWinningOpt) continue;

      for (const dbQ of dbPending2026) {
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
            totalMatches++;
            matches.push({
              dbId: dbQ.id,
              dbCode: dbQ.code,
              institution: dbQ.institution,
              year: dbQ.year,
              exam: item.key,
              pdfQNum: q.num,
              officialAnswer,
              matchedDbLetter,
              stmtSim: stmtSim.toFixed(4),
              optSim: bestOptSim.toFixed(4)
            });
            console.log(`[MATCH] ${item.key} Q${q.num} -> ${dbQ.code} (${dbQ.institution}) | Stmt: ${(stmtSim*100).toFixed(1)}%, Opt: ${(bestOptSim*100).toFixed(1)}% | Answer: ${matchedDbLetter}`);
          }
        }
      }
    }
  }

  console.log(`\n======================================================`);
  console.log(`TOTAL HOMOLOGATED IN AMP 2026 (Dual-Gate >= 85%): ${totalMatches}`);
  console.log(`======================================================`);

  // Write to a temporary file for inspection (WITHOUT touching Supabase)
  fs.writeFileSync('data/temp_amp_matches.json', JSON.stringify(matches, null, 2));
}

run();
