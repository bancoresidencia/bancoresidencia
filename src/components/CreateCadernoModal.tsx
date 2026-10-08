'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  BookOpen,
  FolderIcon,
  FolderPlus,
  Play,
  Save,
  Check,
  ChevronRight,
  ChevronDown,
  Layers,
  Sparkles,
  Sliders,
  Plus,
  Minus
} from 'lucide-react';
import { Folder, QuestionList, AdvancedFilterState } from '@/types';
import { useTheme } from '@/context/ThemeContext';

interface CreateCadernoModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AdvancedFilterState;
  folders: Folder[];
  onCreateFolder: (name: string, parentId: string | null) => void;
  onConfirmCreate: (config: {
    title: string;
    folderId: string | null;
    questionCountsByItem: Record<string, number>;
    totalQuestions: number;
    startSolvingImmediately: boolean;
  }) => void;
  availableQuestionsCount: number;
}

export const CreateCadernoModal: React.FC<CreateCadernoModalProps> = ({
  isOpen,
  onClose,
  filters,
  folders,
  onCreateFolder,
  onConfirmCreate,
  availableQuestionsCount
}) => {
  const { accentConfig } = useTheme();

  // 1. Título do Caderno
  const defaultTitle = useMemo(() => {
    if (filters.subfocos?.length > 0) return `Caderno: ${filters.subfocos[0]}`;
    if (filters.focos?.length > 0) return `Caderno: ${filters.focos[0]}`;
    if (filters.temas?.length > 0) return `Caderno: ${filters.temas[0]}`;
    if (filters.especialidades?.length > 0) return `Caderno: ${filters.especialidades.join(', ')}`;
    return `Caderno de Estudos - ${new Date().toLocaleDateString('pt-BR')}`;
  }, [filters]);

  const [cadernoTitle, setCadernoTitle] = useState(defaultTitle);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Estado para criar pasta rápida direto do modal
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderParentId, setNewFolderParentId] = useState<string | null>(null);

  // Pastas em 3 níveis
  const rootFolders = useMemo(() => folders.filter((f) => !f.parentId), [folders]);
  const getSubfolders = (parentId: string) => folders.filter((f) => f.parentId === parentId);

  // 2. Identificação dos itens clínicos selecionados (especialidade, tema, foco, subfoco)
  const itemsToConfigure = useMemo(() => {
    const list: Array<{ id: string; name: string; category: string }> = [];

    if (filters.especialidades?.length > 0) {
      filters.especialidades.forEach((esp) => list.push({ id: esp, name: esp, category: 'Especialidade' }));
    }
    if (filters.temas?.length > 0) {
      filters.temas.forEach((tem) => list.push({ id: tem, name: tem, category: 'Tema' }));
    }
    if (filters.focos?.length > 0) {
      filters.focos.forEach((foc) => list.push({ id: foc, name: foc, category: 'Foco' }));
    }
    if (filters.subfocos?.length > 0) {
      filters.subfocos.forEach((sub) => list.push({ id: sub, name: sub, category: 'Subfoco' }));
    }

    if (list.length > 0) {
      return list;
    }

    // Nenhuma seleção: todas as 6 grandes áreas para distribuição inicial
    return [
      { id: 'Clínica Médica', name: 'Clínica Médica', category: 'Especialidade' },
      { id: 'Cirurgia', name: 'Cirurgia', category: 'Especialidade' },
      { id: 'Pediatria', name: 'Pediatria', category: 'Especialidade' },
      { id: 'Ginecologia', name: 'Ginecologia', category: 'Especialidade' },
      { id: 'Obstetrícia', name: 'Obstetrícia', category: 'Especialidade' },
      { id: 'Medicina Preventiva e Social', name: 'Medicina Preventiva e Social', category: 'Especialidade' }
    ];
  }, [filters]);

  // Quantidade de questões por item
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    itemsToConfigure.forEach((item) => {
      initial[item.id] = 10; // 10 questões por padrão para cada item
    });
    return initial;
  });

  const handleSetCount = (itemId: string, value: number) => {
    setQuestionCounts((prev) => ({
      ...prev,
      [itemId]: Math.max(0, Math.min(200, value))
    }));
  };

  const applyPresetToAll = (qty: number) => {
    setQuestionCounts(() => {
      const updated: Record<string, number> = {};
      itemsToConfigure.forEach((item) => {
        updated[item.id] = qty;
      });
      return updated;
    });
  };

  const totalSelectedQuestions = useMemo(() => {
    return Object.values(questionCounts).reduce((acc, curr) => acc + (curr || 0), 0);
  }, [questionCounts]);

  // Salvar nova pasta no modal
  const handleQuickCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    onCreateFolder(newFolderName.trim(), newFolderParentId);
    setNewFolderName('');
    setIsCreatingNewFolder(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#0b1324] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-caderno-title"
      >
        {/* Topo do Modal */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 id="modal-caderno-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-heading">
                Criar Caderno Personalizado
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure a quantidade de questões por área e selecione a pasta de destino
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Scroll */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* 1. Nome do Caderno */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Nome do Caderno
            </label>
            <input
              type="text"
              value={cadernoTitle}
              onChange={(e) => setCadernoTitle(e.target.value)}
              placeholder="Ex: Revisão de Cirurgia e Pediatria R1"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
            />
          </div>

          {/* 2. Seleção de Pasta (3 Níveis) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Salvar na Pasta (Hierarquia de até 3 Níveis)
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingNewFolder(!isCreatingNewFolder)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Nova Pasta</span>
              </button>
            </div>

            {/* Formulário Rápido de Criação de Pasta */}
            {isCreatingNewFolder && (
              <form onSubmit={handleQuickCreateFolder} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Nome da pasta..."
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <select
                    value={newFolderParentId || ''}
                    onChange={(e) => setNewFolderParentId(e.target.value || null)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">📁 Nenhuma (Pasta Maior - Nível 1)</option>
                    {rootFolders.map((r) => {
                      const lvl2s = getSubfolders(r.id);
                      return (
                        <React.Fragment key={r.id}>
                          <option value={r.id}>📁 {r.name} (Nível 1 → criará Nível 2)</option>
                          {lvl2s.map((l2) => (
                            <option key={l2.id} value={l2.id}>
                              &nbsp;&nbsp;↳ 📁 {l2.name} (Nível 2 → criará Nível 3)
                            </option>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingNewFolder(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!newFolderName.trim()}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-40 cursor-pointer"
                  >
                    Criar Pasta
                  </button>
                </div>
              </form>
            )}

            {/* Dropdown de Pastas nos 3 Níveis */}
            <select
              value={selectedFolderId || ''}
              onChange={(e) => setSelectedFolderId(e.target.value || null)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">📁 Sem pasta (Salvar na raiz de cadernos)</option>
              {rootFolders.map((r) => {
                const lvl2s = getSubfolders(r.id);
                return (
                  <React.Fragment key={r.id}>
                    <option value={r.id}>📁 {r.name} (Nível 1 - Pasta Maior)</option>
                    {lvl2s.map((l2) => {
                      const lvl3s = getSubfolders(l2.id);
                      return (
                        <React.Fragment key={l2.id}>
                          <option value={l2.id}>&nbsp;&nbsp;↳ 📁 {l2.name} (Nível 2 - Subpasta)</option>
                          {lvl3s.map((l3) => (
                            <option key={l3.id} value={l3.id}>
                              &nbsp;&nbsp;&nbsp;&nbsp;↳ ↳ 📁 {l3.name} (Nível 3 - Sub-subpasta)
                            </option>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </select>
          </div>

          {/* 3. Configuração de Questões por Área */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Quantidade de Questões por Item
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Escolha quantas questões deseja selecionar de cada especialidade, tema, foco ou subfoco
                </span>
              </div>

              {/* Botões de Atalho */}
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-slate-400">Atalhos:</span>
                <button
                  type="button"
                  onClick={() => applyPresetToAll(5)}
                  className="px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-slate-600 dark:text-slate-300"
                >
                  5 cada
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetToAll(10)}
                  className="px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-slate-600 dark:text-slate-300"
                >
                  10 cada
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetToAll(20)}
                  className="px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-slate-600 dark:text-slate-300"
                >
                  20 cada
                </button>
              </div>
            </div>

            {/* Lista de Itens com Input Numérico */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {itemsToConfigure.map((item) => {
                const count = questionCounts[item.id] ?? 10;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                          {item.category}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {item.name}
                        </span>
                      </div>
                    </div>

                    {/* Stepper de Quantidade */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSetCount(item.id, count - 5)}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Diminuir 5 questões"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        min={0}
                        max={300}
                        value={count}
                        onChange={(e) => handleSetCount(item.id, parseInt(e.target.value) || 0)}
                        className="w-14 text-center font-sans font-bold text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-1 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleSetCount(item.id, count + 5)}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Adicionar 5 questões"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Rodapé com Resumo e Ações */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Total do Caderno:</span>
            <span className="font-sans font-black text-sm sm:text-base text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
              {totalSelectedQuestions} questões
            </span>
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={totalSelectedQuestions === 0 || !cadernoTitle.trim()}
              onClick={() => {
                onConfirmCreate({
                  title: cadernoTitle.trim(),
                  folderId: selectedFolderId,
                  questionCountsByItem: questionCounts,
                  totalQuestions: totalSelectedQuestions,
                  startSolvingImmediately: true
                });
                onClose();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold text-white shadow-md hover:scale-102 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Criar e Resolver Agora</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
