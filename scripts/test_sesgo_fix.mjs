import fs from 'fs';
import { PDFParse } from 'pdf-parse';

function parseSesgoAnswerKey(text) {
  const ansMap = {};
  // Strip page breaks and footers
  const clean = text.replace(/--\s*\d+\s*of\s*\d+\s*--/gi, '')
                    .replace(/Goiânia[\s\S]*$/gi, '')
                    .replace(/\* - Gabarito alterado[\s\S]*$/gi, '');
  const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);
  
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

async function testFix() {
  const gbBuf = new Uint8Array(fs.readFileSync('data/official_exams/SES_GO/SES_GO_2024_GABARITO_DEFINITIVO.pdf'));
  const pGb = new PDFParse(gbBuf);
  await pGb.load();
  const gbTxt = (await pGb.getText()).text || await pGb.getText();
  const map = parseSesgoAnswerKey(gbTxt);
  console.log(`Mapeadas: ${Object.keys(map).length} questões.`);
  console.log(`Q66: ${map[66]}, Q67: ${map[67]}, Q68: ${map[68]}, Q69: ${map[69]}, Q70: ${map[70]}`);
}

testFix().catch(console.error);
