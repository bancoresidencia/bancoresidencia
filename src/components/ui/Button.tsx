'use client';

import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from './cn';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'link'
  | 'subtle';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--primary-color,#2563eb)] hover:bg-[var(--primary-hover,#1d4ed8)] text-[var(--primary-contrast,#ffffff)] shadow-xs active:scale-[0.98]',
  secondary:
    'bg-[var(--muted,#f8fafc)] dark:bg-[var(--muted,#18181b)] hover:bg-zinc-200/80 dark:hover:bg-zinc-800 text-[var(--foreground,#09090b)] dark:text-[var(--foreground,#f4f4f5)] border border-[var(--card-border,#e2e8f0)] dark:border-[var(--card-border,#27272a)] active:scale-[0.98]',
  outline:
    'bg-transparent hover:bg-[var(--muted,#f8fafc)] dark:hover:bg-[var(--muted,#18181b)] text-[var(--foreground,#09090b)] dark:text-[var(--foreground,#f4f4f5)] border border-[var(--card-border,#e2e8f0)] dark:border-[var(--card-border,#27272a)] active:scale-[0.98]',
  ghost:
    'bg-transparent hover:bg-[var(--muted,#f8fafc)] dark:hover:bg-[var(--muted,#18181b)] text-[var(--muted-foreground,#52525b)] dark:text-[var(--muted-foreground,#a1a1aa)] hover:text-[var(--foreground,#09090b)] dark:hover:text-[var(--foreground,#f4f4f5)] active:scale-[0.98]',
  destructive:
    'bg-red-600 hover:bg-red-700 text-white shadow-xs active:scale-[0.98]',
  link:
    'bg-transparent text-[var(--primary-color,#2563eb)] hover:underline p-0 h-auto font-medium active:opacity-80',
  subtle:
    'bg-[var(--accent-subtle,rgba(37,99,235,0.08))] hover:bg-[var(--accent-muted,rgba(37,99,235,0.15))] text-[var(--primary-color,#2563eb)] border border-[var(--accent-border,rgba(37,99,235,0.35))] active:scale-[0.98]'
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-[11px] gap-1.5 rounded-lg',
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-9 px-4 text-sm gap-2 rounded-xl min-h-[38px]',
  lg: 'h-11 px-6 text-base gap-2.5 rounded-xl',
  icon: 'h-9 w-9 p-0 rounded-xl justify-center shrink-0',
  'icon-sm': 'h-7 w-7 p-0 rounded-lg justify-center shrink-0'
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-150 select-none cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color,#2563eb)] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:active:scale-100',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
