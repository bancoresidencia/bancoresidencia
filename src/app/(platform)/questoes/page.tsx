'use client';

import React, { Suspense } from 'react';
import { QuestoesView } from '@/components/QuestoesView';
import { Loader2 } from 'lucide-react';

export default function QuestoesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-xs font-bold text-slate-500">Carregando Banco de Questões...</p>
        </div>
      }
    >
      <QuestoesView />
    </Suspense>
  );
}

