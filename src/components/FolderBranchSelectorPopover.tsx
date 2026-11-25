'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Folder as FolderIcon,
  FolderOpen,
  FolderPlus,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  Plus,
  Loader2,
  ListPlus
} from 'lucide-react';
import { Folder } from '@/types';
import { useTheme } from '@/context/ThemeContext';

export interface FolderBranchSelectorPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder?: (name: string, parentId: string | null) => Promise<void> | void;
  defaultListTitle: string;
  onConfirmCreateList: (title: string, folderId: string | null) => Promise<void>;
  isSaving?: boolean;
  disabled?: boolean;
}

/**
 * Seletor de ramificação completa de pastas para criação de lista a partir dos filtros atuais.
 * Não permite editar filtros nem quantidade de questões (definidos exclusivamente na aba de filtros).
 */
export const FolderBranchSelectorPopover: React.FC<FolderBranchSelectorPopoverProps> = ({
  isOpen,
  onClose,
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  defaultListTitle,
  onConfirmCreateList,
  isSaving = false,
  disabled = false
}) => {
  const { accentConfig } = useTheme();
  const [listTitle, setListTitle] = useState(defaultListTitle);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [creatingUnderParentId, setCreatingUnderParentId] = useState<string | null | undefined>(undefined);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Sincroniza título sugerido quando o seletor é aberto
  useEffect(() => {
    if (isOpen) {
      setListTitle(defaultListTitle);
      setCreatingUnderParentId(undefined);
      setNewFolderName('');
    }
  }, [isOpen, defaultListTitle]);

  // Mapa de filhos por parentId para suportar ramificação completa em qualquer profundidade
  const childrenByParent = useMemo(() => {
    const map = new Map<string, Folder[]>();
    const rootKey = '__root__';
    for (const folder of folders) {
      const key = folder.parentId || rootKey;
      const list = map.get(key) || [];
      list.push(folder);
      map.set(key, list);
    }
    return map;
  }, [folders]);

  const folderById = useMemo(() => {
    const map = new Map<string, Folder>();
    for (const f of folders) {
      map.set(f.id, f);
    }
    return map;
  }, [folders]);

  const selectedPathLabel = useMemo(() => {
    if (!selectedFolderId) return 'Raiz de Listas (Sem pasta)';
    const parts: string[] = [];
    const visited = new Set<string>();
    let current: Folder | undefined = folderById.get(selectedFolderId);
    while (current && !visited.has(current.id)) {
      visited.add(current.id);
      parts.unshift(current.name);
      current = current.parentId ? folderById.get(current.parentId) : undefined;
    }
    return parts.length > 0 ? parts.join(' / ') : 'Raiz de Listas (Sem pasta)';
  }, [selectedFolderId, folderById]);

  const toggleExpand = (folderId: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleStartCreateFolder = (parentId: string | null) => {
    setCreatingUnderParentId(parentId);
    setNewFolderName('');
    if (parentId) {
      setExpandedIds((prev) => ({ ...prev, [parentId]: true }));
    }
  };

  const handleConfirmNewFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || !onCreateFolder || creatingUnderParentId === undefined) return;
    try {
      setIsCreatingFolder(true);
      await onCreateFolder(newFolderName.trim(), creatingUnderParentId);
      setNewFolderName('');
      setCreatingUnderParentId(undefined);
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleSubmitList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listTitle.trim() || isSaving || disabled) return;
    await onConfirmCreateList(listTitle.trim(), selectedFolderId);
  };

  const renderFolderNode = (folder: Folder, depth: number): React.ReactNode => {
    const children = childrenByParent.get(folder.id) || [];
    const hasChildren = children.length > 0;
    const isExpanded = Boolean(expandedIds[folder.id]);
    const isSelected = selectedFolderId === folder.id;
    const isCreatingChildHere = creatingUnderParentId === folder.id;

    return (
      <div key={folder.id} className="select-none">
        <div
          className={`group flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-xs transition-colors ${
            isSelected
              ? 'font-bold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800/90'
              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50'
          }`}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
        >
          <button
            type="button"
            onClick={() => hasChildren && toggleExpand(folder.id)}
            className={`w-4 h-4 flex items-center justify-center rounded shrink-0 ${
              hasChildren
                ? 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer'
                : 'opacity-0 pointer-events-none'
            }`}
            aria-label={isExpanded ? 'Recolher pasta' : 'Expandir pasta'}
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => onSelectFolder(folder.id)}
            className="flex-1 flex items-center gap-2 min-w-0 text-left cursor-pointer"
          >
            {isExpanded || isSelected ? (
              <FolderOpen
                className="w-4 h-4 shrink-0"
                style={{ color: isSelected ? accentConfig.primaryHex : undefined }}
              />
            ) : (
              <FolderIcon className="w-4 h-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
            )}
            <span className="truncate">{folder.name}</span>
          </button>

          {isSelected && (
            <Check className="w-3.5 h-3.5 shrink-0" style={{ color: accentConfig.primaryHex }} />
          )}

          {onCreateFolder && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleStartCreateFolder(folder.id);
              }}
              className="opacity-70 group-hover:opacity-100 p-1 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-700/70 cursor-pointer shrink-0"
              title={`Criar subpasta dentro de "${folder.name}"`}
            >
              <Plus className="w-3 h-3" />
            </button>
          )}
        </div>

        {isCreatingChildHere && (
          <form
            onSubmit={handleConfirmNewFolder}
            className="flex items-center gap-1.5 py-1.5 pr-2"
            style={{ paddingLeft: `${28 + depth * 16}px` }}
          >
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder={`Subpasta em ${folder.name}...`}
              autoFocus
              className="flex-1 min-w-0 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
            />
            <button
              type="submit"
              disabled={!newFolderName.trim() || isCreatingFolder}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white disabled:opacity-40 cursor-pointer shrink-0"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              {isCreatingFolder ? '...' : 'Criar'}
            </button>
            <button
              type="button"
              onClick={() => setCreatingUnderParentId(undefined)}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer"
              title="Cancelar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {hasChildren && isExpanded && (
          <div className="space-y-0.5">
            {children.map((child) => renderFolderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  const rootFolders = childrenByParent.get('__root__') || [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-45 bg-black/50 backdrop-blur-2xs"
        onClick={onClose}
      />

      {/* Popover / Bottom-sheet de Seleção de Pasta */}
      <div
        className="fixed inset-x-3 bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] md:inset-x-auto md:bottom-16 md:right-6 md:w-[420px] max-h-[78dvh] z-50 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 text-zinc-900 dark:text-zinc-100 animate-in slide-in-from-bottom-3 duration-200"
        style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.45)' }}
        role="dialog"
        aria-modal="true"
        aria-label="Selecionar local da lista"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-2.5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: accentConfig.bgRgba, color: accentConfig.primaryHex }}
            >
              <FolderIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                Selecionar local da lista
              </h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate" title={selectedPathLabel}>
                Destino: {selectedPathLabel}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer shrink-0"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nome da Lista */}
        <form onSubmit={handleSubmitList} className="flex flex-col gap-3 min-h-0 flex-1">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
              Nome da Lista *
            </label>
            <input
              type="text"
              value={listTitle}
              onChange={(e) => setListTitle(e.target.value)}
              placeholder="Ex: Treino Clínica Médica..."
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            />
          </div>

          {/* Ramificação Completa de Pastas */}
          <div className="flex flex-col gap-1.5 min-h-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                Pastas e Ramificações
              </span>
              {onCreateFolder && (
                <button
                  type="button"
                  onClick={() => handleStartCreateFolder(null)}
                  className="flex items-center gap-1 text-[11px] font-bold hover:underline cursor-pointer"
                  style={{ color: accentConfig.primaryHex }}
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Nova pasta raiz</span>
                </button>
              )}
            </div>

            {creatingUnderParentId === null && (
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleConfirmNewFolder(e);
                    }
                  }}
                  placeholder="Nome da nova pasta raiz..."
                  autoFocus
                  className="flex-1 min-w-0 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                />
                <button
                  type="button"
                  onClick={handleConfirmNewFolder}
                  disabled={!newFolderName.trim() || isCreatingFolder}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white disabled:opacity-40 cursor-pointer shrink-0"
                  style={{ backgroundColor: accentConfig.primaryHex }}
                >
                  {isCreatingFolder ? '...' : 'Criar'}
                </button>
                <button
                  type="button"
                  onClick={() => setCreatingUnderParentId(undefined)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer"
                  title="Cancelar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="overflow-y-auto max-h-[240px] pr-1 space-y-0.5 rounded-xl border border-zinc-200 dark:border-zinc-800 p-1.5 bg-zinc-50/60 dark:bg-zinc-950/40">
              {/* Opção Raiz */}
              <button
                type="button"
                onClick={() => onSelectFolder(null)}
                className={`w-full flex items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                  selectedFolderId === null
                    ? 'font-bold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800/90'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <FolderIcon
                    className="w-4 h-4 shrink-0"
                    style={{ color: selectedFolderId === null ? accentConfig.primaryHex : undefined }}
                  />
                  <span className="truncate">Raiz de Listas (Sem pasta)</span>
                </span>
                {selectedFolderId === null && (
                  <Check className="w-3.5 h-3.5 shrink-0" style={{ color: accentConfig.primaryHex }} />
                )}
              </button>

              {rootFolders.map((rootFolder) => renderFolderNode(rootFolder, 0))}
            </div>
          </div>

          {/* Rodapé de Confirmação (sem edição de filtros/qtd) */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!listTitle.trim() || isSaving || disabled}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm disabled:opacity-45 cursor-pointer"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ListPlus className="w-3.5 h-3.5" />
              )}
              <span>{isSaving ? 'Criando...' : 'Confirmar e Criar Lista'}</span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
