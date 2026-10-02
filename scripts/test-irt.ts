import assert from 'node:assert';
import {
  getEligibleQuestions,
  calculateIRTAbility,
  calculateStandardError,
  calculateReliability,
  calculateAdjustedScore,
  getRankingStatus,
  calculateEmpiricalPercentile,
  auditQuestionsQuality,
  computeStudentIRTEvaluation,
  type ValidatedAttempt
} from '../src/utils/irtModel.ts';

console.log('=== INICIANDO SUÍTE DE TESTES UNITÁRIOS DO MODELO IRT ===\n');

// Função auxiliar para gerar tentativas sintéticas
function generateAttempts(count: number, accuracy: number, difficulty: 'Fácil' | 'Médio' | 'Difícil'): ValidatedAttempt[] {
  const attempts: ValidatedAttempt[] = [];
  const correctCount = Math.round(count * accuracy);
  for (let i = 0; i < count; i++) {
    attempts.push({
      question_id: `q-gen-${difficulty}-${i}`,
      difficulty,
      correct: i < correctCount,
      user_id: 'test-user',
      timestamp: Date.now() + i
    });
  }
  return attempts;
}

// 1. Teste: 10/10 fáceis
const test1_attempts = generateAttempts(10, 1.0, 'Fácil');
const test1_theta = calculateIRTAbility(test1_attempts);
const test1_se = calculateStandardError(test1_theta, test1_attempts);
const test1_score = calculateAdjustedScore(test1_theta, test1_se, 10);
console.log(`[1] 10/10 fáceis -> Theta: ${test1_theta.toFixed(3)}, SE: ${test1_se.toFixed(3)}, Score: ${test1_score.toFixed(3)}`);
assert(test1_theta > 0, '10/10 fáceis deve ter theta positivo');

// 2. Teste: 10/10 difíceis
const test2_attempts = generateAttempts(10, 1.0, 'Difícil');
const test2_theta = calculateIRTAbility(test2_attempts);
const test2_se = calculateStandardError(test2_theta, test2_attempts);
const test2_score = calculateAdjustedScore(test2_theta, test2_se, 10);
console.log(`[2] 10/10 difíceis -> Theta: ${test2_theta.toFixed(3)}, SE: ${test2_se.toFixed(3)}, Score: ${test2_score.toFixed(3)}`);
assert(test2_theta > test1_theta, 'Acertar 10 difíceis deve gerar theta superior a 10 fáceis');
assert(test2_score > test1_score, 'Score ajustado de 10 difíceis deve ser superior a 10 fáceis');

// 3. Teste: 100 questões com 80% de acerto
const test3_attempts = [
  ...generateAttempts(30, 0.8, 'Fácil'),
  ...generateAttempts(40, 0.8, 'Médio'),
  ...generateAttempts(30, 0.8, 'Difícil')
];
const test3_theta = calculateIRTAbility(test3_attempts);
const test3_se = calculateStandardError(test3_theta, test3_attempts);
const test3_score = calculateAdjustedScore(test3_theta, test3_se, 100);
console.log(`[3] 100 q (80% acerto) -> Theta: ${test3_theta.toFixed(3)}, SE: ${test3_se.toFixed(3)}, Score: ${test3_score.toFixed(3)}`);
assert(test3_se < test1_se, 'Erro padrão com 100 itens deve ser menor que com 10 itens');

// 4. Teste: 500 questões com 80% de acerto
const test4_attempts = [
  ...generateAttempts(150, 0.8, 'Fácil'),
  ...generateAttempts(200, 0.8, 'Médio'),
  ...generateAttempts(150, 0.8, 'Difícil')
];
const test4_theta = calculateIRTAbility(test4_attempts);
const test4_se = calculateStandardError(test4_theta, test4_attempts);
const test4_score = calculateAdjustedScore(test4_theta, test4_se, 500);
console.log(`[4] 500 q (80% acerto) -> Theta: ${test4_theta.toFixed(3)}, SE: ${test4_se.toFixed(3)}, Score: ${test4_score.toFixed(3)}`);
assert(test4_se < test3_se, 'SE com 500 questões deve ser muito menor que com 100 questões');
assert(test4_score > test2_score, 'Aluno com 500 questões e 80% consistente deve superar 10/10 difíceis');

