import { NextRequest, NextResponse } from 'next/server';
import { callGeminiAi, parseCleanJson } from '@/lib/gemini';
import { AiDecisionBadge, AiDecisionDetails } from '@/components/dashboard/scheduleTypes';
import { verifyStudentSession } from '@/lib/supabase/studentAuth';

export const dynamic = 'force-dynamic';

interface CalendarSlotInput {
  id: string;
  title: string;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  startMinutes: number;
  endMinutes: number;
  category?: 'hospital' | 'estudo' | 'pausa' | 'simulado' | 'flashcard' | 'revisao';
  description?: string;
  location?: string;
  source?: 'google' | 'plataforma';
}

interface FreeGap {
  startMinutes: number;
  endMinutes: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

interface StudySuggestion {
  id: string;
  title: string;
  category: 'estudo' | 'flashcard' | 'revisao' | 'simulado' | 'pausa';
  startTime: string;
  endTime: string;
  startMinutes: number;
  endMinutes: number;
  source: 'plataforma';
  action: 'treinar' | 'flashcards' | 'caderno_erros' | 'simulado' | 'mnemonico';
  description: string;
  rationale: string;
  aiDecision?: AiDecisionDetails;
}

function formatMinutesToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Calcula os intervalos livres do dia mesclando intervalos ocupados (busy ranges)
 * e restringindo estritamente ao momento atual do aluno (ignora períodos que já passaram).
 */
function calculateFreeGaps(events: CalendarSlotInput[], currentMinutes?: number): FreeGap[] {
  const nowMin = typeof currentMinutes === 'number' && !isNaN(currentMinutes) ? currentMinutes : 0;
  // Margem de segurança de 5 minutos a partir de agora
  const effectiveDayStart = Math.max(nowMin + 5, 360); // Pelo menos 06:00
  const dayEnd = 1380; // 23:00

  if (effectiveDayStart >= dayEnd - 25) {
    // Já é final de noite (após 22:35), sem gaps significativos hoje
    return [];
  }

  if (!events || events.length === 0) {
    return [
      {
        startMinutes: effectiveDayStart,
        endMinutes: dayEnd,
        startTime: formatMinutesToTime(effectiveDayStart),
        endTime: formatMinutesToTime(dayEnd),
        durationMinutes: dayEnd - effectiveDayStart
      }
    ];
  }

  // 1. Normaliza e mescla eventos ocupados que possam se sobrepor
  const sorted = [...events]
    .map(e => ({
      start: Math.max(0, e.startMinutes),
      end: Math.min(1440, e.endMinutes)
    }))
    .filter(e => e.end > e.start)
    .sort((a, b) => a.start - b.start);

  const mergedBusy: { start: number; end: number }[] = [];
  for (const interval of sorted) {
    if (mergedBusy.length === 0) {
      mergedBusy.push({ ...interval });
    } else {
      const prev = mergedBusy[mergedBusy.length - 1];
      if (interval.start <= prev.end) {
        prev.end = Math.max(prev.end, interval.end);
      } else {
        mergedBusy.push({ ...interval });
      }
    }
  }

  const rawGaps: { start: number; end: number }[] = [];

  // Intervalo antes do primeiro evento
  const firstEventStart = mergedBusy[0].start;
  if (firstEventStart > 360) {
    rawGaps.push({ start: 360, end: firstEventStart });
  }

  // Intervalos entre eventos consecutivos
  for (let i = 0; i < mergedBusy.length - 1; i++) {
    const currentEnd = mergedBusy[i].end;
    const nextStart = mergedBusy[i + 1].start;
    if (nextStart > currentEnd) {
      rawGaps.push({ start: currentEnd, end: nextStart });
    }
  }

  // Intervalo após o último evento até as 23:00
  const lastEventEnd = mergedBusy[mergedBusy.length - 1].end;
  if (lastEventEnd < dayEnd) {
    rawGaps.push({ start: lastEventEnd, end: dayEnd });
  }

  // 2. Filtra e ajusta gaps estritamente para o tempo futuro a partir de effectiveDayStart
  const validGaps: FreeGap[] = [];
  for (const gap of rawGaps) {
    if (gap.end <= effectiveDayStart) continue; // Gap já passou hoje

    const adjustedStart = Math.max(gap.start, effectiveDayStart);
    const adjustedEnd = Math.min(gap.end, dayEnd);
    const duration = adjustedEnd - adjustedStart;

    if (duration >= 25) { // Janela mínima produtiva de 25 minutos
      validGaps.push({
        startMinutes: adjustedStart,
        endMinutes: adjustedEnd,
        startTime: formatMinutesToTime(adjustedStart),
        endTime: formatMinutesToTime(adjustedEnd),
        durationMinutes: duration
      });
    }
  }

  return validGaps;
}

/**
 * Gerador de sugestões determinístico de alto rendimento médico (Fallback Seguro)
 * Cruza deficiências reais, flashcards FSRS e caderno de erros mesmo sem conexão com IA
 */
function generateHeuristicSuggestions(
  gaps: FreeGap[],
  userContext: any
): StudySuggestion[] {
  const suggestions: StudySuggestion[] = [];
  let taskCounter = 1;

  const areaName = userContext.recommendedArea || 'Clínica Médica';
  const targetExam = userContext.targetExamName || 'ENARE 2026';
  const dailyGoal = userContext.dailyGoal || 30;
  const remainingGoal = Math.max(5, (dailyGoal - (userContext.todayAnswered || 0)));

  const dueTodayFsrs = userContext.spacedRepetition?.dueToday || 0;
  const pendingErrorsCount = userContext.errorNotebook?.pendingCount || 0;
  const mostCriticalSpecialty = userContext.errorNotebook?.mostCriticalSpecialty || areaName;
  const criticalSubtopic = userContext.criticalWeaknesses?.[0]?.subtopic || null;
  const criticalSubtopicAcc = userContext.criticalWeaknesses?.[0]?.accuracy ?? 30;
  const bestShift = userContext.cognitiveEnergy?.bestShift || null;
  const fatigueAlert = Boolean(userContext.cognitiveEnergy?.fatigueAlert);

  let hasAllocatedFsrs = false;
  let hasAllocatedErrors = false;

  for (const gap of gaps) {
    if (suggestions.length >= 4) break; // Máximo 4 blocos para não sobrecarregar
    const duration = gap.durationMinutes;
    const isNight = gap.startMinutes >= 1140; // Após 19h

    // Prioridade 1 em janelas curtas (25 a 50 min) ou noite: FSRS se houver cards vencendo
    if (dueTodayFsrs > 0 && !hasAllocatedFsrs && (duration <= 50 || isNight || fatigueAlert)) {
      hasAllocatedFsrs = true;
      const bDuration = Math.min(duration, 35);
      const bEnd = gap.startMinutes + bDuration;

      suggestions.push({
        id: `ai_sug_fsrs_${Date.now()}_${taskCounter++}`,
        title: 'Revisão Espaçada FSRS (Flashcards Críticos)',
        category: 'flashcard',
        startTime: gap.startTime,
        endTime: formatMinutesToTime(bEnd),
        startMinutes: gap.startMinutes,
        endMinutes: bEnd,
        source: 'plataforma',
        action: 'flashcards',
        description: `Baralho inteligente: ${dueTodayFsrs} card(s) com retenção prevista para vencer hoje`,
        rationale: `Encaixado nesta janela de ${bDuration} min para consolidar conceitos antes da curva de esquecimento (algoritmo FSRS).`,
        aiDecision: {
          whyThisTopic: `Você tem ${dueTodayFsrs} flashcard(s) aguardando revisão hoje. Evita regressão mnemônica na curva de Ebbinghaus.`,
          whyThisTime: isNight
            ? 'Janela noturna com menor demanda extrínseca, protegendo sua cognição contra fadiga.'
            : 'Intervalo curto perfeito para sessões ágeis de repetição ativa sem dispersão.',
          pedagogicalObjective: 'Manter a taxa de retenção da residência médica acima de 90%.',
          decisionBadges: [
            { type: 'fsrs_due', label: `${dueTodayFsrs} Flashcards FSRS Vencendo` },
            ...(isNight ? [{ type: 'fatigue_relief' as const, label: 'Baixa Carga Extrínseca' }] : [])
          ]
        }
      });
      continue;
    }

    // Prioridade 2: Caderno de Erros se houver erros acumulados
    if (pendingErrorsCount > 0 && !hasAllocatedErrors && duration >= 30) {
      hasAllocatedErrors = true;
      const bDuration = Math.min(duration, 45);
      const bEnd = gap.startMinutes + bDuration;

      suggestions.push({
        id: `ai_sug_err_${Date.now()}_${taskCounter++}`,
        title: `Caderno de Erros: ${mostCriticalSpecialty}`,
        category: 'revisao',
        startTime: gap.startTime,
        endTime: formatMinutesToTime(bEnd),
        startMinutes: gap.startMinutes,
        endMinutes: bEnd,
        source: 'plataforma',
        action: 'caderno_erros',
        description: `Reteste de ${Math.min(pendingErrorsCount, 10)} questões erradas recentemente para sanar vieses`,
        rationale: `Reteste focado nos seus ${pendingErrorsCount} erros pendentes para converter falhas em acertos garantidos no ${targetExam}.`,
        aiDecision: {
          whyThisTopic: `Seu caderno de erros acumula ${pendingErrorsCount} questão(ões) não recuperadas, concentradas principalmente em ${mostCriticalSpecialty}.`,
          whyThisTime: 'Janela intermediária propícia para metacognição e análise detalhada dos distratores da banca.',
          pedagogicalObjective: 'Eliminar pontos cegos recorrentes e reverter padrões de erro.',
          decisionBadges: [
            { type: 'error_retest', label: `${pendingErrorsCount} Erros p/ Reteste` },
            { type: 'weakness', label: `Foco: ${mostCriticalSpecialty}` }
          ]
        }
      });
      continue;
    }

    // Prioridade 3: Treino Intensivo de Questões TRI (Janelas amplas ou pico de foco)
    const topicTitle = criticalSubtopic ? `${areaName}: ${criticalSubtopic}` : areaName;
    const bMinutes = Math.min(duration, 75);
    const bEnd = gap.startMinutes + bMinutes;
    const numQuestions = Math.min(remainingGoal, Math.round(bMinutes / 3));

    const badges: AiDecisionBadge[] = [
      { type: 'weakness', label: `Ponto Cego: ~${criticalSubtopicAcc}% de acerto` },
      { type: 'exam_weight', label: `Alvo: ${targetExam}` }
    ];

    if (bestShift && gap.startTime.startsWith('0') && bestShift === 'Manhã') {
      badges.push({ type: 'energy_peak', label: 'Pico Cognitivo (Manhã)' });
    }

    suggestions.push({
      id: `ai_sug_tri_${Date.now()}_${taskCounter++}`,
      title: `Treino de Questões TRI: ${topicTitle}`,
      category: 'estudo',
      startTime: gap.startTime,
      endTime: formatMinutesToTime(bEnd),
      startMinutes: gap.startMinutes,
      endMinutes: bEnd,
      source: 'plataforma',
      action: 'treinar',
      description: `Resolução ativa de ${numQuestions} questões com gabarito comentado focado em ${topicTitle}`,
      rationale: `Janela contínua de ${bMinutes} min aproveitada para resolver ${numQuestions} questões na área de maior vulnerabilidade.`,
      aiDecision: {
        whyThisTopic: `Seu Raio-X indica maior taxa de erro em ${topicTitle} (~${criticalSubtopicAcc}% de acerto). Foco de alto impacto no ${targetExam}.`,
        whyThisTime: 'Espaço de tempo contínuo que permite concentração profunda sem interrupções da rotina.',
        pedagogicalObjective: `Atingir a meta de questões do dia (${dailyGoal}Q) elevando a proficiência TRI.`,
        decisionBadges: badges
      }
    });
  }

  return suggestions;
}

export async function POST(req: NextRequest) {
  try {
    // Blindagem de segurança: Acesso restrito a estudantes autenticados
    const auth = await verifyStudentSession(req);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Acesso não autorizado: faça login para otimizar sua agenda.' },
        { status: auth.status }
      );
    }

