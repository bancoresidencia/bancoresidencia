import assert from 'node:assert';
import { normalizeStudyQuery } from '../src/services/studyQuestionCatalog';
import { hasRightCardActiveFilters } from '../src/services/stratifiedQuizService';

console.log('=== TESTE DO FILTRO COMENTADAS (PADRÃO OURO) ===');

assert.strictEqual(
  normalizeStudyQuery({ apenasComentadas: true }).only_commented,
  true,
  'apenasComentadas=true deve gerar only_commented=true'
);
assert.strictEqual(
  normalizeStudyQuery({ apenasComentadas: false }).only_commented,
  false,
  'apenasComentadas=false deve gerar only_commented=false'
);
assert.strictEqual(
  normalizeStudyQuery({}).only_commented,
  false,
  'Ausência de apenasComentadas deve preservar retrocompatibilidade (false)'
);
assert.strictEqual(
  hasRightCardActiveFilters({ apenasComentadas: true }),
  true,
  'hasRightCardActiveFilters deve reconhecer apenasComentadas=true'
);
assert.strictEqual(
  hasRightCardActiveFilters({ apenasComentadas: false }),
  false,
  'hasRightCardActiveFilters deve retornar false quando apenasComentadas=false e sem outros filtros'
);

console.log('✅ Todos os testes do filtro Comentadas passaram com sucesso!');
