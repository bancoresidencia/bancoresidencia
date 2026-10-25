'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Target, X, Building2, TrendingUp, AlertTriangle, Lightbulb, Loader2, BookOpen } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { AdvancedFilterState } from '@/types';

interface BancaRaioXModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: Partial<AdvancedFilterState>) => void;
  initialBanca?: string;
}

const POPULAR_BANCAS = [
  'ENARE',
  'USP-SP',
  'SUS-SP',
  'UNICAMP',
  'PSU-MG',
  'AMRIGS',
  'SURCE',
  'UNIFESP',
  'UERJ'
];

interface RaioXData {
  banca: string;
  totalQuestions: number;
  specialties: Record<string, number>;
  difficulties: Record<string, number>;
  topTemas: { tema: string; count: number; percent: number }[];
  analysis: {
    estiloEnunciados: string;
    perfilGeral: string;
    armadilhasComuns: string;
    diretrizesPrioritarias: string;
    dicaDeOuro: string;
    dificuldadePredominante: string;
  };
}

export function BancaRaioXModal({ isOpen, onClose, onApplyFilters, initialBanca }: BancaRaioXModalProps) {
  const { accentConfig } = useTheme();
  const [selectedBanca, setSelectedBanca] = useState<string>(initialBanca || 'ENARE');
  const [data, setData] = useState<RaioXData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBancaData = useCallback(async (banca: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/banca-raiox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banca })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Falha ao carregar Raio-X da banca.');
      }
      setData(json);
    } catch (err: unknown) {
      console.error('Erro no Raio-X:', err);
      const msg = err instanceof Error ? err.message : 'Erro ao carregar dados da banca.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadBancaData(selectedBanca);
    }
  }, [isOpen, selectedBanca, loadBancaData]);

  if (!isOpen) return null;

  const handleTrainBanca = () => {
    if (!data) return;
    const topTemaNames = data.topTemas.slice(0, 5).map((t) => t.tema);
    onApplyFilters({
      instituicoes: [data.banca],
      temas: topTemaNames.length > 0 ? topTemaNames : undefined,
      modalidades: ['Residência Médica']
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Topo do Modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-xs"
              style={{ backgroundColor: accentConfig.primaryHex + '18', color: accentConfig.primaryHex }}
            >
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-1.5">
                <span>Raio-X da Banca Examinadora</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
                  Inteligência Estatística
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Padrão de cobrança, temas mais quentes e perfil de pegadinhas
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Seletor de Bancas Populares */}
        <div className="px-4 sm:px-5 py-2.5 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
          <span className="text-[11px] font-semibold text-zinc-400 shrink-0 mr-1 flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            Banca:
          </span>
          {POPULAR_BANCAS.map((banca) => {
            const isSelected = selectedBanca === banca;
            return (
              <button
                key={banca}
                type="button"
                onClick={() => setSelectedBanca(banca)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
                style={{
                  backgroundColor: isSelected ? accentConfig.primaryHex : undefined
                }}
              >
                {banca}
              </button>
            );
          })}
        </div>

        {/* Corpo do Modal com Scroll */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 custom-scrollbar text-xs">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-zinc-500">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--primary-color)]" />
              <span className="text-xs font-medium">Analisando histórico de questões da banca com IA...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              {error}
            </div>
          ) : data ? (
            <>
              {/* 1. KPIs Rápidos da Banca */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80">
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1">
                    Acervo Mapeado
                  </span>
                  <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-white font-mono">
                    {data.totalQuestions.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-[10px] text-zinc-500 block">questões oficiais</span>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80">
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1">
                    Dificuldade
                  </span>
                  <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-white">
                    {data.analysis.dificuldadePredominante || 'Alta'}
                  </span>
                  <span className="text-[10px] text-zinc-500 block">padrão de cobrança</span>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80">
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1">
                    Corte Estimado
                  </span>
                  <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    80% - 86%
                  </span>
                  <span className="text-[10px] text-zinc-500 block">percentil competitivo</span>
                </div>
              </div>

              {/* 2. Dica de Ouro da Banca (Destaque Principal) */}
              <div 
                className="p-3.5 sm:p-4 rounded-2xl border flex items-start gap-3 shadow-xs"
                style={{
                  backgroundColor: accentConfig.primaryHex + '10',
                  borderColor: accentConfig.primaryHex + '35'
                }}
              >
                <div 
                  className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: accentConfig.primaryHex, color: '#fff' }}
                >
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-zinc-900 dark:text-white text-xs block">
                    Dica de Ouro para a Prova da {data.banca}:
                  </span>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                    {data.analysis.dicaDeOuro}
                  </p>
                </div>
              </div>

              {/* 3. Top Temas Mais Incidentes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 dark:text-white text-xs flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" style={{ color: accentConfig.primaryHex }} />
                    Temas Mais Cobrados no Histórico Recente:
                  </span>
                  <span className="text-[11px] text-zinc-400">Top temas quentes</span>
                </div>

                <div className="space-y-1.5">
                  {data.topTemas.slice(0, 5).map((t, idx) => (
                    <div 
                      key={t.tema}
                      className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-700 dark:text-zinc-300 shrink-0 font-mono">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {t.tema}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-[10px] font-mono">
                          {t.count} questões
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Diagnóstico Clínico do Estilo & Pegadinhas da Banca */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Formato de Enunciado */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-800 space-y-1.5">
                  <span className="font-bold text-zinc-900 dark:text-white text-xs flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                    Estilo dos Enunciados
                  </span>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {data.analysis.estiloEnunciados}
                  </p>
                </div>

                {/* Armadilhas Comuns */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-800 space-y-1.5">
                  <span className="font-bold text-zinc-900 dark:text-white text-xs flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Pegadinha Típica
                  </span>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {data.analysis.armadilhasComuns}
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Rodapé do Modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Fechar
          </button>

          {data && (
            <button
              type="button"
              onClick={handleTrainBanca}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer hover:opacity-95"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Treinar Raio-X desta Banca ({data.banca})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
