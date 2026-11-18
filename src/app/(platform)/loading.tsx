'use client';

import React from 'react';
import { HippocampusLoading } from '@/components/HippocampusLoading';

/**
 * Transição de Rota Oficial da Plataforma Hippocampus
 * Exclusivo para transições e navegações internas entre abas (Dashboard, Questões, Erros, Flashcards, etc.)
 */
export default function PlatformLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8 animate-in fade-in duration-150">
      <HippocampusLoading size="md" message="Carregando..." fullScreen={false} />
    </div>
  );
}
