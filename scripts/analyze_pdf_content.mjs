import fs from 'fs';

const content = fs.readFileSync('data/catalogo_pdf_extracted.txt', 'utf8');

console.log('Tamanho do texto extraído:', content.length, 'caracteres');
console.log('--- PRIMEIRAS LINHAS ---');
console.log(content.split('\n').slice(0, 40).join('\n'));

const countDiagConduta = (content.match(/Diagnóstico e Conduta/g) || []).length;
const countDiagTrat = (content.match(/Diagnóstico e Tratamento/g) || []).length;
const countGeriatria = (content.match(/Geriatria/g) || []).length;
const countMiscelanea = (content.match(/Miscelânea/g) || []).length;

console.log('\n--- CONTAGENS ESPECÍFICAS NO PDF ---');
console.log('Diagnóstico e Conduta:', countDiagConduta);
console.log('Diagnóstico e Tratamento:', countDiagTrat);
console.log('Geriatria:', countGeriatria);
console.log('Miscelânea:', countMiscelanea);

// Checar páginas onde ocorrem
function findContexts(pattern, maxCount = 5) {
  const regex = new RegExp(`(.{0,60}${pattern}.{0,60})`, 'gi');
  const matches = [];
  let m;
  while ((m = regex.exec(content)) !== null && matches.length < maxCount) {
    matches.push(m[0].replace(/\n/g, ' '));
  }
  return matches;
}

console.log('\n--- CONTEXTOS DE DIAGNÓSTICO E CONDUTA NO PDF ---');
findContexts('Diagnóstico e Conduta', 6).forEach(c => console.log(' ->', c.trim()));

console.log('\n--- CONTEXTOS DE PEDIATRIA CLÍNICA NO PDF ---');
findContexts(': Diagnóstico e Conduta', 3).forEach(c => console.log(' ->', c.trim()));

console.log('\n--- VERIFICAÇÃO DE TEMAS DE GERIATRIA NO PDF ---');
findContexts('Geriatria', 6).forEach(c => console.log(' ->', c.trim()));

console.log('\n--- VERIFICAÇÃO DE GINECOLOGIA ENDÓCRINA NO PDF ---');
findContexts('Ginecologia Endócrina', 6).forEach(c => console.log(' ->', c.trim()));
