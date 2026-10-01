'use client';

import React from 'react';
import { Trophy, Medal, Award, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { RankedStudent } from '@/utils/percentile';
import { PerformanceFilterState } from '@/types';

interface OfficialRankingProps {
  ranking: RankedStudent[];
  filters: PerformanceFilterState;
  userQuestions: number;
}

export const OfficialRanking: React.FC<OfficialRankingProps> = ({
  ranking,
  filters,
  userQuestions
}) => {
  const isUserEligible = userQuestions >= 500;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-base font-bold text-white">Ranking Oficial da Plataforma</h3>
            <p className="text-xs text-slate-400">
              Classificação semestral baseada em Score Ajustado (mínimo de 500 questões)
            </p>
          </div>
        </div>

        <span className="text-xs px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 font-medium">
          Semestre {filters.period === '2026.2' ? '2026.2 (Jul - Dez)' : '2026.1 (Jan - Jun)'}
        </span>
      </div>

      {!isUserEligible && (
        <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-900/50 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200">
            <span className="font-semibold">Aviso sobre o Ranking Oficial:</span> Para figurar no ranking semestral oficial e ter seu percentil homologado, é exigido um mínimo de <strong>500 questões resolvidas</strong>. Atualmente você resolveu <strong>{userQuestions}</strong> (faltam <strong>{Math.max(0, 500 - userQuestions)}</strong>). Continue praticando!
          </div>
        </div>
      )}

      {/* Tabela do Ranking */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
              <th className="py-2.5 px-3">Posição</th>
              <th className="py-2.5 px-3">Estudante</th>
              <th className="py-2.5 px-3">Instituição</th>
              <th className="py-2.5 px-3">Banca</th>
              <th className="py-2.5 px-3 text-center">Questões</th>
              <th className="py-2.5 px-3 text-center">Acertos Brutos</th>
              <th className="py-2.5 px-3 text-right">Percentil</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {ranking.map((student) => {
              const isCurrentUser = student.name.includes('(Você)');

              let badgeIcon = null;
              if (student.rank === 1) {
                badgeIcon = <Trophy className="w-4 h-4 text-amber-400 shrink-0 inline mr-1.5" />;
              } else if (student.rank === 2) {
                badgeIcon = <Medal className="w-4 h-4 text-slate-300 shrink-0 inline mr-1.5" />;
              } else if (student.rank === 3) {
                badgeIcon = <Medal className="w-4 h-4 text-amber-600 shrink-0 inline mr-1.5" />;
              }

              return (
                <tr
                  key={student.name}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    isCurrentUser ? 'bg-blue-950/40 border-l-2 border-blue-500 font-semibold text-white' : ''
                  }`}
                >
                  <td className="py-3 px-3">
                    <span className="font-bold flex items-center">
                      {badgeIcon}
                      #{student.rank}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-100">{student.name}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{student.institution}</td>
                  <td className="py-3 px-3 text-slate-400">{student.banca}</td>
                  <td className="py-3 px-3 text-center font-mono">{student.answered}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-emerald-400 font-semibold">{student.rawAccuracy.toFixed(1)}%</span>
                    <span className="text-[10px] text-slate-500 block">({student.correct}/{student.answered})</span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold font-mono">
                      P{student.percentile}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
