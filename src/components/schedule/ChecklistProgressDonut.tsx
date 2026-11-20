'use client';

import React, { memo } from 'react';
import { Tooltip } from '@/components/ui';
import { Check } from 'lucide-react';

export interface ChecklistProgressDonutProps {
  percent: number;
  total?: number;
  completed?: number;
  size?: 'sm' | 'md' | 'lg';
  colorHex?: string;
  showLabel?: boolean;
  tooltipText?: string;
  className?: string;
}

const SIZE_CONFIGS = {
  sm: {
    containerSize: 28,
    strokeWidth: 3.5,
    fontSize: 'text-[9px]',
    iconSize: 10
  },
  md: {
    containerSize: 44,
    strokeWidth: 3.8,
    fontSize: 'text-xs',
    iconSize: 14
  },
  lg: {
    containerSize: 52,
    strokeWidth: 4.2,
    fontSize: 'text-sm',
    iconSize: 16
  }
};

/**
 * Donut vetorial SVG de alto desempenho com aceleração por hardware.
 * Utiliza raio canônico 15.9155 onde a circunferência = exatamente 100.
 */
const ChecklistProgressDonutComponent: React.FC<ChecklistProgressDonutProps> = ({
  percent = 0,
  total,
  completed,
  size = 'md',
  colorHex = '#3b82f6',
  showLabel = true,
  tooltipText,
  className = ''
}) => {
  const safePercent = Math.max(0, Math.min(100, Math.round(percent)));
  const isComplete = safePercent === 100;
  const config = SIZE_CONFIGS[size] || SIZE_CONFIGS.md;

  // Cor ativa do arco de progresso: se 100%, brilha em esmeralda (#10b981)
  const activeColor = isComplete ? '#10b981' : colorHex;

  // Offset canônico para circunferência = 100
  const strokeDashoffset = 100 - safePercent;

  const defaultTooltip =
    tooltipText ||
    (total !== undefined && completed !== undefined
      ? `${completed} de ${total} focos estudados (${safePercent}%)`
      : `${safePercent}% concluído`);

  const donutElement = (
    <div
      role="progressbar"
      aria-valuenow={safePercent}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`relative shrink-0 flex items-center justify-center select-none ${className}`}
      style={{
        width: `${config.containerSize}px`,
        height: `${config.containerSize}px`
      }}
    >
      <svg
        viewBox="0 0 36 36"
        className="w-full h-full -rotate-90 transform"
        aria-hidden="true"
      >
        {/* Trilho de fundo (Focos pendentes) */}
        <circle
          cx="18"
          cy="18"
          r="15.9155"
          fill="transparent"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          className="text-zinc-200 dark:text-zinc-800"
        />

        {/* Arco de progresso ativo (Focos estudados) */}
        {safePercent > 0 && (
          <circle
            cx="18"
            cy="18"
            r="15.9155"
            fill="transparent"
            stroke={activeColor}
            strokeWidth={config.strokeWidth}
            strokeDasharray="100 100"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap={safePercent === 100 ? 'butt' : 'round'}
            className="transition-all duration-500 ease-out"
          />
        )}
      </svg>

      {/* Rótulo Central */}
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {isComplete && size !== 'sm' ? (
            <Check
              className="text-emerald-500 stroke-[3]"
              style={{ width: `${config.iconSize}px`, height: `${config.iconSize}px` }}
            />
          ) : (
            <span
              className={`${config.fontSize} font-bold tracking-tight ${
                isComplete
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-zinc-800 dark:text-zinc-100'
              }`}
            >
              {safePercent}%
            </span>
          )}
        </div>
      )}
    </div>
  );

  return <Tooltip content={defaultTooltip} position="top">{donutElement}</Tooltip>;
};

export const ChecklistProgressDonut = memo(
  ChecklistProgressDonutComponent,
  (prev, next) =>
    prev.percent === next.percent &&
    prev.completed === next.completed &&
    prev.total === next.total &&
    prev.size === next.size &&
    prev.colorHex === next.colorHex &&
    prev.tooltipText === next.tooltipText
);
