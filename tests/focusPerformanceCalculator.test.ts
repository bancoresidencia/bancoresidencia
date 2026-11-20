import assert from 'node:assert';
import {
  calculateFociPerformanceMap,
  getMetricForFocus
} from '../src/utils/focusPerformanceCalculator';
import { UserAnswerItem } from '../src/types';

async function runTests() {
  console.log('🧪 Iniciando Testes Unitários de Rendimento em Questões do Checklist (Etapa 3)');

  // Mock de respostas reais do aluno no site
  const mockUserAnswers: Record<string, UserAnswerItem> = {
    'ans-1': {
      letter: 'A',
      isCorrect: true,
      timestamp: Date.now(),
      foco: 'Insuficiência Cardíaca',
      specialty: 'Clínica Médica'
    },
    'ans-2': {
      letter: 'B',
      isCorrect: true,
      timestamp: Date.now(),
      foco: 'Insuficiência Cardíaca',
      specialty: 'Clínica Médica'
    },
    'ans-3': {
      letter: 'C',
      isCorrect: true,
      timestamp: Date.now(),
      foco: 'Insuficiência Cardíaca',
      specialty: 'Clínica Médica'
    },
    'ans-4': {
      letter: 'D',
      isCorrect: true,
      timestamp: Date.now(),
      foco: 'Insuficiência Cardíaca',
      specialty: 'Clínica Médica'
    },
    'ans-5': {
      letter: 'E',
      isCorrect: false,
      timestamp: Date.now(),
      foco: 'Insuficiência Cardíaca',
      specialty: 'Clínica Médica'
    },
    // Foco 2: Trauma Abdominal (1 acerto de 3 = 33% crítico)
    'ans-6': {
      letter: 'A',
      isCorrect: true,
      timestamp: Date.now(),
      foco: 'Trauma Abdominal Fechado',
      specialty: 'Cirurgia Geral'
    },
    'ans-7': {
      letter: 'B',
      isCorrect: false,
      timestamp: Date.now(),
      foco: 'Trauma Abdominal Fechado',
      specialty: 'Cirurgia Geral'
    },
    'ans-8': {
      letter: 'C',
      isCorrect: false,
      timestamp: Date.now(),
      foco: 'Trauma Abdominal Fechado',
      specialty: 'Cirurgia Geral'
    },
    // Foco 3: Icterícia Neonatal (2 acertos de 3 = 67% atenção)
    'ans-9': {
      letter: 'A',
      isCorrect: true,
      timestamp: Date.now(),
      foco: 'Icterícia Neonatal',
      specialty: 'Pediatria'
    },
    'ans-10': {
      letter: 'B',
      isCorrect: true,
      timestamp: Date.now(),
      foco: 'Icterícia Neonatal',
      specialty: 'Pediatria'
    },
    'ans-11': {
      letter: 'C',
      isCorrect: false,
      timestamp: Date.now(),
      foco: 'Icterícia Neonatal',
      specialty: 'Pediatria'
    }
  };

  const perfMap = calculateFociPerformanceMap(mockUserAnswers);

  // 1. Teste de Foco com Alta Acurácia (80% -> excelente)
  const metricCardio = getMetricForFocus('Insuficiência Cardíaca', perfMap);
  assert.strictEqual(metricCardio.answered, 5);
  assert.strictEqual(metricCardio.correct, 4);
  assert.strictEqual(metricCardio.accuracyRate, 80);
  assert.strictEqual(metricCardio.statusLabel, 'excelente');
  console.log('  ✅ 1. Acurácia de 80% (Insuficiência Cardíaca) classificada como excelente.');

  // 2. Teste de Normalização de Acentos (insuficiencia cardiaca sem acento encontra a métrica)
  const metricCardioNoAccent = getMetricForFocus('insuficiencia cardiaca', perfMap);
  assert.strictEqual(metricCardioNoAccent.accuracyRate, 80);
  console.log('  ✅ 2. Busca resiliente a acentos e maiúsculas/minúsculas validada.');

  // 3. Teste de Foco com Acurácia Crítica (33% -> critico)
  const metricTrauma = getMetricForFocus('Trauma Abdominal Fechado', perfMap);
  assert.strictEqual(metricTrauma.answered, 3);
  assert.strictEqual(metricTrauma.correct, 1);
  assert.strictEqual(metricTrauma.accuracyRate, 33);
  assert.strictEqual(metricTrauma.statusLabel, 'critico');
  console.log('  ✅ 3. Acurácia de 33% (Trauma Abdominal) classificada como crítico.');

  // 4. Teste de Foco com Acurácia Intermediária (67% -> atencao)
  const metricNeonat = getMetricForFocus('Icterícia Neonatal', perfMap);
  assert.strictEqual(metricNeonat.answered, 3);
  assert.strictEqual(metricNeonat.correct, 2);
  assert.strictEqual(metricNeonat.accuracyRate, 67);
  assert.strictEqual(metricNeonat.statusLabel, 'atencao');
  console.log('  ✅ 4. Acurácia de 67% (Icterícia Neonatal) classificada como atencao.');

  // 5. Teste de Foco sem Questões Feitas (0 resolvidas)
  const metricEmpty = getMetricForFocus('Pré-Eclâmpsia e Eclâmpsia', perfMap);
  assert.strictEqual(metricEmpty.answered, 0);
  assert.strictEqual(metricEmpty.correct, 0);
  assert.strictEqual(metricEmpty.accuracyRate, 0);
  assert.strictEqual(metricEmpty.statusLabel, 'sem_dados');
  console.log('  ✅ 5. Foco sem questões retorna fallback seguro sem_dados.');

  console.log('\n🎉 TODOS OS TESTES DA ETAPA 3 PASSARAM COM 100% DE SUCESSO!\n');
}

runTests().catch((err) => {
  console.error('❌ Falha nos testes de focusPerformanceCalculator:', err);
  process.exit(1);
});
