import { NextRequest, NextResponse } from 'next/server';
import dns from 'node:dns/promises';
import ical from 'node-ical';
import { verifyStudentSession } from '@/lib/supabase/studentAuth';
import {
  validateIcalUrlFormat,
  isPrivateOrReservedIp,
  safeFetchBufferWithLimit
} from '@/utils/urlSecurity';

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
    // 0. Autenticação obrigatória de estudante (impede uso como proxy público)
    const auth = await verifyStudentSession(req);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json(
        { error: 'Faça login na plataforma para sincronizar sua agenda.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const rawUrl = (body?.url || body?.icalUrl || '').trim();

    if (!rawUrl) {
      return NextResponse.json(
        { error: 'Por favor, cole o link secreto (.ics) da sua agenda.' },
        { status: 400 }
      );
    }

    if (rawUrl.includes('/calendar/u/') || rawUrl.includes('/r/month') || rawUrl.includes('/r/week') || rawUrl.includes('/embed?src=')) {
      return NextResponse.json(
        {
          error: 'Você colou o link do navegador ou de incorporação. Você precisa colar o "Endereço secreto no formato iCal" (termina com .ics), disponível em Configurações da sua agenda > Integrar agenda.'
        },
        { status: 400 }
      );
    }

    // 1. Validação estrita contra SSRF (apenas calendar.google.com, Outlook e iCloud; sem 'google.com' aberto)
    const urlCheck = validateIcalUrlFormat(rawUrl);
    if (!urlCheck.allowed || !urlCheck.normalizedUrl) {
      return NextResponse.json(
        { error: urlCheck.reason || 'URL de calendário não permitida.' },
        { status: 400 }
      );
    }

    // 2. Validação DNS contra DNS Rebinding / IPs internos
    const parsedHost = new URL(urlCheck.normalizedUrl).hostname;
    try {
      const resolvedIps = await dns.lookup(parsedHost, { all: true });
      if (!resolvedIps.length || resolvedIps.some((r) => isPrivateOrReservedIp(r.address))) {
        return NextResponse.json(
          { error: 'Endereço de destino inválido por política de segurança.' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Não foi possível resolver o servidor da agenda informada.' },
        { status: 400 }
      );
    }

    // 3. Busca o arquivo .ics bloqueando redirecionamentos HTTP (redirect: 'error') e limitando a 2MB
    let icsRawText = '';
    try {
      const fetched = await safeFetchBufferWithLimit(
        urlCheck.normalizedUrl,
        2 * 1024 * 1024,
        8000,
        {
          'User-Agent': 'BancoResidencia-CalendarSync/1.0',
          'Accept': 'text/calendar, text/plain'
        }
      );

      if (!fetched.ok) {
        return NextResponse.json(
          {
            error: `Erro ao acessar o link (Código ${fetched.status}). Verifique se o endereço secreto foi copiado por completo.`
          },
          { status: 400 }
        );
      }

      icsRawText = fetched.buffer.toString('utf8');
    } catch (fetchErr: unknown) {
      const errMsg = fetchErr instanceof Error ? fetchErr.message : '';
      if (errMsg.includes('timeout') || (fetchErr as { name?: string })?.name === 'TimeoutError') {
        return NextResponse.json(
          { error: 'Tempo limite esgotado ao tentar acessar o link do Google Agenda. Verifique sua conexão e o link.' },
          { status: 408 }
        );
      }
      if (errMsg.includes('limite máximo')) {
        return NextResponse.json(
          { error: 'O arquivo da agenda excede o limite máximo seguro de 2MB.' },
          { status: 413 }
        );
      }
      return NextResponse.json(
        { error: 'Não foi possível conectar ao endereço fornecido (redirecionamentos externos são bloqueados por segurança).' },
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

    // Converte qualquer data para a hora/minuto em Brasília (evita bugs de fuso em servidores UTC)
    const getBrtTime = (d: Date) => {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).formatToParts(d);
      const hourStr = parts.find(p => p.type === 'hour')?.value || '00';
      const minStr = parts.find(p => p.type === 'minute')?.value || '00';
      const h = parseInt(hourStr, 10);
      const m = parseInt(minStr, 10);
      return {
        timeStr: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
        minutes: h * 60 + m
      };
    };

    const windowStart = new Date(now.getTime() - 24 * 3600 * 1000);
    const windowEnd = new Date(now.getTime() + 24 * 3600 * 1000);

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
          const occurrences = ev.rrule.between(windowStart, windowEnd, true);
          for (const occDate of occurrences) {
            const occBrtStr = getBrtDateString(occDate);
            if (occBrtStr !== todayBrtStr) continue;

            const duration = ev.end ? (new Date(ev.end).getTime() - new Date(ev.start).getTime()) : 3600000;
            const evStart = new Date(occDate);
            const evEnd = new Date(evStart.getTime() + duration);

            const startBrt = getBrtTime(evStart);
            const endBrt = getBrtTime(evEnd);

            eventsList.push({
              id: `${ev.uid || k}_${evStart.getTime()}`,
              title: summary,
              category,
              startTime: startBrt.timeStr,
              endTime: endBrt.timeStr,
              startMinutes: startBrt.minutes,
              endMinutes: Math.max(endBrt.minutes, startBrt.minutes + 15),
              source: 'google',
              description: description || '',
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
          const startBrt = getBrtTime(evStart);
          const endBrt = getBrtTime(evEnd);

          eventsList.push({
            id: ev.uid || k,
            title: summary,
            category,
            startTime: startBrt.timeStr,
            endTime: endBrt.timeStr,
            startMinutes: startBrt.minutes,
            endMinutes: Math.max(endBrt.minutes, startBrt.minutes + 15),
            source: 'google',
            description: description || '',
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
