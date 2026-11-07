import { solveQuestionDeep, PAID_KEY, API_KEYS } from './solve_questions_engine.mjs';

console.log('PAID_KEY:', PAID_KEY === '' ? 'BLOQUEADA (Vazia)' : 'ERRO: AINDA ATIVA');
console.log('API_KEYS length:', API_KEYS.length);
API_KEYS.forEach((k, i) => console.log(`  Key ${i+1}: ${k.slice(0, 8)}...${k.slice(-4)}`));

const testQ = {
  id: 'test-free-1',
  code: 'TESTE-FREE-001',
  statement: 'Paciente de 45 anos com tosse produtiva e febre alta há 3 dias. Ausculta pulmonar com estertores crepitantes em base direita.',
  options: [
    { letter: 'A', text: 'Pneumonia adquirida na comunidade' },
    { letter: 'B', text: 'Embolia pulmonar maciça' }
  ],
  correct_answer: 'A',
  correctAnswer: 'A',
  is_anulada: false,
  isAnulada: false,
  especialidade: 'Clínica Médica',
  tema: 'Pneumologia'
};

const res = await solveQuestionDeep(testQ);
console.log('\n--- RESULTADO NO MODO 100% GRATUITO ---');
console.log('FinalCommentary:', res.finalCommentary);
console.log('Option A:', res.options[0].explanation);
console.log('Option B:', res.options[1].explanation);
console.log('MainErrorReason:', res.mainErrorReason);
console.log('TakeHomeMessage:', res.takeHomeMessage);

