import fs from 'fs';
import { PDFParse } from 'pdf-parse';

function parseUerjAnswerKey(text) {
  const ansMap = {};
  
  // Match "R<num>" tokens
  const rTokens = text.match(/R\d+/g) || [];
  if (rTokens.length === 0) return ansMap;
  
  // Let's find where letters are
  // Remove headers and footers
  const clean = text.replace(/UNIVERSIDADE[\s\S]*$/i, '')
                    .replace(/Legenda[\s\S]*$/i, '')
                    .replace(/ACESSO DIRETO[\s\S]*$/i, '');
                    
  // Find lines
  const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const rMatches = line.match(/\bR(\d+)\b/g);
    if (rMatches && rMatches.length >= 5) {
      const qNums = rMatches.map(m => parseInt(m.replace('R', ''), 10));
      // Next line might contain the answers
      let nextLine = lines[i + 1] || '';
      let answers = nextLine.split(/\s+/).filter(t => /^[A-DX]$/i.test(t));
      
      // If same line has the answers right after:
      if (answers.length === 0 && i + 1 < lines.length) {
        // Maybe all R1..R100 were in one line and next line had all 100 answers!
        answers = lines[i + 1].split(/\s+/).filter(t => /^[A-DX]$/i.test(t));
      }
      
      if (answers.length === qNums.length) {
        for (let j = 0; j < qNums.length; j++) {
          const ans = answers[j].toUpperCase();
          ansMap[qNums[j]] = ans === 'X' ? 'ANULADA' : ans;
        }
      }
    }
  }
  
  return ansMap;
}

async function testAll() {
  for (const y of [2026, 2025, 2024, 2023, 2022]) {
    const buf = new Uint8Array(fs.readFileSync(`data/official_exams/UERJ/UERJ_${y}_GABARITO_DEFINITIVO.pdf`));
    const p = new PDFParse(buf);
    await p.load();
    const txt = (await p.getText()).text || await p.getText();
    const map = parseUerjAnswerKey(txt);
    const keys = Object.keys(map).map(Number).sort((a,b)=>a-b);
    console.log(`[UERJ ${y}] Mapeadas ${keys.length} questões (min: ${keys[0]}, max: ${keys[keys.length-1]})`);
    const anuladas = keys.filter(k => map[k] === 'ANULADA');
    console.log(`  Anuladas (${anuladas.length}): ${anuladas.join(', ')}`);
  }
}

testAll().catch(console.error);
