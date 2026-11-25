import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

const CARD_SHELL =
  'rounded-2xl bg-[var(--bg-card,#ffffff)] dark:bg-[var(--card,#121215)] border border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)] p-4 sm:p-5 shadow-xs';

export const GenericTabSkeleton: React.FC = () => {
  return (
    <div aria-label="Carregando conteúdo da aba" className="space-y-5">
      <div className={`${CARD_SHELL} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="space-y-2.5 flex-1">
          <Skeleton variant="text" className="w-48 sm:w-64 h-7 rounded-xl" />
          <Skeleton variant="text" className="w-72 sm:w-96 h-4" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Skeleton variant="rectangular" className="w-28 h-9 rounded-xl" />
          <Skeleton variant="rectangular" className="w-24 h-9 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton variant="card" className="h-32" />
        <Skeleton variant="card" className="h-32" />
        <Skeleton variant="card" className="h-32" />
      </div>

      <div className={`${CARD_SHELL} space-y-3`}>
        <Skeleton variant="text" className="w-44 h-5" />
        <Skeleton variant="rectangular" className="w-full h-24 rounded-xl" />
        <Skeleton variant="rectangular" className="w-full h-24 rounded-xl" />
      </div>
    </div>
  );
};

export const DesempenhoSkeleton: React.FC = () => {
  return (
    <div aria-label="Carregando métricas de desempenho" className="space-y-5">
      <div className={`${CARD_SHELL} flex flex-wrap items-center justify-between gap-3`}>
        <div className="space-y-2">
          <Skeleton variant="text" className="w-52 h-7 rounded-xl" />
          <Skeleton variant="text" className="w-72 h-3.5" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton variant="rectangular" className="w-28 h-9 rounded-xl" />
          <Skeleton variant="rectangular" className="w-28 h-9 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className={`${CARD_SHELL} space-y-2.5`}>
            <Skeleton variant="text" className="w-24 h-3.5" />
            <Skeleton variant="text" className="w-20 h-8 rounded-xl" />
            <Skeleton variant="text" className="w-32 h-3" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className={`lg:col-span-7 ${CARD_SHELL} space-y-4 min-h-[280px]`}>
          <Skeleton variant="text" className="w-48 h-5" />
          <Skeleton variant="rectangular" className="w-full h-52 rounded-xl" />
        </div>
        <div className={`lg:col-span-5 ${CARD_SHELL} space-y-4 min-h-[280px]`}>
          <Skeleton variant="text" className="w-40 h-5" />
          <Skeleton variant="rectangular" className="w-full h-52 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const CronogramaSkeleton: React.FC = () => {
  return (
    <div aria-label="Carregando cronograma de estudos" className="space-y-4">
      <div className={`${CARD_SHELL} grid grid-cols-2 lg:grid-cols-4 gap-3`}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="space-y-2">
            <Skeleton variant="text" className="w-24 h-3.5" />
            <Skeleton variant="text" className="w-16 h-7 rounded-xl" />
          </div>
        ))}
      </div>

      <div className={`${CARD_SHELL} space-y-4 min-h-[420px]`}>
        <div className="flex items-center justify-between">
          <Skeleton variant="text" className="w-44 h-6 rounded-xl" />
          <div className="flex items-center gap-2">
            <Skeleton variant="rectangular" className="w-24 h-9 rounded-xl" />
            <Skeleton variant="rectangular" className="w-32 h-9 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 pt-2">
          {Array.from({ length: 14 }).map((_, idx) => (
            <Skeleton key={idx} variant="rectangular" className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
};

export const FlashcardsOrResumosSkeleton: React.FC = () => {
  return (
    <div aria-label="Carregando conteúdo de estudo" className="space-y-5">
      <div className={`${CARD_SHELL} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" className="w-48 h-7 rounded-xl" />
          <Skeleton variant="text" className="w-64 h-4" />
        </div>
        <Skeleton variant="rectangular" className="w-full sm:w-64 h-10 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className={`${CARD_SHELL} space-y-3`}>
            <div className="flex items-center gap-3">
              <Skeleton variant="rectangular" className="w-10 h-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" className="w-36 h-4" />
                <Skeleton variant="text" className="w-24 h-3" />
              </div>
            </div>
            <Skeleton variant="rectangular" className="w-full h-2.5 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const QuestoesFiltersSkeleton: React.FC = () => {
  return (
    <div aria-label="Carregando filtros do banco de questões" className="space-y-4">
      <div className={`${CARD_SHELL} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <Skeleton variant="rectangular" className="w-full sm:w-80 h-10 rounded-xl" />
        <div className="flex items-center gap-2">
          <Skeleton variant="rectangular" className="w-28 h-10 rounded-xl" />
          <Skeleton variant="rectangular" className="w-36 h-10 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className={`lg:col-span-4 ${CARD_SHELL} space-y-3 min-h-[340px]`}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} variant="rectangular" className="w-full h-10 rounded-xl" />
          ))}
        </div>
        <div className={`lg:col-span-8 ${CARD_SHELL} space-y-4 min-h-[340px]`}>
          <Skeleton variant="text" className="w-52 h-5" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} variant="rectangular" className="w-full h-14 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
