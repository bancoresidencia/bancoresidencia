import fs from 'fs';

const logPath = 'C:\\Users\\cnath\\.gemini\\antigravity\\brain\\9618f204-3788-45d2-8b60-26cb27d0dbd1\\.system_generated\\logs\\transcript_full.jsonl';
const text = fs.readFileSync(logPath, 'utf8');

const targetStr = 'esta aqui os gabaritos e os cadernos de prova da abem';
const idx = text.indexOf(targetStr);

if (idx === -1) {
  console.error('Target not found');
  process.exit(1);
}

// Encontra o início da linha (último \n antes de idx)
const lineStart = text.lastIndexOf('\n', idx);
const lineEnd = text.indexOf('\n', idx);

const line = text.slice(lineStart + 1, lineEnd !== -1 ? lineEnd : text.length);
const obj = JSON.parse(line);

console.log('Objeto encontrado! Tipo:', obj.type, 'Source:', obj.source, 'Tamanho do conteúdo:', obj.content.length);
fs.writeFileSync('data/abem_raw_content.txt', obj.content, 'utf8');
console.log('Salvo em data/abem_raw_content.txt');