    const body = await req.json();
    const events: CalendarSlotInput[] = body.events || [];
    const userContext = body.userContext || {};
    const userCommand: string = (body.userCommand || body.prompt || '').trim();
    const currentMinutes: number = typeof body.currentMinutes === 'number'
      ? body.currentMinutes
      : (typeof userContext.currentMinutes === 'number' ? userContext.currentMinutes : -1);

    const areaName = userContext.recommendedArea || 'Clínica Médica';
    const targetExam = userContext.targetExamName || 'ENARE 2026';
    const dailyGoal = userContext.dailyGoal || 30;
    const dueTodayFsrs = userContext.spacedRepetition?.dueToday || 0;
    const pendingErrors = userContext.errorNotebook?.pendingCount || 0;

    // 1. Calcula os intervalos livres matematicamente a partir de AGORA
    const freeGaps = calculateFreeGaps(events, currentMinutes >= 0 ? currentMinutes : undefined);

    if (freeGaps.length === 0 && !userCommand) {
      return NextResponse.json({
        success: true,
        summary: 'Sua agenda está com horários contínuos ocupados hoje para o restante do dia. Não encontramos intervalos livres de pelo menos 25 minutos.',
        freeGaps: [],
        suggestions: []
      });
    }

    // 2. Prepara fallback determinístico inteligente com base nas métricas reais
    const heuristicSuggestions = generateHeuristicSuggestions(freeGaps, userContext);

