import fs from 'fs';
import { extractPdfText, norm } from './pdf_crossref_utils.mjs';

async function deepSearch2025() {
  const txt = await extractPdfText('data/official_exams/AMP_PARANA/AMP_2025_PROVA_GERAL.pdf');
  const nTxt = norm(txt);
  console.log('Tamanho texto normalizado AMP 2025:', nTxt.length);

  const keywords = [
    { code: 'AMP-2025-OBS-2852', words: ['imunoglobulina', 'coombs', 'concepto', 'antonio', 'joana'] },
    { code: 'AMP-2025-CIR-4510', words: ['subescapular', 'intercostal', 'enfisema', 'ferimento'] },
    { code: 'AMP-2025-CIR-2971', words: ['telhado', 'siate', 'anisocoria', 'intubacao'] },
    { code: 'AMP-2025-CLM-28322', words: ['leptospirose', 'espiroquetas', 'enchente', 'ictericia'] },
    { code: 'AMP-2025-MPS-7040', words: ['paternalista', 'consentimento', 'moral', 'relacao'] },
    { code: 'AMP-2025-CIR-1946', words: ['enteral', 'parenteral', 'jejunostomia', 'translocacao'] }
  ];

  for (const k of keywords) {
    console.log(`\nBuscando palavras-chave de ${k.code}:`);
    for (const w of k.words) {
      const nw = norm(w);
      const has = nTxt.includes(nw);
      console.log(`  - "${w}": ${has ? 'PRESENTE' : 'AUSENTE'}`);
    }
  }
}

deepSearch2025();

