'use client';

import React, { useState, useMemo } from 'react';
import {
  Settings,
  Check,
  Sliders,
  RotateCcw,
  Sparkles,
  Zap,
  Scale,
  Feather,
  Clock,
  Info
} from 'lucide-react';
import {
  FlashcardPresetMode,
  FlashcardProgress,
  FlashcardQueueOrder,
  FlashcardSchedulerSettings
} from '@/types/flashcards';
import {
  FLASHCARD_PRESETS,
  BasicPresetKey,
  parseStepsInput,
  formatStepsInput,
  previewRatingOptions,
  resolveEffectiveSchedulerSettings
} from '@/utils/ankiScheduler';
import { flashcardsService } from '@/services/flashcardsService';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

interface AnkiSettingsSectionProps {
  onSettingsChanged?: (settings: FlashcardSchedulerSettings) => void;
}

const PRESET_ICONS: Record<BasicPresetKey, React.ComponentType<{ className?: string }>> = {
  more_reps: Zap,
  moderate: Scale,
  fewer_reps: Feather
};

export const AnkiSettingsSection: React.FC<AnkiSettingsSectionProps> = ({
  onSettingsChanged
}) => {
  const { accentConfig } = useTheme();
  const { user } = useAuth();

  const [settings, setSettings] = useState<FlashcardSchedulerSettings>(() =>
    flashcardsService.getSchedulerSettings(user?.id)
  );
  const [learningStepsText, setLearningStepsText] = useState<string>(() =>
    formatStepsInput(flashcardsService.getSchedulerSettings(user?.id).learningStepsMinutes)
  );
  const [relearningStepsText, setRelearningStepsText] = useState<string>(() =>
    formatStepsInput(flashcardsService.getSchedulerSettings(user?.id).relearningStepsMinutes)
  );
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  const showSaved = (label: string) => {
    setSavedFeedback(label);
    setTimeout(() => setSavedFeedback(null), 3000);
  };

  const commitSettings = (next: FlashcardSchedulerSettings, feedbackLabel: string) => {
    const saved = flashcardsService.saveSchedulerSettings(next, user?.id);
    setSettings(saved);
    setLearningStepsText(formatStepsInput(saved.learningStepsMinutes));
    setRelearningStepsText(formatStepsInput(saved.relearningStepsMinutes));
    onSettingsChanged?.(saved);
    showSaved(feedbackLabel);
  };

  const handleSelectBasicPreset = (presetId: BasicPresetKey) => {
    const preset = FLASHCARD_PRESETS[presetId];
    commitSettings(
      {
        presetMode: presetId,
        ...preset.settings
      },
      `Perfil "${preset.title}" ativado!`
    );
  };

  const handleEnableCustomAnki = (seedFrom?: BasicPresetKey) => {
    const base = seedFrom ? FLASHCARD_PRESETS[seedFrom].settings : settings;
    const customNext = resolveEffectiveSchedulerSettings({
      ...base,
      presetMode: 'custom_anki'
    });
    commitSettings(customNext, 'Modo Personalizado (Anki) ativado!');
  };

  const handleSaveCustomAnki = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLearning = parseStepsInput(learningStepsText, [10]);
    const parsedRelearning = parseStepsInput(relearningStepsText, [10]);
    const next = resolveEffectiveSchedulerSettings({
      ...settings,
      presetMode: 'custom_anki',
      learningStepsMinutes: parsedLearning,
      relearningStepsMinutes: parsedRelearning
    });
    commitSettings(next, 'Configurações personalizadas do Anki salvas!');
  };

  // Prévia ao vivo com os mesmos parâmetros do motor FSRS-5
  const livePreview = useMemo(() => {
    const now = new Date();
    const effective = resolveEffectiveSchedulerSettings({
      ...settings,
      learningStepsMinutes:
        settings.presetMode === 'custom_anki'
          ? parseStepsInput(learningStepsText, settings.learningStepsMinutes)
          : settings.learningStepsMinutes,
      relearningStepsMinutes:
        settings.presetMode === 'custom_anki'
          ? parseStepsInput(relearningStepsText, settings.relearningStepsMinutes)
          : settings.relearningStepsMinutes
    });

    const newCardPreview = previewRatingOptions(undefined, now, effective);

    const sampleReviewCard: FlashcardProgress = {
      state: 'review',
      repetitions: 3,
      intervalDays: 10,
      stepIndex: 0,
      scheduledDays: 10,
      easeFactor: 2.5,
      stability: 10,
      difficulty: 5.0,
      retrievability: 0.9,
      lastReviewDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      nextReviewDate: now.toISOString(),
      lapses: 0
    };
    const reviewCardPreview = previewRatingOptions(sampleReviewCard, now, effective);

    return { newCardPreview, reviewCardPreview, effective };
  }, [settings, learningStepsText, relearningStepsText]);

  const activeMode: FlashcardPresetMode = settings.presetMode;

  return (
    <div className="space-y-4">
      {/* Cabeçalho da Aba de Configurações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800/80 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            <Settings className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="font-heading font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100 leading-tight">
              Configurações de Repetição Espaçada (FSRS-5 &amp; Anki)
            </h2>
            <p className="text-[11px] text-zinc-500">
              Escolha um perfil pronto ou ajuste cada parâmetro do algoritmo no modo avançado do Anki.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {savedFeedback && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold animate-in fade-in duration-150">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{savedFeedback}</span>
            </span>
          )}
          <button
            type="button"
            onClick={() => handleSelectBasicPreset('moderate')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer inline-flex items-center gap-1.5"
            title="Restaurar padrão recomendado (Repetições Moderadas)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrão</span>
          </button>
        </div>
      </div>

      {/* SEÇÃO 1: CONFIGURAÇÕES BÁSICAS (3 OPÇÕES + PERSONALIZADO ANKI) */}
      <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800/80 p-4 sm:p-5 rounded-2xl shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-black text-xs sm:text-sm uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
              Configurações Básicas (Perfis Prontos)
            </h3>
            <p className="text-[11px] text-zinc-500">
              Selecione a intensidade das revisões de acordo com seu momento de preparação.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {(['more_reps', 'moderate', 'fewer_reps'] as BasicPresetKey[]).map((key) => {
            const preset = FLASHCARD_PRESETS[key];
            const Icon = PRESET_ICONS[key];
            const isSelected = activeMode === key;

            return (
              <div
                key={key}
                onClick={() => handleSelectBasicPreset(key)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 select-none ${
                  isSelected
                    ? 'bg-zinc-50 dark:bg-zinc-900/80 ring-2 shadow-xs'
                    : 'bg-white dark:bg-[#151519] border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
                style={
                  isSelected
                    ? {
                        borderColor: accentConfig.primaryHex,
                        boxShadow: `0 0 0 1px ${accentConfig.primaryHex}33`
                      }
                    : undefined
                }
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={
                        isSelected
                          ? { backgroundColor: accentConfig.primaryHex, color: '#fff' }
                          : { backgroundColor: accentConfig.bgRgba, color: accentConfig.primaryHex }
                      }
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      {preset.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                          {preset.badge}
                        </span>
                      )}
                      {isSelected && (
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: accentConfig.primaryHex }}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-heading font-black text-sm text-zinc-900 dark:text-zinc-100">
                      {preset.title}
                    </h4>
                    <span className="text-[11px] font-mono font-bold text-zinc-600 dark:text-zinc-300 block mt-0.5">
                      {preset.subtitle}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {preset.summary}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span>Graduação: {preset.settings.graduatingIntervalDays}d</span>
                  <span>Fácil: {preset.settings.easyIntervalDays}d</span>
                  <span>{preset.settings.newCardsPerDay} novos/d</span>
                </div>
              </div>
            );
          })}

          {/* 4ª Opção: Personalizado Modelo Anki */}
          <div
            onClick={() => handleEnableCustomAnki()}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 select-none ${
              activeMode === 'custom_anki'
                ? 'bg-zinc-50 dark:bg-zinc-900/80 ring-2 shadow-xs'
                : 'bg-white dark:bg-[#151519] border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
            style={
              activeMode === 'custom_anki'
                ? {
                    borderColor: accentConfig.primaryHex,
                    boxShadow: `0 0 0 1px ${accentConfig.primaryHex}33`
                  }
                : undefined
            }
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={
                    activeMode === 'custom_anki'
                      ? { backgroundColor: accentConfig.primaryHex, color: '#fff' }
                      : { backgroundColor: accentConfig.bgRgba, color: accentConfig.primaryHex }
                  }
                >
                  <Sliders className="w-4 h-4" />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                    Avançado
                  </span>
                  {activeMode === 'custom_anki' && (
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: accentConfig.primaryHex }}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-heading font-black text-sm text-zinc-900 dark:text-zinc-100">
                  Personalizado (Modelo Anki)
                </h4>
                <span className="text-[11px] font-mono font-bold text-zinc-600 dark:text-zinc-300 block mt-0.5">
                  Controle total dos parâmetros
                </span>
              </div>

              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Configure passos (1m, 10m, 1h), retenção FSRS, modificadores, lapsos e limites diários igual ao Anki Desktop.
              </p>
            </div>

            <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>{activeMode === 'custom_anki' ? 'Editando abaixo' : 'Clique para personalizar'}</span>
              <Sparkles className="w-3 h-3 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO 2: PAINEL COMPLETO MODELO ANKI (VISÍVEL QUANDO CUSTOM_ANKI ESTÁ ATIVO) */}
      {activeMode === 'custom_anki' && (
        <form
          onSubmit={handleSaveCustomAnki}
          className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800/80 p-4 sm:p-5 rounded-2xl shadow-xs space-y-5 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-500" />
              <h3 className="font-heading font-black text-sm text-zinc-900 dark:text-zinc-100">
                Opções Avançadas do Baralho (Modelo Anki)
              </h3>
            </div>
            <span className="text-[11px] text-zinc-500">
              Unidades aceitas nos passos: <code className="font-mono">m</code> (min), <code className="font-mono">h</code> (horas), <code className="font-mono">d</code> (dias)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Coluna 1: Passos & Aprendizagem */}
            <div className="p-3.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800/70 space-y-3">
              <h4 className="font-bold uppercase tracking-wider text-[11px] text-zinc-500">
                1. Novos Cartões &amp; Lapsos
              </h4>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Passos de aprendizagem
                </label>
                <input
                  type="text"
                  value={learningStepsText}
                  onChange={(e) => setLearningStepsText(e.target.value)}
                  placeholder="Ex: 1m 10m"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Passos de reaprendizagem (lapsos)
                </label>
                <input
                  type="text"
                  value={relearningStepsText}
                  onChange={(e) => setRelearningStepsText(e.target.value)}
                  placeholder="Ex: 10m"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Graduação (dias)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={settings.graduatingIntervalDays}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        graduatingIntervalDays: Math.max(1, Number(e.target.value) || 1)
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Intervalo Fácil (dias)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={settings.easyIntervalDays}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        easyIntervalDays: Math.max(1, Number(e.target.value) || 4)
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>
            </div>

            {/* Coluna 2: Parâmetros FSRS-5 */}
            <div className="p-3.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800/70 space-y-3">
              <h4 className="font-bold uppercase tracking-wider text-[11px] text-zinc-500">
                2. Algoritmo FSRS-5 &amp; Intervalos
              </h4>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">
                    Retenção desejada
                  </label>
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {Math.round(settings.desiredRetention * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={75}
                  max={97}
                  step={1}
                  value={Math.round(settings.desiredRetention * 100)}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      desiredRetention: Number(e.target.value) / 100
                    }))
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Modificador
                  </label>
                  <input
                    type="number"
                    min={0.5}
                    max={2.0}
                    step={0.05}
                    value={settings.intervalModifier}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        intervalModifier: Number(e.target.value) || 1.0
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Intervalo máx. (d)
                  </label>
                  <input
                    type="number"
                    min={7}
                    max={36500}
                    value={settings.maximumIntervalDays}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        maximumIntervalDays: Math.max(7, Number(e.target.value) || 365)
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 items-end">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Mín. pós-lapso (d)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={settings.minimumLapseIntervalDays}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        minimumLapseIntervalDays: Math.max(1, Number(e.target.value) || 1)
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.enableFuzz}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, enableFuzz: e.target.checked }))
                    }
                    className="rounded cursor-pointer"
                  />
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">Fuzz (±5%)</span>
                </label>
              </div>
            </div>

            {/* Coluna 3: Limites Diários & Fila */}
            <div className="p-3.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800/70 space-y-3">
              <h4 className="font-bold uppercase tracking-wider text-[11px] text-zinc-500">
                3. Limites Diários &amp; Fila
              </h4>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Novos / dia
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={999}
                    value={settings.newCardsPerDay}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        newCardsPerDay: Math.max(0, Number(e.target.value) || 0)
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Revisões / dia
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={9999}
                    value={settings.maxReviewsPerDay}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        maxReviewsPerDay: Math.max(0, Number(e.target.value) || 0)
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Learn-Ahead Limit (minutos)
                </label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={settings.learnAheadMinutes}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      learnAheadMinutes: Math.max(0, Number(e.target.value) || 0)
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Ordem de exibição na fila
                </label>
                <select
                  value={settings.queueOrder}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      queueOrder: e.target.value as FlashcardQueueOrder
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                >
                  <option value="mix">Misturar Novos e Revisões</option>
                  <option value="reviews_first">Revisões antes de Novos</option>
                  <option value="new_first">Novos antes de Revisões</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer hover:opacity-95 transition-all inline-flex items-center gap-1.5"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Salvar Configurações Anki</span>
            </button>
          </div>
        </form>
      )}

      {/* SEÇÃO 3: SIMULAÇÃO AO VIVO DOS INTERVALOS (TRANSPARÊNCIA TOTAL) */}
      <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800/80 p-4 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-500" />
            <h3 className="font-heading font-black text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
              Prévia ao Vivo dos Intervalos com o Perfil Atual
            </h3>
          </div>
          <span className="text-[11px] text-zinc-500 inline-flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            <span>
              Passos: <strong className="font-mono">{formatStepsInput(livePreview.effective.learningStepsMinutes)}</strong> • Retenção <strong className="font-mono">{Math.round(livePreview.effective.desiredRetention * 100)}%</strong>
            </span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Simulação Card Novo */}
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800/70 space-y-2">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 block">
              Cartão Novo (1º contato)
            </span>
            <div className="grid grid-cols-4 gap-1.5 text-center">
              <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
                <span className="block text-[10px] font-bold">De novo</span>
                <span className="font-mono font-bold text-[11px]">{livePreview.newCardPreview.again.label}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-zinc-200/60 dark:bg-zinc-800 border border-zinc-300/60 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
                <span className="block text-[10px] font-bold">Difícil</span>
                <span className="font-mono font-bold text-[11px]">{livePreview.newCardPreview.hard.label}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <span className="block text-[10px] font-bold">Bom</span>
                <span className="font-mono font-bold text-[11px]">{livePreview.newCardPreview.good.label}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400">
                <span className="block text-[10px] font-bold">Fácil</span>
                <span className="font-mono font-bold text-[11px]">{livePreview.newCardPreview.easy.label}</span>
              </div>
            </div>
          </div>

          {/* Simulação Card em Revisão (10 dias) */}
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800/70 space-y-2">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
              Cartão em Revisão (intervalo de 10 dias)
            </span>
            <div className="grid grid-cols-4 gap-1.5 text-center">
              <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
                <span className="block text-[10px] font-bold">De novo</span>
                <span className="font-mono font-bold text-[11px]">{livePreview.reviewCardPreview.again.label}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-zinc-200/60 dark:bg-zinc-800 border border-zinc-300/60 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
                <span className="block text-[10px] font-bold">Difícil</span>
                <span className="font-mono font-bold text-[11px]">{livePreview.reviewCardPreview.hard.label}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <span className="block text-[10px] font-bold">Bom</span>
                <span className="font-mono font-bold text-[11px]">{livePreview.reviewCardPreview.good.label}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400">
                <span className="block text-[10px] font-bold">Fácil</span>
                <span className="font-mono font-bold text-[11px]">{livePreview.reviewCardPreview.easy.label}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
