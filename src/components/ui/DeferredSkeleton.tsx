'use client';

import React, { useEffect, useState } from 'react';
import { cn } from './cn';

export interface DeferredSkeletonProps {
  children: React.ReactNode;
  /** Tempo mínimo de espera antes de exibir o skeleton, evitando piscar em trocas rápidas de aba. */
  delayMs?: number;
  className?: string;
}

/**
 * Wrapper que só revela o skeleton após um pequeno limiar (padrão 150ms).
 * Transições rápidas ou em cache permanecem limpas sem flash visual;
 * carregamentos realmente lentos recebem feedback progressivo sem sensação de travamento.
 */
export const DeferredSkeleton: React.FC<DeferredSkeletonProps> = ({
  children,
  delayMs = 150,
  className
}) => {
  const [delayedVisible, setDelayedVisible] = useState(false);
  const visible = delayMs <= 0 || delayedVisible;

  useEffect(() => {
    if (delayMs <= 0) return;

    const timer = window.setTimeout(() => {
      setDelayedVisible(true);
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [delayMs]);

  if (!visible) {
    return (
      <div
        aria-busy="true"
        aria-label="Preparando conteúdo"
        className={cn('min-h-[45vh]', className)}
      />
    );
  }

  return (
    <div
      aria-busy="true"
      className={cn('animate-in fade-in duration-150 motion-reduce:animate-none', className)}
    >
      {children}
    </div>
  );
};
