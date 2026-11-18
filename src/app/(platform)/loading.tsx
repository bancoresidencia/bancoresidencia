import React from 'react';
import { HippocampusLoading } from '@/components/HippocampusLoading';

export default function PlatformSegmentLoading() {
  return (
    <div className="min-h-[65vh] flex items-center justify-center p-6">
      <HippocampusLoading fullScreen={false} message="Carregando módulo..." />
    </div>
  );
}
