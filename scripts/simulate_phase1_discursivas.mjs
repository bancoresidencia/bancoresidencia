import fs from 'fs';
import path from 'path';

const files = [
  { key: 'cirurgia', name: 'Cirurgia Geral', file: 'data/cirurgia_final_questions.json' },
  { key: 'clinica', name: 'Clínica Médica', file: 'data/clinica_medica_final_questions.json' },
  { key: 'ginecologia', name: 'Ginecologia', file: 'data/ginecologia_final_questions.json' },
  { key: 'preventiva', name: 'Medicina Preventiva', file: 'data/medicina_preventiva_final_questions.json' },
  { key: 'nefrologia', name: 'Nefrologia', file: 'data/nefrologia_final_questions.json' },
  { key: 'obstetricia', name: 'Obstetrícia', file: 'data/obstetricia_final_questions.json' },
  { key: 'pediatria', name: 'Pediatria', file: 'data/pediatria_final_questions.json' },
  { key: 'urologia', name: 'Urologia', file: 'data/urologia_final_questions.json' }
];

console.log('='.repeat(75));
console.log('🧪 SIMULAÇÃO DA FASE 1: CLASSIFICAÇÃO DE DISCURSIVAS & QUARENTENA');
console.log('='.repeat(75));

let totalExamined = 0;
let totalDiscursivasIdentificadas = 0;
let totalMcqQuebradas = 0;
let totalAnuladasPreservadas = 0;

const discursivasList = [];
const mcqQuebradasList = [];

for (const f of files) {
  const qs = JSON.parse(fs.readFileSync(f.file, 'utf8'));
  let specDisc = 0;
  let specMcqBroken = 0;

  for (const q of qs) {
    const isZeroOpt = !q.options || (Array.isArray(q.options) && q.options.length === 0);
    if (!isZeroOpt) continue;

    totalExamined++;
    const currentAns = (q.correct_answer || q.correctAnswer || '').trim().toUpperCase();
    const hasLetter = ['A', 'B', 'C', 'D', 'E'].includes(currentAns);

    if (hasLetter) {
      // Múltipla escolha quebrada: tem letra de alternativa mas não tem opções
      specMcqBroken++;
      totalMcqQuebradas++;
      mcqQuebradasList.push({
        id: q.id,
        code: q.code,
        spec: f.name,
        banca: q.banca,
        year: q.year,
        answer: currentAns
      });
    } else {
      // Discursiva real (ou questão aberta de 2ª fase)
      specDisc++;
      totalDiscursivasIdentificadas++;
      discursivasList.push({
        id: q.id,
        code: q.code,
        spec: f.name,
        banca: q.banca,
        year: q.year,
        oldType: q.type,
        oldAnulada: Boolean(q.is_anulada || q.isAnulada)
      });
    }
  }

  console.log(`🩺 ${f.name.padEnd(25)}: ${specDisc} discursivas reais | ${specMcqBroken} MCQs com opções ausentes`);
}

console.log('='.repeat(75));
console.log(`TOTAL EXAMINADO (SEM OPÇÕES)     : ${totalExamined}`);
console.log(`• Discursivas Reais Identificadas: ${totalDiscursivasIdentificadas}`);
console.log(`• Múltipla Escolha Quebradas     : ${totalMcqQuebradas}`);
console.log('='.repeat(75));

