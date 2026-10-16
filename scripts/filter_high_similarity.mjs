import fs from 'fs';

const matches = JSON.parse(fs.readFileSync('data/lote2_official_matches_ready.json', 'utf8'));
console.log('Total de matches brutos:', matches.length);

const ge80 = matches.filter(m => m.score >= 0.80);
const ge75 = matches.filter(m => m.score >= 0.75 && m.score < 0.80);
const ge70 = matches.filter(m => m.score >= 0.70 && m.score < 0.75);

console.log(`• Score >= 0.80 (Praticamente Idênticas / Quase 100%): ${ge80.length}`);
console.log(`• Score 0.75 a 0.79 (Altíssima Similaridade Textual): ${ge75.length}`);
console.log(`• Score 0.70 a 0.74 (Quase Total Similaridade): ${ge70.length}`);

// Filtrar apenas com Score >= 0.70 (Quase total similaridade)
const ultraStrict = matches.filter(m => m.score >= 0.70);
console.log(`\n🎯 TOTAL ULTRA-ESTRITO (Score >= 0.70): ${ultraStrict.length}`);

console.log('\nExemplos de casos clínicos com quase total similaridade:');
for (const m of ultraStrict.slice(0, 5)) {
  console.log(`\n[Score: ${(m.score * 100).toFixed(1)}%] ${m.code} | Banca: ${m.banca} | Gabarito Oficial: ${m.correct_answer}`);
}

fs.writeFileSync('data/lote2_ultra_strict_matches.json', JSON.stringify(ultraStrict, null, 2), 'utf8');
console.log('\nSalvo em data/lote2_ultra_strict_matches.json');
