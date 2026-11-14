import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function testMatch() {
  const pth = 'data/official_exams/SES_GO_2026/PV_ACESSO_DIRETO_A.pdf';
  const buf = new Uint8Array(fs.readFileSync(pth));
  const p = new PDFParse({ data: buf });
  await p.load();
  const txt = (await p.getText()).text || await p.getText();

  console.log('PDF SES-GO 2026 Acesso Direto carregado! Len:', txt.length);
  const keywords = ['coqueluche', 'calendário de vacinação', 'agente etiológico'];
  for (const kw of keywords) {
    const idx = txt.toLowerCase().indexOf(kw.toLowerCase());
    console.log(`Keyword "${kw}": encontrada na pos ${idx}`);
    if (idx !== -1) {
      console.log('Snippet:', txt.slice(idx - 50, idx + 200).replace(/\n/g, ' '));
    }
  }
}

testMatch().catch(console.error);
