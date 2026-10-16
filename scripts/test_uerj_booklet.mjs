import fs from 'fs';
import { PDFParse } from 'pdf-parse';

function extractBookletQuestions(text) {
  // Find all occurrences of number followed by ")" or "." at start of line or after newline
  const regex = /(?:^|\n)\s*(\d{1,3})\s*[\)\.]\s+/g;
  const matches = [];
  let m;
  while ((m = regex.exec(text)) !== null) {
    const qNum = parseInt(m[1], 10);
    if (qNum >= 1 && qNum <= 100) {
      matches.push({ qNum, index: m.index });
    }
  }
  
  // Sort and filter duplicate numbers if any
  const unique = [];
  const seen = new Set();
  for (const item of matches) {
    if (!seen.has(item.qNum)) {
      seen.add(item.qNum);
      unique.push(item);
    }
  }
  unique.sort((a,b) => a.qNum - b.qNum);
  
  const questions = {};
  for (let i = 0; i < unique.length; i++) {
    const start = unique[i].index;
    const end = i + 1 < unique.length ? unique[i + 1].index : text.length;
    questions[unique[i].qNum] = text.slice(start, end).trim();
  }
  return questions;
}

async function testBooklets() {
  for (const y of [2026, 2025, 2024, 2023, 2022]) {
    const buf = new Uint8Array(fs.readFileSync(`data/official_exams/UERJ/UERJ_${y}_PROVA_ACESSO_DIRETO.pdf`));
    const p = new PDFParse(buf);
    await p.load();
    const txt = (await p.getText()).text || await p.getText();
    const qs = extractBookletQuestions(txt);
    const nums = Object.keys(qs).map(Number).sort((a,b)=>a-b);
    console.log(`[UERJ ${y} CADERNO] Extraídas ${nums.length} questões (min: ${nums[0]}, max: ${nums[nums.length-1]})`);
    if (nums.length > 0) {
      console.log(`  Q1: ${qs[1]?.slice(0, 80).replace(/\n/g, ' ')}...`);
    }
  }
}

testBooklets().catch(console.error);
