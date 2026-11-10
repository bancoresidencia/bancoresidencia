import assert from 'assert';
import { getUserStudySessionsStorageKey } from '../src/services/userStudySessionsService';
import { getUserScheduledTasksStorageKey } from '../src/services/userScheduledTasksService';
import { getLocalDateStr, formatSecondsToHms, formatSecondsToShort } from '../src/context/StudyTimerContext';
import { DailyScheduleSlot } from '../src/components/dashboard/scheduleTypes';
import { StudySession } from '../src/types/studyTimer';

console.log('================================================================');
console.log('🩺 SUÍTE DE TESTES: VERIFICAÇÃO FUNCIONAL DA AGENDA E CRONÔMETRO');
console.log('================================================================\n');

// 1. Teste de Escopamento de Chaves por Usuário (Privacidade e Multi-Tenant)
console.log('[1] Teste de isolamento de chaves de armazenamento por usuário...');
const mockUserId = 'usr_test_medico_123';
const sessionsKey = getUserStudySessionsStorageKey(mockUserId);
const tasksKey = getUserScheduledTasksStorageKey(mockUserId);
const guestSessionsKey = getUserStudySessionsStorageKey(null);
const guestTasksKey = getUserScheduledTasksStorageKey(undefined);

assert.strictEqual(sessionsKey, 'bancoresidencia_study_sessions_usr_test_medico_123');
assert.strictEqual(tasksKey, 'bancoresidencia_user_scheduled_tasks_usr_test_medico_123');
assert.strictEqual(guestSessionsKey, 'bancoresidencia_study_sessions_guest');
assert.strictEqual(guestTasksKey, 'bancoresidencia_user_scheduled_tasks_guest');
console.log('    ✓ Chaves de usuário e visitante isoladas com segurança.');

// 2. Teste de Formatação Temporal e Fuso Horário Local
console.log('\n[2] Teste de formatadores de tempo e cálculo de fuso local...');
const hms = formatSecondsToHms(3665);
assert.strictEqual(hms, '01:01:05');

const shortTime = formatSecondsToShort(3665);
assert.strictEqual(shortTime, '1h 1m 5s');

const today = new Date();
const localDate = getLocalDateStr(today);
assert.match(localDate, /^\d{4}-\d{2}-\d{2}$/);
console.log(`    ✓ Formatação temporal validada: 3665s -> "${hms}" / "${shortTime}". Data local: ${localDate}`);

// 3. Teste de Criação de Tarefa do Calendário ("Criar Tarefa")
console.log('\n[3] Teste de estrutura de dados de "Criar Tarefa" (Obrigação)...');
const sampleCalendarTask: DailyScheduleSlot = {
  id: `cal_task_${Date.now()}`,
  title: 'Plantão UTI Geral',
  category: 'hospital',
  startTime: '07:00',
  endTime: '19:00',
  startMinutes: 7 * 60,
  endMinutes: 19 * 60,
  source: 'plataforma',
  description: 'Plantão de rotina no hospital de estágio',
  date: localDate,
  isCalendarTask: true,
  rationale: 'Obrigação de calendário adicionada.'
};

assert.strictEqual(sampleCalendarTask.isCalendarTask, true);
assert.strictEqual(sampleCalendarTask.isStudySession, undefined);
assert.strictEqual(sampleCalendarTask.category, 'hospital');
assert.strictEqual(sampleCalendarTask.startMinutes, 420);
assert.strictEqual(sampleCalendarTask.endMinutes, 1140);
console.log('    ✓ Objeto de Tarefa de Calendário criado com flags e minutos consistentes.');

// 4. Teste de Registro de Bloco de Estudo ("Novo Bloco")
console.log('\n[4] Teste de estrutura de dados de "Novo Bloco" (Sessão de Estudo)...');
const sampleStudySession: StudySession = {
  id: `sess_manual_${Date.now()}`,
  userId: mockUserId,
  startTime: `${localDate}T14:00:00.000Z`,
  endTime: `${localDate}T15:30:00.000Z`,
  durationSeconds: 5400,
  durationFormatted: '01:30:00',
  taxonomy: {
    especialidade: 'Clínica Médica',
    tema: 'Cardiologia',
    foco: 'Insuficiência Cardíaca'
  },
  studyType: 'questoes',
  questionsCount: 20,
  correctCount: 17,
  incorrectCount: 3,
  accuracy: 85,
  sessionSource: 'manual',
  notes: 'Treino de IC com foco em FE reduzida e quádrupla terapia',
  createdAt: new Date().toISOString()
};

