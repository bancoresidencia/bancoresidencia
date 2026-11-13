import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

export async function parseFubogGabarito(pdfPath) {
  const p = new PDFParse({ data: fs.readFileSync(pdfPath) });
  await p.load();
  const text = (await p.getText()).text || await p.getText();

  const answers = {};
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    const m = line.match(/^(\d{1,3})\s+([A-D|X])$/i);
    if (m) {
      answers[parseInt(m[1], 10)] = m[2].toUpperCase();
    }
    const anMatch = line.match(/Quest[aã]o\s+(\d+).*?anulada/i);
    if (anMatch) {
      answers[parseInt(anMatch[1], 10)] = 'X';
    }
  }
  return answers;
}

export async function parseFubogExamPdf(pdfPath) {
  const p = new PDFParse({ data: fs.readFileSync(pdfPath) });
  await p.load();
  const text = (await p.getText()).text || await p.getText();

  const questions = {};
  const lines = text.split('\n');

  let currentQ = null;
  let currentOpt = null;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    if (line.includes('Prova Objetiva - FUBOG') || line.includes('-- ') || line.includes('Residência Médica de')) continue;
    if (line === 'CLÍNICA MÉDICA' || line === 'CIRURGIA GERAL' || line === 'PEDIATRIA' || line === 'GINECOLOGIA E OBSTETRÍCIA' || line === 'MEDICINA PREVENTIVA E SOCIAL') continue;

    // Detect question start: "01. ", "100. "
    const qMatch = line.match(/^(\d{1,3})\.\s+(.*)$/);
    if (qMatch) {
      if (currentQ) {
        if (currentOpt) currentQ.options[currentOpt.letter] = currentOpt.text.trim();
        questions[currentQ.num] = currentQ;
      }
      currentQ = {
        num: parseInt(qMatch[1], 10),
        statement: qMatch[2],
        options: {}
      };
      currentOpt = null;
      continue;
    }

    // Detect option: "(A) ", "(B) "
    const optMatch = line.match(/^\(([A-D])\)\s+(.*)$/);
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