    // 3. Tenta enriquecer com Gemini AI para raciocínio preceptor personalizado
    try {
      const prompt = `
Você é o Coordenador Pedagógico e Preceptor Médico de Residência Médica da plataforma Banco Residência.
O estudante conectou o calendário e solicitou uma alocação cirúrgica de horários para HOJE, baseada no seu desempenho real.

PERFIL COGNITIVO & DESEMPENHO REAL DO ESTUDANTE:
- Exame de Residência Alvo: ${targetExam}
- Meta Diária de Questões: ${dailyGoal} (Já respondeu: ${userContext.todayAnswered || 0}Q)
- Área Prioritária de Foco: ${areaName}
- Subtemas Críticos com Menor Acurácia: ${JSON.stringify(userContext.criticalWeaknesses || [])}
- Caderno de Erros (Pendentes de Reteste): ${pendingErrors} questões erradas
- Revisão Espaçada FSRS: ${dueTodayFsrs} flashcards vencendo HOJE na curva de esquecimento
- Cronobiologia & Energia Cognitiva Real: ${JSON.stringify(userContext.cognitiveEnergy || {})}

TEMPO & HORÁRIOS:
- Hora Atual do Aluno: ${userContext.currentTime || 'Agora'} (${currentMinutes} minutos do dia)
- Compromissos Atuais Ocupados (Hospital/Aulas/Plantões):
${JSON.stringify(events.map(e => ({ title: e.title, horario: `${e.startTime} às ${e.endTime}` })))}

- INTERVALOS LIVRES DISPONÍVEIS A PARTIR DE AGORA:
${JSON.stringify(freeGaps.map(g => ({ horario: `${g.startTime} às ${g.endTime}`, duracaoMin: g.durationMinutes })))}

${userCommand ? `PEDIDO ESPECÍFICO DO ALUNO:
"${userCommand}"
IMPORTANTE: Atenda rigorosamente ao pedido do aluno acima se compatível!` : ''}

DIRETRIZES DE DECISÃO PEDAGÓGICA (MANDATÓRIAS):
1. NUNCA sugira horários no passado (antes de ${userContext.currentTime || 'agora'}).
2. Se houver flashcards FSRS vencendo hoje (${dueTodayFsrs} cards), OBRIGATORIAMENTE aloque uma sessão de 20 a 35 min de flashcards FSRS.
3. Se houver erros pendentes (${pendingErrors} erros), aloque uma sessão de Caderno de Erros.
4. Para temas densos (Treino TRI de questões no subtema fraco), priorize horários com maior energia mental do aluno ou janelas amplas.
5. Se for tarde/noite ou o aluno tiver fadiga noturna, evite sobrecarga cognitiva.
6. TRANSPARÊNCIA TOTAL: Para CADA atividade, forneça "aiDecision" detalhando:
   - "whyThisTopic": Por que este tema/atividade foi selecionado baseado nos números reais do aluno.
   - "whyThisTime": Por que este horário específico é o ideal (cronobiologia, compromissos pré/pós, fadiga).
   - "pedagogicalObjective": O ganho imediato para a prova.
   - "decisionBadges": Lista de 1 a 3 badges curtos com rótulos objetivos (Ex: "Ponto Cego: 25% acerto", "18 FSRS Vencendo", "Pico Cognitivo (Manhã)", "Reteste de Erros").

Responda OBRIGATORIAMENTE em JSON válido com a seguinte estrutura:
{
  "summary": "Resumo clínico amigável e direto de 1 a 2 frases conectando os horários livres aos pontos fracos e flashcards do dia",
  "suggestions": [
    {
      "id": "ai_sug_1",
      "title": "Treino TRI: ...",
      "category": "estudo",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "action": "treinar",
      "description": "...",
      "rationale": "Frase sintética motivadora",
      "aiDecision": {
        "whyThisTopic": "...",
        "whyThisTime": "...",
        "pedagogicalObjective": "...",
        "decisionBadges": [
          { "type": "weakness", "label": "Ponto Cego: 25% acerto" },
          { "type": "energy_peak", "label": "Pico Cognitivo" }
        ]
      }
    }
  ]
}
`;

      const aiResponse = await callGeminiAi(prompt, {
        temperature: 0.25,
        responseMimeType: 'application/json'
      });

      const parsed = parseCleanJson<{
        summary?: string;
        suggestions?: Array<{
          id?: string;
          title: string;
          category: 'estudo' | 'flashcard' | 'revisao' | 'simulado' | 'pausa';
          startTime: string;
          endTime: string;
          action: 'treinar' | 'flashcards' | 'caderno_erros' | 'simulado' | 'mnemonico';
          description: string;
          rationale?: string;
          aiDecision?: {
            whyThisTopic?: string;
            whyThisTime?: string;
            pedagogicalObjective?: string;
            decisionBadges?: Array<{
              type: 'weakness' | 'energy_peak' | 'fsrs_due' | 'error_retest' | 'exam_weight' | 'fatigue_relief' | 'quick_win';
              label: string;
            }>;
          };
        }>;
      }>(aiResponse);

      if (parsed?.suggestions && Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0) {
        const validatedSuggestions: StudySuggestion[] = parsed.suggestions.map((s, idx) => {
          const [startH, startM] = (s.startTime || '08:00').split(':').map(Number);
          const [endH, endM] = (s.endTime || '09:00').split(':').map(Number);
          const startMinutes = (startH || 0) * 60 + (startM || 0);
          const endMinutes = (endH || 0) * 60 + (endM || 0);

          return {
            id: s.id || `ai_sug_${Date.now()}_${idx}`,
            title: s.title || `Treino de Questões: ${areaName}`,
            category: s.category || 'estudo',
            startTime: s.startTime,
            endTime: s.endTime,
            startMinutes,
            endMinutes: Math.max(endMinutes, startMinutes + 15),
            source: 'plataforma',
            action: s.action || 'treinar',
            description: s.description || 'Bloco de estudo adaptativo calibrado pelo Preceptor IA',
            rationale: s.rationale || 'Otimização pedagógica baseada no seu desempenho e horários livres.',
            aiDecision: s.aiDecision || {
              whyThisTopic: `Foco direcionado para alavancar seu rendimento em ${areaName}.`,
              whyThisTime: 'Encaixado estrategicamente nos horários livres da sua rotina.',
              pedagogicalObjective: `Avanço na preparação para o ${targetExam}.`,
              decisionBadges: [{ type: 'exam_weight', label: targetExam }]
            }
          };
        });

        // Ordena cronologicamente por horário de início
        validatedSuggestions.sort((a, b) => a.startMinutes - b.startMinutes);

        return NextResponse.json({
          success: true,
          summary: parsed.summary || `Encontramos ${freeGaps.length} intervalo(s) livre(s) a partir de agora. Estruturamos seus blocos priorizando deficiências e repetição espaçada.`,
          freeGaps,
          suggestions: validatedSuggestions,
          aiModel: 'gemini'
        });
      }
    } catch (aiErr) {
      console.warn('[ScheduleOptimizer] Fallback para heurística pedagógica avançada:', aiErr);
    }

