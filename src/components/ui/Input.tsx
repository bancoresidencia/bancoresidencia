'use client';

import React, { forwardRef } from 'react';
import { cn } from './cn';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean | string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', size = 'md', leftIcon, rightIcon, error, disabled, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={cn(
            'w-full rounded-xl bg-[var(--bg-input,#ffffff)] dark:bg-[var(--bg-input,#18181b)] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
            'border border-zinc-200 dark:border-zinc-800 transition-all duration-150',
            'focus-visible:outline-none focus-visible:border-[var(--primary-color,#2563eb)] focus-visible:ring-2 focus-visible:ring-[var(--glow-color,rgba(37,99,235,0.25))]',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-zinc-100 dark:disabled:bg-zinc-900',
            size === 'sm' ? 'h-8 text-xs px-3' : 'h-10 text-sm px-3.5',
            leftIcon && (size === 'sm' ? 'pl-8' : 'pl-9'),
            rightIcon && (size === 'sm' ? 'pr-8' : 'pr-9'),
            Boolean(error) && 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 flex items-center text-zinc-400 dark:text-zinc-500">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
