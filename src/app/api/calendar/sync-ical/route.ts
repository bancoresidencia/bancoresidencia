import { NextRequest, NextResponse } from 'next/server';
import ical from 'node-ical';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CalendarEventResult {
  id: string;
  title: string;
  category: 'hospital' | 'estudo' | 'pausa';
  startTime: string;
  endTime: string;
  startMinutes: number;
  endMinutes: number;
  source: 'google';
  description: string;
  location?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let url = (body?.url || body?.icalUrl || '').trim();

    if (!url) {
      return NextResponse.json(
        { error: 'Por favor, cole o link secreto (.ics) da sua agenda.' },
        { status: 400 }
      );
    }

    // Normaliza links webcal:// para https://
    if (url.startsWith('webcal://')) {
      url = url.replace('webcal://', 'https://');
    }

    // Validação preventiva de links comuns errados
    if (url.includes('/calendar/u/') || url.includes('/r/month') || url.includes('/r/week') || url.includes('/embed?src=')) {
      return NextResponse.json(
        {
          error: 'Você colou o link do navegador ou de incorporação. Você precisa colar o "Endereço secreto no formato iCal" (termina com .ics), disponível em Configurações da sua agenda > Integrar agenda.'
        },
        { status: 400 }
      );
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return NextResponse.json(
        { error: 'Formato de link inválido. O link deve começar com https://' },
        { status: 400 }
      );
    }

    // Busca o arquivo .ics no servidor com timeout de 8 segundos para evitar travamentos
    let icsRawText = '';
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'BancoResidencia-CalendarSync/1.0',
          'Accept': 'text/calendar, text/plain, */*'
        },
        signal: AbortSignal.timeout(8000),
        next: { revalidate: 0 }
      });

      if (!response.ok) {
        return NextResponse.json(
          {
            error: `Erro ao acessar o link (Código ${response.status}). Verifique se o endereço secreto foi copiado por completo.`
          },
          { status: 400 }
        );
      }

      icsRawText = await response.text();
    } catch (fetchErr: any) {
      if (fetchErr?.name === 'TimeoutError' || fetchErr?.message?.includes('timeout')) {
        return NextResponse.json(
          { error: 'Tempo limite esgotado ao tentar acessar o link do Google Agenda. Verifique sua conexão e o link.' },
          { status: 408 }
        );
      }
      return NextResponse.json(
        { error: 'Não foi possível conectar ao endereço fornecido. Certifique-se de que a URL está correta.' },
        { status: 400 }
      );
    }

    if (!icsRawText || !icsRawText.includes('BEGIN:VCALENDAR')) {
      return NextResponse.json(
        {
          error: 'O link informado não é um calendário iCal (.ics) válido. No Google Agenda, copie especificamente o "Endereço secreto no formato iCal".'
        },
        { status: 400 }
      );
    }

    // Parse do conteúdo iCal
    const parsed = await ical.async.parseICS(icsRawText);

    // Determina o intervalo do dia atual no fuso horário de Brasília (America/Sao_Paulo)
    const timeZone = 'America/Sao_Paulo';
    const now = new Date();
    
    // Obtém YYYY-MM-DD em Brasília
    const getBrtDateString = (d: Date) => {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(d);
    };

    const todayBrtStr = getBrtDateString(now);

    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const eventsList: CalendarEventResult[] = [];
    let calendarName = '';

    for (const k in parsed) {
      if (!Object.prototype.hasOwnProperty.call(parsed, k)) continue;
      const ev: any = parsed[k];

      if (ev.type === 'VCALENDAR' && ev['WR-CALNAME']) {
        calendarName = ev['WR-CALNAME'];
      }

      if (ev.type !== 'VEVENT') continue;

      const summary = (ev.summary || 'Compromisso').toString().trim();
      const location = (ev.location || '').toString().trim();
      const description = (ev.description || '').toString().trim();

      // Classifica categoria automaticamente
      const lowerText = `${summary} ${location} ${description}`.toLowerCase();
      let category: 'hospital' | 'estudo' | 'pausa' = 'hospital';
      if (lowerText.includes('almoço') || lowerText.includes('jantar') || lowerText.includes('pausa') || lowerText.includes('descanso')) {
        category = 'pausa';
      } else if (lowerText.includes('estudo') || lowerText.includes('questõ') || lowerText.includes('simulado') || lowerText.includes('revis')) {
        category = 'estudo';
      } else {
        category = 'hospital';
      }

      // 1. Evento com recorrência (RRULE)
      if (ev.rrule) {
        try {
          const occurrences = ev.rrule.between(startOfDay, endOfDay, true);
          for (const occDate of occurrences) {
            const duration = ev.end ? (new Date(ev.end).getTime() - new Date(ev.start).getTime()) : 3600000;
            const evStart = new Date(occDate);
            const evEnd = new Date(evStart.getTime() + duration);

            const startMinutes = evStart.getHours() * 60 + evStart.getMinutes();
            const endMinutes = evEnd.getHours() * 60 + evEnd.getMinutes();
            const startTime = `${String(evStart.getHours()).padStart(2, '0')}:${String(evStart.getMinutes()).padStart(2, '0')}`;
            const endTime = `${String(evEnd.getHours()).padStart(2, '0')}:${String(evEnd.getMinutes()).padStart(2, '0')}`;

            eventsList.push({
              id: `${ev.uid || k}_${evStart.getTime()}`,
              title: summary,
              category,
              startTime,
              endTime,
              startMinutes,
              endMinutes: Math.max(endMinutes, startMinutes + 15),
              source: 'google',
              description: description || 'Evento sincronizado do Google Agenda',
              location: location || undefined
            });
          }
        } catch {
          // Fallback silencioso para evitar quebrar o loop se uma RRULE falhar
        }
      } else if (ev.start) {
        // 2. Evento pontual simples
        const evStart = new Date(ev.start);
        const evEnd = ev.end ? new Date(ev.end) : new Date(evStart.getTime() + 3600000);

        // Verifica se o evento coincide com hoje no fuso horário do Brasil
        const eventBrtStr = getBrtDateString(evStart);
        if (eventBrtStr === todayBrtStr) {
          const startMinutes = evStart.getHours() * 60 + evStart.getMinutes();
          const endMinutes = evEnd.getHours() * 60 + evEnd.getMinutes();
          const startTime = `${String(evStart.getHours()).padStart(2, '0')}:${String(evStart.getMinutes()).padStart(2, '0')}`;
          const endTime = `${String(evEnd.getHours()).padStart(2, '0')}:${String(evEnd.getMinutes()).padStart(2, '0')}`;

          eventsList.push({
            id: ev.uid || k,
            title: summary,
            category,
            startTime,
            endTime,
            startMinutes,
            endMinutes: Math.max(endMinutes, startMinutes + 15),
            source: 'google',
            description: description || 'Evento sincronizado do Google Agenda',
            location: location || undefined
          });
        }
      }
    }

    // Ordena os eventos por horário de início
    eventsList.sort((a, b) => a.startMinutes - b.startMinutes);

    return NextResponse.json({
      success: true,
      calendarName: calendarName || 'Google Agenda',
      eventsCount: eventsList.length,
      events: eventsList,
      syncedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      message: eventsList.length > 0
        ? `${eventsList.length} compromisso(s) sincronizado(s) com sucesso.`
        : 'Agenda conectada com sucesso! Nenhum compromisso agendado para hoje.'
    });
  } catch (error: any) {
    console.error('[Sync iCal Error]', error);
    return NextResponse.json(
      { error: error?.message || 'Falha ao processar o arquivo da agenda.' },
      { status: 500 }
    );
  }
}
