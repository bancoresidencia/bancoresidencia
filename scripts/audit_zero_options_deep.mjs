import fs from 'fs';

const files = [
  { name: 'Cirurgia Geral', file: 'cirurgia_final_questions.json' },
  { name: 'Clínica Médica', file: 'clinica_medica_final_questions.json' },
  { name: 'Ginecologia', file: 'ginecologia_final_questions.json' },
  { name: 'Medicina Preventiva', file: 'medicina_preventiva_final_questions.json' },
  { name: 'Nefrologia', file: 'nefrologia_final_questions.json' },
  { name: 'Obstetrícia', file: 'obstetricia_final_questions.json' },
  { name: 'Pediatria', file: 'pediatria_final_questions.json' },
  { name: 'Urologia', file: 'urologia_final_questions.json' }
];

console.log('='.repeat(80));
console.log('DISTRIBUIÇÃO DOS ITENS COM ZERO OPTIONS (SEM ALTERNATIVAS) POR ESPECIALIDADE:');
console.log('='.repeat(80));

let sum = 0;
for (const item of files) {
  const qs = JSON.parse(fs.readFileSync('data/' + item.file, 'utf8'));
  const zeroOpts = qs.filter(q => Array.isArray(q.options) && q.options.length === 0);
  sum += zeroOpts.length;

  const currentTypes = {};
  const currentAns = {};
  let anuladas = 0;

  for (const q of zeroOpts) {
    const t = q.type || 'NULL';
    currentTypes[t] = (currentTypes[t] || 0) + 1;
    const a = (q.correct_answer || q.correctAnswer || 'VAZIO').trim();
    currentAns[a] = (currentAns[a] || 0) + 1;
    if (q.is_anulada || q.isAnulada) anuladas++;
  }

  console.log(`${item.name.padEnd(25)}: ${String(zeroOpts.length).padStart(4)} itens`);
  console.log(`   └─ types     : ${JSON.stringify(currentTypes)}`);
  console.log(`   └─ answers   : ${JSON.stringify(currentAns)}`);
  console.log(`   └─ is_anulada: ${anuladas}`);
}
console.log('='.repeat(80));
console.log(`TOTAL SOMADO: ${sum}`);

