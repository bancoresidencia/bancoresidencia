import fs from 'fs';

const data = JSON.parse(fs.readFileSync('data/pending_amp_questions.json', 'utf8'));
console.log(`Total: ${data.length}`);

data.forEach((q, i) => {
  console.log(`\n========================================================================`);
  console.log(`QUESTÃO ${i + 1} de ${data.length}`);
  console.log(`Código: ${q.code} | Ano: ${q.year} | Especialidade: ${q.especialidade}`);
  console.log(`Tema: ${q.tema} | Foco: ${q.foco}`);
  console.log(`------------------------------------------------------------------------`);
  console.log(`ENUNCIADO:`);
  console.log(q.statement);
  console.log(`------------------------------------------------------------------------`);
  console.log(`ALTERNATIVAS:`);
  if (Array.isArray(q.options)) {
    q.options.forEach(opt => {
      console.log(`  (${opt.letter}) ${opt.text}`);
    });
  } else {
    console.log(q.options);
  }
});

