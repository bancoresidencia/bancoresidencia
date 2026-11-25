import fs from 'fs';
import path from 'path';

const BANCO_GERAL_DIR = path.resolve('data/imagens_banco_geral');
const CONVERTED_DIR = path.resolve('data/imagens_convertidas_webp');

const testNames = [
  'clean_8a8f4a8e_gestante-29-semanas-com-dois-tratamentos-previos-para-sifili-01.webp',
  'clean_questions_29adac0f-e8dc-5b19-a48d-e9fc66cc1352_converted_250_q089-figure.webp'
];

for (const baseName of testNames) {
  const candidateBases = [
    baseName,
    baseName.replace(/^clean_/, ''),
    baseName.replace(/^clean_questions_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}_/i, ''),
    baseName.replace(/^clean_questions_[a-zA-Z0-9_-]+?_(?=converted|orig|[0-9a-f]{8}_)/i, ''),
    baseName.replace(/^clean_[a-zA-Z0-9_-]+_/, '')
  ];

  let found = null;
  for (const b of candidateBases) {
    if (fs.existsSync(path.join(BANCO_GERAL_DIR, b))) {
      found = path.join(BANCO_GERAL_DIR, b);
      break;
    }
    if (fs.existsSync(path.join(CONVERTED_DIR, b))) {
      found = path.join(CONVERTED_DIR, b);
      break;
    }
  }

  console.log(`${baseName} -> found:`, Boolean(found), found);
}