// 5. Teste: 500 questões com 90% de acerto
const test5_attempts = [
  ...generateAttempts(150, 0.9, 'Fácil'),
  ...generateAttempts(200, 0.9, 'Médio'),
  ...generateAttempts(150, 0.9, 'Difícil')
];
const test5_theta = calculateIRTAbility(test5_attempts);
const test5_score = calculateAdjustedScore(test5_theta, calculateStandardError(test5_theta, test5_attempts), 500);
console.log(`[5] 500 q (90% acerto) -> Theta: ${test5_theta.toFixed(3)}, Score: ${test5_score.toFixed(3)}`);
assert(test5_theta > test4_theta, '500 q com 90% deve ter theta maior que 500 q com 80%');
assert(test5_score > test4_score, '500 q com 90% deve ter score maior que 500 q com 80%');

// 6. Teste: 500 questões com 70% de acerto
const test6_attempts = [
  ...generateAttempts(150, 0.7, 'Fácil'),
  ...generateAttempts(200, 0.7, 'Médio'),
  ...generateAttempts(150, 0.7, 'Difícil')
];
const test6_theta = calculateIRTAbility(test6_attempts);
const test6_score = calculateAdjustedScore(test6_theta, calculateStandardError(test6_theta, test6_attempts), 500);
console.log(`[6] 500 q (70% acerto) -> Theta: ${test6_theta.toFixed(3)}, Score: ${test6_score.toFixed(3)}`);
assert(test4_theta > test6_theta, '80% acerto deve ter theta maior que 70%');
assert(test4_score > test6_score, '80% acerto deve ter score maior que 70%');

// 7. Teste: Aluno com 149 questões
const status149 = getRankingStatus(149);
console.log(`[7] 149 questões -> Status: ${status149.status} ("${status149.label}"), Faltam: ${status149.missingForNextTier}`);
assert.strictEqual(status149.status, 'unranked', '149 questões deve ser unranked');
assert.strictEqual(status149.missingForNextTier, 1, 'Deve faltar exatamente 1 questão para o ranking provisório');

// 8. Teste: Aluno com 150 questões
const status150 = getRankingStatus(150);
console.log(`[8] 150 questões -> Status: ${status150.status} ("${status150.label}"), Faltam: ${status150.missingForNextTier}`);
assert.strictEqual(status150.status, 'provisional', '150 questões deve ser provisional');
assert.strictEqual(status150.missingForNextTier, 350, 'Deve faltar 350 questões para o ranking oficial');

// 9. Teste: Aluno com 499 questões
const status499 = getRankingStatus(499);
console.log(`[9] 499 questões -> Status: ${status499.status} ("${status499.label}"), Faltam: ${status499.missingForNextTier}`);
assert.strictEqual(status499.status, 'provisional', '499 questões deve ser provisional');
assert.strictEqual(status499.missingForNextTier, 1, 'Deve faltar exatamente 1 questão para o ranking oficial');

// 10. Teste: Aluno com 500 questões
const status500 = getRankingStatus(500);
console.log(`[10] 500 questões -> Status: ${status500.status} ("${status500.label}"), Oficial: ${status500.isOfficial}`);
assert.strictEqual(status500.status, 'official', '500 questões deve ser official');
assert.strictEqual(status500.missingForNextTier, 0, 'No oficial não faltam questões');

// 11. Teste: Questões sem dificuldade
const rawWithUnknown = [
  { question_id: 'q1', difficulty: 'Fácil', correct: true },
  { question_id: 'q2', difficulty: 'Desconhecido', correct: true },
  { question_id: 'q3', difficulty: null, correct: true },
  { question_id: 'q4', difficulty: '', correct: true },
  { question_id: 'q5', difficulty: 'Médio', correct: true }
];
const filteredUnknown = getEligibleQuestions(rawWithUnknown);
console.log(`[11] Questões sem dificuldade -> De 5 itens, ${filteredUnknown.length} foram elegíveis`);
assert.strictEqual(filteredUnknown.length, 2, 'Itens sem dificuldade conhecida devem ser completamente excluídos');

