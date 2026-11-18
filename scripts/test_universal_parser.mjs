import fs from 'fs';
import { parseUniversalMedicalHtml } from './universal_medical_web_parser.mjs';

const html = fs.readFileSync('scripts/estrategia_sample.html', 'utf8');
const result = parseUniversalMedicalHtml(html, 'https://med.estrategia.com/public/questoes/Mulher-45-anos-procura64a862e1a7/');

console.log('Result from Universal Parser:');
console.log('Source:', result?.source);
console.log('Statement:', result?.statement?.slice(0, 100));
console.log('Correct Letter:', result?.correctLetter);
console.log('Alternatives count:', result?.alternatives?.length);
result?.alternatives?.forEach(a => console.log(`  [${a.letter}] ${a.correct ? '★' : ' '} ${a.text}`));
