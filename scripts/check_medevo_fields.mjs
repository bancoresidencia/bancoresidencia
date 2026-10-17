import fs from 'fs';

const uro = JSON.parse(fs.readFileSync('data/urologia_medevo_extracted.json', 'utf8'));
const q0 = uro.questions[0];
console.log('Total questions in urologia:', uro.questions.length);
console.log('Keys of question[0]:', Object.keys(q0));

// Busca campos que contenham links, referências ou materiais
let foundFields = new Set();
let sampleReferences = [];

for (const q of uro.questions) {
  for (const [k, v] of Object.entries(q)) {
    if (typeof v === 'string' && (v.includes('http') || v.includes('pdf') || v.includes('doi.org') || v.includes('diretriz'))) {
      foundFields.add(k);
    } else if (Array.isArray(v)) {
      v.forEach(item => {
        if (typeof item === 'string' && (item.includes('http') || item.includes('pdf'))) {
          foundFields.add(`${k}[]`);
        } else if (typeof item === 'object' && item !== null) {
          Object.keys(item).forEach(subK => {
            if (typeof item[subK] === 'string' && (item[subK].includes('http') || item[subK].includes('pdf'))) {
              foundFields.add(`${k}[].${subK}`);
            }
          });
        }
      });
    } else if (typeof v === 'object' && v !== null) {
      Object.keys(v).forEach(subK => {
        if (typeof v[subK] === 'string' && (v[subK].includes('http') || v[subK].includes('pdf'))) {
          foundFields.add(`${k}.${subK}`);
        }
      });
    }
  }
}

console.log('Campos com links/referências encontrados:', Array.from(foundFields));
