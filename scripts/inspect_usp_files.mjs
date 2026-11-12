import fs from 'fs';
import path from 'path';

const USP_DIR = path.resolve('data/official_exams/USP_FUVEST');
const files = fs.readdirSync(USP_DIR);

console.log(`Arquivos em USP_FUVEST (${files.length}):`);
const byYear = {};
for (const f of files) {
  const match = f.match(/20\d\d/);
  const y = match ? match[0] : 'outros';
  byYear[y] = (byYear[y] || 0) + 1;
}

console.log('Distribuição por ano em USP_FUVEST:', byYear);
console.log('\nAmostra de 15 arquivos:');
console.log(files.slice(0, 15));

