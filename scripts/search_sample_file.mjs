import fs from 'fs';
import path from 'path';

const needle = '13702fdf';
const dirs = [
  'data/imagens_medq_originais',
  'data/imagens_higienizadas_medq',
  'data/comparacoes_antes_depois_medq',
  'data/imagens_resgatadas_gate6',
  'data/imagens_convertidas_webp',
  'data/imagens_provaderesidencia',
  'data/imagens_banco_geral'
];

for (const d of dirs) {
  if (fs.existsSync(d)) {
    const files = fs.readdirSync(d);
    const found = files.filter(f => f.includes(needle));
    console.log(`${d}: found ${found.length} files:`, found);
  }
}
