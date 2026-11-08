import React from 'react';
import { cn } from './cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  ...props
}) => {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse bg-zinc-200/70 dark:bg-zinc-800/60',
        variant === 'text' && 'h-4 w-full rounded-md',
        variant === 'circular' && 'rounded-full shrink-0',
        variant === 'rectangular' && 'rounded-xl',
        variant === 'card' && 'h-32 w-full rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50',
        className
      )}
      {...props}
    />
  );
};
