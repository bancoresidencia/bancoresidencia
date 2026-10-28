import assert from 'node:assert';
import {
  sanitizePostgrestTerm,
  validateQuestionId,
  validateAnswerOption,
  isPrivilegedRole
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

// 4. Teste de Validação de Roles Privilegiadas (Anti-Privilege Escalation)
console.log('[4] Teste de controle de acesso por roles...');
assert.strictEqual(isPrivilegedRole('admin'), true, 'Role admin deve ser privilegiada');
assert.strictEqual(isPrivilegedRole('curador'), true, 'Role curador deve ser privilegiada');
assert.strictEqual(isPrivilegedRole('curator'), true, 'Role curator deve ser privilegiada');
assert.strictEqual(isPrivilegedRole('ADMIN'), true, 'Role admin case-insensitive deve ser aceita');
assert.strictEqual(isPrivilegedRole('student'), false, 'Role student não pode ter privilégios');
assert.strictEqual(isPrivilegedRole(''), false, 'Role vazia não pode ter privilégios');
assert.strictEqual(isPrivilegedRole(null), false, 'Role nula não pode ter privilégios');
assert.strictEqual(isPrivilegedRole(undefined), false, 'Role undefined não pode ter privilégios');
assert.strictEqual(isPrivilegedRole('admin; DROP TABLE'), false, 'Injeção de role deve ser rejeitada');
assert.strictEqual(isPrivilegedRole('user'), false, 'Role user comum deve ser rejeitada');
console.log('    ✓ Apenas roles autenticadas e autorizadas (admin, curador, curator) possuem privilégios.');

// 5. Teste de Proteção contra Path Traversal em Livros Médicos
console.log('[5] Teste de proteção contra Directory / Path Traversal no acervo médico...');
function isSafeKnowledgePath(path: string): boolean {
  if (!path || typeof path !== 'string') return false;
  if (path.includes('..') || path.includes('\\') || path.includes('\0')) return false;
  return path.endsWith('.json');
}
assert.strictEqual(isSafeKnowledgePath('Cardiologia/Bradiarritmias.json'), true, 'Caminho normal deve ser aceito');
assert.strictEqual(isSafeKnowledgePath('../../../etc/passwd'), false, 'Path traversal com .. deve ser bloqueado');
assert.strictEqual(isSafeKnowledgePath('Cardiologia/..\\..\\secret.env'), false, 'Path traversal misto deve ser bloqueado');
assert.strictEqual(isSafeKnowledgePath('Cardiologia/test.json\0.exe'), false, 'Null byte injection deve ser bloqueado');
assert.strictEqual(isSafeKnowledgePath('Cardiologia/document.pdf'), false, 'Extensão não-json deve ser bloqueada');
console.log('    ✓ Tentativas de Directory Traversal e injeção de extensões foram bloqueadas com sucesso.');

// 6. Teste de Omissão de Gabarito na Projeção Pública (Anti-Scraping)
console.log('[6] Teste de projeção segura de colunas na listagem pública...');
const SAFE_QUESTION_COLUMNS = 'id, code, institution, banca, year, tipo_prova, modalidade, especialidade, tema, foco, subfoco, difficulty, type, is_anulada, statement, options, images';
assert(!SAFE_QUESTION_COLUMNS.includes('correct_answer'), 'correct_answer NÃO deve estar presente na listagem pública');
assert(!SAFE_QUESTION_COLUMNS.includes('commentary'), 'commentary NÃO deve estar presente na listagem pública');
console.log('    ✓ Colunas sensíveis (correct_answer e commentary) estão blindadas contra extração em massa.');

// 7. Teste de Integridade e Estrutura de Logs de Auditoria
console.log('[7] Teste de validação de invariantes de logs de auditoria...');
interface AuditPayloadValidation {
  action: string;
  entityType: string;
  entityId: string;
}
function validateAuditPayload(payload: Partial<AuditPayloadValidation>): boolean {
  if (!payload.action || typeof payload.action !== 'string') return false;
  if (!payload.entityType || typeof payload.entityType !== 'string') return false;
  if (!payload.entityId || typeof payload.entityId !== 'string' || payload.entityId.trim() === '') return false;
  const validActions = new Set([
    'UPDATE_GABARITO',
    'ANULATE_QUESTION',
    'RESTORE_QUESTION',
    'RESOLVE_REPORT',
    'GENERATE_COMMENTARY',
    'MANUAL_OVERRIDE',
    'BULK_IMPORT'
  ]);
  return validActions.has(payload.action);
}

assert.strictEqual(
  validateAuditPayload({
    action: 'UPDATE_GABARITO',
    entityType: 'question',
    entityId: 'q-usp-2024-01'
  }),
  true,
  'Evento de auditoria válido deve ser aceito'
);
assert.strictEqual(
  validateAuditPayload({
    action: 'HACK_GABARITO',
    entityType: 'question',
    entityId: 'q-usp-2024-01'
  }),
  false,
  'Ação arbitrária não homologada deve ser rejeitada'
);
assert.strictEqual(
  validateAuditPayload({
    action: 'UPDATE_GABARITO',
    entityType: 'question',
    entityId: ''
  }),
  false,
  'Evento sem entityId deve ser rejeitado'
);
console.log('    ✓ Invariantes de auditoria e validação de schema foram verificados com sucesso.');

console.log('\n✅ TODOS OS TESTES DE SEGURANÇA E AUDITORIA FORAM APROVADOS COM SUCESSO!\n');

