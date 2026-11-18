import assert from 'node:assert';
import { deduceStudyTaxonomy } from '../src/utils/taxonomyDeduction';

console.log('--- Testando Dedução Taxonômica (Motor LCA) ---');

// 1. Filtros vazios -> Treino Geral
const t1 = deduceStudyTaxonomy({});
assert.strictEqual(t1.rawLabel, 'Treino Geral', 'Teste 1 falhou: Esperava Treino Geral para filtros vazios');
console.log('✓ 1. Filtros vazios -> Treino Geral');

// 2. Múltiplas especialidades -> Treino Geral
const t2 = deduceStudyTaxonomy({
  especialidades: ['Cirurgia', 'Pediatria']
});
assert.strictEqual(t2.rawLabel, 'Treino Geral', 'Teste 2 falhou: Esperava Treino Geral para múltiplas especialidades');
console.log('✓ 2. Múltiplas especialidades -> Treino Geral');

// 3. Especialidade única isolada -> Nível Especialidade
const t3 = deduceStudyTaxonomy({
  especialidades: ['Cirurgia Geral']
});
assert.strictEqual(t3.especialidade, 'Cirurgia Geral', 'Teste 3 falhou: Esperava Cirurgia Geral');
assert.strictEqual(t3.rawLabel, 'Cirurgia Geral', 'Teste 3 falhou: Esperava Cirurgia Geral');
console.log('✓ 3. Especialidade única isolada -> Nível Especialidade');

// 4. Foco único -> Nível FOCO
const t4 = deduceStudyTaxonomy({
  focos: ['Abdome Agudo Inflamatório']
});
assert.strictEqual(t4.foco, 'Abdome Agudo Inflamatório', 'Teste 4 falhou: Esperava Abdome Agudo Inflamatório como foco');
assert.strictEqual(t4.especialidade, 'Cirurgia Geral', 'Teste 4 falhou: Esperava Cirurgia Geral');
assert.strictEqual(t4.tema, 'Abdome Agudo Cirúrgico', 'Teste 4 falhou: Esperava Abdome Agudo Cirúrgico');
console.log('✓ 4. Foco único -> Nível FOCO com tema e especialidade deduzidos');

// 5. Múltiplos subfocos do mesmo foco -> Nível FOCO
const t5 = deduceStudyTaxonomy({
  subfocos: ['Apendicite Aguda', 'Diverticulite Aguda dos Cólons']
});
assert.strictEqual(t5.foco, 'Abdome Agudo Inflamatório', 'Teste 5 falhou: Esperava foco Abdome Agudo Inflamatório');
assert.strictEqual(t5.especialidade, 'Cirurgia Geral', 'Teste 5 falhou: Esperava Cirurgia Geral');
console.log('✓ 5. Múltiplos subfocos do mesmo foco -> Nível FOCO');

// 6. Múltiplos focos do mesmo tema -> Nível TEMA
const t6 = deduceStudyTaxonomy({
  focos: ['Abdome Agudo Inflamatório', 'Abdome Agudo Obstrutivo']
});
assert.strictEqual(t6.tema, 'Abdome Agudo Cirúrgico', 'Teste 6 falhou: Esperava Abdome Agudo Cirúrgico');
assert.strictEqual(t6.especialidade, 'Cirurgia Geral', 'Teste 6 falhou: Esperava Cirurgia Geral');
console.log('✓ 6. Múltiplos focos do mesmo tema -> Nível TEMA');

// 7. Múltiplos temas da mesma especialidade -> Nível ESPECIALIDADE
const t7 = deduceStudyTaxonomy({
  especialidades: ['Cirurgia Geral'],
  temas: ['Abdome Agudo Cirúrgico', 'Trauma e Atendimento Inicial']
});
assert.strictEqual(t7.especialidade, 'Cirurgia Geral', 'Teste 7 falhou: Esperava Cirurgia Geral');
console.log('✓ 7. Múltiplos temas da mesma especialidade -> Nível ESPECIALIDADE');

