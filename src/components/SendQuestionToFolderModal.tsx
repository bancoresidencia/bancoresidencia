'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  FolderIcon,
  FolderPlus,
  Check,
  ChevronRight,
  ChevronDown,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { Folder, Question } from '@/types';
import { useTheme } from '@/context/ThemeContext';

interface SendQuestionToFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
  folders: Folder[];
  onCreateFolder: (name: string, parentId: string | null) => void;
  onSaveToFolder: (questionId: string, folderId: string, folderName: string) => void;
  savedFolderIds?: string[];
}

export const SendQuestionToFolderModal: React.FC<SendQuestionToFolderModalProps> = ({
  isOpen,
  onClose,
  question,
  folders,
  onCreateFolder,
  onSaveToFolder,
  savedFolderIds = []
}) => {
  const { accentConfig } = useTheme();

  // Pastas em 3 níveis
  const rootFolders = useMemo(() => folders.filter((f) => !f.parentId), [folders]);
  const getSubfolders = (parentId: string) => folders.filter((f) => f.parentId === parentId);

  // Estados de expansão na árvore
  const [openFolderIds, setOpenFolderIds] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    folders.forEach((f) => {
      init[f.id] = true; // Abre por padrão para facilitar a visualização dos 3 níveis
    });
    return init;
  });

  const toggleFolder = (folderId: string) => {
    setOpenFolderIds((prev) => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  // Criação rápida de nova pasta
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderParentId, setNewFolderParentId] = useState<string | null>(null);

  // Feedback de sucesso
  const [savedSuccessFolder, setSavedSuccessFolder] = useState<string | null>(null);

  const handleQuickCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    onCreateFolder(newFolderName.trim(), newFolderParentId);
    setNewFolderName('');
    setIsCreatingNewFolder(false);
  };

  const handleSelectFolder = (folder: Folder) => {
    onSaveToFolder(question.id, folder.id, folder.name);
    setSavedSuccessFolder(folder.name);
    setTimeout(() => {
      onClose();
      setSavedSuccessFolder(null);
    }, 1100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#0b1324] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-send-folder-title"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 id="modal-send-folder-title" className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Salvar Questão em uma Pasta
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecione a pasta onde deseja guardar esta questão para revisar depois
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Resumo da Questão */}
        <div className="px-5 pt-4">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5 truncate">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white">{question.code}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 dark:text-slate-400">{question.institution} ({question.year})</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {question.especialidade} {question.tema ? `› ${question.tema}` : ''}
              </p>
            </div>
            <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
              {question.difficulty || 'Média'}
            </span>
          </div>
        </div>

        {/* Mensagem de sucesso */}
        {savedSuccessFolder && (
          <div className="mx-5 mt-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Questão adicionada à pasta &quot;{savedSuccessFolder}&quot; com sucesso!</span>
          </div>
        )}

        {/* Árvore de Pastas (3 Níveis) */}
        <div className="p-5 space-y-3 overflow-y-auto flex-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Pastas do Aluno (Hierarquia até 3 Níveis):
            </span>
            <button
              type="button"
              onClick={() => setIsCreatingNewFolder(!isCreatingNewFolder)}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Nova Pasta</span>
            </button>
          </div>

          {/* Form Rápido de Criar Pasta */}
          {isCreatingNewFolder && (
            <form onSubmit={handleQuickCreate} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2.5 animate-in fade-in">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Nome da pasta (ex: Minhas Revisões R1)..."
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <select
                value={newFolderParentId || ''}
                onChange={(e) => setNewFolderParentId(e.target.value || null)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">📁 Pasta Maior (Nível 1 - Raiz)</option>
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
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreatingNewFolder(false)}
                  className="px-3 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newFolderName.trim()}
                  className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-40"
                >
                  Criar Pasta
                </button>
              </div>
            </form>
          )}

          {/* Renderização da Árvore de 3 Níveis */}
          <div className="space-y-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 bg-slate-50/40 dark:bg-slate-950/30">
            {rootFolders.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Nenhuma pasta criada ainda. Clique em &quot;Nova Pasta&quot; acima para começar!</p>
            ) : (
              rootFolders.map((root) => {
                const subfolders = getSubfolders(root.id);
                const isOpen = openFolderIds[root.id];
                const isRootSaved = savedFolderIds.includes(root.id);

                return (
                  <div key={root.id} className="space-y-1">
                    {/* Nível 1 - Pasta Maior */}
                    <div
                      onClick={() => handleSelectFolder(root)}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-900 ${
                        isRootSaved
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700'
                          : 'text-slate-700 dark:text-slate-200 font-semibold'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {subfolders.length > 0 ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFolder(root.id);
                            }}
                            className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                          >
                            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                        ) : (
                          <span className="w-3.5" />
                        )}
                        <FolderIcon className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="truncate">{root.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">(Nível 1)</span>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5">
                        {isRootSaved && (
                          <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> Salva
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 hover:text-blue-500">Enviar →</span>
                      </div>
                    </div>

                    {/* Nível 2 - Subpastas */}
                    {isOpen && subfolders.length > 0 && (
                      <div className="pl-6 space-y-1 border-l-2 border-slate-200 dark:border-slate-800 ml-3">
                        {subfolders.map((sub) => {
                          const subSubfolders = getSubfolders(sub.id);
                          const isSubOpen = openFolderIds[sub.id];
                          const isSubSaved = savedFolderIds.includes(sub.id);

                          return (
                            <div key={sub.id} className="space-y-1">
                              <div
                                onClick={() => handleSelectFolder(sub)}
                                className={`flex items-center justify-between p-1.5 px-2 rounded-lg text-xs cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-900 ${
                                  isSubSaved
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700'
                                    : 'text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  {subSubfolders.length > 0 ? (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFolder(sub.id);
                                      }}
                                      className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                                    >
                                      {isSubOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                    </button>
                                  ) : (
                                    <span className="w-3" />
                                  )}
                                  <FolderIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  <span className="truncate">{sub.name}</span>
                                  <span className="text-[10px] text-slate-400 font-normal">(Nível 2)</span>
                                </div>
                                <div className="shrink-0 flex items-center gap-1.5">
                                  {isSubSaved && (
                                    <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                      <Check className="w-2.5 h-2.5" /> Salva
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-400 hover:text-blue-500">Enviar →</span>
                                </div>
                              </div>

                              {/* Nível 3 - Sub-subpastas */}
                              {isSubOpen && subSubfolders.length > 0 && (
                                <div className="pl-6 space-y-1 border-l-2 border-slate-200 dark:border-slate-800 ml-3">
                                  {subSubfolders.map((sub3) => {
                                    const isSub3Saved = savedFolderIds.includes(sub3.id);
                                    return (
                                      <div
                                        key={sub3.id}
                                        onClick={() => handleSelectFolder(sub3)}
                                        className={`flex items-center justify-between p-1.5 px-2 rounded-lg text-xs cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-900 ${
                                          isSub3Saved
                                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700'
                                            : 'text-slate-500 dark:text-slate-400'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <FolderIcon className="w-3 h-3 text-purple-500 shrink-0" />
                                          <span className="truncate">{sub3.name}</span>
                                          <span className="text-[10px] text-purple-400 font-normal">(Nível 3)</span>
                                        </div>
                                        <div className="shrink-0 flex items-center gap-1.5">
                                          {isSub3Saved && (
                                            <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                              <Check className="w-2.5 h-2.5" /> Salva
                                            </span>
                                          )}
                                          <span className="text-[10px] text-slate-400 hover:text-purple-500">Enviar →</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
