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

function parseSesgoAnswerKey(text) {
  const ansMap = {};
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const tokens = line.split(/\s+/);
    if (tokens.every(t => /^\d{1,3}$/.test(t)) && tokens.length >= 4) {
      const qNums = tokens.map(t => parseInt(t, 10));
      const nextLine = lines[i + 1] || '';
      const ansTokens = nextLine.split(/\s+/).map(t => t.replace(/[*#]/g, '').toUpperCase());
      if (ansTokens.length === qNums.length) {
        for (let j = 0; j < qNums.length; j++) {
          const ans = ansTokens[j];
          ansMap[qNums[j]] = ans === 'X' ? 'ANULADA' : ans;
        }
      }
    }
  }
  return ansMap;
}

function extractSesgoBooklet(text) {
  const regex = /(?:^|\n)\s*(?:QUESTÃO|QUESTAO)\s+(\d{1,3})/gi;
  const matches = [];
  let m;
  while ((m = regex.exec(text)) !== null) {
    matches.push({ qNum: parseInt(m[1], 10), index: m.index });
  }
  const questions = {};
  for (let i = 0; i < matches.length; i++) {
    const s = matches[i].index;
    const e = i + 1 < matches.length ? matches[i+1].index : text.length;
    questions[matches[i].qNum] = text.slice(s, e).trim();
  }
  return questions;
}

async function testMatch() {
  const year = 2024;
  console.log(`=== TESTE MATCHING SES-GO ${year} ===`);
  const gbBuf = new Uint8Array(fs.readFileSync(`data/official_exams/SES_GO/SES_GO_${year}_GABARITO_DEFINITIVO.pdf`));
  const pGb = new PDFParse(gbBuf);
  await pGb.load();
  const gbTxt = (await pGb.getText()).text || await pGb.getText();
  const ansMap = parseSesgoAnswerKey(gbTxt);
  console.log(`Gabarito: ${Object.keys(ansMap).length} questões mapeadas.`);

  const pvBuf = new Uint8Array(fs.readFileSync(`data/official_exams/SES_GO/SES_GO_${year}_PROVA_ACESSO_DIRETO.pdf`));
  const pPv = new PDFParse(pvBuf);
  await pPv.load();
  const pvTxt = (await pPv.getText()).text || await pPv.getText();
  const bookletMap = extractSesgoBooklet(pvTxt);
  console.log(`Caderno: ${Object.keys(bookletMap).length} questões extraídas.`);

  const files = fs.readdirSync('data').filter(f => f.endsWith('_final_questions.json')).map(f => 'data/' + f);
  let matched = 0;
  let total = 0;

  for (const f of files) {
    const list = JSON.parse(fs.readFileSync(f, 'utf-8'));
    for (const q of list) {
      const inst = q.institution || '';
      const banca = q.banca || '';
      if ((inst.toLowerCase().includes('ses-go') || banca.toLowerCase().includes('ses-go') || inst.toLowerCase().includes('goiás')) && parseInt(q.year, 10) === year) {
        total++;
        const qToks = getTokens(q.statement);
        let bestNum = null;
        let bestScore = 0;
        for (const [numStr, bText] of Object.entries(bookletMap)) {
          const num = parseInt(numStr, 10);
          const bToks = getTokens(bText);
          const inter = [...qToks].filter(t => bToks.has(t)).length;
          const score = inter / Math.max(1, qToks.size);
          if (score > bestScore) {
            bestScore = score;
            bestNum = num;
          }
        }
        if (bestScore >= 0.60) {
          matched++;
          console.log(`  [MATCH] ${q.code || q.id.slice(0,8)} -> Q${bestNum} (${(bestScore*100).toFixed(0)}%) = ${ansMap[bestNum]}`);
        }
      }
    }
  }
  console.log(`Total SES-GO ${year} no banco: ${total} | Mapeadas: ${matched}`);
}

testMatch().catch(console.error);
