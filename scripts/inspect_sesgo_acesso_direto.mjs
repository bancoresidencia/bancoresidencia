import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function inspectAcessoDireto() {
  const dir = path.resolve('data/official_exams/SES_GO_2026');
  
  // Gabarito
  const pGb = new PDFParse({ data: fs.readFileSync(path.join(dir, 'GB_ACESSO_DIRETO_A.pdf')) });
  await pGb.load();
  const gbText = (await pGb.getText()).text || await pGb.getText();
  console.log('=== GABARITO ACESSO DIRETO A ===\n', gbText);

  // Prova
  const pPv = new PDFParse({ data: fs.readFileSync(path.join(dir, 'PV_ACESSO_DIRETO_A.pdf')) });
  await pPv.load();
  const pvText = (await pPv.getText()).text || await pPv.getText();
  console.log('=== PROVA ACESSO DIRETO A (sample 1500-3000) ===\n', pvText.slice(1500, 3000));
}

inspectAcessoDireto();
