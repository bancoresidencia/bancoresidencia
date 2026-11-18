'use client';

import React, { Suspense } from 'react';
import { QuestoesView } from '@/components/QuestoesView';
import { HippocampusLoading } from '@/components/HippocampusLoading';

export default function QuestoesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center p-8">
          <HippocampusLoading size="md" message="Carregando Banco de Questões..." fullScreen={false} />
        </div>
      }
    >
      <QuestoesView />
    </Suspense>
  );
}

