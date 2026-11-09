import fs from 'fs';

const content = fs.readFileSync('data/catalogo_pdf_extracted.txt', 'utf8');
const pages = content.split(/=== PAGE \d+ ===/);

[42, 59, 77, 106].forEach(pageIdx => {
  const p = pages[pageIdx].trim();
  const lines = p.split('\n').map(l => l.trim()).filter(Boolean);
  
  const subSubLines = [];
  const topLines = [];
  
  lines.forEach(l => {
    if (l.includes('↳')) {
      subSubLines.push(l.replace(/↳/g, '').trim());
    } else if (!l.includes('Banco Residência •') && !l.includes('Padrão-Ouro de Preparação')) {
      topLines.push(l);
    }
  });

  console.log(`\n=================== PÁGINA ${pageIdx} ===================`);
  console.log('Linhas de Topo:', topLines.length);
  topLines.slice(0, 8).forEach((l, i) => console.log(`  top[${i}]: ${l}`));
  console.log('Linhas de Sub-subfocos (↳):', subSubLines.length);
  subSubLines.slice(0, 4).forEach((l, i) => console.log(`  subSub[${i}]: ${l}`));
});
