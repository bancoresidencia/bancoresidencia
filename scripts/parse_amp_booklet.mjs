import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

export async function parseAmpGabarito(pdfPath, sectionHeader = 'PROVA GERAL') {
  const p = new PDFParse({ data: fs.readFileSync(pdfPath) });
  await p.load();
  const text = (await p.getText()).text || await p.getText();

  const answers = {};

  // Find all "Questão XX: Anulada" in the document
  const anMatches = text.matchAll(/Quest[aã]o\s+(\d+)[:\s]+Anulada/gi);
  for (const am of anMatches) {
    answers[parseInt(am[1], 10)] = 'X';
  }

  // Find table header (e.g. "PROVA GERAL\n" or "PROVA GERAL - 2026")
  let tableText = text;
  const headerRegex = new RegExp(`${sectionHeader}[\\s\\S]*?(?=\\n\\d{1,2}\\s+[A-E])`, 'i');
  const hMatch = text.match(headerRegex);
  if (hMatch && hMatch.index !== undefined) {
    tableText = text.slice(hMatch.index);
  } else {
    const lastIdx = text.lastIndexOf(sectionHeader);
    if (lastIdx !== -1) tableText = text.slice(lastIdx);
  }

  // Match all numbers and letters e.g. "01 \tE", "21 \tE", "88 \tX"
  const pairMatches = tableText.matchAll(/(\d{1,3})\s+([A-E|X])\b/g);
  for (const pm of pairMatches) {
    const qNum = parseInt(pm[1], 10);
    if (qNum >= 1 && qNum <= 100) {
      if (!answers[qNum]) {
        answers[qNum] = pm[2].toUpperCase();
      }
    }
  }

  return answers;
}

export async function parseAmpExamPdf(pdfPath) {
  const p = new PDFParse({ data: fs.readFileSync(pdfPath) });
  await p.load();
  const rawText = (await p.getText()).text || await p.getText();
  
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const questions = {};
  let currentQ = null;
  let currentOpt = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('--') && line.endsWith('--')) continue;
    if (line.includes('ASSOCIAÇÃO MÉDICA DO PARANÁ')) continue;
    if (line.includes('EXAME AMP')) continue;

    const qMatch = line.match(/^(\d{1,3})\)\s+(.*)/);
    if (qMatch) {
      if (currentQ) {
        if (currentOpt) currentQ.options[currentOpt.letter] = currentOpt.text.trim();
        questions[currentQ.num] = currentQ;
      }
      currentQ = {
        num: parseInt(qMatch[1], 10),
        statement: qMatch[2].trim(),
        options: {}
      };
      currentOpt = null;
      continue;
    }

    const optMatch = line.match(/^([A-E])\)\s+(.*)/);
    if (optMatch && currentQ) {
      if (currentOpt) currentQ.options[currentOpt.letter] = currentOpt.text.trim();
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
    if (currentOpt) currentQ.options[currentOpt.letter] = currentOpt.text.trim();
    questions[currentQ.num] = currentQ;
  }

  return questions;
}

async function testAmpParserSelf() {
  const gb25 = await parseAmpGabarito('data/official_exams/AMP_PARANA/AMP_2025_GABARITO_RETIFICADO.pdf', 'PROVA GERAL');
  console.log('AMP 2025 Gabarito parsed:', Object.keys(gb25).length, 'Sample (1-15):', Object.entries(gb25).slice(0, 15));

  const pv25 = await parseAmpExamPdf('data/official_exams/AMP_PARANA/AMP_2025_PROVA_GERAL.pdf');
  console.log('AMP 2025 Prova parsed:', Object.keys(pv25).length, 'Q1 Statement:', pv25[1]?.statement?.slice(0, 80));

  const gb26 = await parseAmpGabarito('data/official_exams/AMP_PARANA/AMP_2026_GABARITOS_OFICIAIS.pdf', 'PROVA GERAL - 2026');
  console.log('AMP 2026 Gabarito parsed:', Object.keys(gb26).length, 'Sample (1-15):', Object.entries(gb26).slice(0, 15));

  const pv26 = await parseAmpExamPdf('data/official_exams/AMP_PARANA/AMP_2026_PROVA_GERAL.pdf');
  console.log('AMP 2026 Prova parsed:', Object.keys(pv26).length, 'Q1 Statement:', pv26[1]?.statement?.slice(0, 80));
}

if (process.argv[1]?.includes('parse_amp_booklet.mjs')) {
  testAmpParserSelf();
}
