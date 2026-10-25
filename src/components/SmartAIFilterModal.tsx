'use client';

import React, { useState } from 'react';
import { Sparkles, X, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { AdvancedFilterState } from '@/types';

interface SmartAIFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyAndStart: (filters: Partial<AdvancedFilterState>, quantity?: number) => void | Promise<void>;
  initialCount?: number;
}

const QUICK_PROMPTS = [
  '🚨 ENARE: 15 questões de Trauma, Choque e ATLS',
  '🤰 USP-SP: 10 questões sobre Pré-eclâmpsia grave',
  '👶 Pediatria: 20 questões sobre Desidratação e Hidratação Venosa',
  '🫀 Cardiologia: 10 questões de Infarto com supra de ST',
  '🏥 Preventiva: 15 questões de SUS e Epidemiologia recente',
  '💉 Revalida: 10 questões de Diabetes e Cetoacidose'
];

export function SmartAIFilterModal({
  isOpen,
  onClose,
  onApplyAndStart,
  initialCount = 20
}: SmartAIFilterModalProps) {
  const { accentConfig } = useTheme();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (textToAnalyze?: string) => {
    const text = (textToAnalyze || prompt).trim();
    if (!text || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/smart-filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Não foi possível processar a solicitação com IA.');
      }

      // Fecha o modal e inicia direto a resolução das questões
      await onApplyAndStart(data.filters || {}, data.quantidade || initialCount);
      onClose();
    } catch (err: unknown) {
      console.error('Erro ao gerar questões com IA:', err);
      const msg = err instanceof Error ? err.message : 'Falha na comunicação com o serviço de Inteligência Artificial.';
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Topo do Modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-xs"
              style={{ backgroundColor: accentConfig.primaryHex + '18', color: accentConfig.primaryHex }}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-1.5">
                <span>Gerar Questões com IA</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                  Gemini 3.5
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Descreva o que deseja e iremos direto para as questões
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 custom-scrollbar text-xs">
          {/* Caixa de Texto */}
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
              <span>Como você quer estudar hoje?</span>
              <span className="text-[11px] font-normal text-zinc-400">Ex: quantidade, banca, tema, foco, anos</span>
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              placeholder="Ex: Quero 15 questões difíceis da USP e ENARE sobre pré-eclâmpsia e sulfato de magnésio dos últimos 3 anos..."
              className="w-full p-3 rounded-2xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 transition-all resize-none disabled:opacity-60"
            />
          </div>

          {/* Sugestões Rápidas */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Sugestões Rápidas de Prompt
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp}
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    setPrompt(qp);
                    handleGenerate(qp);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all text-left disabled:opacity-50 cursor-pointer"
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => handleGenerate()}
            disabled={isLoading || !prompt.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md disabled:opacity-50 cursor-pointer hover:opacity-95 active:scale-98"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gerando questões com IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Gerar Questões com IA</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
