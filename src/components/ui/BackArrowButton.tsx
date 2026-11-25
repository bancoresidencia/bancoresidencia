'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from './cn';

export interface BackArrowButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  size?: 'sm' | 'md';
  variant?: 'surface' | 'ghost';
  ariaLabel?: string;
}

/**
 * Icon-only back arrow button used across drawers, modals, subviews, and sessions.
 */
export const BackArrowButton: React.FC<BackArrowButtonProps> = ({
  size = 'md',
  variant = 'surface',
  ariaLabel = 'Voltar',
  title = 'Voltar',
  className,
  type = 'button',
  ...props
}) => {
  const sizeClasses = size === 'sm' ? 'w-8 h-8 rounded-lg' : 'w-9 h-9 rounded-xl';
  const variantClasses =
    variant === 'ghost'
      ? 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-transparent'
      : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 border border-zinc-200/80 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-200 shadow-xs';

  return (
    <button
      type={type}
      title={title}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center justify-center transition-all cursor-pointer shrink-0 group active:scale-95 touch-manipulation',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color,#2563eb)]',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        sizeClasses,
        variantClasses,
        className
      )}
      {...props}
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
    </button>
  );
};
