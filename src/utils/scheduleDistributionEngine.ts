import {
  UserScheduleItem,
  GenerateScheduleParams
} from '@/types/studySchedule';
import {
  getEnrichedFociForInstitution,
  EnrichedFocusWithIncidence
} from '@/services/examIncidenceService';

// Helpers puros de data (YYYY-MM-DD) sem dependências externas
export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().split('T')[0];
}

export function getDayOfWeek(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = Domingo, 1 = Segunda...
}

export function isDateOnOrBefore(d1: string, d2: string): boolean {
  return d1 <= d2;
}

export function getNextAvailableStudyDate(
  currentDate: string,
  allowedDays: number[]
): string {
  const allowedSet = new Set(allowedDays.length > 0 ? allowedDays : [1, 2, 3, 4, 5]);
  let cursor = currentDate;
  let safety = 0;
  while (!allowedSet.has(getDayOfWeek(cursor)) && safety < 14) {
    cursor = addDays(cursor, 1);
    safety++;
  }
  return cursor;
}

/**
 * 1. ALGORITMO CLÁSSICO: Proporcional Balanceado por Especialidade
 * Intercala dia a dia entre as Especialidades (Clínica -> Cirurgia -> Pediatria -> GO -> Preventiva),
 * priorizando dentro de cada especialidade os Focos de maior incidência na instituição.
 */
export function orderFociProportionalClassic(
  foci: EnrichedFocusWithIncidence[]
): EnrichedFocusWithIncidence[] {
  // Agrupa por Especialidade
  const bySpecialty: Record<string, EnrichedFocusWithIncidence[]> = {};
  for (const f of foci) {
    const esp = f.especialidade;
    if (!bySpecialty[esp]) bySpecialty[esp] = [];
    bySpecialty[esp].push(f);
  }

  // Ordena os focos de cada especialidade por incidência decrescente (4 fogos primeiro)
  const specialties = Object.keys(bySpecialty);
  for (const esp of specialties) {
    bySpecialty[esp].sort((a, b) => b.incidence.fireCount - a.incidence.fireCount);
  }

  const result: EnrichedFocusWithIncidence[] = [];
  let remaining = true;
  let round = 0;

  while (remaining) {
    remaining = false;
    for (const esp of specialties) {
      const list = bySpecialty[esp];
      if (round < list.length) {
        result.push(list[round]);
        remaining = true;
      }
    }
    round++;
  }

  return result;
}

/**
 * 2. ALGORITMO EM ESCADINHA: Ciclos Modulares de 2 a 3 Temas Afins
 * Não fica preso em uma única matéria nem disperso demais.
 * Intercala focos de um bloco de 2 a 3 temas até esgotá-los, subindo o próximo degrau da escadinha.
 */
export function orderFociSpiralCycle(
  foci: EnrichedFocusWithIncidence[]
): EnrichedFocusWithIncidence[] {
  // Agrupa por Tema mantendo a ordem dos focos por incidência
  const byTheme: Record<string, EnrichedFocusWithIncidence[]> = {};
  const themeOrder: string[] = [];

  for (const f of foci) {
    const key = `${f.especialidade}__${f.tema}`;
    if (!byTheme[key]) {
      byTheme[key] = [];
      themeOrder.push(key);
    }
    byTheme[key].push(f);
  }

  // Ordena os temas pela média de incidência dos seus focos
  themeOrder.sort((tA, tB) => {
    const avgA = byTheme[tA].reduce((s, x) => s + x.incidence.fireCount, 0) / byTheme[tA].length;
    const avgB = byTheme[tB].reduce((s, x) => s + x.incidence.fireCount, 0) / byTheme[tB].length;
    return avgB - avgA;
  });

  const result: EnrichedFocusWithIncidence[] = [];
  const chunkSize = 3; // Bloco de 3 temas em paralelo

  for (let i = 0; i < themeOrder.length; i += chunkSize) {
    const activeThemes = themeOrder.slice(i, i + chunkSize);
    const queues = activeThemes.map((t) => [...byTheme[t]].sort((a, b) => b.incidence.fireCount - a.incidence.fireCount));

    let hasItems = true;
    while (hasItems) {
      hasItems = false;
      for (const queue of queues) {
        if (queue.length > 0) {
          result.push(queue.shift()!);
          hasItems = true;
        }
      }
    }
  }

  return result;
}

