import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const nonMatchedStatements = [
  "Homem de 45 anos de idade, com antecedentes de litíase renal, é admitido em Serviço de Emergência",
  "Homem de 67 anos de idade, sem comorbidades relevantes, é admitido em Pronto-Socorro com dor",
  "Homem de 21 anos de idade, indígena, radicado em grande centro urbano",
  "Criança de 5 anos de idade, do sexo masculino, parda, com histórico de dermatite atópica"
];

const pdfs = {
  '2024': 'data/official_exams/ABEM/TPN2024_Caderno_Prova_v1.pdf',
  '2025': 'C:/Users/cnath/.gemini/antigravity/brain/9618f204-3788-45d2-8b60-26cb27d0dbd1/.user_uploaded/media_1794604731653_272749d2.pdf',
  '2025_noite': 'data/official_exams/ABEM/TPN25_Caderno_Prova_19h30.pdf',
  '2026': 'C:/Users/cnath/.gemini/antigravity/brain/9618f204-3788-45d2-8b60-26cb27d0dbd1/.user_uploaded/media_1794604731740_a22389df.pdf'
};

async function checkNonMatched() {
  for (const [name, pth] of Object.entries(pdfs)) {
    if (!fs.existsSync(pth)) continue;
    const buf = new Uint8Array(fs.readFileSync(pth));
    const p = new PDFParse({ data: buf });
    await p.load();
    const txt = (await p.getText()).text || await p.getText();
    
    console.log(`\nVerificando em ${name}...`);
    for (const stmt of nonMatchedStatements) {
      const keyword = stmt.split(',')[0];
      const found = txt.toLowerCase().includes(keyword.toLowerCase());
      if (found) {
        console.log(`  -> ENCONTRADO em ${name}: "${keyword}"`);
      }
    }
  }
}

checkNonMatched().catch(console.error);
