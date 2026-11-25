import fs from 'fs';
import path from 'path';

console.log('--- SAMPLE IMAGENS BANCO GERAL ---');
const bgFiles = fs.readdirSync('data/imagens_banco_geral');
console.log('Total in imagens_banco_geral:', bgFiles.length);
console.log('Sample:', bgFiles.slice(0, 5));

console.log('\n--- SAMPLE IMAGENS MEDQ ORIGINAIS ---');
const moFiles = fs.readdirSync('data/imagens_medq_originais');
console.log('Total in imagens_medq_originais:', moFiles.length);
console.log('Sample:', moFiles.slice(0, 5));

console.log('\n--- SAMPLE COMPARACOES ---');
const compFiles = fs.readdirSync('data/comparacoes_antes_depois_medq');
console.log('Total in comparacoes:', compFiles.length);
console.log('Sample:', compFiles.slice(0, 5));

console.log('\n--- BACKUPS DIRECTORIES ---');
const bEntries = fs.readdirSync('data/backups');
console.log('Backups:', bEntries);
