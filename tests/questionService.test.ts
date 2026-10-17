import assert from 'node:assert';
import {
  sanitizePostgrestTerm,
  validateQuestionId,
  validateAnswerOption
} from '../src/utils/security.ts';

console.log('=== INICIANDO TESTES UNITÁRIOS DE SEGURANÇA E VALIDAÇÃO ===\n');

// 1. Teste de Sanitização contra Injeção em PostgREST
console.log('[1] Teste de sanitização de PostgREST...');
const dangerousInput1 = 'ENARE; DROP TABLE questions; --';
const sanitized1 = sanitizePostgrestTerm(dangerousInput1);
assert(!sanitized1.includes(';'), 'Ponto e vírgula deve ser removido');
assert(!sanitized1.includes('--'), 'Comentários SQL devem ser removidos');

const dangerousInput2 = 'USP.or(id.neq.0)';
const sanitized2 = sanitizePostgrestTerm(dangerousInput2);
assert(!sanitized2.includes('(') && !sanitized2.includes(')'), 'Parênteses de subquery devem ser removidos');
assert(!sanitized2.includes('.or.'), 'Operador PostgREST deve ser neutralizado');
console.log('    ✓ Sanitização removeu caracteres maliciosos e operadores de filtro.');

// 2. Teste de Validação de ID de Questão
console.log('[2] Teste de rejeição de ID vazio ou malicioso...');
assert.strictEqual(validateQuestionId(''), false, 'ID vazio deve ser rejeitado');
assert.strictEqual(validateQuestionId(null), false, 'ID nulo deve ser rejeitado');
assert.strictEqual(validateQuestionId(undefined), false, 'ID undefined deve ser rejeitado');
assert.strictEqual(validateQuestionId('q-valid-123_abc'), true, 'ID alfanumérico com hífen e underline deve ser aceito');
assert.strictEqual(validateQuestionId('q-test<script>alert(1)</script>'), false, 'Payload XSS no ID deve ser rejeitado');
assert.strictEqual(validateQuestionId("q' OR '1'='1"), false, 'Payload SQL no ID deve ser rejeitado');
console.log('    ✓ IDs vazios ou com caracteres perigosos são rejeitados com segurança.');

// 3. Teste de Validação de Opção de Gabarito
console.log('[3] Teste de rejeição de gabarito arbitrário/malicioso...');
assert.strictEqual(validateAnswerOption('A'), true, 'Gabarito A deve ser aceito');
assert.strictEqual(validateAnswerOption('E'), true, 'Gabarito E deve ser aceito');
assert.strictEqual(validateAnswerOption('ANULADA'), true, 'Gabarito ANULADA deve ser aceito');
assert.strictEqual(validateAnswerOption('Z'), false, 'Gabarito Z deve ser rejeitado');
assert.strictEqual(validateAnswerOption("A' OR '1'='1"), false, 'Payload SQL no gabarito deve ser rejeitado');
assert.strictEqual(validateAnswerOption(123), false, 'Valor não string deve ser rejeitado');
console.log('    ✓ Apenas gabaritos oficiais (A, B, C, D, E, ANULADA) são permitidos.');

console.log('\n✅ TODOS OS TESTES DE SEGURANÇA FORAM APROVADOS COM SUCESSO!\n');
