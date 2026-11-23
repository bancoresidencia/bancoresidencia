import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const getComm = db.prepare("SELECT commentary FROM questions_curated_staging WHERE (id = ? OR id = ? OR code = ?) AND commentary LIKE '%Take-Home%' LIMIT 1");
const valid = ['A', 'B', 'C', 'D', 'E', 'ANULADA'];

const specialties = [
  { name: 'Ginecologia', file: 'data/ginecologia_direto_questions.json' },
  { name: 'Medicina Preventiva', file: 'data/medicina_preventiva_final_questions.json' },
  { name: 'Cirurgia Geral', file: 'data/cirurgia_direto_questions.json' },
  { name: 'Obstetrícia', file: 'data/obstetricia_direto_questions.json' },
  { name: 'Pediatria', file: 'data/pediatria_direto_questions.json' },
  { name: 'Clínica Médica', file: 'data/clinica_direto_questions.json' }
];

const report = [];

for (const s of specialties) {
  if (!fs.existsSync(s.file)) {
    report.push({ name: s.name, error: 'Arquivo não encontrado' });
    continue;
  }
  const all = JSON.parse(fs.readFileSync(s.file, 'utf8'));
  let synced = 0;
  for (const q of all) {
    const comm = q.commentary || '';
    if (!comm.includes('Take-Home')) {
      const row = getComm.get(q.id, 'questions_expansion_direto_' + q.id, q.code);
      if (row && row.commentary) {
        synced++;
        q.commentary = row.commentary;
      }
    }
  }
  if (synced > 0) {
    fs.writeFileSync(s.file, JSON.stringify(all, null, 2), 'utf8');
  }
  const pending = all.filter(q => {
    const ans = (q.correctAnswer || q.correct_answer || q.gabarito || '').toUpperCase().trim();
    const hasValid = valid.includes(ans) || q.is_anulada;
    const comm = q.commentary || '';
    const needs = !comm.includes('Take-Home Message:') && !comm.includes('Take-Home');
    const hasImg = q.images && q.images.length > 0;
    return hasValid && needs && !hasImg;
  });
  report.push({
    especialidade: s.name,
    totalArquivo: all.length,
    sincronizadasDoSQLite: synced,
    pendentesTextoComGabarito: pending.length
  });
}

console.table(report);
