import fs from 'fs';

const rep = JSON.parse(fs.readFileSync('data/relatorio_auditoria_integral_gabaritos.json', 'utf8'));
const cat5Class = JSON.parse(fs.readFileSync('data/cat5_classification.json', 'utf8'));

console.log('=== DISTRIBUIÇÃO DAS INCONGRUÊNCIAS POR ESPECIALIDADE ===\n');

const specCounts = {};
for (const item of cat5Class.type1_trueKeyErrors) {
  specCounts[item.spec] = (specCounts[item.spec] || 0) + 1;
}
console.log('Erros Reais de Gabarito (Tipo 1 - 529 casos):');
for (const [s, c] of Object.entries(specCounts).sort((a,b) => b[1] - a[1])) {
  console.log(`  • ${s.padEnd(25)}: ${c} questões`);
}

const instCounts = {};
for (const item of cat5Class.type1_trueKeyErrors) {
  const inst = (item.institution || item.banca || 'Indefinida').slice(0, 35);
  instCounts[inst] = (instCounts[inst] || 0) + 1;
}
console.log('\nTop 10 Bancas/Instituições com mais Erros Reais de Gabarito:');
for (const [inst, c] of Object.entries(instCounts).sort((a,b) => b[1] - a[1]).slice(0, 10)) {
  console.log(`  • ${inst.padEnd(36)}: ${c} questões`);
}

const yearCounts = {};
for (const item of cat5Class.type1_trueKeyErrors) {
  const y = item.year || 'Sem ano';
  yearCounts[y] = (yearCounts[y] || 0) + 1;
}
console.log('\nDistribuição por Ano:');
for (const [y, c] of Object.entries(yearCounts).sort((a,b) => b[1] - a[1]).slice(0, 8)) {
  console.log(`  • Ano ${y}: ${c} questões`);
}
