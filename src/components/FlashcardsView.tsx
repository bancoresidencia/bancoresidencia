'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  CheckCircle2,
  Clock,
  Play,
  RotateCw,
  Star,
  Brain,
  Stethoscope,
  Activity,
  Baby,
  Heart,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  X,
  Plus,
  Check,
  History,
  Bookmark,
  TrendingUp,
  Tag,
  Shuffle
} from 'lucide-react';
import {
  FlashcardItem,
  StudyMaterialItem,
  LastFlashcardSessionInfo,
  LastReadSummaryInfo
} from '@/types/flashcards';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { flashcardsService } from '@/services/flashcardsService';
import { clinicalHierarchy } from '@/data/mockQuestions';
import { FlashcardStudySession } from './FlashcardStudySession';
import { StudyMaterialReader } from './StudyMaterialReader';

export interface SpecialtyConfig {
  id: string;
  name: string;
  hierarchyKey: string;
  icon: React.ComponentType<{ className?: string }>;
  colorHex: string;
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
  accentText: string;
}

export const SPECIALTY_CONFIGS: SpecialtyConfig[] = [
  {
    id: 'clinica',
    name: 'Clínica Médica',
    hierarchyKey: 'Clínica Médica',
    icon: Stethoscope,
    colorHex: '#3B82F6',
    bgLight: 'bg-blue-50/80',
    bgDark: 'dark:bg-blue-950/25',
    borderLight: 'border-blue-200/80',
    borderDark: 'dark:border-blue-800/40',
    accentText: 'text-blue-600 dark:text-blue-400'
  },
  {
    id: 'cirurgia',
    name: 'Cirurgia Geral',
    hierarchyKey: 'Cirurgia',
    icon: Activity,
    colorHex: '#10B981',
    bgLight: 'bg-emerald-50/80',
    bgDark: 'dark:bg-emerald-950/25',
    borderLight: 'border-emerald-200/80',
    borderDark: 'dark:border-emerald-800/40',
    accentText: 'text-emerald-600 dark:text-emerald-400'
  },
  {
    id: 'pediatria',
    name: 'Pediatria',
    hierarchyKey: 'Pediatria',
    icon: Baby,
    colorHex: '#F59E0B',
    bgLight: 'bg-amber-50/80',
    bgDark: 'dark:bg-amber-950/25',
    borderLight: 'border-amber-200/80',
    borderDark: 'dark:border-amber-800/40',
    accentText: 'text-amber-600 dark:text-amber-400'
  },
  {
    id: 'ginecologia',
    name: 'Ginecologia',
    hierarchyKey: 'Ginecologia',
    icon: Sparkles,
    colorHex: '#EC4899',
    bgLight: 'bg-pink-50/80',
    bgDark: 'dark:bg-pink-950/25',
    borderLight: 'border-pink-200/80',
    borderDark: 'dark:border-pink-800/40',
    accentText: 'text-pink-600 dark:text-pink-400'
  },
  {
    id: 'obstetricia',
    name: 'Obstetrícia',
    hierarchyKey: 'Obstetrícia',
    icon: Heart,
    colorHex: '#8B5CF6',
    bgLight: 'bg-purple-50/80',
    bgDark: 'dark:bg-purple-950/25',
    borderLight: 'border-purple-200/80',
    borderDark: 'dark:border-purple-800/40',
    accentText: 'text-purple-600 dark:text-purple-400'
  },
  {
    id: 'preventiva',
    name: 'Medicina Preventiva e Social',
    hierarchyKey: 'Medicina Preventiva e Social',
    icon: ShieldCheck,
    colorHex: '#06B6D4',
    bgLight: 'bg-cyan-50/80',
    bgDark: 'dark:bg-cyan-950/25',
    borderLight: 'border-cyan-200/80',
    borderDark: 'dark:border-cyan-800/40',
    accentText: 'text-cyan-600 dark:text-cyan-400'
  }
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function shuffleCards<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function itemMatchesSpecialty(
  item: { specialty: string; theme: string; focus: string },
  specHierarchyKey: string
): boolean {
  const s = item.specialty.toLowerCase();
  const target = specHierarchyKey.toLowerCase();

  if (target.includes('clínica') || target.includes('clinica')) {
    return s.includes('clínica') || s.includes('clinica');
  }
  if (target.includes('cirurgia')) {
    return s.includes('cirurgia');
  }
  if (target.includes('pediatria')) {
    return s.includes('pediatria');
  }
  if (target.includes('preventiva')) {
    return s.includes('preventiva');
  }
  if (target.includes('ginecologia')) {
    if (s === 'ginecologia') return true;
    if (s.includes('ginecologia')) {
      const th = item.theme.toLowerCase();
      const fo = item.focus.toLowerCase();
      if (
        th.includes('obstetr') ||
        fo.includes('parto') ||
        fo.includes('eclâmpsia') ||
        fo.includes('eclampsia')
      ) {
        return false;
      }
      return true;
    }
    return false;
  }
  if (target.includes('obstetr')) {
    if (s === 'obstetrícia' || s === 'obstetricia') return true;
    if (s.includes('obstetr')) {
      const th = item.theme.toLowerCase();
      const fo = item.focus.toLowerCase();
      if (
        th.includes('gineco') ||
        th.includes('mioma') ||
        fo.includes('colo uterino') ||
        fo.includes('mioma')
      ) {
        return false;
      }
      return true;
    }
    return false;
  }
  return false;
}

interface FlashcardsViewProps {
  mode?: 'flashcards' | 'resumos';
  onNavigateToBanco?: (specialty?: string, tema?: string) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  mode = 'flashcards',
  onNavigateToBanco
}) => {
  const { accentConfig } = useTheme();
  const { user } = useAuth();

  // Estados de Expansão dos Cards de Especialidade (todos colapsados por padrão)
  const [expandedSpecialties, setExpandedSpecialties] = useState<Record<string, boolean>>({});

  // Estados de Expansão dos Temas (todos colapsados por padrão)
  const [expandedTemas, setExpandedTemas] = useState<Record<string, boolean>>({});

  // Multi-seleção de Especialidades
  const [selectedSpecialties, setSelectedSpecialties] = useState<Set<string>>(new Set());

  // Multi-seleção de Temas
  const [selectedTemas, setSelectedTemas] = useState<Set<string>>(new Set());

  // Multi-seleção de Focos
  const [selectedFocos, setSelectedFocos] = useState<Set<string>>(new Set());

  // Sessão Ativa ou Leitor Ativo
  const [activeSessionCards, setActiveSessionCards] = useState<FlashcardItem[] | null>(null);
  const [activeMaterial, setActiveMaterial] = useState<StudyMaterialItem | null>(null);

  // Histórico de Última Sessão e Resumo Lido
  const [lastFlashcardSession, setLastFlashcardSession] = useState<LastFlashcardSessionInfo | null>(null);
  const [lastReadSummary, setLastReadSummary] = useState<LastReadSummaryInfo | null>(null);

  // Termo de Busca Rápida (Flashcards & Resumos)
  const [searchQuery, setSearchQuery] = useState('');

  // Filtro exclusivo para estudar apenas flashcards essenciais (alta incidência em provas)
  const [filterEssentialOnly, setFilterEssentialOnly] = useState(false);

  // Opção de embaralhar flashcards (com persistência no localStorage)
  const [isShuffleEnabled, setIsShuffleEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const saved = localStorage.getItem('bancoresidencia_flashcards_shuffle');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const normalizedQuery = useMemo(() => normalizeText(searchQuery), [searchQuery]);

  const continuationTitle = useMemo(() => {
    if (mode === 'flashcards') {
      return lastFlashcardSession
        ? lastFlashcardSession.deckTitle
        : 'Alta Incidência: Cartões Prioritários (Clínica & Cirurgia)';
    }
    return lastReadSummary
      ? lastReadSummary.title
      : 'Endoscopia Digestiva Alta & Hemorragia Digestiva Alta (HDA)';
  }, [mode, lastFlashcardSession, lastReadSummary]);

  // Estado do Drawer Central de Adicionar Flashcard
  const [isAddCardDrawerOpen, setIsAddCardDrawerOpen] = useState(false);
  const [newCardSpecialty, setNewCardSpecialty] = useState('Clínica Médica');
  const [newCardTema, setNewCardTema] = useState('');
  const [newCardFoco, setNewCardFoco] = useState('');
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [newCardComment, setNewCardComment] = useState('');
  const [newCardPriority, setNewCardPriority] = useState<'essential' | 'standard'>('essential');
  const [newCardTags, setNewCardTags] = useState('');
  const [addCardSuccessToast, setAddCardSuccessToast] = useState(false);

  const frontTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Carrega Flashcards e Materiais base
  const [allFlashcards, setAllFlashcards] = useState<FlashcardItem[]>([]);

  useEffect(() => {
    setAllFlashcards(flashcardsService.getFlashcards({ userId: user?.id }));
  }, [activeSessionCards]);

// SWR: Sincroniza progresso remoto, baralhos e cards criados pelo usuário
  useEffect(() => {
    if (user?.id) {
      flashcardsService.syncRemoteProgress(user.id).then(() => {
        setAllFlashcards(flashcardsService.getFlashcards({ userId: user.id }));
      });
      flashcardsService.syncRemoteDecks(user.id);
      flashcardsService.syncRemoteUserCreatedCards(user.id).then(() => {
        setAllFlashcards(flashcardsService.getFlashcards({ userId: user.id }));
      });
      flashcardsService.syncRemoteStudyProgress(user.id).then((lastSumm) => {
        if (lastSumm) setLastReadSummary(lastSumm);
      });
    }
  }, [user?.id]);

  const allStudyMaterials = useMemo(() => {
    return flashcardsService.getStudyMaterials();
  }, []);

  // Estatísticas FSRS
  const stats = useMemo(() => {
    return flashcardsService.getStats(user?.id);
  }, [activeSessionCards, allFlashcards, user?.id]);

  // Contagem dinâmica para KPIs de Resumos
  const totalTemasCount = useMemo(() => {
    return clinicalHierarchy.reduce((acc, h) => acc + h.temas.length, 0);
  }, []);

  const totalFocosCount = useMemo(() => {
    return clinicalHierarchy.reduce((acc, h) => {
      return acc + h.temas.reduce((tAcc, t) => tAcc + t.focos.length, 0);
    }, 0);
  }, []);

  // Carrega histórico salvo no localStorage
  useEffect(() => {
    setLastFlashcardSession(flashcardsService.getLastFlashcardSession());
    setLastReadSummary(flashcardsService.getLastReadSummary());
  }, []);

  // Quantidade total de flashcards essenciais
  const essentialCardsCount = useMemo(() => {
    return allFlashcards.filter((c) => c.priority === 'essential').length;
  }, [allFlashcards]);

  // Iniciar sessão de estudo de flashcards e registrar como última sessão
  const handleStartStudy = (
    cardsToStudy: FlashcardItem[],
    sessionTitle?: string,
    overridePriorityOnly?: boolean
  ) => {
    if (!cardsToStudy || cardsToStudy.length === 0) return;

    const shouldFilterEssential = overridePriorityOnly ?? filterEssentialOnly;
    const filtered = shouldFilterEssential
      ? cardsToStudy.filter((c) => c.priority === 'essential')
      : cardsToStudy;

    if (filtered.length === 0) return;

    const listToLaunch = isShuffleEnabled ? shuffleCards(filtered) : [...filtered];

    const title =
      sessionTitle ||
      (listToLaunch[0]?.specialty
        ? `${listToLaunch[0].specialty} (${listToLaunch.length} cards)`
        : 'Sessão de Flashcards');

    const sessionInfo: LastFlashcardSessionInfo = {
      deckTitle: title,
      specialty: listToLaunch[0]?.specialty,
      theme: listToLaunch[0]?.theme,
      focus: listToLaunch[0]?.focus,
      cardIds: listToLaunch.map((c) => c.id),
      cardCount: listToLaunch.length,
      lastStudiedAt: new Date().toISOString()
    };

    flashcardsService.saveLastFlashcardSession(sessionInfo);
    setLastFlashcardSession(sessionInfo);
    setActiveSessionCards(listToLaunch);
  };

  // Iniciar sessão exclusiva com os flashcards essenciais (mais cobrados na prova)
  const handleStartEssentialStudy = () => {
    const essentials = allFlashcards.filter((c) => c.priority === 'essential');
    if (essentials.length === 0) return;
    handleStartStudy(
      essentials,
      `Flashcards Essenciais de Prova (${essentials.length} cards)`,
      true
    );
  };

  // Abrir resumo clínico e registrar como último resumo lido
  const handleOpenMaterial = (material: StudyMaterialItem) => {
    const summaryInfo: LastReadSummaryInfo = {
      materialId: material.id,
      title: material.title,
      specialty: material.specialty,
      theme: material.theme,
      focus: material.focus,
      readTimeMinutes: material.readTimeMinutes,
      guidelineBadge: material.guidelineBadge,
      lastReadAt: new Date().toISOString()
    };

    flashcardsService.saveLastReadSummary(summaryInfo, user?.id);
    setLastReadSummary(summaryInfo);
    setActiveMaterial(material);
  };

  // Toggle expansão especialidade
  const toggleSpecialtyExpand = (specName: string) => {
    setExpandedSpecialties((prev) => ({
      ...prev,
      [specName]: !prev[specName]
    }));
  };

  // Toggle expansão tema
  const toggleTemaExpand = (specName: string, temaName: string) => {
    const key = `${specName}:::${temaName}`;
    setExpandedTemas((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Helper para obter flashcards de uma especialidade inteira
  const getCardsForSpecialty = (specName: string) => {
    const list = allFlashcards.filter((c) => itemMatchesSpecialty(c, specName));
    return filterEssentialOnly ? list.filter((c) => c.priority === 'essential') : list;
  };

  // Helper para obter flashcards de um tema específico
  const getCardsForTema = (specName: string, temaName: string) => {
    const list = allFlashcards
      .filter((c) => itemMatchesSpecialty(c, specName))
      .filter((c) => {
        const normTema = normalizeText(temaName);
        const normItemTh = normalizeText(c.theme);
        const normItemFo = normalizeText(c.focus);

        const matchesTh =
          normItemTh.includes(normTema) ||
          normTema.includes(normItemTh) ||
          normItemFo.includes(normTema);

        const isEndo = normTema.includes('endocrino') && normItemTh.includes('endocrino');
        const isCardio = normTema.includes('cardio') && normItemTh.includes('cardio');
        const isGinecoOnco = normTema.includes('oncologia') && normItemTh.includes('ginecologia');
        const isMioma = normTema.includes('mioma') && normItemTh.includes('mioma');
        const isObstetr = normTema.includes('obstetr') && normItemTh.includes('obstetr');
        const isPrev = normTema.includes('epidemiologia') && normItemTh.includes('epidemiologia');

        return matchesTh || isEndo || isCardio || isGinecoOnco || isMioma || isObstetr || isPrev;
      });
    return filterEssentialOnly ? list.filter((c) => c.priority === 'essential') : list;
  };

  // Helper para obter flashcards de um foco específico
  const getCardsForFoco = (specName: string, temaName: string, focoName: string) => {
    const list = getCardsForTema(specName, temaName).filter((c) => {
      const normFoco = normalizeText(focoName);
      const normItemFo = normalizeText(c.focus);
      const normFront = c.front ? normalizeText(c.front) : '';
      const normBack = c.back ? normalizeText(c.back) : '';
      const normComment = c.comment ? normalizeText(c.comment) : '';

      const direct = normItemFo.includes(normFoco) || normFoco.includes(normItemFo);
      const content =
        normFront.includes(normFoco) ||
        normBack.includes(normFoco) ||
        normComment.includes(normFoco);

      const words = normFoco.split(/\s+/).filter((w) => w.length > 3);
      const wordsMatch =
        words.length > 0 &&
        words.some(
          (w) =>
            normItemFo.includes(w) ||
            normFront.includes(w) ||
            (c.tags && c.tags.some((t) => normalizeText(t).includes(w)))
        );

      return direct || content || wordsMatch;
    });
    return filterEssentialOnly ? list.filter((c) => c.priority === 'essential') : list;
  };

  // Helper para verificar se um foco clínico dá match com o termo de busca
  const focoMatchesSearch = (specName: string, temaName: string, focoName: string) => {
    if (!normalizedQuery) return true;

    const normFoco = normalizeText(focoName);
    const normTema = normalizeText(temaName);
    const normSpec = normalizeText(specName);

    if (normFoco.includes(normalizedQuery) || normalizedQuery.includes(normFoco)) return true;
    if (normTema.includes(normalizedQuery) || normSpec.includes(normalizedQuery)) return true;

    if (mode === 'flashcards') {
      const cards = getCardsForFoco(specName, temaName, focoName);
      return cards.some(
        (c) =>
          normalizeText(c.front).includes(normalizedQuery) ||
          normalizeText(c.back).includes(normalizedQuery) ||
          (c.comment && normalizeText(c.comment).includes(normalizedQuery)) ||
          (c.tags && c.tags.some((t) => normalizeText(t).includes(normalizedQuery)))
      );
    }

    if (mode === 'resumos') {
      const existingMat =
        allStudyMaterials.find(
          (m) =>
            normalizeText(m.focus) === normFoco ||
            normalizeText(m.focus).includes(normFoco) ||
            normFoco.includes(normalizeText(m.focus))
        ) ||
        allStudyMaterials.find(
          (m) => m.theme && normalizeText(m.theme) === normTema && !m.focus
        );
      if (existingMat) {
        if (normalizeText(existingMat.title).includes(normalizedQuery)) return true;
        if (normalizeText(existingMat.summarySnippet).includes(normalizedQuery)) return true;
        if (
          existingMat.keyPoints &&
          existingMat.keyPoints.some((kp) => normalizeText(kp).includes(normalizedQuery))
        ) {
          return true;
        }
      }
    }

    return false;
  };

  // Contagem total de focos que dão match com a busca ativa
  const totalMatchingFocosCount = useMemo(() => {
    if (!normalizedQuery) return null;
    let count = 0;
    SPECIALTY_CONFIGS.forEach((spec) => {
      const hNode = clinicalHierarchy.find(
        (h) =>
          h.especialidade.toLowerCase() === spec.name.toLowerCase() ||
          (spec.name === 'Cirurgia Geral' && h.especialidade === 'Cirurgia') ||
          (spec.name === 'Cirurgia' && h.especialidade === 'Cirurgia')
      );
      hNode?.temas.forEach((tem) => {
        tem.focos.forEach((foc) => {
          if (focoMatchesSearch(spec.name, tem.tema, foc.foco)) {
            count++;
          }
        });
      });
    });
    return count;
  }, [normalizedQuery, mode, allFlashcards, allStudyMaterials]);

  // Multi-seleção de Especialidades
  const toggleSpecialtySelection = (specName: string) => {
    setSelectedSpecialties((prev) => {
      const next = new Set(prev);
      if (next.has(specName)) {
        next.delete(specName);
      } else {
        next.add(specName);
      }
      return next;
    });
  };

  // Multi-seleção de Temas
  const toggleTemaSelection = (specName: string, temaName: string) => {
    const key = `${specName}:::${temaName}`;
    setSelectedTemas((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Multi-seleção de Focos
  const toggleFocoSelection = (specName: string, temaName: string, focoName: string) => {
    const key = `${specName}:::${temaName}:::${focoName}`;
    setSelectedFocos((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Total de Flashcards Selecionados (Especialidades + Temas + Focos)
  const selectedCardsList = useMemo(() => {
    const cardSet = new Map<string, FlashcardItem>();

    // 1. Cards de Especialidades selecionadas inteiras
    selectedSpecialties.forEach((specName) => {
      getCardsForSpecialty(specName).forEach((c) => cardSet.set(c.id, c));
    });

    // 2. Cards de Temas selecionados
    selectedTemas.forEach((key) => {
      const [specName, temaName] = key.split(':::');
      getCardsForTema(specName, temaName).forEach((c) => cardSet.set(c.id, c));
    });

    // 3. Cards de Focos selecionados
    selectedFocos.forEach((key) => {
      const [specName, temaName, focoName] = key.split(':::');
      getCardsForFoco(specName, temaName, focoName).forEach((c) => cardSet.set(c.id, c));
    });

    return Array.from(cardSet.values());
  }, [selectedSpecialties, selectedTemas, selectedFocos, allFlashcards]);

  const totalSelectionCount =
    selectedSpecialties.size + selectedTemas.size + selectedFocos.size;

  // Limpar todas as seleções
  const handleClearSelections = () => {
    setSelectedSpecialties(new Set());
    setSelectedTemas(new Set());
    setSelectedFocos(new Set());
  };

  // Continuação do Último Conjunto Estudado
  const handleContinueLastSession = () => {
    if (lastFlashcardSession && lastFlashcardSession.cardIds.length > 0) {
      const cards = allFlashcards.filter((c) =>
        lastFlashcardSession.cardIds.includes(c.id)
      );
      if (cards.length > 0) {
        handleStartStudy(cards, lastFlashcardSession.deckTitle);
        return;
      }
    }
    const priorityCards = allFlashcards
      .filter((c) => c.priority === 'essential')
      .slice(0, 15);
    handleStartStudy(priorityCards, 'Alta Incidência: Cartões Prioritários');
  };

  // Continuação do Último Resumo Lido
  const handleContinueLastSummary = () => {
    if (lastReadSummary) {
      const mat = allStudyMaterials.find((m) => m.id === lastReadSummary.materialId);
      if (mat) {
        handleOpenMaterial(mat);
        return;
      }
    }
    if (allStudyMaterials.length > 0) {
      handleOpenMaterial(allStudyMaterials[0]);
    }
  };

  // Inserir Oclusão Cloze no Drawer
  const handleInsertCloze = () => {
    const textarea = frontTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = newCardFront;
    const selectedText = text.substring(start, end);

    const existingMatches = text.match(/\{\{c(\d+)::/g) || [];
    const nextNum = existingMatches.length + 1;

    const replacement = selectedText
      ? `{{c${nextNum}::${selectedText}}}`
      : `{{c${nextNum}::resposta}}`;

    const updated = text.substring(0, start) + replacement + text.substring(end);
    setNewCardFront(updated);

    setTimeout(() => {
      textarea.focus();
      const newCursor = start + replacement.length;
      textarea.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  // Salvar Novo Flashcard
  const handleSaveNewFlashcard = (keepOpen = false) => {
    if (!newCardFront.trim() || !newCardBack.trim()) return;

    const tagsArray = newCardTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const finalTema = newCardTema.trim() || 'Geral';
    const finalFoco = newCardFoco.trim() || finalTema;

    const newCard: FlashcardItem = {
      id: `fc-user-${Date.now()}`,
      front: newCardFront.trim(),
      back: newCardBack.trim(),
      comment: newCardComment.trim() || undefined,
      specialty: newCardSpecialty,
      theme: finalTema,
      focus: finalFoco,
      priority: newCardPriority,
      tags: tagsArray.length > 0 ? tagsArray : undefined
    };

    flashcardsService.saveNewFlashcard(newCard, user?.id);
    setAllFlashcards(flashcardsService.getFlashcards({ userId: user?.id }));

    setAddCardSuccessToast(true);
    setTimeout(() => setAddCardSuccessToast(false), 3000);

    if (keepOpen) {
      setNewCardFront('');
      setNewCardBack('');
      setNewCardComment('');
      setNewCardTags('');
      if (frontTextareaRef.current) frontTextareaRef.current.focus();
    } else {
      setIsAddCardDrawerOpen(false);
      setNewCardFront('');
      setNewCardBack('');
      setNewCardComment('');
      setNewCardTags('');
    }
  };

  // Temas da especialidade selecionada no Drawer
  const drawerTemas = useMemo(() => {
    const hNode = clinicalHierarchy.find(
      (h) =>
        h.especialidade.toLowerCase() === newCardSpecialty.toLowerCase() ||
        (newCardSpecialty === 'Cirurgia Geral' && h.especialidade === 'Cirurgia') ||
        (newCardSpecialty === 'Cirurgia' && h.especialidade === 'Cirurgia')
    );
    return hNode?.temas || [];
  }, [newCardSpecialty]);

  // Focos do tema selecionado no Drawer
  const drawerFocos = useMemo(() => {
    const temaObj = drawerTemas.find((t) => t.tema === newCardTema);
    return temaObj?.focos.map((f) => f.foco) || [];
  }, [drawerTemas, newCardTema]);

  // Abrir ou Gerar Resumo de um Foco
  const handleOpenFocoSummary = (specName: string, temaName: string, focoName: string) => {
    const existingMat =
      allStudyMaterials.find(
        (m) =>
          normalizeText(m.focus) === normalizeText(focoName) ||
          normalizeText(m.focus).includes(normalizeText(focoName)) ||
          normalizeText(focoName).includes(normalizeText(m.focus))
      ) ||
      allStudyMaterials.find(
        (m) => m.theme && normalizeText(m.theme) === normalizeText(temaName) && !m.focus
      );

    if (existingMat) {
      handleOpenMaterial(existingMat);
      return;
    }

    const cardsForFoco = getCardsForFoco(specName, temaName, focoName);

    const dynamicMat: StudyMaterialItem = {
      id: `mat-foco-${normalizeText(focoName).replace(/\s+/g, '-')}`,
      title: focoName,
      specialty: specName,
      theme: temaName,
      focus: focoName,
      readTimeMinutes: 5,
      lastUpdatedYear: 2026,
      guidelineBadge: 'Diretriz & Evidência Oficial',
      summarySnippet: `Síntese e pontos críticos de alta incidência para ${focoName} nas principais bancas de residência médica.`,
      keyPoints: [
        `Fisiopatologia e critérios diagnósticos essenciais de ${focoName}.`,
        `Linhas de conduta terapêutica e estratificação de risco recomendadas.`,
        `Principais armadilhas e pegadinhas recorrentes em provas oficiais.`
      ],
      markdownContent: `# ${focoName}

## 1. Visão Geral e Fisiopatologia
O foco clínico **${focoName}** integra o tema de **${temaName}** em **${specName}**. Nas provas de residência médica, o examinador prioriza o raciocínio clínico aplicado, diagnóstico diferencial e protocolos de conduta imediata.

---

## 2. Diagnóstico e Estratificação
* **Quadro Clínico Típico:** Reconhecimento precoce de sinais de gravidade e manifestações cardinais.
* **Exames Complementares:** Métodos padrão-ouro versus exames de triagem inicial.
* **Critérios de Risco:** Estratificação conforme diretrizes oficiais brasileiras.

---

## 3. Conduta e Tratamento Padrão-Ouro
* **Primeira Linha de Abordagem:** Estabilização e medidas iniciais indispensáveis.
* **Terapêutica Farmacológica / Cirúrgica:** Doses consagradas, contraindicações absolutas e armadilhas frequentes de prova.
* **Seguimento e Prognóstico:** Critérios de alta, internação ou encaminhamento.`,
      flashcardCount: cardsForFoco.length
    };

    handleOpenMaterial(dynamicMat);
  };

  // Se estiver em modo de sessão ativa de flashcards
  if (activeSessionCards) {
    return (
      <FlashcardStudySession
        cards={activeSessionCards}
        onExit={() => setActiveSessionCards(null)}
        onOpenMaterial={(mat) => handleOpenMaterial(mat)}
        initialShuffled={isShuffleEnabled}
      />
    );
  }

  // Se estiver lendo um material de apoio específico
  if (activeMaterial) {
    return (
      <StudyMaterialReader
        material={activeMaterial}
        onBack={() => setActiveMaterial(null)}
        onPracticeFlashcards={(mat) => {
          const related = allFlashcards
            .filter((c) => itemMatchesSpecialty(c, mat.specialty))
            .filter(
              (c) =>
                c.focus.toLowerCase().includes(mat.focus.toLowerCase()) ||
                c.theme.toLowerCase() === mat.theme.toLowerCase()
            );
          const cardsToPractice =
            related.length > 0
              ? related
              : allFlashcards.filter((c) => itemMatchesSpecialty(c, mat.specialty));
          setActiveMaterial(null);
          if (cardsToPractice.length > 0) {
            handleStartStudy(cardsToPractice, `Prática: ${mat.title}`);
          }
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. CONTAINER UNIFICADO (HEADER + CONTINUAÇÃO + BUSCA + KPIS FUNDIDOS EM 1 SÓ CARD) */}
      <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800/80 p-5 sm:p-6 rounded-3xl shadow-xs space-y-4">
        {/* Topo: Identificação do Módulo + Ação Primária */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
              style={{
                backgroundColor: accentConfig.bgRgba,
                color: accentConfig.primaryHex,
                border: `1px solid ${accentConfig.borderRgba}`
              }}
            >
              {mode === 'flashcards' ? (
                <Brain className="w-6 h-6 stroke-[2]" />
              ) : (
                <BookOpen className="w-6 h-6 stroke-[2]" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-lg sm:text-xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
                  {mode === 'flashcards' ? 'Flashcards' : 'Resumos Clínicos'}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase tracking-wider">
                  {mode === 'flashcards' ? 'Repetição Espaçada' : 'Diretrizes & Condutas'}
                </span>
              </div>
            </div>
          </div>

          {/* Ações Rápidas de Estudo no Topo */}
          {mode === 'flashcards' && (
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              {/* Botão Resolver Só Essenciais */}
              <button
                type="button"
                onClick={handleStartEssentialStudy}
                title={`Iniciar sessão apenas com os ${essentialCardsCount} flashcards essenciais mais cobrados em prova`}
                className="px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-700 dark:text-amber-300 border border-amber-500/40 active:scale-98"
              >
                <Star className="w-4 h-4 fill-amber-500 text-amber-500 shrink-0" />
                <span>Resolver Só Essenciais</span>
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-amber-500/20 text-amber-900 dark:text-amber-200">
                  {essentialCardsCount}
                </span>
              </button>

              {/* Botão Embaralhar Flashcards */}
              <button
                type="button"
                onClick={() => {
                  const next = !isShuffleEnabled;
                  setIsShuffleEnabled(next);
                  try {
                    localStorage.setItem('bancoresidencia_flashcards_shuffle', String(next));
                  } catch { }
                }}
                title={isShuffleEnabled ? 'Embaralhar flashcards está ativado (Clique para ordem fixa)' : 'Ordem fixa dos flashcards (Clique para embaralhar)'}
                className={`px-3 sm:px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border shadow-2xs active:scale-98 ${isShuffleEnabled
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                    : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
              >
                <Shuffle className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{isShuffleEnabled ? 'Embaralhar: ON' : 'Embaralhar: OFF'}</span>
              </button>

              {/* Botão de Adicionar Flashcard */}
              <button
                type="button"
                onClick={() => {
                  setIsAddCardDrawerOpen(true);
                  if (drawerTemas.length > 0 && !newCardTema) {
                    setNewCardTema(drawerTemas[0].tema);
                    if (drawerTemas[0].focos.length > 0) {
                      setNewCardFoco(drawerTemas[0].focos[0].foco);
                    }
                  }
                }}
                className="px-3.5 sm:px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 hover:opacity-95 active:scale-98"
                style={{
                  backgroundColor: accentConfig.primaryHex,
                  boxShadow: `0 6px 16px -4px ${accentConfig.bgRgba}`
                }}
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Adicionar Flashcard</span>
                <span className="sm:hidden">Criar</span>
              </button>
            </div>
          )}
        </div>

        {/* Faixa Integrada de Continuação (Card 2 Fundido com Altíssima Densidade UX) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800/60 transition-all hover:border-slate-300 dark:hover:border-zinc-700">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              {mode === 'flashcards' ? (
                <History className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block leading-tight">
                {mode === 'flashcards' ? 'Continuar Estudo' : 'Continuar Leitura'}
              </span>
              <span className="font-heading font-bold text-xs sm:text-sm text-slate-800 dark:text-zinc-200 truncate block">
                {continuationTitle}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={mode === 'flashcards' ? handleContinueLastSession : handleContinueLastSummary}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-white shadow-2xs cursor-pointer hover:opacity-95 transition-all shrink-0 inline-flex items-center justify-center gap-1.5"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            {mode === 'flashcards' ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Continuar</span>
              </>
            ) : (
              <>
                <BookOpen className="w-3.5 h-3.5" />
                <span>Continuar</span>
              </>
            )}
          </button>
        </div>

        {/* Mini-KPIs embutidos no mesmo card conjunto (quando em Flashcards) */}
        {mode === 'flashcards' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
            <div className="bg-slate-50 dark:bg-zinc-900/60 p-3.5 rounded-2xl border border-slate-200/70 dark:border-zinc-800/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                Para Hoje
              </span>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-zinc-100 mt-0.5">
                {stats.dueToday}
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                revisões pendentes
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-900/60 p-3.5 rounded-2xl border border-slate-200/70 dark:border-zinc-800/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Novos Cards
              </span>
              <div className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400 mt-0.5">
                {stats.newCards}
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                aguardando estudo
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-900/60 p-3.5 rounded-2xl border border-slate-200/70 dark:border-zinc-800/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Em Revisão
              </span>
              <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                {stats.review}
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                consolidados no FSRS
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-900/60 p-3.5 rounded-2xl border border-slate-200/70 dark:border-zinc-800/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                Meta Retenção
              </span>
              <div
                className="text-2xl font-black font-mono mt-0.5"
                style={{ color: accentConfig.primaryHex }}
              >
                {stats.desiredRetention}%
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                precisão esperada
              </span>
            </div>
          </div>
        )}

        {/* Mini-KPIs embutidos no mesmo card conjunto (quando em Resumos) */}
        {mode === 'resumos' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
            <div className="bg-slate-50 dark:bg-zinc-900/60 p-3.5 rounded-2xl border border-slate-200/70 dark:border-zinc-800/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                Resumos Clínicos
              </span>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-zinc-100 mt-0.5">
                {totalFocosCount}
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                focos mapeados
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-900/60 p-3.5 rounded-2xl border border-slate-200/70 dark:border-zinc-800/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Temas Oficiais
              </span>
              <div className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400 mt-0.5">
                {totalTemasCount}
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                em 6 especialidades
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-900/60 p-3.5 rounded-2xl border border-slate-200/70 dark:border-zinc-800/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Evidências Oficiais
              </span>
              <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                100%
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                diretrizes atualizadas
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-900/60 p-3.5 rounded-2xl border border-slate-200/70 dark:border-zinc-800/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                Tempo Médio
              </span>
              <div
                className="text-2xl font-black font-mono mt-0.5"
                style={{ color: accentConfig.primaryHex }}
              >
                5 min
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                síntese de alto rendimento
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. BARRA DE BUSCA E FILTRO DE ESSENCIAIS LOGO ACIMA DAS ESPECIALIDADES */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              mode === 'flashcards'
                ? 'Buscar flashcards por foco clínico, tema ou pergunta...'
                : 'Buscar resumos clínicos por tema, diretriz ou foco...'
            }
            className="w-full pl-10 pr-24 py-3 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800/80 text-xs sm:text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-700 shadow-xs transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {searchQuery && (
              <>
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 hidden sm:inline">
                  {totalMatchingFocosCount ?? 0} {totalMatchingFocosCount === 1 ? 'resultado' : 'resultados'}
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  title="Limpar busca"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {mode === 'flashcards' && (
          <button
            type="button"
            onClick={() => setFilterEssentialOnly((prev) => !prev)}
            className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer shadow-xs whitespace-nowrap shrink-0 active:scale-98 ${filterEssentialOnly
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20'
                : 'bg-white dark:bg-[#121215] border-slate-200 dark:border-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700'
              }`}
            title="Alternar entre ver todos os flashcards ou apenas os essenciais de alta incidência"
          >
            <Star className={`w-4 h-4 ${filterEssentialOnly ? 'fill-amber-500 text-amber-500' : 'text-zinc-400'}`} />
            <span>{filterEssentialOnly ? 'Filtro: Só Essenciais Ativo' : 'Filtrar Só Essenciais'}</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-amber-500/20 text-amber-900 dark:text-amber-200">
              {essentialCardsCount}
            </span>
          </button>
        )}
      </div>

      {/* 3. ESPECIALIDADES MÉDICAS EM CARDS (UM EMBAIXO DO OUTRO) */}
      {normalizedQuery && totalMatchingFocosCount === 0 ? (
        <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 space-y-3">
          <Search className="w-8 h-8 text-zinc-400 mx-auto" />
          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            Nenhum {mode === 'flashcards' ? 'flashcard' : 'resumo'} encontrado para &ldquo;{searchQuery}&rdquo;
          </p>
          <p className="text-xs text-zinc-500">
            Tente buscar por outro termo médico, foco clínico ou especialidade.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer hover:opacity-95 transition-all"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            Limpar busca
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {SPECIALTY_CONFIGS.map((spec) => {
            const hNode = clinicalHierarchy.find(
              (h) =>
                h.especialidade.toLowerCase() === spec.name.toLowerCase() ||
                (spec.name === 'Cirurgia Geral' && h.especialidade === 'Cirurgia') ||
                (spec.name === 'Cirurgia' && h.especialidade === 'Cirurgia')
            );

            const temasList = hNode?.temas || [];

            // Filtra temas que possuem focos correspondentes ou cujo tema dá match
            const filteredTemas = temasList
              .map((tem) => {
                const matchingFocos = tem.focos.filter((foc) =>
                  focoMatchesSearch(spec.name, tem.tema, foc.foco)
                );
                const isTemaMatch =
                  !normalizedQuery ||
                  normalizeText(tem.tema).includes(normalizedQuery) ||
                  matchingFocos.length > 0;
                return {
                  ...tem,
                  matchingFocos:
                    !normalizedQuery || normalizeText(tem.tema).includes(normalizedQuery)
                      ? tem.focos
                      : matchingFocos,
                  isTemaMatch
                };
              })
              .filter((tem) => tem.isTemaMatch && tem.matchingFocos.length > 0);

            if (normalizedQuery && filteredTemas.length === 0) {
              return null;
            }

            const isExpanded = normalizedQuery
              ? true
              : Boolean(expandedSpecialties[spec.name]);
            const isSpecSelected = selectedSpecialties.has(spec.name);
            const Icon = spec.icon;

            return (
              <div
                key={spec.id}
                className={`rounded-2xl border transition-all overflow-hidden ${isExpanded
                  ? 'bg-white dark:bg-[#121215] border-zinc-300 dark:border-zinc-700 shadow-sm'
                  : 'bg-white dark:bg-[#121215] border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
              >
                {/* Linha da Especialidade: Apenas Ícone + Nome (Sem texto embaixo, sem badge de contagem) */}
                <div
                  onClick={() => toggleSpecialtyExpand(spec.name)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none transition-colors hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Checkbox para selecionar especialidade inteira (multi-seleção) */}
                    {mode === 'flashcards' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSpecialtySelection(spec.name);
                        }}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${isSpecSelected
                          ? 'text-white shadow-2xs'
                          : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-400'
                          }`}
                        style={{
                          backgroundColor: isSpecSelected ? accentConfig.primaryHex : undefined,
                          borderColor: isSpecSelected ? accentConfig.primaryHex : undefined
                        }}
                      >
                        {isSpecSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    )}

                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${spec.bgLight} ${spec.bgDark} ${spec.borderLight} ${spec.borderDark} border`}
                    >
                      <Icon className={`w-5 h-5 ${spec.accentText}`} />
                    </div>

                    <h3 className="font-heading font-black text-base sm:text-lg text-zinc-900 dark:text-zinc-100 leading-tight truncate">
                      {spec.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Conteúdo Expandido da Especialidade: Temas e Focos */}
                {isExpanded && (
                  <div className="border-t border-zinc-100 dark:border-zinc-800 p-4 sm:p-5 bg-zinc-50/50 dark:bg-[#15151a]/50 space-y-2">
                    {filteredTemas.map((tem) => {
                      const temaKey = `${spec.name}:::${tem.tema}`;
                      const isTemaExpanded = normalizedQuery
                        ? true
                        : Boolean(expandedTemas[temaKey]);
                      const isTemaSelected = selectedTemas.has(temaKey);
                      const temaCards = getCardsForTema(spec.name, tem.tema);

                      return (
                        <div
                          key={tem.tema}
                          className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#121215] overflow-hidden"
                        >
                          {/* Linha do Tema */}
                          <div
                            onClick={() => toggleTemaExpand(spec.name, tem.tema)}
                            className={`p-3 flex items-center justify-between gap-3 transition-colors cursor-pointer select-none ${isTemaSelected
                              ? 'bg-zinc-100/90 dark:bg-zinc-800/80'
                              : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
                              }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {/* Checkbox para selecionar o Tema (Multi-seleção como nas questões) */}
                              {mode === 'flashcards' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleTemaSelection(spec.name, tem.tema);
                                  }}
                                  className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${isTemaSelected
                                    ? 'text-white shadow-2xs'
                                    : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-400'
                                    }`}
                                  style={{
                                    backgroundColor: isTemaSelected
                                      ? accentConfig.primaryHex
                                      : undefined,
                                    borderColor: isTemaSelected
                                      ? accentConfig.primaryHex
                                      : undefined
                                  }}
                                >
                                  {isTemaSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                </button>
                              )}

                              {/* Chevron para expandir Focos */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTemaExpand(spec.name, tem.tema);
                                }}
                                className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                              >
                                {isTemaExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5" />
                                )}
                              </button>

                              <span className="font-heading font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                                {tem.tema}
                              </span>
                            </div>

                            {/* Lado Direito do Tema: Apenas o Número (sem a palavra 'cards', sem botão play) */}
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="px-2 py-0.5 rounded-md text-xs font-mono font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800">
                                {mode === 'flashcards' ? temaCards.length : tem.matchingFocos.length}
                              </span>
                            </div>
                          </div>

                          {/* Focos do Tema (Em Resumos: 2 Colunas com Cards ricos como estava antes; Em Flashcards: checklist compacta) */}
                          {isTemaExpanded && tem.matchingFocos.length > 0 && (
                            mode === 'resumos' ? (
                              <div className="p-3 sm:p-5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/25">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                                  {tem.matchingFocos.map((foc) => {
                                    const existingMat =
                                      allStudyMaterials.find(
                                        (m) =>
                                          normalizeText(m.focus) === normalizeText(foc.foco) ||
                                          normalizeText(m.focus).includes(normalizeText(foc.foco)) ||
                                          normalizeText(foc.foco).includes(normalizeText(m.focus))
                                      ) ||
                                      allStudyMaterials.find(
                                        (m) => m.theme && normalizeText(m.theme) === normalizeText(tem.tema) && !m.focus
                                      );

                                    const focoCards = getCardsForFoco(
                                      spec.name,
                                      tem.tema,
                                      foc.foco
                                    );

                                    const snippet =
                                      existingMat?.summarySnippet ||
                                      `Síntese clínica e condutas padrão-ouro para ${foc.foco} nas principais bancas de residência médica.`;

                                    const keyPoints =
                                      existingMat?.keyPoints && existingMat.keyPoints.length > 0
                                        ? existingMat.keyPoints
                                        : [
                                          `Critérios diagnósticos, estratificação de gravidade e triagem.`,
                                          `Protocolos de conduta imediata e armadilhas de prova.`
                                        ];

                                    const readTime = existingMat?.readTimeMinutes || 5;
                                    const badgeText = existingMat?.guidelineBadge || 'Diretriz Oficial';

                                    return (
                                      <div
                                        key={foc.foco}
                                        className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800/90 shadow-xs flex flex-col justify-between space-y-3.5 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all group"
                                      >
                                        <div className="space-y-2.5">
                                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                            <span className="px-2 py-0.5 rounded-md font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] truncate max-w-[180px]">
                                              {tem.tema}
                                            </span>
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                                              <CheckCircle2 className="w-3 h-3" />
                                              <span>{badgeText}</span>
                                            </span>
                                          </div>

                                          <h4 className="text-sm sm:text-base font-heading font-black text-zinc-900 dark:text-zinc-100 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {foc.foco}
                                          </h4>

                                          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                            {snippet}
                                          </p>

                                          {keyPoints && keyPoints.length > 0 && (
                                            <div className="pt-0.5 space-y-1">
                                              {keyPoints.slice(0, 2).map((kp, idx) => (
                                                <div
                                                  key={idx}
                                                  className="flex items-start gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400"
                                                >
                                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1" />
                                                  <span className="truncate">{kp}</span>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>

                                        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs gap-2">
                                          <span className="flex items-center gap-1 text-zinc-400 text-[11px] shrink-0">
                                            <Clock className="w-3 h-3" />
                                            <span>{readTime} min de leitura</span>
                                          </span>

                                          <div className="flex items-center gap-2">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleOpenFocoSummary(
                                                  spec.name,
                                                  tem.tema,
                                                  foc.foco
                                                )
                                              }
                                              className="px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                                            >
                                              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                                              <span>Ler Resumo</span>
                                            </button>

                                            {focoCards.length > 0 && (
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleStartStudy(
                                                    focoCards,
                                                    `Prática: ${foc.foco}`
                                                  )
                                                }
                                                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer hover:opacity-95 transition-all inline-flex items-center gap-1.5"
                                                style={{ backgroundColor: accentConfig.primaryHex }}
                                                title={`Praticar ${focoCards.length} flashcards deste foco`}
                                              >
                                                <Play className="w-3 h-3 fill-current" />
                                                <span>Cards ({focoCards.length})</span>
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div className="pl-6 sm:pl-8 pr-3 py-2 space-y-1.5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30">
                                {tem.matchingFocos.map((foc) => {
                                  const focoKey = `${spec.name}:::${tem.tema}:::${foc.foco}`;
                                  const isFocoSelected = selectedFocos.has(focoKey);
                                  const focoCards = getCardsForFoco(
                                    spec.name,
                                    tem.tema,
                                    foc.foco
                                  );

                                  return (
                                    <div
                                      key={foc.foco}
                                      className={`p-2.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-[#121215] flex items-center justify-between gap-3 transition-colors ${isFocoSelected
                                        ? 'bg-zinc-100/90 dark:bg-zinc-800'
                                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/40'
                                        }`}
                                    >
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            toggleFocoSelection(
                                              spec.name,
                                              tem.tema,
                                              foc.foco
                                            )
                                          }
                                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${isFocoSelected
                                            ? 'text-white shadow-2xs'
                                            : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-400'
                                            }`}
                                          style={{
                                            backgroundColor: isFocoSelected
                                              ? accentConfig.primaryHex
                                              : undefined,
                                            borderColor: isFocoSelected
                                              ? accentConfig.primaryHex
                                              : undefined
                                          }}
                                        >
                                          {isFocoSelected && (
                                            <Check className="w-3 h-3 stroke-[3]" />
                                          )}
                                        </button>

                                        <span className="font-medium text-xs text-zinc-800 dark:text-zinc-200 truncate">
                                          {foc.foco}
                                        </span>
                                      </div>

                                      {/* No modo Flashcards: apenas o número de cards deste foco */}
                                      <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800">
                                          {focoCards.length}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )
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
      )}

      {/* 4. BARRA FLUTUANTE DE ESTUDO MULTI-SELEÇÃO (QUANDO ITENS SÃO SELECIONADOS) */}
      {mode === 'flashcards' && totalSelectionCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/95 dark:bg-zinc-800/95 text-white backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border border-zinc-700/60 flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-200 max-w-[90vw]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold whitespace-nowrap">
              {totalSelectionCount}{' '}
              {totalSelectionCount === 1 ? 'item selecionado' : 'itens selecionados'} •{' '}
              {selectedCardsList.length} flashcards
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearSelections}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Limpar
            </button>

            {selectedCardsList.some((c) => c.priority === 'essential') && (
              <button
                type="button"
                onClick={() =>
                  handleStartStudy(
                    selectedCardsList.filter((c) => c.priority === 'essential'),
                    `Essenciais Selecionados (${selectedCardsList.filter((c) => c.priority === 'essential').length} cards)`,
                    true
                  )
                }
                className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                title="Estudar somente os cards essenciais dos itens selecionados"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="hidden sm:inline">Só Essenciais</span>
                <span>({selectedCardsList.filter((c) => c.priority === 'essential').length})</span>
              </button>
            )}

            <button
              type="button"
              disabled={selectedCardsList.length === 0}
              onClick={() =>
                handleStartStudy(
                  selectedCardsList,
                  `Estudo Selecionado (${selectedCardsList.length} cards)`
                )
              }
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md cursor-pointer hover:opacity-95 transition-all inline-flex items-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Estudar Selecionados ({selectedCardsList.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. DRAWER CENTRAL TOTALMENTE ADAPTADO PARA ADICIONAR FLASHCARD */}
      {isAddCardDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-5 animate-in fade-in-50 zoom-in-95 duration-200 custom-scrollbar">
            {/* Topo do Drawer Central */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: accentConfig.primaryHex }}
                >
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
                    Adicionar Flashcard
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Crie um cartão de memorização ativa com suporte a oclusão Cloze.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddCardDrawerOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Toast de Sucesso Interno */}
            {addCardSuccessToast && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in-50 duration-200">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Flashcard adicionado com sucesso! Já está disponível para estudo.</span>
              </div>
            )}

            {/* Campos do Formulário do Flashcard */}
            <div className="space-y-4 text-xs">
              {/* Especialidade, Tema e Foco */}
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Especialidade *
                  </label>
                  <select
                    value={newCardSpecialty}
                    onChange={(e) => {
                      const spec = e.target.value;
                      setNewCardSpecialty(spec);
                      const hNode = clinicalHierarchy.find(
                        (h) =>
                          h.especialidade.toLowerCase() === spec.toLowerCase() ||
                          (spec === 'Cirurgia Geral' && h.especialidade === 'Cirurgia') ||
                          (spec === 'Cirurgia' && h.especialidade === 'Cirurgia')
                      );
                      const firstTema = hNode?.temas[0]?.tema || '';
                      setNewCardTema(firstTema);
                      setNewCardFoco(hNode?.temas[0]?.focos[0]?.foco || '');
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                  >
                    {SPECIALTY_CONFIGS.map((sp) => (
                      <option key={sp.id} value={sp.name}>
                        {sp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Tema *
                  </label>
                  <select
                    value={newCardTema}
                    onChange={(e) => {
                      const tem = e.target.value;
                      setNewCardTema(tem);
                      const temaObj = drawerTemas.find((t) => t.tema === tem);
                      setNewCardFoco(temaObj?.focos[0]?.foco || '');
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                  >
                    {drawerTemas.map((tem) => (
                      <option key={tem.tema} value={tem.tema}>
                        {tem.tema}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Foco Clínico
                  </label>
                  <select
                    value={newCardFoco}
                    onChange={(e) => setNewCardFoco(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                  >
                    {drawerFocos.map((foc) => (
                      <option key={foc} value={foc}>
                        {foc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Frente do Flashcard com Auxiliar de Cloze */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">
                    Frente do Cartão (Pergunta ou Oclusão Cloze) *
                  </label>
                  <button
                    type="button"
                    onClick={handleInsertCloze}
                    className="text-[11px] font-bold px-2 py-0.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    title="Selecione um termo no texto e clique para criar uma oclusão cloze"
                  >
                    <span>[ Inserir Cloze &#123;&#123;c1::...&#125;&#125; ]</span>
                  </button>
                </div>

                <textarea
                  ref={frontTextareaRef}
                  rows={3}
                  value={newCardFront}
                  onChange={(e) => setNewCardFront(e.target.value)}
                  placeholder="Ex: A ingestão de {{c1::bateria de disco}} no esôfago exige remoção endoscópica imediata."
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all font-mono text-xs sm:text-sm"
                />
              </div>

              {/* Verso do Flashcard (Resposta) */}
              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block">
                  Verso do Cartão (Resposta Direta) *
                </label>
                <input
                  type="text"
                  value={newCardBack}
                  onChange={(e) => setNewCardBack(e.target.value)}
                  placeholder="Ex: bateria de disco (ou remoção endoscópica imediata)"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all"
                />
              </div>

              {/* Comentário / Justificativa Clínica */}
              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block">
                  Justificativa Clínica & Armadilha de Prova (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={newCardComment}
                  onChange={(e) => setNewCardComment(e.target.value)}
                  placeholder="Ex: Necrose por liquefação em até 2 horas. No RX, o duplo contorno diferencia da moeda."
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all text-xs"
                />
              </div>

              {/* Prioridade e Tags */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setNewCardPriority((prev) =>
                      prev === 'essential' ? 'standard' : 'essential'
                    )
                  }
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl font-bold border transition-colors cursor-pointer ${newCardPriority === 'essential'
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                    : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                >
                  <Star
                    className={`w-3.5 h-3.5 ${newCardPriority === 'essential'
                      ? 'fill-amber-500 text-amber-500'
                      : 'text-zinc-400'
                      }`}
                  />
                  <span>Cartão Prioritário (Alta Relevância)</span>
                </button>

                <div className="relative flex-1 max-w-xs">
                  <Tag className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={newCardTags}
                    onChange={(e) => setNewCardTags(e.target.value)}
                    placeholder="Tags separadas por vírgula"
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Rodapé do Drawer Central */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsAddCardDrawerOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Fechar
              </button>

              <button
                type="button"
                disabled={!newCardFront.trim() || !newCardBack.trim()}
                onClick={() => handleSaveNewFlashcard(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                Salvar e Criar Outro
              </button>

              <button
                type="button"
                disabled={!newCardFront.trim() || !newCardBack.trim()}
                onClick={() => handleSaveNewFlashcard(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer hover:opacity-95 transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
                style={{ backgroundColor: accentConfig.primaryHex }}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Salvar Flashcard</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
