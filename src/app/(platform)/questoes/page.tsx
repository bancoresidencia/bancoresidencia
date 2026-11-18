'use client';

import React, { Suspense } from 'react';
import { QuestoesView } from '@/components/QuestoesView';
import { HippocampusLoading } from '@/components/HippocampusLoading';

export default function QuestoesPage() {
  return (
    <Suspense fallback={<HippocampusLoading fullScreen={false} className="min-h-[60vh]" message="Carregando Banco de Questões..." />}>
      <QuestoesView />
    </Suspense>
  );
}

