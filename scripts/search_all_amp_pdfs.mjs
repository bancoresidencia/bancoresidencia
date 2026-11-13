import fs from 'fs';
import path from 'path';
import { extractPdfText, norm } from './pdf_crossref_utils.mjs';

async function searchAllAmpPdfs() {
  const dir = 'data/official_exams/AMP_PARANA';
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'));
  console.log(`Buscando em ${files.length} arquivos PDF da pasta AMP_PARANA...`);

  const terms = ['leptospirose', 'espiroquetas', 'subescapular', 'paternalista', 'jejunostomia', 'coombs', 'rokitanski', 'munchhausen'];

  for (const f of files) {
    const fullPath = path.join(dir, f);
    const txt = await extractPdfText(fullPath);
    if (txt.length < 500) continue;
    const nTxt = norm(txt);

    const hits = terms.filter(t => nTxt.includes(norm(t)));
    if (hits.length > 0) {
      console.log(`\n>>> ENCONTRADO em ${f} (${txt.length} chars)! Termos: ${hits.join(', ')}`);
    }
  }
}

searchAllAmpPdfs();

