import assert from 'node:assert';
import {
  getAvailableTargetInstitutions,
  getInstitutionFociIncidence,
  getEnrichedFociForInstitution,
  getAllTaxonomyFoci,
  getSpecialtyColor
} from '../src/services/examIncidenceService';
import {
  addDays,
  getDayOfWeek,
  getNextAvailableStudyDate,
  orderFociProportionalClassic,
  orderFociSpiralCycle,
  orderFociSequentialTheme,
  generateStudyScheduleItems,
  createCustomScheduleItem,
  batchAddCustomFociToDates
} from '../src/utils/scheduleDistributionEngine';
import { GenerateScheduleParams } from '../src/types/studySchedule';

async function runTests() {
  console.log('🧪 Iniciando Testes do Motor de Incidência e Distribuição Balanceada (Etapa 2)');

  // --------------------------------------------------------------------------
  // 1. Catálogo e Incidência por Instituição de Prova
  // --------------------------------------------------------------------------
  const institutions = getAvailableTargetInstitutions();
  assert.ok(institutions.length > 50, 'Deve conter mais de 50 instituições no catálogo');
  const enare = institutions.find((i) => i.sigla === 'ENARE');
  const usp = institutions.find((i) => i.sigla === 'USP-SP');
  assert.ok(enare, 'ENARE deve estar disponível no catálogo de instituições');
  assert.ok(usp, 'USP-SP deve estar disponível no catálogo de instituições');
  assert.strictEqual(enare?.popular, true, 'ENARE deve estar marcado como popular');
  console.log('  ✅ 1. Catálogo de Instituições de Prova validado com sucesso.');

  // Teste de cálculo de incidência por instituição
  const enareIncidence = getInstitutionFociIncidence('ENARE');
  const uspIncidence = getInstitutionFociIncidence('USP-SP');
  const allFoci = getAllTaxonomyFoci();

  assert.strictEqual(Object.keys(enareIncidence).length, allFoci.length);

  // Validação da escala dos 4 fogos
  const extremeCount = Object.values(enareIncidence).filter((i) => i.fireCount === 4).length;
  const highCount = Object.values(enareIncidence).filter((i) => i.fireCount === 3).length;
  const mediumCount = Object.values(enareIncidence).filter((i) => i.fireCount === 2).length;
  const lowCount = Object.values(enareIncidence).filter((i) => i.fireCount === 1).length;

  assert.ok(extremeCount > 0, 'Deve haver focos com 4 fogos vermelhos (Altíssima)');
  assert.ok(highCount > 0, 'Deve haver focos com 3 fogos laranjas (Alta)');
  assert.ok(mediumCount > 0, 'Deve haver focos com 2 fogos amarelos (Média)');
  assert.ok(lowCount > 0, 'Deve haver focos com 1 fogo verde (Baixa)');

  // Proporção de Altíssima incidência deve ser ~15% do total
  const extremePercent = (extremeCount / allFoci.length) * 100;
  assert.ok(extremePercent >= 14 && extremePercent <= 16, 'Altíssima deve representar ~15%');
  console.log('  ✅ 2. Escala de 4 fogos (Altíssima 🔥🔥🔥🔥, Alta 🔥🔥🔥, Média 🔥🔥, Baixa 🔥) validada.');

  // Cores por Especialidade
  assert.strictEqual(getSpecialtyColor('Clínica Médica'), '#3b82f6');
  assert.strictEqual(getSpecialtyColor('Cirurgia Geral'), '#10b981');
  assert.strictEqual(getSpecialtyColor('Pediatria'), '#f59e0b');
  console.log('  ✅ 3. Cores canônicas por Especialidade validadas.');

  // --------------------------------------------------------------------------
  // 2. Algoritmo 1: Proporcional Clássico (Intercalado por Especialidade)
  // --------------------------------------------------------------------------
  const allEnrichedFoci = getEnrichedFociForInstitution('ENARE');
  const classicOrdered = orderFociProportionalClassic(allEnrichedFoci);
  assert.strictEqual(classicOrdered.length, allEnrichedFoci.length);

  // Valida que os primeiros itens alternam especialidades diferentes
  const esp1 = classicOrdered[0].especialidade;
  const esp2 = classicOrdered[1].especialidade;
  assert.notStrictEqual(esp1, esp2, 'Algoritmo clássico deve alternar especialidades sequenciais');
  console.log('  ✅ 4. Algoritmo 1 (Proporcional Clássico por Especialidade) validado.');

  // --------------------------------------------------------------------------
  // 3. Algoritmo 2: Ciclos em Espiral / Escadinha por Temas (Blocos Modulares)
  // --------------------------------------------------------------------------
  const spiralOrdered = orderFociSpiralCycle(allEnrichedFoci);
  assert.strictEqual(spiralOrdered.length, allEnrichedFoci.length);

  // No modo espiral, temas de um mesmo ciclo aparecem intercalados
  const distinctThemesFirstFive = new Set(spiralOrdered.slice(0, 5).map((f) => f.tema));
  assert.ok(distinctThemesFirstFive.size >= 2, 'Ciclo em espiral deve intercalar temas do bloco ativo');
  console.log('  ✅ 5. Algoritmo 2 (Ciclos em Escadinha / Espiral) validado.');

  // --------------------------------------------------------------------------
  // 4. Algoritmo 3: Sequencial por Tema (Imersão Linear)
  // --------------------------------------------------------------------------
  const seqOrdered = orderFociSequentialTheme(allEnrichedFoci);
  assert.strictEqual(seqOrdered.length, allEnrichedFoci.length);

  // No sequencial, todos os focos do 1º tema devem vir antes de mudar de tema
  const firstTheme = seqOrdered[0].tema;
  const countFirstTheme = allEnrichedFoci.filter((f) => f.tema === firstTheme).length;
  for (let i = 0; i < countFirstTheme; i++) {
    assert.strictEqual(seqOrdered[i].tema, firstTheme, 'Modo sequencial deve agrupar todo o tema antes do próximo');
  }
  console.log('  ✅ 6. Algoritmo 3 (Sequencial por Tema) validado.');

  // --------------------------------------------------------------------------
  // 5. Geração Completa de Cronograma com Datas e Revisões Espaçadas
  // --------------------------------------------------------------------------
  const genParams: GenerateScheduleParams = {
    scheduleId: 'sched-unit-test',
    userId: 'user-unit-test',
    targetInstitution: 'ENARE',
    startDate: '2026-04-06', // Segunda-feira
    targetExamDate: '2026-08-30',
    strategy: 'proportional_classic',
    weeklyStudyDays: [1, 2, 3, 4, 5], // Seg a Sex (descanso Sáb e Dom)
    dailyFocusTarget: 2,
    includeRevisions: true,
    revisionIntervals: [7, 30],
    maxFociLimit: 10
  };

  const scheduleItems = generateStudyScheduleItems(genParams);
  assert.ok(scheduleItems.length > 10, 'Deve conter itens de teoria + revisões agendadas');

  const theoryItems = scheduleItems.filter((i) => i.itemType === 'theory');
  const r1Items = scheduleItems.filter((i) => i.itemType === 'review_1');
  const r2Items = scheduleItems.filter((i) => i.itemType === 'review_2');

  assert.strictEqual(theoryItems.length, 10, 'Deve gerar exatamente 10 itens de teoria');
  assert.ok(r1Items.length > 0, 'Deve conter itens de R1');
  assert.ok(r2Items.length > 0, 'Deve conter itens de R2');

  // Validação de não estudar em dias de folga (Sábado = 6, Domingo = 0)
  for (const item of scheduleItems) {
    const day = getDayOfWeek(item.scheduledDate);
    assert.ok(day >= 1 && day <= 5, `Item em ${item.scheduledDate} não pode cair em final de semana (dia ${day})`);
  }
  console.log('  ✅ 7. Geração de Cronograma com R1 (+7d) e R2 (+30d) e respeito aos dias de descanso validada.');

  // --------------------------------------------------------------------------
  // 6. Modo Personalizado: Adição Avulsa e em Lote
  // --------------------------------------------------------------------------
  const customItem = createCustomScheduleItem({
    scheduleId: 'sched-custom-1',
    userId: 'user-custom',
    especialidade: 'Clínica Médica',
    tema: 'Cardiologia',
    foco: 'Insuficiência Cardíaca',
    targetDate: '2026-05-15',
    notes: 'Revisar quádrupla terapia com foco em Dapagliflozina'
  });
  assert.strictEqual(customItem.foco, 'Insuficiência Cardíaca');
  assert.strictEqual(customItem.scheduledDate, '2026-05-15');
  assert.strictEqual(customItem.notes, 'Revisar quádrupla terapia com foco em Dapagliflozina');

  const batchCustom = batchAddCustomFociToDates({
    scheduleId: 'sched-custom-1',
    userId: 'user-custom',
    selectedFoci: [
      { especialidade: 'Cirurgia', tema: 'Trauma', foco: 'Trauma Torácico' },
      { especialidade: 'Pediatria', tema: 'Puericultura', foco: 'Marcos do Desenvolvimento' }
    ],
    startFromDate: '2026-06-01',
    weeklyStudyDays: [1, 3, 5], // Seg, Qua, Sex
    dailyLimit: 1
  });
  assert.strictEqual(batchCustom.length, 2);
  assert.strictEqual(batchCustom[0].foco, 'Trauma Torácico');
  assert.strictEqual(batchCustom[1].foco, 'Marcos do Desenvolvimento');
  console.log('  ✅ 8. Modo Personalizado (Criação avulsa e em lote) validado.');

  console.log('\n🎉 TODOS OS TESTES DA ETAPA 2 PASSARAM COM 100% DE SUCESSO!\n');
}

runTests().catch((err) => {
  console.error('❌ Falha nos testes de scheduleDistributionEngine:', err);
  process.exit(1);
});
