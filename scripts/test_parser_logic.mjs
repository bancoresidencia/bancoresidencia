import fs from 'fs';

const content = fs.readFileSync('data/catalogo_pdf_extracted.txt', 'utf8');
const pages = content.split(/=== PAGE \d+ ===/);

console.log('Testando parser em páginas selecionadas...');

// Vamos olhar as páginas 2, 3, 26, 41, 58, 76, 105
[2, 3, 26, 41, 58, 76, 105].forEach(pageIdx => {
  const p = pages[pageIdx].trim();
  const lines = p.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Encontrar onde começam os sub_subfocos (linhas que terminam com ↳ ou contêm ↳)
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
  console.log('Linhas de Topo (Especialidade / Tema / Focos / Subfocos):', topLines.length);
  topLines.slice(0, 10).forEach((l, i) => console.log(`  top[${i}]: ${l}`));
  console.log('Linhas de Sub-subfocos (↳):', subSubLines.length);
  subSubLines.slice(0, 5).forEach((l, i) => console.log(`  subSub[${i}]: ${l}`));
});
