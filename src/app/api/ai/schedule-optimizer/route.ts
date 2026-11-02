import { NextRequest, NextResponse } from 'next/server';
import { callGeminiAi, parseCleanJson } from '@/lib/gemini';

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
}

function formatMinutesToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Calcula os intervalos livres do dia mesclando intervalos ocupados (busy ranges)
 */
function calculateFreeGaps(events: CalendarSlotInput[]): FreeGap[] {
  if (!events || events.length === 0) {
    // Dia totalmente livre (das 08:00 às 22:00 = 14 horas)
    return [
      {
        startMinutes: 480,
        endMinutes: 1320,
        startTime: '08:00',
        endTime: '22:00',
        durationMinutes: 840
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

  // 2. Determina o escopo do dia útil
  // Se o primeiro evento começar antes das 07:00 (420m), o início acompanha ou começa após ele.
  const firstEventStart = mergedBusy[0].start;
  const dayStart = firstEventStart < 420 ? Math.max(360, firstEventStart) : 420; // min 06:00 ou 07:00
  const dayEnd = 1350; // 22:30

  const gaps: FreeGap[] = [];

  // Intervalo antes do primeiro evento (se houver pelo menos 45 min)
  if (firstEventStart > dayStart && (firstEventStart - dayStart) >= 45) {
    gaps.push({
      startMinutes: dayStart,
      endMinutes: firstEventStart,
      startTime: formatMinutesToTime(dayStart),
      endTime: formatMinutesToTime(firstEventStart),
      durationMinutes: firstEventStart - dayStart
    });
  }

  // Intervalos entre eventos consecutivos
  for (let i = 0; i < mergedBusy.length - 1; i++) {
    const currentEnd = mergedBusy[i].end;
    const nextStart = mergedBusy[i + 1].start;
    if (nextStart - currentEnd >= 30) { // pelo menos 30 minutos livres
      gaps.push({
        startMinutes: currentEnd,
        endMinutes: nextStart,
        startTime: formatMinutesToTime(currentEnd),
        endTime: formatMinutesToTime(nextStart),
        durationMinutes: nextStart - currentEnd
      });
    }
  }

  // Intervalo após o último evento até o fim da noite
  const lastEventEnd = mergedBusy[mergedBusy.length - 1].end;
  if (lastEventEnd < dayEnd && (dayEnd - lastEventEnd) >= 45) {
    gaps.push({
      startMinutes: lastEventEnd,
      endMinutes: dayEnd,
      startTime: formatMinutesToTime(lastEventEnd),
      endTime: formatMinutesToTime(dayEnd),
      durationMinutes: dayEnd - lastEventEnd
    });
  }

  return gaps;
}

/**
 * Gerador de sugestões determinístico / heurístico de alto rendimento médico
 * Garante resultado instantâneo e serve de fallback caso a IA esteja offline
 */
function generateHeuristicSuggestions(
  gaps: FreeGap[],
  areaName: string,
  targetExam: string,
  dailyGoal: number
): StudySuggestion[] {
  const suggestions: StudySuggestion[] = [];
  let taskCounter = 1;

  for (const gap of gaps) {
    const duration = gap.durationMinutes;

    // Janela Curta (30 a 55 min)
    if (duration >= 30 && duration < 60) {
      if (gap.startMinutes >= 1140) { // Noite
        suggestions.push({
          id: `ai_sug_${Date.now()}_${taskCounter++}`,
          title: 'Caderno de Erros (Reteste Metacognitivo)',
          category: 'revisao',
          startTime: gap.startTime,
          endTime: gap.endTime,
          startMinutes: gap.startMinutes,
          endMinutes: gap.endMinutes,
          source: 'plataforma',
          action: 'caderno_erros',
          description: 'Reteste ativo dos pontos cegos e pegadinhas erradas recentemente',
          rationale: 'Intervalo noturno curto perfeito para fixação metacognitiva sem sobrecarga.'
        });
      } else {
        suggestions.push({
          id: `ai_sug_${Date.now()}_${taskCounter++}`,
          title: 'Simulado Expresso TRI (Blitz 10Q)',
          category: 'simulado',
          startTime: gap.startTime,
          endTime: gap.endTime,
          startMinutes: gap.startMinutes,
          endMinutes: gap.endMinutes,
          source: 'plataforma',
          action: 'simulado',
          description: `10 questões calibradas no padrão ${targetExam} (~12 a 15 min de prova)`,
          rationale: 'Janela rápida ideal para manter velocidade de prova e calibração de tempo.'
        });
      }
    }
    // Janela Média (60 a 110 min)
    else if (duration >= 60 && duration < 120) {
      const isMorning = gap.startMinutes < 720;
      const isAfternoon = gap.startMinutes >= 720 && gap.startMinutes < 1140;

      if (isMorning || isAfternoon) {
        suggestions.push({
          id: `ai_sug_${Date.now()}_${taskCounter++}`,
          title: `Treino de Questões TRI: ${areaName}`,
          category: 'estudo',
          startTime: gap.startTime,
          endTime: gap.endTime,
          startMinutes: gap.startMinutes,
          endMinutes: gap.endMinutes,
          source: 'plataforma',
          action: 'treinar',
          description: `Treino direcionado de alta densidade (${Math.min(dailyGoal, 20)} questões comentadas)`,
          rationale: 'Janela livre contínua para concentração profunda na sua área prioritária.'
        });
      } else {
        suggestions.push({
          id: `ai_sug_${Date.now()}_${taskCounter++}`,
          title: 'Revisão de Flashcards FSRS & Erros',
          category: 'flashcard',
          startTime: gap.startTime,
          endTime: gap.endTime,
          startMinutes: gap.startMinutes,
          endMinutes: gap.endMinutes,
          source: 'plataforma',
          action: 'flashcards',
          description: 'Fixação mnemônica espaçada com algoritmo FSRS',
          rationale: 'Excelente janela noturna para consolidar memórias de longo prazo.'
        });
      }
    }
    // Janela Ampla (>= 120 min)
    else if (duration >= 120) {
      // Bloco 1: Treino de Questões (90 min)
      const b1Start = gap.startMinutes + 15; // 15 min de respiro inicial
      const b1End = b1Start + 90;
      suggestions.push({
        id: `ai_sug_${Date.now()}_${taskCounter++}`,
        title: `Treino Principal de Questões: ${areaName}`,
        category: 'estudo',
        startTime: formatMinutesToTime(b1Start),
        endTime: formatMinutesToTime(b1End),
        startMinutes: b1Start,
        endMinutes: b1End,
        source: 'plataforma',
        action: 'treinar',
        description: `Meta prioritária: 25 a 30 questões comentadas com padrão psicométrico ${targetExam}`,
        rationale: 'Horário nobre de energia mental para resolução intensiva de questões.'
      });

      // Se restar espaço substancial (> 75 min após pausa de 15 min)
      const b2Start = b1End + 15;
      const remaining = gap.endMinutes - b2Start;
      if (remaining >= 45) {
        const b2End = Math.min(gap.endMinutes, b2Start + 60);
        suggestions.push({
          id: `ai_sug_${Date.now()}_${taskCounter++}`,
          title: 'Revisão de Flashcards FSRS & Pílula Clínica',
          category: 'flashcard',
          startTime: formatMinutesToTime(b2Start),
          endTime: formatMinutesToTime(b2End),
          startMinutes: b2Start,
          endMinutes: b2End,
          source: 'plataforma',
          action: 'flashcards',
          description: 'Baralho inteligente de repetição espaçada sem fadiga cognitiva',
          rationale: 'Alternância de estímulo cognitivo (questões ➔ repetição ativa).'
        });
      }
    }
  }

  return suggestions;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const events: CalendarSlotInput[] = body.events || [];
    const userContext = body.userContext || {};

    const areaName = userContext.recommendedArea || 'Clínica Médica';
    const targetExam = userContext.targetExamName || 'ENARE 2026';
    const dailyGoal = userContext.dailyGoal || 30;

    // 1. Calcula os intervalos livres matematicamente
    const freeGaps = calculateFreeGaps(events);

    if (freeGaps.length === 0) {
      return NextResponse.json({
        success: true,
        summary: 'Sua agenda do Google está com horários contínuos ocupados hoje. Não encontramos intervalos livres de pelo menos 30 minutos.',
        freeGaps: [],
        suggestions: []
      });
    }

    // 2. Prepara fallback determinístico
    const heuristicSuggestions = generateHeuristicSuggestions(freeGaps, areaName, targetExam, dailyGoal);

    // 3. Tenta enriquecer com Gemini AI para raciocínio preceptor personalizado
    try {
      const prompt = `
Você é o Coordenador Pedagógico e Preceptor Médico de Residência Médica da plataforma Banco Residência.
O estudante conectou o Google Agenda e deseja um planejamento cirúrgico e adaptativo de estudos para os horários LIVRES de hoje.

DADOS DA ROTINA DO ESTUDANTE:
- Eventos atuais sincronizados do Google Agenda:
${JSON.stringify(events.map(e => ({ title: e.title, horario: `${e.startTime} às ${e.endTime}` })))}

- INTERVALOS LIVRES IDENTIFICADOS NO DIA:
${JSON.stringify(freeGaps.map(g => ({ horario: `${g.startTime} às ${g.endTime}`, duracaoMin: g.durationMinutes })))}

- Exame de Residência Alvo: ${targetExam}
- Área com maior necessidade de foco: ${areaName}
- Meta diária de questões: ${dailyGoal}

REGRAS PEDAGÓGICAS E PSICOMÉTRICAS:
1. NÃO colida com os compromissos existentes do Google Agenda. Use APENAS os intervalos livres listados.
2. Cada tarefa deve pertencer a uma das categorias:
   - "estudo" (ação: "treinar"): Treino focado de questões TRI com gabarito comentado
   - "flashcard" (ação: "flashcards"): Baralho ativo espaçado algoritmo FSRS
   - "revisao" (ação: "caderno_erros" ou "mnemonico"): Reteste de erros e fixação de pegadinhas
   - "simulado" (ação: "simulado"): Simulado expresso TRI sob pressão de tempo (Blitz 10Q)
3. Sugira de 2 a 4 blocos de estudo no total, distribuídos harmoniosamente nos intervalos livres.
4. Para cada bloco, explique em 1 frase curta e motivadora o porquê pedagógico daquele horário (cronobiologia e descanso).

Responda OBRIGATORIAMENTE em JSON válido com a estrutura:
{
  "summary": "Resumo clínico amigável e direto de 1 a 2 frases analisando o dia do aluno",
  "suggestions": [
    {
      "id": "ai_sug_1",
      "title": "Treino de Questões TRI: ${areaName}",
      "category": "estudo",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "action": "treinar",
      "description": "...",
      "rationale": "..."
    }
  ]
}
`;

      const aiResponse = await callGeminiAi(prompt, {
        temperature: 0.3,
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
            description: s.description || 'Bloco de estudo personalizado gerado por IA',
            rationale: s.rationale || 'Otimização baseada nos intervalos livres da sua agenda.'
          };
        });

        // Ordena por horário de início
        validatedSuggestions.sort((a, b) => a.startMinutes - b.startMinutes);

        return NextResponse.json({
          success: true,
          summary: parsed.summary || `Identificamos ${freeGaps.length} intervalo(s) livre(s) hoje. Alocamos blocos otimizados para ${targetExam}.`,
          freeGaps,
          suggestions: validatedSuggestions,
          aiModel: 'gemini'
        });
      }
    } catch (aiErr) {
      console.warn('[ScheduleOptimizer] Fallback para heurística pedagógica:', aiErr);
    }

    // Retorno com heurística padrão ouro caso o Gemini não responda
    const totalFreeMinutes = freeGaps.reduce((acc, g) => acc + g.durationMinutes, 0);
    const freeHours = Math.floor(totalFreeMinutes / 60);
    const freeMins = totalFreeMinutes % 60;

    return NextResponse.json({
      success: true,
      summary: `Detectamos ${freeHours > 0 ? `${freeHours}h ` : ''}${freeMins}m de horários livres no seu Google Agenda hoje. Sugerimos ${heuristicSuggestions.length} blocos adaptados para alavancar seu desempenho em ${areaName}.`,
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
