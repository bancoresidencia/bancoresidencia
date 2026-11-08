'use client';

import React from 'react';
import { cn } from './cn';

export interface ToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  size?: 'sm' | 'md';
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onCheckedChange,
  size = 'md',
  disabled,
  className,
  ...props
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color,#2563eb)] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950',
        'disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' ? 'h-5 w-9 p-0.5' : 'h-6 w-11 p-0.5',
        checked ? 'bg-[var(--primary-color,#2563eb)]' : 'bg-zinc-200 dark:bg-zinc-700',
        className
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none inline-block rounded-full bg-white shadow-xs transform transition duration-200 ease-in-out',
          size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
          checked
            ? size === 'sm'
              ? 'translate-x-4'
              : 'translate-x-5'
            : 'translate-x-0'
        )}
      />
    </button>
  );
};
