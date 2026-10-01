'use client';

import React from 'react';
import { FileCheck2, Clock, CheckCircle, Trophy, ArrowRight, ShieldCheck } from 'lucide-react';

interface MockExamsProps {
  onStartExam: (examTitle: string) => void;
}

export const MockExams: React.FC<MockExamsProps> = ({ onStartExam }) => {
  const exams = [
    {
      id: 'ex-1',
      title: 'Simulado Geral ENARE 2024 / 2025',
      banca: 'FGV',
      questions: 100,
      duration: '4h 00min',
      difficulty: 'Média / Alta',
      participants: 4120,
      badge: 'Oficial'
    },
    {
      id: 'ex-2',
      title: 'Simulado Específico USP-SP 2024',
      banca: 'FUVEST',
      questions: 100,
      duration: '4h 30min',
      difficulty: 'Alta',
      participants: 2850,
      badge: 'Alta Concorrência'
    },
    {
      id: 'ex-3',
      title: 'Simulado Express: Cirurgia e Clínica Médica',
      banca: 'Múltiplas',
      questions: 50,
      duration: '2h 00min',
      difficulty: 'Média',
      participants: 1340,
      badge: 'Revisão Rápida'
    },
    {
      id: 'ex-4',
      title: 'Simulado SUS-SP / UNIFESP',
      banca: 'VUNESP',
      questions: 80,
      duration: '3h 30min',
      difficulty: 'Média',
      participants: 1980,
      badge: 'Treino Prático'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-400" />
            Simulados de Residência Médica
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Provas cronometradas com cálculo de score ajustado e classificação comparativa
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Ambiente de Prova com Gabarito Oficial</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-sm transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                  {exam.badge}
                </span>
                <span className="text-xs text-slate-400">Banca: <strong className="text-slate-200">{exam.banca}</strong></span>
              </div>

              <h3 className="text-sm md:text-base font-bold text-white">{exam.title}</h3>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center text-xs">
                <div className="bg-slate-950 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Questões</span>
                  <span className="font-bold text-white">{exam.questions}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Tempo</span>
                  <span className="font-bold text-white">{exam.duration}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Inscritos</span>
                  <span className="font-bold text-blue-400">{exam.participants}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onStartExam(exam.title)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer shadow"
            >
              <span>Iniciar Simulado Agora</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
