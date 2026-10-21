'use client';

import React, { useState } from 'react';
import { Trophy, Medal, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';
import { RankedStudent, getPercentileColor, getProvisionalRanking } from '@/utils/percentile';
import { PerformanceFilterState } from '@/types';
import { useTheme } from '@/context/ThemeContext';

interface OfficialRankingProps {
  ranking: RankedStudent[];
  filters: PerformanceFilterState;
  userQuestions: number;
  userPercentile?: number;
  userCorrect?: number;
  userName?: string;
}

export const OfficialRanking: React.FC<OfficialRankingProps> = ({
  ranking,
  filters,
  userQuestions,
  userPercentile,
  userCorrect = 0,
  userName = 'Você'
}) => {
  const { accentConfig, mode } = useTheme();
  const [activeRankingTab, setActiveRankingTab] = useState<'official' | 'provisional'>('official');

  const isUserEligibleOfficial = userQuestions >= 500;
  const isUserEligibleProvisional = userQuestions >= 150;

  // Carrega ranking provisório de candidatos reais (150 - 499 questões)
  const provisionalRanking = getProvisionalRanking(filters, {
    answered: userQuestions,
    correct: userCorrect,
    name: userName
  });

  const displayedList = activeRankingTab === 'official' ? ranking : provisionalRanking;

  return (
    <div className="bg-white dark:bg-[var(--bg-card)] border border-zinc-200 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Cabeçalho do Ranking */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-md">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Ranking de Candidatos
              </h3>
              <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border ${
                activeRankingTab === 'official'
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                  : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30'
              }`}>
                {activeRankingTab === 'official' ? 'Oficial (≥500 Q)' : 'Provisório (150–499 Q)'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Classificação por Modelo IRT Bayesiano 2PL com P-valor empírico
            </p>
          </div>
        </div>

        {/* Abas Alternativas: Oficial vs Provisório */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveRankingTab('official')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeRankingTab === 'official'
                ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 shadow-xs font-extrabold border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🏆 Ranking Oficial
          </button>
          <button
            type="button"
            onClick={() => setActiveRankingTab('provisional')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeRankingTab === 'provisional'
                ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-xs font-extrabold border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ⚡ Provisório
          </button>
        </div>
      </div>

      {/* CARD: SEU PERCENTIL E DESEMPENHO NO RANKING */}
      {(() => {
        const pValue = userPercentile ?? 78;
        const tier = getPercentileColor(pValue);
        const userInList = displayedList.find((s) => s.name.includes('(Você)'));
        const userRank = userInList ? `#${userInList.rank}` : (isUserEligibleOfficial ? 'Homologado' : 'Sem ranking');
        const badgeTextColor = mode === 'light' ? tier.textLight : tier.textDark;

        return (
          <div
            className="p-5 sm:p-6 rounded-3xl border transition-all shadow-xs space-y-4"
            style={{
              backgroundColor: tier.bgRgba,
              borderColor: tier.borderRgba
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-base shadow-sm shrink-0"
                  style={{
                    backgroundColor: tier.color,
                    color: '#ffffff'
                  }}
                >
                  P{pValue}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-xs"
                      style={{
                        backgroundColor: tier.bgRgba,
                        borderColor: tier.borderRgba,
                        color: badgeTextColor
                      }}
                    >
                      {tier.name}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Faixa {tier.rangeLabel}
                    </span>
                  </div>
                  <h4 className="font-heading text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    Nível {tier.name} — {userInList ? `Posição ${userRank}` : userRank}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {userInList ? (
                      <>
                        Você está na posição <strong className="font-bold text-slate-900 dark:text-white">#{userInList.rank}</strong> com base no modelo TRI Bayesiano oficial.
                      </>
                    ) : (
                      <>
                        Você resolveu <strong className="font-bold text-slate-900 dark:text-white">{userQuestions} questões</strong>. {isUserEligibleOfficial ? 'Você atingiu o requisito de questões para homologação oficial.' : `Resolva mais ${Math.max(0, (activeRankingTab === 'official' ? 500 : 150) - userQuestions)} questões para figurar no ranking.`}
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Métricas rápidas */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div className="px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Questões</span>
                  <span className="text-sm font-mono font-black text-slate-900 dark:text-white">
                    {userQuestions}
                  </span>
                </div>
                <div className="px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Status</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {isUserEligibleOfficial ? 'Homologado' : (isUserEligibleProvisional ? 'Provisório' : 'Em Progresso')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Alerta Informativo de Elegibilidade */}
      {activeRankingTab === 'official' && !isUserEligibleOfficial && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3.5">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <span className="font-bold text-amber-800 dark:text-amber-300">Homologação Oficial (≥500 questões):</span> Para figurar oficialmente no ranking consolidado, é exigido um mínimo de <strong>500 questões válidas</strong>. Você resolveu <strong>{userQuestions}</strong> (faltam <strong>{Math.max(0, 500 - userQuestions)}</strong>).
            {isUserEligibleProvisional ? (
              <span className="block mt-1 text-blue-700 dark:text-blue-400 font-medium">
                👉 Seu percentil atual é provisório e você já participa da aba <strong>Ranking Provisório</strong>!
              </span>
            ) : (
              <span className="block mt-1 text-slate-600 dark:text-slate-400">
                Continue praticando para alcançar 150 questões e liberar seu percentil provisório!
              </span>
            )}
          </div>
        </div>
      )}

      {activeRankingTab === 'provisional' && (
        <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <strong>Ranking Provisório (150 a 499 questões):</strong> Estimativa antecipada da sua faixa de percentil com regularização Bayesiana. Não substitui a classificação oficial.
          </div>
        </div>
      )}

      {/* Tabela do Ranking com Foco Central no P-valor e Destaque no Top 3 */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-slate-950/40 shadow-xs">
        <table className="w-full text-left text-sm text-slate-800 dark:text-slate-200">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-400 uppercase tracking-wider font-extrabold text-[11px]">
              <th className="py-3.5 px-4">Posição</th>
              <th className="py-3.5 px-4">Identificador</th>
              <th className="py-3.5 px-4 text-center">
                <div className="inline-flex items-center gap-1">
                  <span>P-valor</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4">Instituição de Origem</th>
              <th className="py-3.5 px-4">Banca Foco</th>
              <th className="py-3.5 px-4 text-center">Questões</th>
              <th className="py-3.5 px-4 text-right">Taxa de Acertos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {displayedList.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 px-4 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                        {activeRankingTab === 'official'
                          ? 'Nenhum candidato no Ranking Oficial ainda'
                          : 'Nenhum candidato no Ranking Provisório ainda'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {activeRankingTab === 'official'
                          ? 'São necessárias pelo menos 500 questões válidas para figurar no ranking consolidado. Resolva questões e dispute o Top 3!'
                          : 'São necessárias pelo menos 150 questões válidas para figurar no ranking provisório. Continue praticando para estrear no ranking!'}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              displayedList.map((student) => {
                const isCurrentUser = student.name.includes('(Você)');
                const tier = getPercentileColor(student.percentile);

                // Destaque Nobre para os 3 Primeiros Colocados (Top 3)
                const isTop1 = student.rank === 1;
                const isTop2 = student.rank === 2;
                const isTop3 = student.rank === 3;
                const isTopThree = isTop1 || isTop2 || isTop3;

                let rowBgClass = '';
                let borderLeftClass = 'border-l-4 border-transparent';
                let rankBadge = null;
                let topTag = null;

                if (isTop1) {
                  rowBgClass = 'bg-amber-500/[0.08] dark:bg-amber-500/[0.14]';
                  borderLeftClass = 'border-l-4 border-l-amber-500';
                  rankBadge = (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/40 font-mono font-black text-xs shadow-xs">
                      <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                      #1
                    </span>
                  );
                  topTag = (
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40">
                      1º Lugar 🥇
                    </span>
                  );
                } else if (isTop2) {
                  rowBgClass = 'bg-slate-300/[0.18] dark:bg-slate-500/[0.14]';
                  borderLeftClass = 'border-l-4 border-l-slate-400 dark:border-l-slate-400';
                  rankBadge = (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600 font-mono font-black text-xs shadow-xs">
                      <Medal className="w-4 h-4 text-slate-400 shrink-0" />
                      #2
                    </span>
                  );
                  topTag = (
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30">
                      2º Lugar 🥈
                    </span>
                  );
                } else if (isTop3) {
                  rowBgClass = 'bg-amber-700/[0.08] dark:bg-amber-700/[0.14]';
                  borderLeftClass = 'border-l-4 border-l-amber-700 dark:border-l-amber-600';
                  rankBadge = (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-800/15 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-700/40 font-mono font-black text-xs shadow-xs">
                      <Medal className="w-4 h-4 text-amber-700 dark:text-amber-500 shrink-0" />
                      #3
                    </span>
                  );
                  topTag = (
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-700/15 text-amber-800 dark:text-amber-300 border border-amber-700/30">
                      3º Lugar 🥉
                    </span>
                  );
                } else {
                  rankBadge = (
                    <span className="flex items-center text-sm font-mono font-bold text-slate-700 dark:text-slate-300 pl-1">
                      #{student.rank}
                    </span>
                  );
                }

                if (isCurrentUser && !isTopThree) {
                  rowBgClass = 'bg-blue-50/80 dark:bg-blue-950/40 font-semibold';
                  borderLeftClass = 'border-l-4 border-blue-600';
                }

                const anonymizedLabel = isCurrentUser
                  ? 'Você (Seu Perfil)'
                  : student.name;

                const badgeTextColor = mode === 'light' ? tier.textLight : tier.textDark;

                return (
                  <tr
                    key={`${activeRankingTab}-${student.name}-${student.rank}`}
                    className={`hover:bg-slate-50/90 dark:hover:bg-slate-900/70 transition-colors ${rowBgClass} ${borderLeftClass}`}
                  >
                    <td className="py-4 px-4 font-mono">
                      {rankBadge}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                        <span className={isCurrentUser ? 'text-blue-700 dark:text-blue-300 font-extrabold' : 'text-slate-800 dark:text-slate-200 font-semibold'}>
                          {anonymizedLabel}
                        </span>
                        {topTag}
                        {isCurrentUser && (
                          <span
                            className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full border shadow-xs"
                            style={{
                              backgroundColor: accentConfig.bgRgba,
                              color: accentConfig.primaryHex,
                              borderColor: accentConfig.borderRgba
                            }}
                          >
                            Você
                          </span>
                        )}
                      </div>
                    </td>

                    {/* P-valor Limpo e Destacado */}
                    <td className="py-4 px-4 text-center">
                      <span
                        className="px-3.5 py-1.5 rounded-xl font-extrabold font-mono text-xs tracking-wider border shadow-xs inline-flex items-center gap-2 transition-all"
                        style={{
                          backgroundColor: tier.bgRgba,
                          borderColor: tier.borderRgba,
                          color: badgeTextColor
                        }}
                        title={`Percentil P${student.percentile} (${tier.name}) - Score IRT Ajustado: ${student.adjustedScore.toFixed(2)}`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: tier.color }}
                        />
                        P{student.percentile}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium">
                      {student.institution}
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium">
                      {student.banca}
                    </td>
                    <td className="py-4 px-4 text-center font-mono font-bold text-slate-900 dark:text-slate-200">
                      {student.answered}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-emerald-700 dark:text-emerald-400 font-extrabold font-mono text-sm">
                        {student.rawAccuracy.toFixed(1)}%
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-normal">
                        ({student.correct}/{student.answered})
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
