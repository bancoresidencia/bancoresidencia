'use client';

import React from 'react';
import { AdminPlansManagement } from '@/components/admin/AdminPlansManagement';

export default function AdminPlanosPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <AdminPlansManagement />
    </div>
  );
}
