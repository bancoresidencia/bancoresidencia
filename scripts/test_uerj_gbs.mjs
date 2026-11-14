import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

function parseUerjGabarito(text) {
  const map = new Map();
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  for (let i = 0; i < lines.length - 1; i++) {
    const qMatches = [...lines[i].matchAll(/\bR(\d{1,3})\b/g)];
    if (qMatches.length >= 5) {
      const letters = lines[i+1].split(/\s+/).filter(t => /^[A-Ea-eX]$/.test(t));
      if (letters.length === qMatches.length) {
        for (let j = 0; j < qMatches.length; j++) {
          const num = parseInt(qMatches[j][1], 10);
          const ans = letters[j].toUpperCase();
          map.set(num, ans === 'X' ? 'ANULADA' : ans);
        }
      }
    }
  }
  return map;
}

async function testAll() {
  for (const yr of ['2022', '2023', '2024', '2025', '2026']) {
    const gbPath = `data/official_exams/UERJ/UERJ_${yr}_GABARITO_DEFINITIVO.pdf`;
    const buf = new Uint8Array(fs.readFileSync(gbPath));
    const p = new PDFParse({ data: buf });
    await p.load();
    const txt = (await p.getText()).text || await p.getText();
    const res = parseUerjGabarito(txt);
    console.log(`Ano ${yr}: ${res.size} respostas extraídas! Q1=${res.get(1)}, Q2=${res.get(2)}, Q100=${res.get(100)}`);
  }
}

testAll().catch(console.error);
