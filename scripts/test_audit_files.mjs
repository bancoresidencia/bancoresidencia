import fs from 'fs';
import path from 'path';

const QUESTION_FILES = [
  { spec: 'cirurgia', name: 'Cirurgia Geral', file: 'data/cirurgia_final_questions.json' },
  { spec: 'clinica_medica', name: 'Clínica Médica', file: 'data/clinica_medica_final_questions.json' },
  { spec: 'ginecologia', name: 'Ginecologia', file: 'data/ginecologia_final_questions.json' },
  { spec: 'medicina_preventiva', name: 'Medicina Preventiva', file: 'data/medicina_preventiva_final_questions.json' },
  { spec: 'obstetricia', name: 'Obstetrícia', file: 'data/obstetricia_final_questions.json' },
  { spec: 'pediatria', name: 'Pediatria', file: 'data/pediatria_final_questions.json' },
  { spec: 'urologia', name: 'Urologia', file: 'data/urologia_final_questions.json' }
];

console.log('Verificando existência e contagem dos arquivos de questões:');
for (const qf of QUESTION_FILES) {
  if (fs.existsSync(qf.file)) {
    const stats = fs.statSync(qf.file);
    console.log(`- ${qf.name}: ${(stats.size / (1024 * 1024)).toFixed(1)} MB`);
  } else {
    console.log(`- ${qf.name}: NÃO ENCONTRADO (${qf.file})`);
  }
}
