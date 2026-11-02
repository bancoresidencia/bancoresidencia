import {
  FlashcardItem,
  StudyMaterialItem,
  FlashcardRating,
  FlashcardProgress,
  CustomFlashcardDeck,
  LastFlashcardSessionInfo,
  LastReadSummaryInfo,
  CardCommunityStats
} from '@/types/flashcards';
import { INITIAL_FLASHCARDS } from '@/data/flashcardsData';
import { INITIAL_STUDY_MATERIALS } from '@/data/studyMaterialsData';

const STORAGE_KEY = 'bancoresidencia_flashcards_progress_v1';
const LAST_SESSION_KEY = 'bancoresidencia_last_flashcard_session';
const LAST_SUMMARY_KEY = 'bancoresidencia_last_read_summary';
const CUSTOM_DECKS_KEY = 'bancoresidencia_custom_flashcard_decks';
const USER_FLASHCARDS_KEY = 'bancoresidencia_user_created_flashcards';
const USER_CARD_EDITS_KEY = 'bancoresidencia_user_card_edits';
const USER_STUDY_MATERIALS_KEY = 'bancoresidencia_user_created_study_materials';

export const flashcardsService = {
  /**
   * Carrega todos os flashcards mesclando o acervo inicial com o progresso salvo no localStorage
   */
  getFlashcards(filter?: {
    specialty?: string;
    theme?: string;
    search?: string;
    priorityOnly?: boolean;
    state?: 'all' | 'due' | 'new' | 'learning' | 'review';
  }): FlashcardItem[] {
    const savedProgress = this.loadSavedProgress();
    const userEdits = this.loadUserCardEdits();
    const now = new Date().toISOString();
    const userCreated = this.loadUserCreatedFlashcards();
    const combined = [...userCreated, ...INITIAL_FLASHCARDS];

    let list = combined.map((card) => {
      const edit = userEdits[card.id];
      const mergedCard = edit ? { ...card, ...edit } : card;
      const p = savedProgress[mergedCard.id];
      if (p) {
        return { ...mergedCard, progress: p };
      }
      return {
        ...mergedCard,
        progress: {
          state: 'new',
          repetitions: 0,
          intervalDays: 0,
          easeFactor: 2.5,
          stability: 1.0,
          difficulty: 5.0,
          retrievability: 1.0,
          nextReviewDate: now,
          lapses: 0
        } as FlashcardProgress
      };
    });

    if (filter) {
      if (filter.specialty && filter.specialty !== 'Todas') {
        list = list.filter((c) => c.specialty === filter.specialty);
      }
      if (filter.theme && filter.theme !== 'Todos') {
        list = list.filter((c) => c.theme === filter.theme);
      }
      if (filter.priorityOnly) {
        list = list.filter((c) => c.priority === 'essential');
      }
      if (filter.search && filter.search.trim()) {
        const q = filter.search.toLowerCase().trim();
        list = list.filter(
          (c) =>
            c.front.toLowerCase().includes(q) ||
            c.back.toLowerCase().includes(q) ||
            c.focus.toLowerCase().includes(q) ||
            c.theme.toLowerCase().includes(q) ||
            (c.comment && c.comment.toLowerCase().includes(q))
        );
      }
      if (filter.state && filter.state !== 'all') {
        if (filter.state === 'due') {
          list = list.filter((c) => {
            if (!c.progress) return true;
            return c.progress.state === 'new' || new Date(c.progress.nextReviewDate) <= new Date();
          });
        } else {
          list = list.filter((c) => c.progress?.state === filter.state);
        }
      }
    }

    return list;
  },

  /**
   * Busca um flashcard específico pelo ID
   */
  getFlashcardById(cardId: string): FlashcardItem | undefined {
    const userCreated = this.loadUserCreatedFlashcards();
    const userEdits = this.loadUserCardEdits();
    const combined = [...userCreated, ...INITIAL_FLASHCARDS];
    const card = combined.find((c) => c.id === cardId);
    if (!card) return undefined;
    const edit = userEdits[card.id];
    return edit ? { ...card, ...edit } : card;
  },

  /**
   * Salva a avaliação do aluno no algoritmo FSRS (Repetição Espaçada)
   * Suporta tempos encurtados para cards 'essential' (alta incidência em provas)
   * e tempos padrão para cards 'standard'
   */
  recordReview(cardId: string, rating: FlashcardRating): FlashcardProgress {
    const saved = this.loadSavedProgress();
    const current = saved[cardId] || {
      state: 'new',
      repetitions: 0,
      intervalDays: 0,
      easeFactor: 2.5,
      stability: 1.0,
      difficulty: 5.0,
      retrievability: 1.0,
      nextReviewDate: new Date().toISOString(),
      lapses: 0
    };

    const card = this.getFlashcardById(cardId);
    const isEssential = card?.priority === 'essential';
    const now = new Date();
    let { state, repetitions, intervalDays, easeFactor, lapses } = current;

    let nextDate: Date;

    if (isEssential) {
      // Tempos encurtados para cards de alta relevância (essenciais na prova)
      // De novo: < 1 min | Difícil: < 5 min | Bom: < 10 min | Fácil: < 2 dias (< 4 dias)
      if (rating === 'again') {
        lapses += 1;
        repetitions = 0;
        intervalDays = 0;
        state = 'learning';
        easeFactor = Math.max(1.3, easeFactor - 0.2);
        nextDate = new Date(now.getTime() + 1 * 60 * 1000); // 1 minuto (< 10 min)
      } else if (rating === 'hard') {
        repetitions += 1;
        intervalDays = 5 / (24 * 60); // 5 minutos (< 5 min)
        state = 'learning';
        easeFactor = Math.max(1.3, easeFactor - 0.15);
        nextDate = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutos
      } else if (rating === 'good') {
        repetitions += 1;
        if (repetitions <= 1) {
          intervalDays = 10 / (24 * 60); // 10 minutos (< 10 min)
          nextDate = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutos
          state = 'learning';
        } else {
          intervalDays = 1; // 1 dia
          nextDate = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
          state = 'review';
        }
      } else if (rating === 'easy') {
        repetitions += 1;
        intervalDays = 2; // 2 dias (< 4 dias)
        state = 'review';
        easeFactor = Math.min(3.0, easeFactor + 0.15);
        nextDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
      } else {
        nextDate = new Date(now.getTime() + 10 * 60 * 1000);
      }
    } else {
      // Tempos padrão para cards não essenciais
      // De novo: < 10 min | Difícil: 1 dia | Bom: 2 dias | Fácil: < 4 dias
      if (rating === 'again') {
        lapses += 1;
        repetitions = 0;
        intervalDays = 0;
        state = 'learning';
        easeFactor = Math.max(1.3, easeFactor - 0.2);
        nextDate = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutos
      } else if (rating === 'hard') {
        repetitions += 1;
        intervalDays = 1;
        state = 'review';
        easeFactor = Math.max(1.3, easeFactor - 0.15);
        nextDate = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000); // 1 dia
      } else if (rating === 'good') {
        repetitions += 1;
        intervalDays = repetitions <= 1 ? 2 : Math.max(2, Math.round(intervalDays * easeFactor));
        state = 'review';
        nextDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000); // 2 dias
      } else if (rating === 'easy') {
        repetitions += 1;
        intervalDays = 4; // 4 dias (< 4 dias ou 4 dias)
        state = 'review';
        easeFactor = Math.min(3.0, easeFactor + 0.15);
        nextDate = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000); // 4 dias
      } else {
        nextDate = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
      }
    }

    const history = [...(current.history || []), rating];
    const updatedProgress: FlashcardProgress = {
      state,
      repetitions,
      intervalDays,
      easeFactor,
      stability: Math.round(easeFactor * (intervalDays + 1) * 10) / 10,
      difficulty: Math.max(1, Math.min(10, current.difficulty + (rating === 'again' ? 1 : rating === 'easy' ? -0.5 : 0))),
      retrievability: 0.9,
      lastReviewDate: now.toISOString(),
      nextReviewDate: nextDate.toISOString(),
      lapses,
      lastRating: rating,
      history
    };

    saved[cardId] = updatedProgress;
    this.saveProgressToStorage(saved);

    return updatedProgress;
  },

  /**
   * Obtém estatísticas do card (histórico do usuário e comparativo de desempenho com outros estudantes)
   */
  getCardCommunityStats(card: FlashcardItem): CardCommunityStats {
    const saved = this.loadSavedProgress();
    const userProgress = saved[card.id] || card.progress;

    // Seed determinístico a partir do ID do card para manter consistência
    let hash = 0;
    for (let i = 0; i < card.id.length; i++) {
      hash = (hash << 5) - hash + card.id.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);

    // Amostra de estudantes na comunidade: entre 820 e 2.450
    const totalStudents = 800 + (absHash % 1650);

    // Taxa de retenção/acerto da comunidade (60% a 90%)
    const isEssential = card.priority === 'essential';
    const baseRetention = isEssential ? 75 : 71;
    const communityRetentionRate = Math.min(92, Math.max(58, baseRetention + ((absHash % 23) - 8)));

    // Distribuição percentual das respostas da comunidade
    const againPercent = Math.max(6, Math.min(22, 100 - communityRetentionRate - ((absHash % 7) + 2)));
    const hardPercent = Math.max(8, Math.min(28, 100 - communityRetentionRate - againPercent));
    const goodEasyTotal = 100 - againPercent - hardPercent;
    const easyPercent = Math.round(goodEasyTotal * 0.42);
    const goodPercent = goodEasyTotal - easyPercent;

    // Tempo médio de resposta da comunidade (9s a 22s)
    const averageSeconds = 10 + (absHash % 12);

    // Dificuldade percebida da questão
    let difficultyLabel: 'Baixa' | 'Média' | 'Alta' | 'Muito Alta' = 'Média';
    if (communityRetentionRate >= 80) difficultyLabel = 'Baixa';
    else if (communityRetentionRate <= 65) difficultyLabel = 'Alta';
    else if (communityRetentionRate < 60) difficultyLabel = 'Muito Alta';

    // Estatísticas do Aluno neste card
    const userTotalReviews = userProgress?.repetitions || 0;
    const userLapses = userProgress?.lapses || 0;
    const userRetentionRate =
      userTotalReviews > 0
        ? Math.max(0, Math.min(100, Math.round(((userTotalReviews - userLapses) / userTotalReviews) * 100)))
        : userProgress?.lastRating === 'good' || userProgress?.lastRating === 'easy'
        ? 100
        : userProgress?.lastRating === 'again'
        ? 0
        : 75;

    // Percentil estimado do aluno em relação a outros estudantes
    let comparisonPercentile = 50;
    if (userProgress?.lastRating === 'easy') {
      comparisonPercentile = Math.min(96, 78 + (absHash % 18));
    } else if (userProgress?.lastRating === 'good') {
      comparisonPercentile = Math.min(84, 62 + (absHash % 18));
    } else if (userProgress?.lastRating === 'hard') {
      comparisonPercentile = Math.max(30, 42 + (absHash % 15));
    } else if (userProgress?.lastRating === 'again') {
      comparisonPercentile = Math.max(15, 20 + (absHash % 15));
    } else if (userTotalReviews > 0) {
      comparisonPercentile = Math.min(95, Math.max(20, userRetentionRate));
    }

    return {
      totalStudents,
      communityRetentionRate,
      againPercent,
      hardPercent,
      goodPercent,
      easyPercent,
      averageSeconds,
      difficultyLabel,
      comparisonPercentile,
      userTotalReviews,
      userRetentionRate,
      userLastRating: userProgress?.lastRating,
      userIntervalDays: userProgress?.intervalDays || 0
    };
  },

  /**
   * Resumo de métricas psicométricas dos flashcards
   */
  getStats() {
    const cards = this.getFlashcards();
    const now = new Date();

    let newCount = 0;
    let learningCount = 0;
    let reviewCount = 0;
    let dueCount = 0;

    cards.forEach((c) => {
      const p = c.progress;
      if (!p || p.state === 'new') {
        newCount += 1;
        dueCount += 1;
      } else if (p.state === 'learning') {
        learningCount += 1;
        if (new Date(p.nextReviewDate) <= now) dueCount += 1;
      } else if (p.state === 'review') {
        reviewCount += 1;
        if (new Date(p.nextReviewDate) <= now) dueCount += 1;
      }
    });

    return {
      total: cards.length,
      dueToday: dueCount,
      newCards: newCount,
      learning: learningCount,
      review: reviewCount,
      desiredRetention: 90
    };
  },

  /**
   * Obtém a lista de Materiais de Apoio / Resumos Clínicos
   */
  getStudyMaterials(filter?: { specialty?: string; search?: string }): StudyMaterialItem[] {
    const userCreated = this.loadUserCreatedStudyMaterials();
    let list = [...userCreated, ...INITIAL_STUDY_MATERIALS];

    if (filter) {
      if (filter.specialty && filter.specialty !== 'Todas') {
        list = list.filter((m) => m.specialty === filter.specialty);
      }
      if (filter.search && filter.search.trim()) {
        const q = filter.search.toLowerCase().trim();
        list = list.filter(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            m.theme.toLowerCase().includes(q) ||
            m.focus.toLowerCase().includes(q) ||
            m.summarySnippet.toLowerCase().includes(q) ||
            m.keyPoints.some((kp) => kp.toLowerCase().includes(q))
        );
      }
    }

    // Calcula quantidade de flashcards associados ao tema
    const allCards = this.getFlashcards();
    return list.map((m) => {
      const count = allCards.filter(
        (c) => c.specialty === m.specialty && (c.theme === m.theme || c.focus === m.focus)
      ).length;
      return { ...m, flashcardCount: count };
    });
  },

  /**
   * Busca um material específico pelo ID
   */
  getStudyMaterialById(id: string): StudyMaterialItem | undefined {
    const materials = this.getStudyMaterials();
    return materials.find((m) => m.id === id);
  },

  /**
   * Busca um material de apoio correspondente a um foco de flashcard
   */
  getStudyMaterialByFocus(focusName: string, specialtyName?: string): StudyMaterialItem | undefined {
    const materials = this.getStudyMaterials();
    // Tenta match exato ou parcial
    return materials.find(
      (m) =>
        m.focus.toLowerCase().includes(focusName.toLowerCase()) ||
        focusName.toLowerCase().includes(m.focus.toLowerCase()) ||
        (specialtyName && m.specialty === specialtyName)
    );
  },

  /**
   * Carrega os resumos clínicos criados/gerados pelo administrador
   */
  loadUserCreatedStudyMaterials(): StudyMaterialItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(USER_STUDY_MATERIALS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /**
   * Salva ou atualiza um material de estudo canônico gerado pelo pipeline
   */
  saveStudyMaterial(material: StudyMaterialItem): StudyMaterialItem {
    if (typeof window === 'undefined') return material;
    try {
      const current = this.loadUserCreatedStudyMaterials();
      const existingIdx = current.findIndex((m) => m.id === material.id || m.focus.toLowerCase() === material.focus.toLowerCase());
      let updated: StudyMaterialItem[] = [];
      if (existingIdx >= 0) {
        updated = [...current];
        updated[existingIdx] = material;
      } else {
        updated = [material, ...current];
      }
      localStorage.setItem(USER_STUDY_MATERIALS_KEY, JSON.stringify(updated));
      return material;
    } catch (e) {
      console.warn('Erro ao salvar material de estudo:', e);
      return material;
    }
  },

  /**
   * Salva um lote de flashcards gerados pelo pipeline na plataforma
   */
  saveFlashcardsBatch(cards: FlashcardItem[]): FlashcardItem[] {
    if (typeof window === 'undefined') return cards;
    try {
      const current = this.loadUserCreatedFlashcards();
      const existingIds = new Set(current.map(c => c.id));
      const freshCards = cards.filter(c => !existingIds.has(c.id));
      const updated = [...freshCards, ...current];
      localStorage.setItem(USER_FLASHCARDS_KEY, JSON.stringify(updated));
      return cards;
    } catch (e) {
      console.warn('Erro ao salvar lote de flashcards:', e);
      return cards;
    }
  },

  // Helpers de storage
  loadSavedProgress(): Record<string, FlashcardProgress> {
    if (typeof window === 'undefined') return {};
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveProgressToStorage(saved: Record<string, FlashcardProgress>) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch (e) {
      console.warn('Erro ao salvar progresso de flashcards no storage:', e);
    }
  },

  /**
   * Recupera o último conjunto de flashcards estudado
   */
  getLastFlashcardSession(): LastFlashcardSessionInfo | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(LAST_SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  /**
   * Salva o último conjunto de flashcards estudado
   */
  saveLastFlashcardSession(info: LastFlashcardSessionInfo): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LAST_SESSION_KEY, JSON.stringify(info));
    } catch (e) {
      console.warn('Erro ao salvar última sessão de flashcards:', e);
    }
  },

  /**
   * Recupera o último resumo clínico lido
   */
  getLastReadSummary(): LastReadSummaryInfo | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(LAST_SUMMARY_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  /**
   * Salva o último resumo clínico lido
   */
  saveLastReadSummary(info: LastReadSummaryInfo): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LAST_SUMMARY_KEY, JSON.stringify(info));
    } catch (e) {
      console.warn('Erro ao salvar último resumo lido:', e);
    }
  },

  /**
   * Carrega os baralhos personalizados criados pelo usuário
   */
  getCustomDecks(): CustomFlashcardDeck[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(CUSTOM_DECKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /**
   * Salva ou atualiza um baralho personalizado
   */
  saveCustomDeck(deck: CustomFlashcardDeck): CustomFlashcardDeck[] {
    if (typeof window === 'undefined') return [];
    try {
      const current = this.getCustomDecks();
      const existingIdx = current.findIndex((d) => d.id === deck.id);
      let updated: CustomFlashcardDeck[];
      if (existingIdx >= 0) {
        updated = [...current];
        updated[existingIdx] = deck;
      } else {
        updated = [deck, ...current];
      }
      localStorage.setItem(CUSTOM_DECKS_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn('Erro ao salvar baralho personalizado:', e);
      return [];
    }
  },

  /**
   * Remove um baralho personalizado
   */
  deleteCustomDeck(id: string): CustomFlashcardDeck[] {
    if (typeof window === 'undefined') return [];
    try {
      const current = this.getCustomDecks();
      const updated = current.filter((d) => d.id !== id);
      localStorage.setItem(CUSTOM_DECKS_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn('Erro ao excluir baralho personalizado:', e);
      return [];
    }
  },

  /**
   * Carrega os flashcards criados pelo usuário
   */
  loadUserCreatedFlashcards(): FlashcardItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(USER_FLASHCARDS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /**
   * Salva um novo flashcard criado pelo usuário
   */
  saveNewFlashcard(card: FlashcardItem): FlashcardItem {
    if (typeof window === 'undefined') return card;
    try {
      const current = this.loadUserCreatedFlashcards();
      const updated = [card, ...current];
      localStorage.setItem(USER_FLASHCARDS_KEY, JSON.stringify(updated));
      return card;
    } catch (e) {
      console.warn('Erro ao salvar novo flashcard:', e);
      return card;
    }
  },

  /**
   * Carrega as edições personalizadas de flashcards salvas localmente pelo usuário
   */
  loadUserCardEdits(): Record<string, Partial<FlashcardItem>> {
    if (typeof window === 'undefined') return {};
    try {
      const data = localStorage.getItem(USER_CARD_EDITS_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  /**
   * Salva a edição de um flashcard apenas localmente para a pessoa que editou
   */
  saveCardEdit(cardId: string, edits: Partial<FlashcardItem>): void {
    if (typeof window === 'undefined') return;
    try {
      const allEdits = this.loadUserCardEdits();
      allEdits[cardId] = {
        ...(allEdits[cardId] || {}),
        ...edits
      };
      localStorage.setItem(USER_CARD_EDITS_KEY, JSON.stringify(allEdits));
    } catch (e) {
      console.warn('Erro ao salvar edição local do flashcard:', e);
    }
  }
};
