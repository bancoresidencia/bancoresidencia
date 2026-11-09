import fs from 'fs';

const content = fs.readFileSync('data/catalogo_pdf_extracted.txt', 'utf8');

// Ver páginas 2 a 5 para entender o padrão de formatação
const pages = content.split(/=== PAGE \d+ ===/);

for (let i = 2; i <= 6 && i < pages.length; i++) {
  console.log(`\n********************* PÁGINA ${i} *********************`);
  console.log(pages[i].trim().slice(0, 2000));
}
