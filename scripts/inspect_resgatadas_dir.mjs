import fs from 'fs';
import path from 'path';

const files = fs.readdirSync('data/imagens_resgatadas_gate6');
console.log('Total files in imagens_resgatadas_gate6:', files.length);

const types = {};
for (const f of files) {
  if (f.endsWith('_clean.webp')) types['clean_webp'] = (types['clean_webp'] || 0) + 1;
  else if (f.endsWith('_sanar.webp')) types['sanar_webp'] = (types['sanar_webp'] || 0) + 1;
  else {
    const ext = path.extname(f);
    types[ext] = (types[ext] || 0) + 1;
  }
}
console.log('Types in imagens_resgatadas_gate6:', types);
