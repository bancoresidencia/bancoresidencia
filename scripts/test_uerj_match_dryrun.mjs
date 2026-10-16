import fs from 'fs';
import { PDFParse } from 'pdf-parse';

function norm(text) {
  if (!text) return '';
  return text.normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function getTokens(text) {
  return new Set(norm(text).split(' ').filter(w => w.length >= 4));
}

function parseUerjAnswerKey(text) {
  const ansMap = {};
  const clean = text.replace(/UNIVERSIDADE[\s\S]*$/i, '')
                    .replace(/Legenda[\s\S]*$/i, '')
                    .replace(/ACESSO DIRETO[\s\S]*$/i, '')
                    .replace(/PROGRAMAS DO ACESSO DIRETO[\s\S]*$/i, '');
  const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const rMatches = line.match(/\bR(\d+)\b/g);
    if (rMatches && rMatches.length >= 5) {
      const qNums = rMatches.map(m => parseInt(m.replace('R', ''), 10));
      let answers = (lines[i + 1] || '').split(/\s+/).filter(t => /^[A-DX]$/i.test(t));
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

function extractBookletQuestions(text) {
  const startIdx = text.search(/CLÍNICA MÉDICA|1\)\s+[A-Z]/i);
  const bodyTxt = startIdx !== -1 ? text.slice(startIdx) : text;
  const regex = /(?:^|\n)\s*(\d{1,3})\s*[\)\.]\s+/g;
  const matches = [];
  let m;
  while ((m = regex.exec(bodyTxt)) !== null) {
    const qNum = parseInt(m[1], 10);
    if (qNum >= 1 && qNum <= 100) {
      matches.push({ qNum, index: m.index });
    }
  }
  const valid = [];
  let expected = 1;
  for (const item of matches) {
    if (item.qNum === expected) {
      valid.push(item);
      expected++;
    }
  }
  const questions = {};
  for (let i = 0; i < valid.length; i++) {
    const s = valid[i].index;
    const e = i + 1 < valid.length ? valid[i+1].index : bodyTxt.length;
    questions[valid[i].qNum] = bodyTxt.slice(s, e).trim();
  }
  return questions;
}

async function runDryRunAll() {
  const files = fs.readdirSync('data').filter(f => f.endsWith('_final_questions.json')).map(f => 'data/' + f);
  
  for (const year of [2026, 2025, 2024, 2023, 2022]) {
    console.log(`\n=================== UERJ ${year} ===================`);
    
    // 1. Load Answer Key
    const gbBuf = new Uint8Array(fs.readFileSync(`data/official_exams/UERJ/UERJ_${year}_GABARITO_DEFINITIVO.pdf`));
    const pGb = new PDFParse(gbBuf);
    await pGb.load();
    const gbTxt = (await pGb.getText()).text || await pGb.getText();
    const ansMap = parseUerjAnswerKey(gbTxt);
    
    // 2. Load Booklet Questions
    const pvBuf = new Uint8Array(fs.readFileSync(`data/official_exams/UERJ/UERJ_${year}_PROVA_ACESSO_DIRETO.pdf`));
    const pPv = new PDFParse(pvBuf);
    await pPv.load();
    const pvTxt = (await pPv.getText()).text || await pPv.getText();
    const bookletMap = extractBookletQuestions(pvTxt);
    console.log(`Gabarito: ${Object.keys(ansMap).length} q | Caderno: ${Object.keys(bookletMap).length} q`);
    
    let matchedCount = 0;
    let totalYear = 0;
    
    for (const file of files) {
      const qs = JSON.parse(fs.readFileSync(file, 'utf-8'));
      for (const q of qs) {
        const inst = q.institution || '';
        const banca = q.banca || '';
        const qYear = parseInt(q.year, 10);
        
        if ((inst.toLowerCase().includes('uerj') || banca.toLowerCase().includes('uerj')) && qYear === year) {
          totalYear++;
          const qTokens = getTokens(q.statement);
          
          let bestNum = null;
          let bestScore = 0;
          
          for (const [numStr, bText] of Object.entries(bookletMap)) {
            const num = parseInt(numStr, 10);
            const bTokens = getTokens(bText);
            const intersection = [...qTokens].filter(t => bTokens.has(t));
            const score = intersection.length / Math.max(1, qTokens.size);
            if (score > bestScore) {
              bestScore = score;
              bestNum = num;
            }
          }
          
          if (bestScore >= 0.60) {
            matchedCount++;
            const officialAns = ansMap[bestNum];
            // console.log(`  [MATCH] ${q.code} -> Q${bestNum} (${(bestScore*100).toFixed(0)}%) -> ${officialAns}`);
          }
        }
      }
    }
    console.log(`Resultado UERJ ${year}: ${matchedCount} de ${totalYear} questões no banco mapeadas com sucesso!`);
  }
}

runDryRunAll().catch(console.error);
