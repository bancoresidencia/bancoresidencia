import fs from 'fs';
import path from 'path';

const tableFiles = [
  'data/tables/questions.json',
  'data/tables/questions_expansion_direto.json',
  'data/tables/questions_expansion_revalida.json',
  'data/all_homologated_questions_gold.json'
];

let selected = null;

for (const tf of tableFiles) {
  if (!fs.existsSync(tf)) continue;
  console.log(`Checking ${tf}...`);
  try {
    const raw = fs.readFileSync(tf, 'utf8');
    const data = JSON.parse(raw);
    const list = Array.isArray(data) ? data : (data.questions || []);
    
    for (const q of list) {
      const spec = (q.especialidade || q.specialty || '').toLowerCase();
      const stmt = (q.statement || '').toLowerCase();
      const tema = (q.tema || '').toLowerCase();
      const comm = q.commentary || '';

      const isGyn = spec.includes('gineco');
      const isSUA = stmt.includes('sangramento uterino') || stmt.includes('sangramento vaginal') || stmt.includes('metrorragia') || tema.includes('sangramento');
      const hasGeminiComm = comm.length > 300 && (comm.includes('**') || comm.includes('optionExplanations') || comm.includes('PALM-COEIN') || comm.includes('gabarito'));

      if (isGyn && isSUA && hasGeminiComm) {
        // Verifica se é múltipla escolha com opções
        const opts = q.options || [];
        if (opts.length >= 4 && (q.correct_answer || q.correctAnswer)) {
          selected = q;
          console.log(`Found candidate in ${tf}: ID ${q.id}`);
          break;
        }
      }
    }
  } catch (e) {
    console.error(`Error reading ${tf}:`, e.message);
  }
  if (selected) break;
}

if (!selected) {
  console.log('No candidate found in primary tables, searching broader...');
} else {
  fs.writeFileSync('scripts/selected_gyn_question.json', JSON.stringify(selected, null, 2), 'utf8');
  console.log('Saved selected question to scripts/selected_gyn_question.json');
}
