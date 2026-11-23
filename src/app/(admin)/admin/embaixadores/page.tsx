'use client';

import React from 'react';
import { AdminAmbassadorsManagement } from '@/components/admin/AdminAmbassadorsManagement';

export default function AdminEmbaixadoresPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <AdminAmbassadorsManagement />
    </div>
  );
}
