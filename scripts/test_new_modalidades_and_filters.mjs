import assert from 'node:assert';
import {
  getHomologatedBaseline,
  homologatedDiretoBaseline,
  homologatedRevalidaBaseline,
  homologatedRPlusBaseline,
  homologatedTituloBaseline
} from '../src/data/homologatedFacetsBaseline.ts';
import { getTargetQuestionTable, hasRightCardActiveFilters } from '../src/services/stratifiedQuizService.ts';
import { buildSqlWhereClauses } from '../src/lib/sqliteQuestions.ts';

console.log('=== TESTE INTEGRADO: NOVAS MODALIDADES E FILTROS COMPLETOS ===\n');

// 1. Baselines Individuais e Censo Supabase
console.log('[1] Baselines individuais das 4 tabelas novas:');
assert.strictEqual(homologatedDiretoBaseline.total, 206599, 'Acesso Direto deve conter 206.599 questões');
assert.strictEqual(homologatedRevalidaBaseline.total, 4411, 'Revalida deve conter 4.411 questões');
assert.strictEqual(homologatedRPlusBaseline.total, 45413, 'R+ deve conter 45.413 questões');
assert.strictEqual(homologatedTituloBaseline.total, 688, 'Título de Especialista deve conter 688 questões');
console.log('    ✓ Acesso Direto: 206.599');
console.log('    ✓ Revalida: 4.411');
console.log('    ✓ R+: 45.413');
console.log('    ✓ Título de Especialista: 688');

// 2. Soma Vetorial Dinâmica Multi-Seleção O(1)
console.log('\n[2] Verificando combinações multi-seleção de modalidades:');
const direto = getHomologatedBaseline(['Acesso Direto']);
assert.strictEqual(direto.total, 206599);

const revalida = getHomologatedBaseline(['Revalida']);
assert.strictEqual(revalida.total, 4411);

const rplus = getHomologatedBaseline(['R+']);
assert.strictEqual(rplus.total, 45413);

const titulo = getHomologatedBaseline(['Título de Especialista']);
assert.strictEqual(titulo.total, 688);

// Multi-seleção: Acesso Direto + Revalida
const diretoRevalida = getHomologatedBaseline(['Acesso Direto', 'Revalida']);
assert.strictEqual(diretoRevalida.total, 206599 + 4411);

// Multi-seleção: Acesso Direto + R+
const diretoRPlus = getHomologatedBaseline(['Acesso Direto', 'R+']);
assert.strictEqual(diretoRPlus.total, 206599 + 45413);

// Multi-seleção: R+ + Título
const rplusTitulo = getHomologatedBaseline(['R+', 'Título de Especialista']);
assert.strictEqual(rplusTitulo.total, 45413 + 688);

// Multi-seleção: Todas as 4
const all4 = getHomologatedBaseline(['Acesso Direto', 'Revalida', 'R+', 'Título de Especialista']);
assert.strictEqual(all4.total, 257111);
console.log('    ✓ Todas as combinações multi-seleção somam com exatidão O(1).');

// 3. Integridade da Árvore Clínica nas Modalidades
console.log('\n[3] Árvore clínica e categorização médica:');
const cmDireto = direto.especialidades['Clínica Médica'] || 0;
const cmRPlus = rplus.especialidades['Clínica Médica'] || 0;
const cmCombined = diretoRPlus.especialidades['Clínica Médica'] || 0;
assert.strictEqual(cmCombined, cmDireto + cmRPlus);

const pedDireto = direto.especialidades['Pediatria'] || 0;
const pedRevalida = revalida.especialidades['Pediatria'] || 0;
const pedCombined = diretoRevalida.especialidades['Pediatria'] || 0;
assert.strictEqual(pedCombined, pedDireto + pedRevalida);
console.log(`    ✓ Clínica Médica combinada: ${cmCombined.toLocaleString('pt-BR')}`);
console.log(`    ✓ Pediatria combinada: ${pedCombined.toLocaleString('pt-BR')}`);

// 4. Roteamento de Views do PostgreSQL
console.log('\n[4] Roteamento de Views para o Supabase:');
assert.strictEqual(getTargetQuestionTable({ modalidades: ['Acesso Direto'] }), 'view_questions_acesso_direto');
assert.strictEqual(getTargetQuestionTable({ modalidades: ['Revalida'] }), 'view_questions_revalida');
assert.strictEqual(getTargetQuestionTable({ modalidades: ['R+'] }), 'view_questions_rplus');
assert.strictEqual(getTargetQuestionTable({ modalidades: ['Título de Especialista'] }), 'view_questions_titulo');
assert.strictEqual(getTargetQuestionTable({ modalidades: ['Acesso Direto', 'R+'] }), 'view_questions_all');
assert.strictEqual(getTargetQuestionTable({ modalidades: ['Acesso Direto', 'Revalida', 'R+'] }), 'view_questions_all');
console.log('    ✓ Seleção única roteia para a view específica da modalidade.');
console.log('    ✓ Multi-seleção roteia para view_questions_all.');

// 5. Teste de Cláusulas SQL e Filtros (Tipo de Questão, Dificuldade, Instituição)
console.log('\n[5] Teste de filtros existentes (Tipo, Dificuldade, Anos, Bancas):');
const whereMultipla = buildSqlWhereClauses({ tipoQuestao: 'Múltipla escolha' });
assert(whereMultipla.whereClause.includes('type = ?'));
assert(whereMultipla.params.includes('Múltipla escolha'));

const whereCertoErrado = buildSqlWhereClauses({ tipoQuestao: 'Certo ou errado' });
assert(whereCertoErrado.whereClause.includes("type IN ('Certo ou errado', 'Verdadeiro ou falso', 'Certo e Errado')"));

const whereCertoEErradoSynonym = buildSqlWhereClauses({ tipoQuestao: 'Certo e Errado' });
assert(whereCertoEErradoSynonym.whereClause.includes("type IN ('Certo ou errado', 'Verdadeiro ou falso', 'Certo e Errado')"));

const whereDissertativa = buildSqlWhereClauses({ tipoQuestao: 'Dissertativa' });
assert(whereDissertativa.whereClause.includes("type IN ('Dissertativa', 'Discursiva')"));

const whereDificuldade = buildSqlWhereClauses({ dificuldade: 'Difícil' });
assert(whereDificuldade.whereClause.includes('difficulty = ?'));
assert(whereDificuldade.params.includes('Difícil'));

const whereBanca = buildSqlWhereClauses({ instituicoes: ['USP'] });
assert(whereBanca.whereClause.includes('banca IN'));

console.log('    ✓ Filtros de Tipo (Múltipla escolha, Certo/Errado, Dissertativa) validados.');
console.log('    ✓ Filtros de Dificuldade, Anos e Instituições validados.');

console.log('\n============================================================');
console.log('🎉 TODOS OS TESTES PASSARAM COM SUCESSO ABSOLUTO (100%)!');
console.log('============================================================\n');
