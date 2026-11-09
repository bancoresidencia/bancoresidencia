import fs from 'fs';

const content = fs.readFileSync('data/catalogo_pdf_extracted.txt', 'utf8');
const pages = content.split(/=== PAGE \d+ ===/);

console.log('--- LINHAS DA PÁGINA 2 ---');
const p2Lines = pages[2].trim().split('\n');
p2Lines.forEach((l, idx) => console.log(`${idx}: ${l}`));
