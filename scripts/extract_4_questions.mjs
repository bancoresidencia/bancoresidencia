import fs from 'fs';

// 1. Pega do benchmark 3.1 flash-lite (sabemos 100% que foi o 3.1 flash-lite)
const cmp = JSON.parse(fs.readFileSync('data/comparison_3_5_vs_3_1.json', 'utf8'));

// 2. Pega também do lote geral de preventiva
const qs = JSON.parse(fs.readFileSync('data/medicina_preventiva_final_questions.json', 'utf8'));

const qList = [];

// Questão 1 do benchmark (3.1 flash lite) - SUS Previne Brasil
if (cmp['UFRGSHCPA-2022-MPS-0004']) {
  const c = cmp['UFRGSHCPA-2022-MPS-0004'];
  qList.push({
    code: c.code,
    institution: c.institution,
    year: c.year,
    tema: c.tema,
    statement: c.statement,
    options: c.options,
    correctAnswer: c.correctAnswer,
    eval: c.evaluations['gemini-3.1-flash-lite']
  });
}

// Questão 2 do benchmark (3.1 flash lite) - Testes Diagnósticos
if (cmp['UFSCHU-2019-MPS-0050']) {
  const c = cmp['UFSCHU-2019-MPS-0050'];
  qList.push({
    code: c.code,
    institution: c.institution,
    year: c.year,
    tema: c.tema,
    statement: c.statement,
    options: c.options,
    correctAnswer: c.correctAnswer,
    eval: c.evaluations['gemini-3.1-flash-lite']
  });
}

// Questão 3 do benchmark (3.1 flash lite) - PrEP / PEP
if (cmp['UFPRHC-2019-MPS-0085']) {
  const c = cmp['UFPRHC-2019-MPS-0085'];
  qList.push({
    code: c.code,
    institution: c.institution,
    year: c.year,
    tema: c.tema,
    statement: c.statement,
    options: c.options,
    correctAnswer: c.correctAnswer,
    eval: c.evaluations['gemini-3.1-flash-lite']
  });
}

// Questão 4 do lote executado durante o dia pelo 3.1 flash lite: UNIVERSIDADE-2018-MPS-0371
const q4 = qs.find(x => x.code === 'UNIVERSIDADE-2018-MPS-0371');
if (q4) {
  qList.push({
    code: q4.code,
    institution: q4.institution,
    year: q4.year,
    tema: q4.tema,
    statement: q4.statement,
    options: q4.options,
    correctAnswer: q4.correctAnswer || q4.correct_answer,
    commentary: q4.commentary
  });
}

console.log('Selected 4 questions:', qList.map(q => q.code));
fs.writeFileSync('data/sample_4_gemini_3_1.json', JSON.stringify(qList, null, 2), 'utf8');