/**
 * 3. ALGORITMO SEQUENCIAL: Imersão Completa por Tema
 * Finaliza toda a Cardiologia, depois toda a Pneumologia, depois toda a Gastroenterologia...
 */
export function orderFociSequentialTheme(
  foci: EnrichedFocusWithIncidence[]
): EnrichedFocusWithIncidence[] {
  const byTheme: Record<string, EnrichedFocusWithIncidence[]> = {};
  const themeOrder: string[] = [];

  for (const f of foci) {
    const key = `${f.especialidade}__${f.tema}`;
    if (!byTheme[key]) {
      byTheme[key] = [];
      themeOrder.push(key);
    }
    byTheme[key].push(f);
  }

  // Ordena os temas por peso de incidência geral
  themeOrder.sort((tA, tB) => {
    const sumA = byTheme[tA].reduce((s, x) => s + x.incidence.fireCount, 0);
    const sumB = byTheme[tB].reduce((s, x) => s + x.incidence.fireCount, 0);
    return sumB - sumA;
  });

  const result: EnrichedFocusWithIncidence[] = [];
  for (const t of themeOrder) {
    const list = [...byTheme[t]].sort((a, b) => b.incidence.fireCount - a.incidence.fireCount);
    result.push(...list);
  }

  return result;
}

/**
 * Motor Principal de Geração e Distribuição do Cronograma
 */
export function generateStudyScheduleItems(
  params: GenerateScheduleParams
): UserScheduleItem[] {
  const {
    scheduleId,
    userId,
    targetInstitution,
    startDate,
    targetExamDate,
    strategy,
    weeklyStudyDays,
    dailyFocusTarget,
    includeRevisions = true,
    revisionIntervals = [7, 30],
    selectedFocusKeys,
    maxFociLimit
  } = params;

  // 1. Obtém os focos enriquecidos com a incidência da instituição
  let enrichedFoci = getEnrichedFociForInstitution(targetInstitution);

  // Filtra por chaves selecionadas se especificado (para o modo personalizado)
  if (selectedFocusKeys && selectedFocusKeys.length > 0) {
    const keySet = new Set(selectedFocusKeys);
    enrichedFoci = enrichedFoci.filter((f) => keySet.has(f.focusKey));
  }

  // 2. Ordena conforme a estratégia escolhida
  let orderedFoci: EnrichedFocusWithIncidence[];
  switch (strategy) {
    case 'spiral_cycle':
      orderedFoci = orderFociSpiralCycle(enrichedFoci);
      break;
    case 'sequential_theme':
      orderedFoci = orderFociSequentialTheme(enrichedFoci);
      break;
    case 'custom':
      // No modo customizado, mantém a ordem de alta incidência escolhida pelo aluno
      orderedFoci = [...enrichedFoci].sort((a, b) => b.incidence.fireCount - a.incidence.fireCount);
      break;
    case 'proportional_classic':
    default:
      orderedFoci = orderFociProportionalClassic(enrichedFoci);
      break;
  }

  if (maxFociLimit && maxFociLimit > 0) {
    orderedFoci = orderedFoci.slice(0, maxFociLimit);
  }

  // 3. Distribui os focos pelas datas úteis disponíveis até a prova
  const items: UserScheduleItem[] = [];
  let currentDate = getNextAvailableStudyDate(startDate, weeklyStudyDays);
  let focusIndex = 0;
  let orderCounter = 0;

  while (focusIndex < orderedFoci.length && isDateOnOrBefore(currentDate, targetExamDate)) {
    // Aloca até dailyFocusTarget focos por dia de estudo
    for (let slot = 0; slot < dailyFocusTarget && focusIndex < orderedFoci.length; slot++) {
      const focusNode = orderedFoci[focusIndex];
      const theoryItemId = `item_${scheduleId}_th_${focusIndex}_${Date.now() % 100000}`;

      // Item Teórico Principal
      items.push({
        id: theoryItemId,
        scheduleId,
        userId,
        especialidade: focusNode.especialidade,
        tema: focusNode.tema,
        foco: focusNode.foco,
        scheduledDate: currentDate,
        itemType: 'theory',
        isCompleted: false,
        orderIndex: orderCounter++
      });

      // Agenda Revisões Espaçadas Automáticas (se ativadas)
      if (includeRevisions && revisionIntervals && revisionIntervals.length > 0) {
        revisionIntervals.forEach((intervalDays, rIdx) => {
          const rawRevDate = addDays(currentDate, intervalDays);
          const revDate = getNextAvailableStudyDate(rawRevDate, weeklyStudyDays);

          if (isDateOnOrBefore(revDate, targetExamDate)) {
            const revType = rIdx === 0 ? 'review_1' : rIdx === 1 ? 'review_2' : 'review_3';
            items.push({
              id: `item_${scheduleId}_r${rIdx + 1}_${focusIndex}_${Date.now() % 100000}`,
              scheduleId,
              userId,
              especialidade: focusNode.especialidade,
              tema: focusNode.tema,
              foco: focusNode.foco,
              scheduledDate: revDate,
              itemType: revType,
              isCompleted: false,
              orderIndex: 50 + rIdx
            });
          }
        });
      }

      focusIndex++;
    }

    // Avança para o próximo dia útil de estudo
    currentDate = getNextAvailableStudyDate(addDays(currentDate, 1), weeklyStudyDays);
  }

  return items;
}