// 12. Teste: Questões anuladas
const rawWithCanceled = [
  { question_id: 'q1', difficulty: 'Fácil', correct: true, isAnulada: false },
  { question_id: 'q2', difficulty: 'Médio', correct: true, isAnulada: true },
  { question_id: 'q3', difficulty: 'Difícil', correct: true, isAnulada: false }
];
const filteredCanceled = getEligibleQuestions(rawWithCanceled, new Set(['q3']));
console.log(`[12] Questões anuladas -> De 3 itens, ${filteredCanceled.length} elegíveis`);
assert.strictEqual(filteredCanceled.length, 1, 'Questões anuladas devem ser excluídas');

// 13. Teste: Respostas duplicadas
const rawWithDuplicates = [
  { question_id: 'q1', difficulty: 'Fácil', correct: false, timestamp: 1000 },
  { question_id: 'q1', difficulty: 'Fácil', correct: true, timestamp: 2000 }, // Resposta mais recente
  { question_id: 'q2', difficulty: 'Médio', correct: true, timestamp: 1500 }
];
const filteredDuplicates = getEligibleQuestions(rawWithDuplicates);
console.log(`[13] Respostas duplicadas -> Deduplicadas de 3 para ${filteredDuplicates.length}`);
assert.strictEqual(filteredDuplicates.length, 2, 'Respostas duplicadas devem ser deduplicadas');
const q1 = filteredDuplicates.find((a) => a.question_id === 'q1');
assert(q1 && q1.correct === true, 'A tentativa mais recente deve prevalecer');

// 14. Teste: Aluno com 100% de acerto
const attempts100 = generateAttempts(50, 1.0, 'Médio');
const theta100 = calculateIRTAbility(attempts100);
const se100 = calculateStandardError(theta100, attempts100);
console.log(`[14] 100% de acerto -> Theta: ${theta100.toFixed(3)}, SE: ${se100.toFixed(3)}`);
assert(theta100 > 2.0 && theta100 <= 4.0, '100% de acerto deve convergir para theta alto e finito via prior');

// 15. Teste: Aluno com 0% de acerto
const attempts0 = generateAttempts(50, 0.0, 'Médio');
const theta0 = calculateIRTAbility(attempts0);
const se0 = calculateStandardError(theta0, attempts0);
console.log(`[15] 0% de acerto -> Theta: ${theta0.toFixed(3)}, SE: ${se0.toFixed(3)}`);
assert(theta0 < -2.0 && theta0 >= -4.0, '0% de acerto deve convergir para theta baixo e finito via prior');

// Teste de Percentil Contínuo e 99+
const mockPopulation = Array.from({ length: 200 }, (_, i) => i * 0.02);
const perc99 = calculateEmpiricalPercentile(3.98, mockPopulation);
console.log(`[Bonus] Teste Percentil 99+ -> Formatted: ${perc99.formattedPercentile}, Continuous: ${perc99.continuousPercentile.toFixed(2)}`);
// Teste de Confiabilidade
const relTest = calculateReliability(se100);
assert(relTest > 0.5 && relTest <= 1.0, 'Confiabilidade deve ser entre 0 e 1');

// Teste de Auditoria de Qualidade
const auditRes = auditQuestionsQuality(rawWithCanceled);
assert(auditRes.canceledCount === 1, 'Auditoria deve detectar 1 anulada');

// Teste de Avaliação Completa do Estudante
const evalRes = computeStudentIRTEvaluation(test4_attempts, mockPopulation);
assert(evalRes.isOfficial === true, '500 questões deve ser homologação oficial');
assert(evalRes.percentile !== null, 'Percentil não deve ser nulo para 500 questões');

console.log('\n✅ TODOS OS 15 CENÁRIOS E TESTES FORAM VALIDADOS COM SUCESSO!\n');
