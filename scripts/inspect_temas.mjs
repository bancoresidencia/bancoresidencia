import fs from 'fs';
const txt = fs.readFileSync('src/data/clinicaMedicaData.ts', 'utf8');
const lines = txt.split('\n').filter(l => l.includes('"tema":')).map(l => l.trim());
console.log(lines);
