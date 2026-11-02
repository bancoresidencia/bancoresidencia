'use client';

import React from 'react';
import { AdminMedevoSanitizer } from '@/components/AdminMedevoSanitizer';

export default function MedevoSanitizerPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <AdminMedevoSanitizer />
    </div>
  );
}

