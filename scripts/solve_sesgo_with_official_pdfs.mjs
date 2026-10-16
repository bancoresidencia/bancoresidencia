import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

function parseGrid(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const map = new Map();
  
  for (let i = 0; i < lines.length - 1; i++) {
    const nums = lines[i].split(/\s+/);
    const answers = lines[i+1].split(/\s+/);
    
    // Se a primeira linha contiver números sequenciais (ex: 01 02 03 04 05 ou 11 12 13 14 15)
    if (nums.every(n => /^\d+$/.test(n)) && answers.length === nums.length) {
      if (answers.every(a => /^[A-EX\*]$/i.test(a.replace(/[\*]/g, '')))) {
        for (let j = 0; j < nums.length; j++) {
          const qNum = parseInt(nums[j], 10);
          let ans = answers[j].toUpperCase().replace(/\*/g, '');
          if (ans === 'X') ans = 'ANULADA';
          map.set(qNum, ans);
        }
      }
    }
  }
  return map;
}

async function run() {
  console.log('Extraindo gabaritos oficiais da SES-GO...');
  
  const g2024Buf = fs.readFileSync('data/official_exams/SES_GO/SES_GO_2024_GABARITO_DEFINITIVO.pdf');
  const p2024 = new PDFParse({ data: g2024Buf });
  await p2024.load();
  const text2024 = await p2024.getText();
  const map2024 = parseGrid(text2024.text || text2024);
  console.log(`SES-GO 2024: ${map2024.size} questões extraídas`);
  
  const g2026Buf = fs.readFileSync('data/official_exams/SES_GO/SES_GO_2026_GABARITO_DEFINITIVO.pdf');
  const p2026 = new PDFParse({ data: g2026Buf });
  await p2026.load();
  const text2026 = await p2026.getText();
  const map2026 = parseGrid(text2026.text || text2026);
  console.log(`SES-GO 2026: ${map2026.size} questões extraídas`);

  const g2023Buf = fs.readFileSync('data/official_exams/SES_GO/SES_GO_2023_GABARITO_DEFINITIVO.pdf');
  const p2023 = new PDFParse({ data: g2023Buf });
  await p2023.load();
  const text2023 = await p2023.getText();
  const map2023 = parseGrid(text2023.text || text2023);
  console.log(`SES-GO 2023: ${map2023.size} questões extraídas`);

  const pending = JSON.parse(fs.readFileSync('data/lote2_pending_index.json', 'utf8'));
  const sesGoPending = pending.filter(q => (q.banca || '').includes('SES-GO') || (q.institution || '').includes('SES-GO') || (q.institution || '').includes('SES GO'));
  console.log(`Total de pendências SES-GO no índice: ${sesGoPending.length}`);

  const resolved = [];
  for (const q of sesGoPending) {
    let yearMap = null;
    if (q.year === 2024) yearMap = map2024;
    else if (q.year === 2026) yearMap = map2026;
    else if (q.year === 2023) yearMap = map2023;

    if (!yearMap) continue;

    // Tentar identificar o número da questão pelo código ou pelo statement
    // Código ex: SES-GO-2024-R1-45 ou similar
    let qNum = null;
    const matchNum = (q.code || '').match(/-(\d+)$/);
    if (matchNum) {
      qNum = parseInt(matchNum[1], 10);
    }

    if (qNum && yearMap.has(qNum)) {
      const ans = yearMap.get(qNum);
      resolved.push({
        id: q.id,
        code: q.code,
        institution: q.institution,
        banca: q.banca,
        year: q.year,
        correct_answer: ans,
        commentary: `Gabarito Oficial Definitivo pós-recurso SES-GO ${q.year} (Edital Oficial Instituto Verbena / UFG)`,
        match_type: 'OFFICIAL_SESGO_PDF'
      });
    }
  }

  console.log(`Questões resolvidas da SES-GO: ${resolved.length}`);
  if (resolved.length > 0) {
    fs.writeFileSync('data/sesgo_resolved.json', JSON.stringify(resolved, null, 2), 'utf8');
    console.log('Salvo em data/sesgo_resolved.json');
  }
}

run().catch(console.error);