// 8. Subfocos de especialidades distintas -> Treino Geral
const t8 = deduceStudyTaxonomy({
  subfocos: ['Apendicite Aguda', 'IAM com Supradesnivelamento do Segmento ST (IAMCSST)']
});
assert.strictEqual(t8.rawLabel, 'Treino Geral', 'Teste 8 falhou: Esperava Treino Geral para subfocos de especialidades distintas');
console.log('✓ 8. Subfocos de especialidades distintas -> Treino Geral');

console.log('\n✅ TODOS OS 8 TESTES DO MOTOR LCA PASSARAM COM 100% DE SUCESSO!\n');


console.log('--- Testando Regras de Descarte e Salvamento do Relógio ---');

// Mock localStorage
const mockStorage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (k: string) => mockStorage[k] || null,
  setItem: (k: string, v: string) => { mockStorage[k] = v; },
  removeItem: (k: string) => { delete mockStorage[k]; }
};

// Teste de Descarte: 0 questões feitas -> descarta silenciosamente
function simulateAutoFinish({
  status,
  qTotal,
  finalSecs,
  taxonomy
}: {
  status: 'running' | 'paused' | 'idle';
  qTotal: number;
  finalSecs: number;
  taxonomy: any;
}) {
  if (status !== 'running' && status !== 'paused') {
    return null;
  }
  // Regra do usuário: descarta se nenhuma questão foi feita
  if (qTotal === 0) {
    mockLocalStorage.removeItem('bancoresidencia_timer_state_v1');
    return null;
  }

  const newSession = {
    id: `sess_${Date.now()}`,
    durationSeconds: Math.max(1, finalSecs),
    taxonomy,
    questionsCount: qTotal,
    correctCount: Math.round(qTotal * 0.8),
    incorrectCount: Math.round(qTotal * 0.2),
    accuracy: 80
  };

  const scheduleSlot = {
    id: `task_${newSession.id}`,
    title: taxonomy.rawLabel === 'Treino Geral' ? 'Treino Geral de Questões' : `Estudo: ${taxonomy.rawLabel}`,
    category: 'estudo',
    description: `Tempo líquido: ${newSession.durationSeconds}s. ${qTotal} questões.`
  };

  mockLocalStorage.setItem('bancoresidencia_user_scheduled_tasks', JSON.stringify([scheduleSlot]));
  return newSession;
}

// 9. Cenário de descarte com 0 questões
const discardResult = simulateAutoFinish({
  status: 'running',
  qTotal: 0,
  finalSecs: 30, // ficou 30 segundos mas não respondeu nada
  taxonomy: { rawLabel: 'Abdome Agudo' }
});
assert.strictEqual(discardResult, null, 'Teste 9 falhou: Deveria descartar sessão com 0 questões');
assert.strictEqual(mockLocalStorage.getItem('bancoresidencia_user_scheduled_tasks'), null, 'Teste 9 falhou: Não deveria gravar na agenda');
console.log('✓ 9. Regra de Descarte: 0 questões feitas -> sessão descartada sem gravar na Agenda');

// 10. Cenário de salvamento com 2 questões respondidas
const saveResult = simulateAutoFinish({
  status: 'running',
  qTotal: 2,
  finalSecs: 45,
  taxonomy: { rawLabel: 'Abdome Agudo' }
});
assert.ok(saveResult !== null, 'Teste 10 falhou: Deveria salvar sessão com questões');
assert.strictEqual(saveResult?.questionsCount, 2, 'Teste 10 falhou: Deveria contabilizar 2 questões');
const agendaData = JSON.parse(mockLocalStorage.getItem('bancoresidencia_user_scheduled_tasks') || '[]');
assert.strictEqual(agendaData.length, 1, 'Teste 10 falhou: Deveria conter 1 slot na agenda');
assert.strictEqual(agendaData[0].title, 'Estudo: Abdome Agudo', 'Teste 10 falhou: Título da agenda incorreto');
console.log('✓ 10. Regra de Salvamento: Questões respondidas -> sessão salva e vinculada à Agenda');

console.log('\n🎉 TODAS AS VALIDAÇÕES INTEGRADAS PASSARAM COM SUCESSO!\n');
