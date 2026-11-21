'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingUp,
  Award,
  Zap,
  Target,
  ChevronRight,
  Flame,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/components/ui/cn';
import type { StudentWeeklyDataPoint, LeaderboardStudent } from '@/types/ranking';

const integer = new Intl.NumberFormat('pt-BR');

interface StudentEvolutionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  student: LeaderboardStudent | null;
  history?: StudentWeeklyDataPoint[];
}

type MetricMode = 'percentile' | 'accuracy' | 'xp';

export function StudentEvolutionDrawer({
  isOpen,
  onClose,
  student,
  history,
}: StudentEvolutionDrawerProps) {
  const [metricMode, setMetricMode] = useState<MetricMode>('percentile');

  // Fechar ao pressionar Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Se não houver histórico real, gerar 8 pontos simulados crescentes baseados no percentil atual
  const currentPerc = student?.percentile ?? 50;
  const currentAcc = student?.accuracy ?? 75;
  const currentXP = student?.xp ?? 200;

  const dataPoints: StudentWeeklyDataPoint[] = (history && history.length > 0)
    ? history
    : Array.from({ length: 8 }, (_, i) => {
        const factor = (i + 1) / 8;
        return {
          week: `Sem ${i + 1}`,
          dateLabel: `Semana ${i + 1}`,
          percentile: Math.min(99.9, Math.max(10, Math.round((currentPerc * (0.6 + 0.4 * factor)) * 10) / 10)),
          accuracy: Math.min(100, Math.max(20, Math.round((currentAcc * (0.7 + 0.3 * factor)) * 10) / 10)),
          totalAnswered: Math.round((student?.totalAnswered ?? 100) * factor),
          rank: Math.max(1, Math.round(500 * (1 - factor * 0.8))),
          xp: Math.round(currentXP * factor),
        };
      });

  const firstPoint = dataPoints[0];
  const lastPoint = dataPoints[dataPoints.length - 1];

  const percentileDelta = Math.round((lastPoint.percentile - firstPoint.percentile) * 10) / 10;
  const accuracyDelta = Math.round((lastPoint.accuracy - firstPoint.accuracy) * 10) / 10;
  const xpEarned = Math.round((lastPoint.xp - firstPoint.xp) * 10) / 10;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      onClick={onClose}
    >
      {/* Painel lateral deslizante */}
      <div
        className="flex h-full w-full max-w-lg flex-col border-l border-zinc-200 bg-white shadow-2xl transition-transform duration-300 dark:border-zinc-800 dark:bg-zinc-950 sm:max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho da Gaveta */}
        <header className="flex items-center justify-between border-b border-zinc-200/80 px-5 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[var(--primary-color)]/10 text-[var(--primary-color)]">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <h2 id="drawer-title" className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100 sm:text-lg">
                Evolução do Estudante
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {student ? `${student.name} [Nv. ${student.level}]` : 'Acompanhamento de Rendimento'}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Fechar gaveta de evolução"
            className="size-9 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="size-5" />
          </Button>
        </header>

        {/* Corpo com Scroll */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {/* Seletor de Métrica do Gráfico */}
          <div className="flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => setMetricMode('percentile')}
              className={cn(
                'flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all',
                metricMode === 'percentile'
                  ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200',
              )}
            >
              Percentil TRI
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('accuracy')}
              className={cn(
                'flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all',
                metricMode === 'accuracy'
                  ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200',
              )}
            >
              Taxa de Acertos (%)
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('xp')}
              className={cn(
                'flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all',
                metricMode === 'xp'
                  ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200',
              )}
            >
              XP Acumulado
            </button>
          </div>

          {/* Gráfico Recharts */}
          <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="mb-3 flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                {metricMode === 'percentile'
                  ? 'Trajetória de Percentil nas Últimas 8 Semanas'
                  : metricMode === 'accuracy'
                  ? 'Acurácia Semanal em Questões'
                  : 'Crescimento de XP de Dedicação'}
              </span>
              <span className="text-[11px] text-zinc-500">
                {metricMode === 'percentile' ? 'Meta: P85+ (R1)' : 'Atual vs. Meta'}
              </span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 150, 150, 0.15)" vertical={false} />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11, fill: '#888' }}
                    axisLine={{ stroke: 'rgba(150, 150, 150, 0.2)' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={metricMode === 'percentile' ? [0, 100] : metricMode === 'accuracy' ? [0, 100] : ['auto', 'auto']}
                    tick={{ fontSize: 11, fill: '#888' }}
                    axisLine={{ stroke: 'rgba(150, 150, 150, 0.2)' }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [
                      metricMode === 'percentile' ? `P${value}` : metricMode === 'accuracy' ? `${value}%` : `${integer.format(value)} XP`,
                      metricMode === 'percentile' ? 'Percentil' : metricMode === 'accuracy' ? 'Acurácia' : 'XP',
                    ]}
                  />

                  {/* Linha de corte de referência R1 no gráfico de percentil */}
                  {metricMode === 'percentile' && (
                    <ReferenceLine
                      y={85}
                      stroke="#10b981"
                      strokeDasharray="4 4"
                      label={{ value: 'Corte R1 (~P85)', position: 'insideTopRight', fill: '#10b981', fontSize: 10 }}
                    />
                  )}

                  <Line
                    type="monotone"
                    dataKey={metricMode === 'percentile' ? 'percentile' : metricMode === 'accuracy' ? 'accuracy' : 'xp'}
                    stroke="var(--primary-color, #2563eb)"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: 'var(--primary-color, #2563eb)', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 5.5, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cards de Métricas de Avanço (Deltas) */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3 text-center dark:border-zinc-800 dark:bg-zinc-900/60">
              <span className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Δ Percentil</span>
              <strong className={cn('mt-0.5 block font-heading text-base font-bold sm:text-lg', percentileDelta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500')}>
                {percentileDelta >= 0 ? `+${percentileDelta}` : percentileDelta}
              </strong>
              <span className="text-[10px] text-zinc-400">nas 8 semanas</span>
            </div>

            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3 text-center dark:border-zinc-800 dark:bg-zinc-900/60">
              <span className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Δ Acurácia</span>
              <strong className={cn('mt-0.5 block font-heading text-base font-bold sm:text-lg', accuracyDelta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500')}>
                {accuracyDelta >= 0 ? `+${accuracyDelta}%` : `${accuracyDelta}%`}
              </strong>
              <span className="text-[10px] text-zinc-400">rendimento</span>
            </div>

            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3 text-center dark:border-zinc-800 dark:bg-zinc-900/60">
              <span className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">XP Conquistado</span>
              <strong className="mt-0.5 block font-heading text-base font-bold text-amber-600 dark:text-amber-400 sm:text-lg">
                +{integer.format(xpEarned)}
              </strong>
              <span className="text-[10px] text-zinc-400">esforço</span>
            </div>
          </div>

          {/* Dica pedagógica e diagnóstico de evolução */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/50 p-4 text-xs text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-950/20 dark:text-emerald-200">
            <div className="flex items-center gap-1.5 font-bold">
              <Award className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>Diagnóstico de Trajetória</span>
            </div>
            <p className="mt-1 leading-relaxed text-zinc-700 dark:text-zinc-300">
              Sua evolução demonstra consistência em direção às notas de corte dos principais programas de Residência Médica. Mantenha o ciclo de questões semanais e a revisão de erros para consolidar sua posição na faixa oficial.
            </p>
          </div>
        </div>

        {/* Rodapé com botão de fechar */}
        <footer className="border-t border-zinc-200/80 p-4 dark:border-zinc-800">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Fechar Evolução
          </Button>
        </footer>
      </div>
    </div>
  );
}
