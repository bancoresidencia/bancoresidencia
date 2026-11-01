import {
  FlashcardItem,
  StudyMaterialItem,
  FlashcardRating,
  FlashcardProgress,
  CustomFlashcardDeck,
  LastFlashcardSessionInfo,
  LastReadSummaryInfo
} from '@/types/flashcards';
import { INITIAL_FLASHCARDS } from '@/data/flashcardsData';
import { INITIAL_STUDY_MATERIALS } from '@/data/studyMaterialsData';

const STORAGE_KEY = 'bancoresidencia_flashcards_progress_v1';
const LAST_SESSION_KEY = 'bancoresidencia_last_flashcard_session';
const LAST_SUMMARY_KEY = 'bancoresidencia_last_read_summary';
const CUSTOM_DECKS_KEY = 'bancoresidencia_custom_flashcard_decks';
const USER_FLASHCARDS_KEY = 'bancoresidencia_user_created_flashcards';

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
    const now = new Date().toISOString();
    const userCreated = this.loadUserCreatedFlashcards();
    const combined = [...userCreated, ...INITIAL_FLASHCARDS];

    let list = combined.map((card) => {
      const p = savedProgress[card.id];
      if (p) {
        return { ...card, progress: p };
      }
      return {
        ...card,
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
   * Salva a avaliação do aluno no algoritmo FSRS (Repetição Espaçada)
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

    const now = new Date();
    let { state, repetitions, intervalDays, easeFactor, lapses } = current;

    if (rating === 'again') {
      lapses += 1;
      repetitions = 0;
      intervalDays = 0; // repetir na mesma sessão ou em breve
      state = 'learning';
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    } else if (rating === 'hard') {
      repetitions += 1;
      intervalDays = intervalDays === 0 ? 1 : Math.max(1, Math.round(intervalDays * 1.2));
      state = 'review';
      easeFactor = Math.max(1.3, easeFactor - 0.15);
    } else if (rating === 'good') {
      repetitions += 1;
      if (intervalDays === 0) {
        intervalDays = 2;
      } else if (intervalDays === 1) {
        intervalDays = 3;
      } else {
        intervalDays = Math.round(intervalDays * easeFactor);
      }
      state = 'review';
    } else if (rating === 'easy') {
      repetitions += 1;
      if (intervalDays === 0) {
        intervalDays = 5;
      } else {
        intervalDays = Math.round(intervalDays * easeFactor * 1.3);
      }
      state = 'review';
      easeFactor = Math.min(3.0, easeFactor + 0.15);
    }

    const nextDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

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
      lapses
    };

    saved[cardId] = updatedProgress;
    this.saveProgressToStorage(saved);

    return updatedProgress;
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
    let list = [...INITIAL_STUDY_MATERIALS];

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
    const allCards = INITIAL_FLASHCARDS;
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
    const materials = INITIAL_STUDY_MATERIALS;
    // Tenta match exato ou parcial
    return materials.find(
      (m) =>
        m.focus.toLowerCase().includes(focusName.toLowerCase()) ||
        focusName.toLowerCase().includes(m.focus.toLowerCase()) ||
        (specialtyName && m.specialty === specialtyName)
    );
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
  }
};
