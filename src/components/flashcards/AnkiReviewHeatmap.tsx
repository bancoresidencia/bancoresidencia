'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { DailyReviewLog } from '@/types/flashcards';
import { flashcardsService } from '@/services/flashcardsService';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

interface AnkiReviewHeatmapProps {
  initialLogs?: Record<string, DailyReviewLog>;
  userId?: string;
  className?: string;
}

export const AnkiReviewHeatmap: React.FC<AnkiReviewHeatmapProps> = ({
  initialLogs,
  userId,
  className = ''
}) => {
  const { user } = useAuth();
  const { mode } = useTheme();

  // Detecção resiliente de Dark Mode: avalia classe .dark no HTML ou preferência
  const [isDark, setIsDark] = useState<boolean>(true);

  useEffect(() => {
    const updateTheme = () => {
      const hasDarkClass = document.documentElement.classList.contains('dark');
      setIsDark(mode === 'dark' || hasDarkClass);
    };
    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, [mode]);

  const activeUserId = userId || user?.id;
  const currentRealYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentRealYear);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Hover state para tooltip flutuante e destaque vertical da coluna (semana)
  const [hoveredColIndex, setHoveredColIndex] = useState<number | null>(null);
  const [hoveredDay, setHoveredDay] = useState<{
    dateStr: string;
    dayName: string;
    formattedDate: string;
    feitos: number;
    revisao: number;
    total: number;
    x: number;
    y: number;
  } | null>(null);

  // Estado local para logs sincronizados com o Supabase (SWR)
  const [syncedLogs, setSyncedLogs] = useState<Record<string, DailyReviewLog> | null>(null);

  useEffect(() => {
    if (activeUserId && activeUserId !== 'demo-student') {
      flashcardsService.syncRemoteDailyLogs(activeUserId, selectedYear).then((remote) => {
        if (remote) {
          setSyncedLogs(remote);
        }
      });
    }
  }, [activeUserId, selectedYear]);

  // Carrega logs de revisão diários (Cache local instantâneo + Reconciliação SWR)
  const dailyLogs = useMemo(() => {
    if (initialLogs && Object.keys(initialLogs).length > 0) return initialLogs;
    if (syncedLogs) return syncedLogs;
    return flashcardsService.getDailyReviewLogs(selectedYear, activeUserId);
  }, [initialLogs, syncedLogs, selectedYear, activeUserId]);

  // Data de hoje em YYYY-MM-DD
  const todayStr = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const todayLog = dailyLogs[todayStr];
  const todayCount = todayLog ? todayLog.total : 0;
  const todaySeconds = todayLog ? todayLog.durationSeconds : 0;

  // Frase superior clássica do Anki
  const formatTodayHeadline = () => {
    const mins = Math.max(1, Math.round(todaySeconds / 60));
    if (todayCount === 0) {
      return 'Nenhum flashcard estudado hoje ainda. Comece agora!';
    }
    if (todaySeconds < 60) {
      return `Studied ${todayCount} ${todayCount === 1 ? 'card' : 'cards'} in ${Math.max(1, todaySeconds)} seconds today.`;
    }
    return `Studied ${todayCount} ${todayCount === 1 ? 'card' : 'cards'} in ${mins} ${mins === 1 ? 'minute' : 'minutes'} today.`;
  };

  // Constrói o grid de 52/53 semanas x 7 dias para o ano selecionado
  const {
    weeksGrid,
    totalDaysInYear,
    daysWithReviewsCount,
    totalReviewsInYear,
    longestStreak,
    currentStreak
  } = useMemo(() => {
    const jan1 = new Date(selectedYear, 0, 1);
    const isLeap =
      (selectedYear % 4 === 0 && selectedYear % 100 !== 0) || selectedYear % 400 === 0;
    const daysInYear = isLeap ? 366 : 365;

    const weeks: Array<
      Array<{
        dateStr: string;
        dateObj: Date;
        reviews: number;
        feitos: number;
        revisao: number;
        isToday: boolean;
        isInYear: boolean;
        isFuture: boolean;
      } | null>
    > = [];

    // Preenche dias antes de 1 de janeiro (alinhamento de dia da semana 0=Dom ... 6=Sáb)
    let currentWeek: Array<any> = new Array(jan1.getDay()).fill(null);

    let activeDaysCount = 0;
    let reviewsSum = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    let cStreak = 0;

    for (let day = 1; day <= daysInYear; day++) {
      const d = new Date(selectedYear, 0, day);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const log = dailyLogs[dateStr];
      const revs = log ? log.total : 0;
      const f = log ? log.feitos : 0;
      const r = log ? log.revisao : 0;

      if (revs > 0) {
        activeDaysCount++;
        reviewsSum += revs;
        tempStreak++;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
      } else {
        tempStreak = 0;
      }

      const isToday = dateStr === todayStr;
      const isFuture = dateStr > todayStr;

      currentWeek.push({
        dateStr,
        dateObj: d,
        reviews: revs,
        feitos: f,
        revisao: r,
        isToday,
        isInYear: true,
        isFuture
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    // Calcula Current Streak (de hoje para trás ininterruptamente)
    const now = new Date();
    const checkDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    while (true) {
      const yyyy = checkDate.getFullYear();
      const mm = String(checkDate.getMonth() + 1).padStart(2, '0');
      const dd = String(checkDate.getDate()).padStart(2, '0');
      const ds = `${yyyy}-${mm}-${dd}`;
      const hasLog = dailyLogs[ds] && dailyLogs[ds].total > 0;
      if (hasLog) {
        cStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        if (ds === todayStr) {
          checkDate.setDate(checkDate.getDate() - 1);
          const yesterdayStr = `${checkDate.getFullYear()}-${String(
            checkDate.getMonth() + 1
          ).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
          if (dailyLogs[yesterdayStr] && dailyLogs[yesterdayStr].total > 0) {
            cStreak = 1;
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }

    return {
      weeksGrid: weeks,
      totalDaysInYear: daysInYear,
      daysWithReviewsCount: activeDaysCount,
      totalReviewsInYear: reviewsSum,
      longestStreak: maxStreak,
      currentStreak: cStreak
    };
  }, [selectedYear, dailyLogs, todayStr]);

  // Estatísticas de rodapé
  const dailyAverage = useMemo(() => {
    if (daysWithReviewsCount === 0) return 0;
    return Math.round((totalReviewsInYear / daysWithReviewsCount) * 10) / 10;
  }, [totalReviewsInYear, daysWithReviewsCount]);

  const daysLearnedPercent = useMemo(() => {
    return Math.round((daysWithReviewsCount / totalDaysInYear) * 100);
  }, [daysWithReviewsCount, totalDaysInYear]);

  // Rótulos de meses posicionados por semana
  const monthLabels = useMemo(() => {
    const labels: Array<{ colIndex: number; name: string }> = [];
    const monthNames = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez'
    ];
    let lastMonth = -1;

    weeksGrid.forEach((week, wIdx) => {
      const firstValidDay = week.find((cell) => cell !== null);
      if (firstValidDay) {
        const month = firstValidDay.dateObj.getMonth();
        if (month !== lastMonth) {
          labels.push({ colIndex: wIdx, name: monthNames[month] });
          lastMonth = month;
        }
      }
    });

    return labels;
  }, [weeksGrid]);

  // Função para cor de fundo do quadradinho (quanto mais cards, mais forte a cor)
  const getCellBg = (reviews: number) => {
    if (reviews > 0) {
      if (reviews <= 9) {
        // Nível 1: Verde suave
        return isDark ? '#14532d' : '#86efac';
      }
      if (reviews <= 24) {
        // Nível 2: Verde moderado
        return isDark ? '#166534' : '#4ade80';
      }
      if (reviews <= 49) {
        // Nível 3: Verde forte
        return isDark ? '#15803d' : '#22c55e';
      }
      // Nível 4: Verde mais forte e vibrante (50+ cards)
      return isDark ? '#4ade80' : '#15803d';
    }

    // 0 revisões (dias sem cards no ano): no tema escuro NUNCA fica branco, mas cinza escuro nítido!
    return isDark ? '#27272a' : '#e4e4e7';
  };

  // Formata data para tooltip
  const handleMouseEnterCell = (
    e: React.MouseEvent,
    cell: { dateStr: string; dateObj: Date; reviews: number; feitos: number; revisao: number },
    wIdx: number
  ) => {
    setHoveredColIndex(wIdx);
    const rect = e.currentTarget.getBoundingClientRect();
    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ];
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    const dayName = dayNames[cell.dateObj.getDay()];
    const monthName = monthNames[cell.dateObj.getMonth()];
    const formatted = `${dayName} ${monthName} ${cell.dateObj.getDate()}, ${cell.dateObj.getFullYear()}`;

    setHoveredDay({
      dateStr: cell.dateStr,
      dayName,
      formattedDate: formatted,
      feitos: cell.feitos,
      revisao: cell.revisao,
      total: cell.reviews,
      x: rect.left + rect.width / 2,
      y: rect.top - 8
    });
  };

  const handleMouseLeaveCell = () => {
    setHoveredDay(null);
    setHoveredColIndex(null);
  };

  return (
    <div
      className={`bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-3 sm:p-4 shadow-xs transition-all relative text-zinc-900 dark:text-zinc-100 ${className}`}
    >
      {/* 1. TOPO ESTILO ANKI: Frase Centralizada + Botão de Minimizar */}
      <div className="relative flex items-center justify-center pb-1">
        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 text-center truncate max-w-[85%]">
          {formatTodayHeadline()}
        </p>

        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="absolute right-0 top-0 p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title={isCollapsed ? 'Expandir Heatmap' : 'Minimizar Heatmap'}
        >
          {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* 2. CONTROLES DE NAVEGAÇÃO CENTRALIZADOS: < T > (Fiel ao Anki) */}
          <div className="flex items-center justify-center gap-1.5 py-1 select-none">
            <button
              type="button"
              onClick={() => setSelectedYear((prev) => prev - 1)}
              className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-mono text-[11px] font-bold transition-colors cursor-pointer"
              title="Ano anterior"
            >
              &lt;
            </button>
            <button
              type="button"
              onClick={() => setSelectedYear(currentRealYear)}
              className="px-2.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 font-mono text-[11px] font-bold transition-colors cursor-pointer"
              title="Voltar para Hoje"
            >
              T
            </button>
            <button
              type="button"
              onClick={() => setSelectedYear((prev) => prev + 1)}
              className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-mono text-[11px] font-bold transition-colors cursor-pointer"
              title="Próximo ano"
            >
              &gt;
            </button>
          </div>

          {/* 3. GRID ANUAL DE 365 DIAS (CALENDÁRIO ANKI COM DESTAQUE DE COLUNA E DIAS SEPARADOS) */}
          <div className="overflow-x-auto py-1 flex justify-center custom-scrollbar">
            <div className="inline-flex flex-col select-none p-1">
              {/* Linha dos Meses */}
              <div className="flex text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold select-none pb-1 pl-6">
                <div
                  className="relative h-4 w-full"
                  style={{ minWidth: weeksGrid.length * 15 }}
                >
                  {monthLabels.map((m, idx) => (
                    <span
                      key={idx}
                      className="absolute font-mono"
                      style={{ left: m.colIndex * 15 }}
                    >
                      {m.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Grid: Dias da semana à esquerda + 53 colunas com destaque de coluna no hover */}
              <div className="flex items-start gap-1.5">
                {/* Coluna dos Dias da Semana (Seg, Qua, Sex) */}
                <div
                  className="flex flex-col text-[9px] font-mono font-medium text-zinc-400 dark:text-zinc-500 justify-between select-none shrink-0"
                  style={{ height: 7 * 11 + 6 * 3.5 }}
                >
                  <span style={{ height: 11, lineHeight: '11px' }}></span>
                  <span style={{ height: 11, lineHeight: '11px' }}>Seg</span>
                  <span style={{ height: 11, lineHeight: '11px' }}></span>
                  <span style={{ height: 11, lineHeight: '11px' }}>Qua</span>
                  <span style={{ height: 11, lineHeight: '11px' }}></span>
                  <span style={{ height: 11, lineHeight: '11px' }}>Sex</span>
                  <span style={{ height: 11, lineHeight: '11px' }}></span>
                </div>

                {/* 53 Colunas de Semanas: Cada coluna pode ser destacada verticalmente */}
                <div className="inline-flex" style={{ gap: 3.5 }}>
                  {weeksGrid.map((week, wIdx) => {
                    const isColHovered = hoveredColIndex === wIdx;

                    return (
                      <div
                        key={wIdx}
                        className={`flex flex-col rounded-[3px] transition-colors ${
                          isColHovered
                            ? isDark
                              ? 'bg-zinc-800/80 ring-2 ring-zinc-700/50'
                              : 'bg-zinc-200/80 ring-2 ring-zinc-300/50'
                            : ''
                        }`}
                        style={{ gap: 3.5, padding: isColHovered ? '1px 0' : 0 }}
                      >
                        {week.map((cell, dIdx) => {
                          if (!cell) {
                            return (
                              <div
                                key={`empty-${dIdx}`}
                                className="opacity-0 shrink-0"
                                style={{ width: 11, height: 11 }}
                              />
                            );
                          }

                          const bgHex = getCellBg(cell.reviews);
                          const isTodayHighlight = cell.isToday
                            ? 'ring-2 ring-amber-400 z-10'
                            : '';
                          const isCellHovered =
                            hoveredDay?.dateStr === cell.dateStr;

                          return (
                            <div
                              key={cell.dateStr}
                              onMouseEnter={(e) =>
                                handleMouseEnterCell(e, cell, wIdx)
                              }
                              onMouseLeave={handleMouseLeaveCell}
                              style={{
                                width: 11,
                                height: 11,
                                backgroundColor: bgHex
                              }}
                              className={`rounded-[2px] transition-all cursor-pointer shrink-0 ${
                                isCellHovered
                                  ? 'ring-2 ring-white dark:ring-zinc-100 z-20 scale-125 shadow-md'
                                  : 'hover:opacity-90'
                              } ${isTodayHighlight}`}
                            />
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 4. ANO CENTRALIZADO ABAIXO DO GRID (Fiel ao Anki) */}
          <div className="text-center py-1">
            <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500 font-bold tracking-wider">
              {selectedYear}
            </span>
          </div>

          {/* 5. RODAPÉ DE ESTATÍSTICAS CLÁSSICAS DO ANKI */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] text-zinc-600 dark:text-zinc-400 font-medium">
            <div>
              Daily average:{' '}
              <strong className="font-mono font-bold text-[#44a340] dark:text-[#5cae4c]">
                {dailyAverage} reviews
              </strong>
            </div>

            <div>
              Days learned:{' '}
              <strong className="font-mono font-bold text-[#8cc665] dark:text-[#bddb7a]">
                {daysLearnedPercent}%
              </strong>
            </div>

            <div>
              Longest streak:{' '}
              <strong className="font-mono font-bold text-[#44a340] dark:text-[#5cae4c]">
                {longestStreak} {longestStreak === 1 ? 'day' : 'days'}
              </strong>
            </div>

            <div>
              Current streak:{' '}
              <strong className="font-mono font-bold text-[#8cc665] dark:text-[#bddb7a]">
                {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
              </strong>
            </div>
          </div>
        </>
      )}

      {/* 6. TOOLTIP FLUTUANTE NO HOVER (Fiel às Imagens do Anki) */}
      {hoveredDay && (
        <div
          data-anki-tooltip="true"
          className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full px-2.5 py-1.5 rounded-lg bg-black/95 text-white text-[11px] shadow-2xl border border-zinc-700/80 backdrop-blur-xs space-y-0.5 animate-in fade-in zoom-in-95 duration-100"
          style={{
            left: `${hoveredDay.x}px`,
            top: `${hoveredDay.y}px`
          }}
        >
          <div className="font-bold whitespace-nowrap">
            {hoveredDay.total > 0
              ? `${hoveredDay.total} ${hoveredDay.total === 1 ? 'review' : 'reviews'} on`
              : 'No reviews on'}
          </div>
          <div className="text-zinc-400 text-[10px] whitespace-nowrap">
            {hoveredDay.formattedDate}
          </div>
          {hoveredDay.total > 0 && (
            <div className="flex items-center gap-2 pt-0.5 border-t border-zinc-800 text-[10px]">
              <span className="text-blue-400 font-semibold">
                (feitos: {hoveredDay.feitos})
              </span>
              <span className="text-emerald-400 font-semibold">
                (revisão: {hoveredDay.revisao})
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