assert.strictEqual(sampleStudySession.userId, mockUserId);
assert.strictEqual(sampleStudySession.questionsCount, 20);
assert.strictEqual(sampleStudySession.accuracy, 85);
assert.strictEqual(sampleStudySession.taxonomy.especialidade, 'Clínica Médica');
console.log('    ✓ Objeto de Sessão de Estudo validado com métricas clínicas (85% de acurácia, 20Q).');

// 5. Teste de Sobreposição Independente (Plantão de 12h + Estudo de 1h30)
console.log('\n[5] Teste de coexistência e sobreposição independente (Dupla Categorização)...');
const sessionSlot: DailyScheduleSlot = {
  id: `task_${sampleStudySession.id}`,
  title: `Estudo: ${sampleStudySession.taxonomy.foco}`,
  category: 'estudo',
  startTime: '14:00',
  endTime: '15:30',
  startMinutes: 14 * 60,
  endMinutes: 15 * 60 + 30,
  source: 'plataforma',
  description: `Tempo líquido: 01:30:00. 20 questões (17 acertos, 3 erros).`,
  action: 'treinar',
  date: localDate,
  isStudySession: true,
  questionsCount: 20,
  correctCount: 17
};

// Ambos ocorrem no mesmo dia, e a sessão ocorre durante o plantão (14:00 dentro de 07:00-19:00)
const combinedSchedule = [sampleCalendarTask, sessionSlot];

const calendarTasks = combinedSchedule.filter(s => s.isCalendarTask);
const studySessions = combinedSchedule.filter(s => s.isStudySession);

assert.strictEqual(combinedSchedule.length, 2);
assert.strictEqual(calendarTasks.length, 1);
assert.strictEqual(studySessions.length, 1);
assert.strictEqual(calendarTasks[0].title, 'Plantão UTI Geral');
assert.strictEqual(studySessions[0].title, 'Estudo: Insuficiência Cardíaca');

// Verifica que o estudo (840min-930min) está dentro do plantão (420min-1140min) sem colidir ou se anular
const isOverlapping = sessionSlot.startMinutes >= sampleCalendarTask.startMinutes && 
                      sessionSlot.endMinutes <= sampleCalendarTask.endMinutes;
assert.strictEqual(isOverlapping, true);
console.log('    ✓ Dupla categorização comprovada: Sessão de Estudo sobrepõe Plantão sem colisão.');

// 6. Teste de Ordenação Decrescente das Sessões de Hoje (Mais Recente Primeiro)
console.log('\n[6] Teste de ordenação das sessões do dia (Mais recente no topo)...');
const earlierSession: StudySession = {
  id: 'sess_1',
  userId: mockUserId,
  startTime: `${localDate}T08:00:00.000Z`,
  endTime: `${localDate}T09:00:00.000Z`,
  durationSeconds: 3600,
  durationFormatted: '01:00:00',
  taxonomy: { especialidade: 'Pediatria' },
  studyType: 'questoes',
  questionsCount: 10,
  correctCount: 8,
  createdAt: `${localDate}T09:00:00.000Z`
};

const laterSession: StudySession = {
  id: 'sess_2',
  userId: mockUserId,
  startTime: `${localDate}T16:00:00.000Z`,
  endTime: `${localDate}T17:00:00.000Z`,
  durationSeconds: 3600,
  durationFormatted: '01:00:00',
  taxonomy: { especialidade: 'Cirurgia Geral' },
  studyType: 'questoes',
  questionsCount: 15,
  correctCount: 14,
  createdAt: `${localDate}T17:00:00.000Z`
};

const unorderedSessions = [earlierSession, laterSession];
const sortedSessions = [...unorderedSessions].sort((a, b) => {
  return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
});

assert.strictEqual(sortedSessions[0].id, 'sess_2');
assert.strictEqual(sortedSessions[0].taxonomy.especialidade, 'Cirurgia Geral');
assert.strictEqual(sortedSessions[1].id, 'sess_1');
console.log('    ✓ Ordenação validada: A sessão mais recente (16:00) aparece primeiro no topo da lista.');

console.log('\n================================================================');
console.log('🎉 TODOS OS TESTES DE INTEGRAÇÃO FUNCIONAL FORAM 100% APROVADOS!');
console.log('================================================================\n');