    // Retorno com heurística pedagógica robusta caso o Gemini falhe ou atinja timeout
    const totalFreeMinutes = freeGaps.reduce((acc, g) => acc + g.durationMinutes, 0);
    const freeHours = Math.floor(totalFreeMinutes / 60);
    const freeMins = totalFreeMinutes % 60;

    let summaryText = `Detectamos ${freeHours > 0 ? `${freeHours}h ` : ''}${freeMins}m de horários livres disponíveis a partir de agora.`;
    if (dueTodayFsrs > 0 && pendingErrors > 0) {
      summaryText += ` Alocamos blocos prioritários para liquidar seus ${dueTodayFsrs} flashcards FSRS vencendo hoje e retestar seus ${pendingErrors} erros pendentes.`;
    } else if (dueTodayFsrs > 0) {
      summaryText += ` Priorizamos seus ${dueTodayFsrs} flashcards FSRS para proteger sua curva de esquecimento.`;
    } else {
      summaryText += ` Alocamos treinos focados na sua área de maior atenção (${areaName}).`;
    }

    return NextResponse.json({
      success: true,
      summary: summaryText,
      freeGaps,
      suggestions: heuristicSuggestions,
      aiModel: 'heuristic-pedagogical'
    });
  } catch (err: any) {
    console.error('[ScheduleOptimizer Error]', err);
    return NextResponse.json(
      { error: err?.message || 'Falha ao analisar horários livres.' },
      { status: 500 }
    );
  }
}
