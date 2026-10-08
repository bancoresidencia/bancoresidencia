'use client';

import React, { useState } from 'react';
import {
  Folder as FolderIcon,
  FolderPlus,
  Plus,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  X,
  Pencil,
  Trash2
} from 'lucide-react';
import { Folder, QuestionList, AdvancedFilterState } from '@/types';
import { AdvancedQuestionFilters } from './AdvancedQuestionFilters';
import { mockQuestions } from '@/data/mockQuestions';
import { useTheme } from '@/context/ThemeContext';

interface ListManagerProps {
  folders: Folder[];
  lists: QuestionList[];
  onCreateFolder: (name: string, parentId: string | null) => void;
  onRenameFolder?: (folderId: string, newName: string) => void;
  onDeleteFolder?: (folderId: string) => void;
  onCreateListWithFilters: (
    title: string,
    folderId: string | null,
    totalQuestions: number,
    appliedFilters: AdvancedFilterState
  ) => void;
  onEditList?: (listId: string, updatedTitle: string, newFolderId?: string | null) => void;
  onDeleteList?: (listId: string) => void;
  onContinueList: (list: QuestionList) => void;
}

export const ListManager: React.FC<ListManagerProps> = ({
  folders,
  lists,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onCreateListWithFilters,
  onEditList,
  onDeleteList,
  onContinueList
}) => {
  const { accentConfig } = useTheme();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [openFolderIds, setOpenFolderIds] = useState<Record<string, boolean>>({
    'f-clinica': true,
    'f-cirurgia': true
  });

  // Modal / Inputs de Criação de Pasta
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderParentId, setFolderParentId] = useState<string | null>(null);

  // Modal / Fluxo de Criação de Lista com Filtros Obrigatórios
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [listFolderId, setListFolderId] = useState<string | null>(null);
  const [listQuestionCount, setListQuestionCount] = useState<number>(20);

  // Estado dos filtros obrigatórios dentro do modal de criação de lista
  const [listFilters, setListFilters] = useState<AdvancedFilterState>({
    search: '',
    modalidades: ['Residência Médica'],
    especialidades: [],
    temas: [],
    focos: [],
    subfocos: [],
    instituicoes: [],
    anos: [],
    tipoProva: [],
    status: 'Todas',
    dificuldade: 'Todas',
    tipoQuestao: 'Todas',
    ocultarAnuladasErro: false,
    ocultarRevisadas: false,
    ultimos5Anos: false
  });
  const [filterError, setFilterError] = useState<string | null>(null);

  // Estados de Edição/Exclusão de Pasta
  const [editingFolder, setEditingFolder] = useState<{ id: string; name: string } | null>(null);
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null);

  // Estados de Edição/Exclusão de Lista
  const [editingList, setEditingList] = useState<{ id: string; title: string; folderId: string | null } | null>(null);

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

    const hasSelection =
      listFilters.especialidades.length > 0 ||
      listFilters.temas.length > 0 ||
      listFilters.focos.length > 0 ||
      listFilters.subfocos.length > 0 ||
      listFilters.instituicoes.length > 0 ||
      listFilters.anos.length > 0 ||
      listFilters.tipoProva.length > 0 ||
      listFilters.dificuldade !== 'Todas' ||
      listFilters.tipoQuestao !== 'Todas' ||
      listFilters.status !== 'Todas' ||
      listFilters.search.trim().length > 0;

    if (!hasSelection) {
      setFilterError('Obrigatório selecionar ao menos um filtro clínico para gerar as questões da lista.');
      return;
    }

    setFilterError(null);
    onCreateListWithFilters(newListTitle.trim(), listFolderId, listQuestionCount, listFilters);
    setNewListTitle('');
    setIsCreatingList(false);
  };

  const rootFolders = folders.filter((f) => !f.parentId);
  const getSubfolders = (parentId: string) => folders.filter((f) => f.parentId === parentId);

  const filteredLists = selectedFolderId
    ? lists.filter((l) => l.folderId === selectedFolderId)
    : lists;

  return (
    <div className="space-y-6">
      {/* Barra de Título e Botões de Ação */}
      <div className="bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
            Cadernos de Questões & Árvore de Pastas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organize seus cadernos clínicos por temas, bancas de residência e prioridade
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setFolderParentId(selectedFolderId);
              setIsCreatingFolder(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <FolderPlus className="w-4 h-4 text-blue-500" />
            <span>Nova Pasta</span>
          </button>
          <button
            onClick={() => {
              setListFolderId(selectedFolderId);
              setIsCreatingList(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-102 active:scale-98"
            style={{
              backgroundColor: accentConfig.primaryHex,
              boxShadow: `0 6px 15px -3px ${accentConfig.bgRgba}`
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Criar Nova Lista</span>
          </button>
        </div>
      </div>

      {/* Modal / Formulário: Nova Pasta */}
      {isCreatingFolder && (
        <form onSubmit={handleSaveFolder} className="bg-white dark:bg-[#0d1527] border-2 border-blue-500/50 p-6 rounded-3xl space-y-4 shadow-lg">
          <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Criar Nova Pasta de Estudos
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nome da Pasta ou Assunto *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Cardiologia, UTI, Doenças Valvares..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Pasta Pai (Opcional para Subpasta)
              </label>
              <select
                value={folderParentId || ''}
                onChange={(e) => setFolderParentId(e.target.value ? e.target.value : null)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
            </div>
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsCreatingFolder(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 cursor-pointer shadow-sm"
            >
              Salvar Pasta
            </button>
          </div>
        </form>
      )}

      {/* Modal / Formulário: Renomear Pasta */}
      {editingFolder && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editingFolder.name.trim()) {
              onRenameFolder?.(editingFolder.id, editingFolder.name.trim());
              setEditingFolder(null);
            }
          }}
          className="bg-white dark:bg-[#0d1527] border-2 border-emerald-500/50 p-6 rounded-3xl space-y-4 shadow-lg animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <span>Renomear Pasta de Estudos</span>
            <button
              type="button"
              onClick={() => setEditingFolder(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Novo Nome da Pasta *
            </label>
            <input
              type="text"
              required
              value={editingFolder.name}
              onChange={(e) => setEditingFolder({ ...editingFolder, name: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setEditingFolder(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer shadow-sm"
            >
              Salvar Novo Nome
            </button>
          </div>
        </form>
      )}

      {/* Modal / Confirmação: Excluir Pasta */}
      {deletingFolderId && (
        <div className="bg-white dark:bg-[#0d1527] border-2 border-rose-500/50 p-6 rounded-3xl space-y-4 shadow-lg animate-in fade-in duration-150">
          <div className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            Excluir Pasta
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Tem certeza que deseja excluir esta pasta? Os cadernos vinculados a ela serão mantidos na pasta principal.
          </p>
          <div className="flex justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setDeletingFolderId(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                onDeleteFolder?.(deletingFolderId);
                if (selectedFolderId === deletingFolderId) setSelectedFolderId(null);
                setDeletingFolderId(null);
              }}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 cursor-pointer shadow-sm"
            >
              Sim, Excluir Pasta
            </button>
          </div>
        </div>
      )}

      {/* Modal / Formulário: Editar Caderno de Questões */}
      {editingList && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editingList.title.trim()) {
              onEditList?.(editingList.id, editingList.title.trim(), editingList.folderId);
              setEditingList(null);
            }
          }}
          className="bg-white dark:bg-[#0d1527] border-2 border-blue-500/50 p-6 rounded-3xl space-y-4 shadow-lg animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <span>Editar Caderno de Questões</span>
            <button
              type="button"
              onClick={() => setEditingList(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Título do Caderno *
              </label>
              <input
                type="text"
                required
                value={editingList.title}
                onChange={(e) => setEditingList({ ...editingList, title: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Mover para Pasta
              </label>
              <select
                value={editingList.folderId || ''}
                onChange={(e) => setEditingList({ ...editingList, folderId: e.target.value || null })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">📁 Nenhuma pasta (Raiz de Cadernos)</option>
                {rootFolders.map((r) => {
                  const lvl2s = getSubfolders(r.id);
                  return (
                    <React.Fragment key={r.id}>
                      <option value={r.id}>📁 {r.name} (Nível 1)</option>
                      {lvl2s.map((l2) => {
                        const lvl3s = getSubfolders(l2.id);
                        return (
                          <React.Fragment key={l2.id}>
                            <option value={l2.id}>&nbsp;&nbsp;↳ 📁 {l2.name} (Nível 2)</option>
                            {lvl3s.map((l3) => (
                              <option key={l3.id} value={l3.id}>
                                &nbsp;&nbsp;&nbsp;&nbsp;↳ ↳ 📁 {l3.name} (Nível 3)
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
          </div>
          <div className="flex justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setEditingList(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 cursor-pointer shadow-sm"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      )}

      {/* Modal / Formulário Completo: Criar Nova Lista COM FILTROS OBRIGATÓRIOS */}
      {isCreatingList && (
        <form onSubmit={handleSaveList} className="bg-white dark:bg-[#0d1527] border-2 border-blue-500/70 p-6 sm:p-7 rounded-3xl space-y-5 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                  Criar Caderno de Questões com Filtros Clínicos
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Selecione especialidade, tema, subfoco e banco de questões para alimentar seu caderno
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsCreatingList(false)}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dados Gerais da Lista */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Título do Caderno *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Treino Intenso de Cardiologia e HAS..."
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Pasta de Destino
              </label>
              <select
                value={listFolderId || ''}
                onChange={(e) => setListFolderId(e.target.value ? e.target.value : null)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">📁 Sem pasta (Raiz de Cadernos)</option>
                {rootFolders.map((r) => {
                  const lvl2s = getSubfolders(r.id);
                  return (
                    <React.Fragment key={r.id}>
                      <option value={r.id}>📁 {r.name} (Nível 1)</option>
                      {lvl2s.map((l2) => {
                        const lvl3s = getSubfolders(l2.id);
                        return (
                          <React.Fragment key={l2.id}>
                            <option value={l2.id}>&nbsp;&nbsp;↳ 📁 {l2.name} (Nível 2)</option>
                            {lvl3s.map((l3) => (
                              <option key={l3.id} value={l3.id}>
                                &nbsp;&nbsp;&nbsp;&nbsp;↳ ↳ 📁 {l3.name} (Nível 3)
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
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Meta de Questões
              </label>
              <input
                type="number"
                min={5}
                max={200}
                value={listQuestionCount}
                onChange={(e) => setListQuestionCount(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filtros Clínicos Embutidos */}
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-2.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5" />
              <span>Selecione os Critérios do Caderno (Obrigatório)</span>
            </div>

            <AdvancedQuestionFilters
              filters={listFilters}
              onChange={setListFilters}
              onReset={() =>
                setListFilters({
                  search: '',
                  modalidades: ['Residência Médica'],
                  especialidades: ['Clínica Médica'],
                  temas: [],
                  focos: [],
                  subfocos: [],
                  instituicoes: [],
                  anos: [],
                  tipoProva: [],
                  status: 'Todas',
                  dificuldade: 'Todas',
                  tipoQuestao: 'Todas',
                  ocultarAnuladasErro: false,
                  ocultarRevisadas: false,
                  ultimos5Anos: false
                })
              }
              totalAvailable={132965}
              totalFiltered={132965}
              onCreateListFromFilter={() => {}}
            />
          </div>

          {filterError && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/80 rounded-xl text-xs text-rose-700 dark:text-rose-200 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>{filterError}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setFilterError(null);
                setIsCreatingList(false);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/30 cursor-pointer"
            >
              Confirmar e Criar Caderno
            </button>
          </div>
        </form>
      )}

      {/* Estrutura: Pastas e Subpastas na Esquerda, Listas na Direita */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Painel de Pastas e Subpastas */}
        <div className="bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 space-y-3 shadow-sm h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Árvore de Assuntos</span>
            <button
              onClick={() => setSelectedFolderId(null)}
              className={`text-xs hover:underline cursor-pointer ${
                selectedFolderId === null ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-400'
              }`}
            >
              Ver Todas
            </button>
          </div>

          <div className="space-y-1">
            {rootFolders.map((root) => {
              const subfolders = getSubfolders(root.id);
              const isOpen = openFolderIds[root.id];
              const isSelected = selectedFolderId === root.id;

              return (
                <div key={root.id} className="space-y-1">
                  <div
                    onClick={() => setSelectedFolderId(root.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/40 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 font-medium'
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
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                        >
                          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                      ) : (
                        <span className="w-3.5" />
                      )}
                      <FolderIcon className="w-4 h-4 text-blue-500" />
                      <span className="truncate">{root.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingFolder({ id: root.id, name: root.name });
                        }}
                        className="p-1 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                        title="Renomear pasta"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingFolderId(root.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                        title="Excluir pasta"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <span className="text-[10px] text-slate-400 font-mono font-semibold ml-0.5">
                        {lists.filter((l) => l.folderId === root.id).length}
                      </span>
                    </div>
                  </div>

                  {/* Subpastas (Nível 2 e Nível 3) */}
                  {isOpen && subfolders.length > 0 && (
                    <div className="pl-4 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 ml-3">
                      {subfolders.map((sub) => {
                        const isSubSelected = selectedFolderId === sub.id;
                        const subSubfolders = getSubfolders(sub.id);
                        const isSubOpen = !!openFolderIds[sub.id] || selectedFolderId === sub.id || subSubfolders.some((ss) => ss.id === selectedFolderId);

                        return (
                          <div key={sub.id} className="space-y-1">
                            <div
                              onClick={() => {
                                setSelectedFolderId(sub.id);
                                if (subSubfolders.length > 0) toggleFolder(sub.id);
                              }}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                                isSubSelected
                                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                {subSubfolders.length > 0 ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFolder(sub.id);
                                    }}
                                    className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                  >
                                    {isSubOpen ? (
                                      <ChevronDown className="w-2.5 h-2.5" />
                                    ) : (
                                      <ChevronRight className="w-2.5 h-2.5" />
                                    )}
                                  </button>
                                ) : (
                                  <div className="w-2.5" />
                                )}
                                <FolderIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span className="truncate">{sub.name}</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingFolder({ id: sub.id, name: sub.name });
                                  }}
                                  className="p-0.5 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                                  title="Renomear subpasta"
                                >
                                  <Pencil className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletingFolderId(sub.id);
                                  }}
                                  className="p-0.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                                  title="Excluir subpasta"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                                <span className="text-[10px] text-slate-400 font-mono ml-0.5">
                                  {lists.filter((l) => l.folderId === sub.id).length}
                                </span>
                              </div>
                            </div>

                            {/* Sub-subpastas (Nível 3) */}
                            {isSubOpen && subSubfolders.length > 0 && (
                              <div className="pl-4 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 ml-3">
                                {subSubfolders.map((subSub) => {
                                  const isSubSubSelected = selectedFolderId === subSub.id;
                                  return (
                                    <div
                                      key={subSub.id}
                                      onClick={() => setSelectedFolderId(subSub.id)}
                                      className={`flex items-center justify-between px-2 py-1 rounded-md text-[11px] cursor-pointer transition-colors ${
                                        isSubSubSelected
                                          ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold'
                                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                      }`}
                                    >
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <FolderIcon className="w-3 h-3 text-purple-500 shrink-0" />
                                        <span className="truncate">{subSub.name}</span>
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingFolder({ id: subSub.id, name: subSub.name });
                                          }}
                                          className="p-0.5 text-slate-400 hover:text-purple-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                                          title="Renomear pasta nível 3"
                                        >
                                          <Pencil className="w-2 h-2" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setDeletingFolderId(subSub.id);
                                          }}
                                          className="p-0.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                                          title="Excluir pasta nível 3"
                                        >
                                          <Trash2 className="w-2 h-2" />
                                        </button>
                                        <span className="text-[9px] text-slate-400 font-mono ml-0.5">
                                          {lists.filter((l) => l.folderId === subSub.id).length}
                                        </span>
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
            })}
          </div>
        </div>

        {/* Grade de Listas de Questões */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>
              {filteredLists.length} {filteredLists.length === 1 ? 'caderno encontrado' : 'cadernos encontrados'}
            </span>
          </div>

          <div className="space-y-3.5">
            {filteredLists.map((list) => {
              const folderObj = folders.find((f) => f.id === list.folderId);
              return (
                <div
                  key={list.id}
                  className="bento-card bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-5 transition-all shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {folderObj && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                          {folderObj.name}
                        </span>
                      )}
                      {list.progressPercentage === 100 ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Concluída
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Em Andamento
                        </span>
                      )}
                    </div>

                    <h4 className="font-heading text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                      {list.title}
                    </h4>

                    <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span>{list.completedQuestions} de {list.totalQuestions} questões resolvidas</span>
                      <span>•</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{list.progressPercentage}%</span>
                      <span>•</span>
                      <span>{list.lastStudiedAt}</span>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-800">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${list.progressPercentage}%`,
                          backgroundColor: accentConfig.primaryHex
                        }}
                      />
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingList({ id: list.id, title: list.title, folderId: list.folderId || null })}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Editar título ou mover caderno"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Deseja excluir o caderno "${list.title}"?`)) {
                          onDeleteList?.(list.id);
                        }
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Excluir caderno"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onContinueList(list)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-102"
                      style={{ backgroundColor: accentConfig.primaryHex }}
                    >
                      <span>{list.completedQuestions > 0 && list.completedQuestions < list.totalQuestions ? 'Continuar' : 'Resolver'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