/**
 * 4. MODO PERSONALIZADO: Cria um item agendado avulso para um dia específico
 */
export function createCustomScheduleItem(params: {
  scheduleId: string;
  userId: string;
  especialidade: string;
  tema: string;
  foco: string;
  targetDate: string;
  itemType?: UserScheduleItem['itemType'];
  orderIndex?: number;
  notes?: string;
}): UserScheduleItem {
  return {
    id: `item_custom_${params.scheduleId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    scheduleId: params.scheduleId,
    userId: params.userId,
    especialidade: params.especialidade,
    tema: params.tema,
    foco: params.foco,
    scheduledDate: params.targetDate,
    itemType: params.itemType || 'theory',
    isCompleted: false,
    orderIndex: params.orderIndex || 0,
    notes: params.notes || null
  };
}

/**
 * 4. MODO PERSONALIZADO: Distribui uma lista manual de focos selecionados a partir de uma data
 */
export function batchAddCustomFociToDates(params: {
  scheduleId: string;
  userId: string;
  selectedFoci: Array<{ especialidade: string; tema: string; foco: string }>;
  startFromDate: string;
  weeklyStudyDays: number[];
  dailyLimit: number;
}): UserScheduleItem[] {
  const { scheduleId, userId, selectedFoci, startFromDate, weeklyStudyDays, dailyLimit } = params;
  const items: UserScheduleItem[] = [];

  let currentDate = getNextAvailableStudyDate(startFromDate, weeklyStudyDays);
  let focusIdx = 0;

  while (focusIdx < selectedFoci.length) {
    for (let slot = 0; slot < dailyLimit && focusIdx < selectedFoci.length; slot++) {
      const node = selectedFoci[focusIdx];
      items.push(
        createCustomScheduleItem({
          scheduleId,
          userId,
          especialidade: node.especialidade,
          tema: node.tema,
          foco: node.foco,
          targetDate: currentDate,
          orderIndex: slot
        })
      );
      focusIdx++;
    }
    currentDate = getNextAvailableStudyDate(addDays(currentDate, 1), weeklyStudyDays);
  }

  return items;
}
