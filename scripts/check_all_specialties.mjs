import fs from 'fs';

const files = [
  'clinica_medica_final_questions.json',
  'cirurgia_final_questions.json',
  'ginecologia_final_questions.json',
  'obstetricia_final_questions.json',
  'pediatria_final_questions.json',
  'medicina_preventiva_final_questions.json'
];

let grandTotalWithComments = 0;

for (const f of files) {
  const p = 'data/' + f;
  if (fs.existsSync(p)) {
    const d = JSON.parse(fs.readFileSync(p, 'utf8'));
    const solved = d.filter(q => q.finalCommentary || q.commentary);
    console.log(`${f}: ${solved.length} com comentário (de ${d.length} totais)`);
    grandTotalWithComments += solved.length;
  }
}

console.log(`\nTOTAL GERAL DE QUESTÕES COM COMENTÁRIOS NO BANCO: ${grandTotalWithComments}`);

