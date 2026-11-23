import fs from 'fs';

const raw = fs.readFileSync('data/tables/questions.json', 'utf8');
const list = JSON.parse(raw);

const clinicalCandidates = list.filter(q => {
  const spec = (q.especialidade || q.specialty || '').toLowerCase();
  const stmt = (q.statement || '').toLowerCase();
  const comm = q.commentary || '';
  const opts = q.options || [];
  
  const isGyn = spec.includes('gineco');
  const isSUAClinical = (stmt.includes('sangramento uterino anormal') || stmt.includes('sangramento vaginal') || stmt.includes('sua') || stmt.includes('palm-coein') || stmt.includes('hipermenorreia') || stmt.includes('metrorragia')) && stmt.length > 100;
  const hasGeminiComm = comm.length > 250;

  return isGyn && isSUAClinical && hasGeminiComm && opts.length >= 4 && (q.correct_answer || q.correctAnswer);
});

console.log('Total clinical SUA candidates:', clinicalCandidates.length);
if (clinicalCandidates.length > 0) {
  // Pega um caso bem rico e representativo
  const selected = clinicalCandidates[0];
  fs.writeFileSync('scripts/selected_gyn_question.json', JSON.stringify(selected, null, 2), 'utf8');
  console.log('Selected Clinical SUA Question ID:', selected.id);
  console.log('Statement:\n', selected.statement.slice(0, 300));
}
