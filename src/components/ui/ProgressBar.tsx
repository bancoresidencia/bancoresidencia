import React from 'react';
import { cn } from './cn';

export type ProgressVariant = 'primary' | 'accuracy' | 'time' | 'energy' | 'success' | 'destructive';
export type ProgressSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  showLabel?: boolean;
}

const variantFillStyles: Record<ProgressVariant, string> = {
  primary: 'bg-[var(--primary-color,#2563eb)]',
  accuracy: 'bg-[var(--accuracy-accent-color,#14b8a6)]',
  time: 'bg-[var(--time-accent-color,#0ea5e9)]',
  energy: 'bg-[var(--energy-accent-color,#f59e0b)]',
  success: 'bg-emerald-500',
  destructive: 'bg-red-500'
};

const sizeStyles: Record<ProgressSize, string> = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3'
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  className,
  ...props
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full flex items-center gap-2.5', className)} {...props}>
      <div
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn(
          'w-full bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden',
          sizeStyles[size]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            variantFillStyles[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold tabular-nums text-zinc-600 dark:text-zinc-300 shrink-0">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};
