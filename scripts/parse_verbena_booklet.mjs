import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

export async function parseVerbenaGabarito(pdfPath) {
  const pGb = new PDFParse({ data: fs.readFileSync(pdfPath) });
  await pGb.load();
  const text = (await pGb.getText()).text || await pGb.getText();

  const answers = {};
  // Format:
  // 01 02 03 04 05
  // C B B D C (or *C B B D C)
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  for (let i = 0; i < lines.length; i++) {
    const l1 = lines[i];
    const nums = l1.split(/\s+/).filter(x => /^\d+$/.test(x));
    if (nums.length >= 3 && i + 1 < lines.length) {
      const l2 = lines[i + 1];
      // Letters can have * or # prefix e.g. *C
      const letters = l2.split(/\s+/).map(x => x.replace(/[*#]/g, '')).filter(x => /^[A-E|X]$/i.test(x));
      if (letters.length === nums.length) {
        for (let j = 0; j < nums.length; j++) {
          answers[parseInt(nums[j], 10)] = letters[j].toUpperCase();
        }
        i++; // skip next line
      }
    }
  }

  // Fallback: check "01 C", "1 A", "01. C", etc
  if (Object.keys(answers).length === 0) {
    const pairRegex = /(\d{1,3})\s*[\.\-–:]?\s*[*#]?([A-E|X])\b/gi;
    let m;
    while ((m = pairRegex.exec(text)) !== null) {
      const qNum = parseInt(m[1], 10);
      if (qNum >= 1 && qNum <= 120 && !answers[qNum]) {
        answers[qNum] = m[2].toUpperCase();
      }
    }
  }

  return answers;
}

export async function parseVerbenaCaderno(pdfPath) {
  const pPv = new PDFParse({ data: fs.readFileSync(pdfPath) });
  await pPv.load();
  const fullText = (await pPv.getText()).text || await pPv.getText();

  // Clean headers/footers
  const clean = fullText
    .replace(/-- \d+ of \d+ --/g, '')
    .replace(/COREME SES\s*-\s*GO[\s\S]*?IV\/UFG/gi, '')
    .replace(/PROCESSO SELETIVO/gi, '')
    .replace(/CADERNO DE QUESTÕES/gi, '')
    .replace(/RASCUNHO/gi, '');

  const questions = {};
  // Regex to split by QUESTÃO XX
  const qRegex = /QUESTÃO\s+(\d+)[\s\r\n]+([\s\S]*?)(?=QUESTÃO\s+\d+|$)/gi;
  let match;
  while ((match = qRegex.exec(clean)) !== null) {
    const qNum = parseInt(match[1], 10);
    const body = match[2].trim();

    // Split statement from alternatives
    // Look for (A) or (A )
    const optSplit = body.search(/\([A-E]\)/i);
    if (optSplit !== -1) {
      const statement = body.slice(0, optSplit).trim().replace(/\s+/g, ' ');
      const optText = body.slice(optSplit);
      
      const options = {};
      const optRegex = /\(([A-E])\)\s*([\s\S]*?)(?=\([A-E]\)|$)/gi;
      let oMatch;
      while ((oMatch = optRegex.exec(optText)) !== null) {
        options[oMatch[1].toUpperCase()] = oMatch[2].trim().replace(/\s+/g, ' ');
      }

      questions[qNum] = {
        qNum,
        statement,
        options
      };
    }
  }

  return questions;
}
