'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { StudentProfileSettings } from '@/components/StudentProfileSettings';
import { useAuth } from '@/context/AuthContext';
import { useStudentData } from '@/context/StudentDataContext';

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { fontSize, setFontSize } = useStudentData();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <StudentProfileSettings
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
        onLogout={handleLogout}
      />
    </div>
  );
}

