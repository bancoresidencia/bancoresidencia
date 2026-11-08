import React from 'react';
import { cn } from './cn';

export type BadgeVariant =
  | 'default'
  | 'theme'
  | 'outline'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'time'
  | 'accuracy'
  | 'energy';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200/60 dark:border-zinc-700/60',
  theme:
    'bg-[var(--accent-subtle,rgba(37,99,235,0.08))] text-[var(--primary-color,#2563eb)] border-[var(--accent-border,rgba(37,99,235,0.3))]',
  secondary:
    'bg-zinc-100 text-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-200 border-transparent',
  outline:
    'bg-transparent text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700',
  success:
    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
  warning:
    'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
  destructive:
    'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/25',
  time:
    'bg-[var(--time-accent-bg,rgba(14,165,233,0.14))] text-[var(--time-accent-color,#0ea5e9)] border-[var(--time-accent-border,rgba(14,165,233,0.35))]',
  accuracy:
    'bg-[var(--accuracy-accent-bg,rgba(20,184,166,0.14))] text-[var(--accuracy-accent-color,#14b8a6)] border-[var(--accuracy-accent-border,rgba(20,184,166,0.35))]',
  energy:
    'bg-[var(--energy-accent-bg,rgba(245,158,11,0.14))] text-[var(--energy-accent-color,#f59e0b)] border-[var(--energy-accent-border,rgba(245,158,11,0.35))]'
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-[10px] px-2 py-0.5 gap-1 font-semibold tracking-wide',
  md: 'text-xs px-2.5 py-1 gap-1.5 font-medium'
};

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  icon,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border transition-colors select-none shrink-0 leading-none whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
