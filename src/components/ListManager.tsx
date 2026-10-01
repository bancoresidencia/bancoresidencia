'use client';

import React, { useState } from 'react';
import {
  Folder as FolderIcon,
  FolderPlus,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronRight,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { Folder, QuestionList } from '@/types';

interface ListManagerProps {
  folders: Folder[];
  lists: QuestionList[];
  onCreateFolder: (name: string, parentId: string | null) => void;
  onCreateList: (title: string, folderId: string | null, totalQuestions: number) => void;
  onContinueList: (list: QuestionList) => void;
}

export const ListManager: React.FC<ListManagerProps> = ({
  folders,
  lists,
  onCreateFolder,
  onCreateList,
  onContinueList
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [openFolderIds, setOpenFolderIds] = useState<Record<string, boolean>>({
    'f-clinica': true,
    'f-cirurgia': true
  });

  // Modal / Inputs de Criação
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderParentId, setFolderParentId] = useState<string | null>(null);

  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [listFolderId, setListFolderId] = useState<string | null>(null);
  const [listQuestionCount, setListQuestionCount] = useState<number>(20);

  const toggleFolder = (folderId: string) => {
    setOpenFolderIds((prev) => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleSaveFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    onCreateFolder(newFolderName.trim(), folderParentId);
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  const handleSaveList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    onCreateList(newListTitle.trim(), listFolderId, listQuestionCount);
    setNewListTitle('');
    setIsCreatingList(false);
  };

  // Pastas raiz e mapeamento de subpastas
  const rootFolders = folders.filter((f) => !f.parentId);
  const getSubfolders = (parentId: string) => folders.filter((f) => f.parentId === parentId);

  // Filtragem de listas pela pasta selecionada ou todas
  const filteredLists = selectedFolderId
    ? lists.filter((l) => l.folderId === selectedFolderId)
    : lists;

  return (
    <div className="space-y-6">
      {/* Barra de Título e Botões de Ação */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-base font-bold text-white">Minhas Listas & Pastas de Questões</h2>
          <p className="text-xs text-slate-400">
            Organize seus cadernos de estudo em pastas e subpastas por assunto clínico
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFolderParentId(selectedFolderId);
              setIsCreatingFolder(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-blue-400" />
            <span>Nova Pasta</span>
          </button>
          <button
            onClick={() => {
              setListFolderId(selectedFolderId);
              setIsCreatingList(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Nova Lista</span>
          </button>
        </div>
      </div>

      {/* Modal / Formulário: Nova Pasta */}
      {isCreatingFolder && (
        <form onSubmit={handleSaveFolder} className="bg-slate-900 border border-blue-500/40 p-4 rounded-xl space-y-3">
          <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">
            Criar Pasta / Subpasta
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Nome da Pasta ou Assunto</label>
              <input
                type="text"
                required
                placeholder="Ex: Infectologia, UTI, Doenças Valvares..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Pasta Pai (Opcional para Subpasta)</label>
              <select
                value={folderParentId || ''}
                onChange={(e) => setFolderParentId(e.target.value ? e.target.value : null)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="">Pasta Raiz (Principal)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsCreatingFolder(false)}
              className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500"
            >
              Salvar Pasta
            </button>
          </div>
        </form>
      )}

      {/* Modal / Formulário: Nova Lista */}
      {isCreatingList && (
        <form onSubmit={handleSaveList} className="bg-slate-900 border border-blue-500/40 p-4 rounded-xl space-y-3">
          <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">
            Criar Nova Lista de Questões
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Título da Lista</label>
              <input
                type="text"
                required
                placeholder="Ex: Simulado Rápido de Trauma..."
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Salvar na Pasta</label>
              <select
                value={listFolderId || ''}
                onChange={(e) => setListFolderId(e.target.value ? e.target.value : null)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="">Sem pasta (Geral)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Quantidade de Questões</label>
              <input
                type="number"
                min={5}
                max={100}
                value={listQuestionCount}
                onChange={(e) => setListQuestionCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsCreatingList(false)}
              className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500"
            >
              Criar Lista
            </button>
          </div>
        </form>
      )}

      {/* Estrutura de Navegação: Pastas e Subpastas na Esquerda, Listas na Direita */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Painel de Pastas e Subpastas */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-semibold text-slate-300">
            <span>Árvore de Assuntos</span>
            <button
              onClick={() => setSelectedFolderId(null)}
              className={`text-[11px] hover:underline cursor-pointer ${
                selectedFolderId === null ? 'text-blue-400 font-bold' : 'text-slate-400'
              }`}
            >
              Ver Todas
            </button>
          </div>

          <div className="space-y-1 pt-1">
            {rootFolders.map((root) => {
              const subfolders = getSubfolders(root.id);
              const isOpen = openFolderIds[root.id];
              const isSelected = selectedFolderId === root.id;

              return (
                <div key={root.id} className="space-y-1">
                  <div
                    onClick={() => setSelectedFolderId(root.id)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {subfolders.length > 0 ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFolder(root.id);
                          }}
                          className="text-slate-400 hover:text-white"
                        >
                          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                      ) : (
                        <span className="w-3.5" />
                      )}
                      <FolderIcon className="w-4 h-4 text-blue-400" />
                      <span className="font-medium">{root.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {lists.filter((l) => l.folderId === root.id).length}
                    </span>
                  </div>

                  {/* Subpastas */}
                  {isOpen && subfolders.length > 0 && (
                    <div className="pl-6 space-y-1 border-l border-slate-800/80 ml-3">
                      {subfolders.map((sub) => {
                        const isSubSelected = selectedFolderId === sub.id;
                        return (
                          <div
                            key={sub.id}
                            onClick={() => setSelectedFolderId(sub.id)}
                            className={`flex items-center justify-between px-2 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                              isSubSelected
                                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <FolderIcon className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{sub.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-500">
                              {lists.filter((l) => l.folderId === sub.id).length}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Grade de Listas de Questões */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              {filteredLists.length} {filteredLists.length === 1 ? 'lista encontrada' : 'listas encontradas'}
            </span>
          </div>

          <div className="space-y-3">
            {filteredLists.map((list) => {
              const folderObj = folders.find((f) => f.id === list.folderId);
              return (
                <div
                  key={list.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {folderObj && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">
                          {folderObj.name}
                        </span>
                      )}
                      {list.progressPercentage === 100 ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Concluída
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Em Andamento
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-white truncate">{list.title}</h4>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{list.completedQuestions} de {list.totalQuestions} resolvidas ({list.progressPercentage}%)</span>
                      <span>•</span>
                      <span>{list.lastStudiedAt}</span>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${list.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => onContinueList(list)}
                    className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
                  >
                    <span>{list.completedQuestions > 0 && list.completedQuestions < list.totalQuestions ? 'Continuar Lista' : 'Resolver'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
