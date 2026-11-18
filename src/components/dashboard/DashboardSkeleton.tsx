import React from 'react';
import { Skeleton } from '@/components/ui';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando painel de estudos"
      className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-3.5"
    >
      {/* 1. Hero Skeleton (12 cols - Taller and matching new layout) */}
      <div className="col-span-12 rounded-2xl bg-[var(--bg-card,#ffffff)] dark:bg-[var(--card,#121215)] border border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)] p-5 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-h-[148px] sm:min-h-[164px]">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <Skeleton variant="rectangular" className="w-8 h-8 rounded-full" />
            <Skeleton variant="rectangular" className="w-14 h-5 rounded-full" />
          </div>
          <Skeleton variant="text" className="w-64 sm:w-80 h-9 rounded-xl" />
          <div className="flex items-center gap-2.5 pt-1">
            <Skeleton variant="rectangular" className="w-36 h-9 rounded-xl" />
            <Skeleton variant="rectangular" className="w-32 h-9 rounded-xl hidden sm:block" />
          </div>
        </div>
        <div className="flex flex-row sm:flex-col lg:flex-row items-center gap-2.5 shrink-0">
          <Skeleton variant="rectangular" className="w-36 h-14 rounded-xl" />
          <Skeleton variant="rectangular" className="w-36 h-14 rounded-xl" />
        </div>
      </div>

      {/* 2. Sequência & Metas (6 cols) */}
      <div className="col-span-12 sm:col-span-6 rounded-2xl bg-[var(--bg-card,#ffffff)] dark:bg-[var(--card,#121215)] border border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)] p-4 shadow-xs space-y-4 min-h-[250px] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton variant="rectangular" className="w-8 h-8 rounded-xl" />
            <Skeleton variant="text" className="w-24 h-3.5" />
          </div>
          <Skeleton variant="rectangular" className="w-8 h-7 rounded-lg" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton variant="rectangular" className="w-16 h-11 rounded-xl" />
          <div className="flex-1 space-y-2.5">
            <Skeleton variant="text" className="w-full h-3" />
            <Skeleton variant="text" className="w-full h-3" />
          </div>
        </div>
        <div className="flex items-end justify-between gap-2 h-16 pt-2">
          {Array.from({ length: 7 }).map((_, idx) => (
            <Skeleton key={idx} variant="rectangular" className="flex-1 max-w-[26px] h-12 rounded-full mx-auto" />
          ))}
        </div>
      </div>

      {/* 3. Aproveitamento (6 cols) */}
      <div className="col-span-12 sm:col-span-6 rounded-2xl bg-[var(--bg-card,#ffffff)] dark:bg-[var(--card,#121215)] border border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)] p-4 shadow-xs space-y-4 min-h-[250px] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton variant="rectangular" className="w-8 h-8 rounded-xl" />
            <Skeleton variant="text" className="w-28 h-3.5" />
          </div>
          <Skeleton variant="rectangular" className="w-24 h-6 rounded-lg" />
        </div>
        <div className="flex flex-col items-center justify-center py-1 space-y-2">
          <Skeleton variant="rectangular" className="w-40 h-16 rounded-t-full" />
          <Skeleton variant="text" className="w-24 h-4 rounded-full" />
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <Skeleton variant="rectangular" className="h-12 rounded-xl" />
          <Skeleton variant="rectangular" className="h-12 rounded-xl" />
          <Skeleton variant="rectangular" className="h-12 rounded-xl" />
        </div>
      </div>

      {/* 4. Percentil Oficial (4 cols) + Agenda (8 cols) */}
      <div className="col-span-12 lg:col-span-4 rounded-2xl bg-[var(--bg-card,#ffffff)] dark:bg-[var(--card,#121215)] border border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)] p-4 shadow-xs space-y-3 min-h-[210px] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" className="w-32 h-4" />
          <Skeleton variant="rectangular" className="w-12 h-5 rounded-md" />
        </div>
        <Skeleton variant="rectangular" className="w-full h-20 rounded-xl" />
        <Skeleton variant="text" className="w-full h-3.5" />
      </div>

      <div className="col-span-12 lg:col-span-8 rounded-2xl bg-[var(--bg-card,#ffffff)] dark:bg-[var(--card,#121215)] border border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)] p-4 shadow-xs space-y-3 min-h-[210px] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" className="w-36 h-4" />
          <Skeleton variant="text" className="w-20 h-3.5" />
        </div>
        <Skeleton variant="rectangular" className="w-full h-20 rounded-xl" />
        <Skeleton variant="text" className="w-40 h-3.5" />
      </div>
    </div>
  );
};
