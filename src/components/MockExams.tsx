'use client';

import React from 'react';
import { FileCheck2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface MockExamsProps {
  onStartExam: (examTitle: string) => void;
}

export const MockExams: React.FC<MockExamsProps> = ({ onStartExam }) => {
  const { accentConfig } = useTheme();

  const exams = [
    {
      id: 'ex-1',
      title: 'Simulado Nacional ENARE 2024 / 2025',
      banca: 'FGV Concursos',
      questions: 100,
      duration: '4h 00min',
      difficulty: 'Média / Alta',
      participants: 4120,
      badge: 'Exame Oficial',
      badgeColor: '#2563eb'
    },
    {
      id: 'ex-2',
      title: 'Simulado Específico USP-SP 2024',
      banca: 'FUVEST Residência',
      questions: 100,
      duration: '4h 30min',
      difficulty: 'Alta Concorrência',
      participants: 2850,
      badge: 'FUVEST',
      badgeColor: '#ea580c'
    },
    {
      id: 'ex-3',
      title: 'Simulado Express: Cirurgia e Clínica Médica',
      banca: 'Bancas Mistas',
      questions: 50,
      duration: '2h 00min',
      difficulty: 'Média',
      participants: 1340,
      badge: 'Revisão Rápida',
      badgeColor: '#059669'
    },
    {
      id: 'ex-4',
      title: 'Simulado SUS-SP / UNIFESP',
      banca: 'Fundação VUNESP',
      questions: 80,
      duration: '3h 30min',
      difficulty: 'Média',
      participants: 1980,
      badge: 'Treino Prático',
      badgeColor: '#7c3aed'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner do Simulado */}
      <div className="bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800/80 p-6 sm:p-7 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <span>Simulados Oficiais de Residência Médica</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Provas cronometradas no padrão das bancas com cálculo de percentil homologado
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800/50 shadow-xs self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Ambiente Oficial de Avaliação</span>
        </div>
      </div>

      {/* Grid de Simulados Bento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="bento-card bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 rounded-3xl p-6 sm:p-7 shadow-sm transition-all flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span
                  className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: `${exam.badgeColor}15`,
                    color: exam.badgeColor,
                    borderColor: `${exam.badgeColor}30`
                  }}
                >
                  {exam.badge}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Banca: <strong className="text-slate-800 dark:text-slate-200">{exam.banca}</strong>
                </span>
              </div>

              <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                {exam.title}
              </h3>

              <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-center text-xs">
                <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/60">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Questões</span>
                  <span className="font-extrabold text-slate-900 dark:text-white font-mono text-sm">{exam.questions}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/60">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Tempo</span>
                  <span className="font-extrabold text-slate-900 dark:text-white font-mono text-sm">{exam.duration}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/60">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Inscritos</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400 font-mono text-sm">{exam.participants.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onStartExam(exam.title)}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-101 active:scale-98"
              style={{
                backgroundColor: accentConfig.primaryHex,
                boxShadow: `0 6px 15px -3px ${accentConfig.bgRgba}`
              }}
            >
              <span>Iniciar Simulado Agora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
