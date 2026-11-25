import {
  CustomFlashcardDeck,
  DynamicFilterCriterion,
  FlashcardItem
} from '@/types/flashcards';
import { calculateAnkiDeckCounts } from './ankiScheduler';
import { normalizeText } from './specialtyMatcher';
import { getFlashcardDepth } from './flashcardDistributionEngine';

export type AnkiDeckCounts = ReturnType<typeof calculateAnkiDeckCounts>;

export interface AnkiOriginalDeckNode {
  fullPath: string;
  label: string;
  depth: number;
  deck: CustomFlashcardDeck | null;
  directCards: FlashcardItem[];
  aggregatedCards: FlashcardItem[];
  counts: AnkiDeckCounts;
  children: AnkiOriginalDeckNode[];
}

export interface FlattenedDeckTreeNode {
  node: AnkiOriginalDeckNode;
  hasChildren: boolean;
  isExpanded: boolean;
}

/**
 * Divide um nome hierárquico de baralho no estilo Anki (`Pai::Filho::Neto`).
 */
export function parseDeckPathSegments(name: string): string[] {
  return String(name || '')
    .split('::')
    .map((seg) => seg.trim())
    .filter(Boolean);
}

function normalizeDeckPathKey(segments: string[]): string {
  return segments.map((s) => normalizeText(s)).join('::');
}

function buildSingleNodeRecursive(
  fullPath: string,
  label: string,
  depth: number,
  deck: CustomFlashcardDeck | null,
  cardsByDeckId: Map<string, FlashcardItem[]>,
  childBuilders: Map<string, InternalDeckNodeBuilder>,
  now: Date
): AnkiOriginalDeckNode {
  const directCards = deck ? cardsByDeckId.get(deck.id) || [] : [];
  const children = Array.from(childBuilders.values())
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
    .map((child) =>
      buildSingleNodeRecursive(
        child.fullPath,
        child.label,
        depth + 1,
        child.deck,
        cardsByDeckId,
        child.children,
        now
      )
    );

  const uniqueAggregated = new Map<string, FlashcardItem>();
  for (const c of directCards) {
    uniqueAggregated.set(c.id, c);
  }
  for (const child of children) {
    for (const c of child.aggregatedCards) {
      uniqueAggregated.set(c.id, c);
    }
  }
  const aggregatedCards = Array.from(uniqueAggregated.values());

  return {
    fullPath,
    label,
    depth,
    deck,
    directCards,
    aggregatedCards,
    counts: calculateAnkiDeckCounts(aggregatedCards, now),
    children
  };
}

interface InternalDeckNodeBuilder {
  normKey: string;
  fullPath: string;
  label: string;
  deck: CustomFlashcardDeck | null;
  children: Map<string, InternalDeckNodeBuilder>;
}

/**
 * Constrói a árvore hierárquica de baralhos autorais (`Pai::Filho`) com agregação Anki.
 * Mantém o "Baralho Padrão" (`deck-padrao`) fixado no topo da raiz.
 */
export function buildOriginalDeckTree(
  decks: CustomFlashcardDeck[],
  cards: FlashcardItem[],
  now: Date = new Date()
): AnkiOriginalDeckNode[] {
  const cardsByDeckId = new Map<string, FlashcardItem[]>();
  for (const card of cards) {
    const did = card.deckId || 'deck-padrao';
    const list = cardsByDeckId.get(did);
    if (list) list.push(card);
    else cardsByDeckId.set(did, [card]);
  }

  const defaultDeck = decks.find((d) => d.id === 'deck-padrao');
  const otherDecks = decks.filter((d) => d.id !== 'deck-padrao');

  const rootBuilders = new Map<string, InternalDeckNodeBuilder>();

  for (const deck of otherDecks) {
    const segments = parseDeckPathSegments(deck.name);
    const effectiveSegments = segments.length > 0 ? segments : [deck.name || 'Sem Nome'];

    let currentLevel = rootBuilders;
    const prefixSegments: string[] = [];

    for (let i = 0; i < effectiveSegments.length; i++) {
      const seg = effectiveSegments[i];
      prefixSegments.push(seg);
      const normKey = normalizeDeckPathKey(prefixSegments);
      const fullPath = prefixSegments.join('::');

      let builder = currentLevel.get(normKey);
      if (!builder) {
        builder = {
          normKey,
          fullPath,
          label: seg,
          deck: null,
          children: new Map()
        };
        currentLevel.set(normKey, builder);
      }

      if (i === effectiveSegments.length - 1) {
        builder.deck = deck;
      }

      currentLevel = builder.children;
    }
  }

  const result: AnkiOriginalDeckNode[] = [];

  if (defaultDeck) {
    const direct = cardsByDeckId.get(defaultDeck.id) || [];
    result.push({
      fullPath: 'deck-padrao',
      label: defaultDeck.name,
      depth: 0,
      deck: defaultDeck,
      directCards: direct,
      aggregatedCards: direct,
      counts: calculateAnkiDeckCounts(direct, now),
      children: []
    });
  }

  const sortedRoots = Array.from(rootBuilders.values()).sort((a, b) =>
    a.label.localeCompare(b.label, 'pt-BR')
  );

  for (const root of sortedRoots) {
    result.push(
      buildSingleNodeRecursive(
        root.fullPath,
        root.label,
        0,
        root.deck,
        cardsByDeckId,
        root.children,
        now
      )
    );
  }

  return result;
}

/**
 * Lineariza nós visíveis da árvore conforme o mapa de nós expandidos.
 */
export function flattenOriginalDeckTree(
  nodes: AnkiOriginalDeckNode[],
  expandedPaths: Record<string, boolean>
): FlattenedDeckTreeNode[] {
  const flat: FlattenedDeckTreeNode[] = [];

  const visit = (node: AnkiOriginalDeckNode) => {
    const hasChildren = node.children.length > 0;
    // Raiz com filhos abre fechada apenas se usuário colapsar explicitamente (true por padrão)
    const isExpanded = hasChildren
      ? expandedPaths[node.fullPath] !== undefined
        ? Boolean(expandedPaths[node.fullPath])
        : true
      : false;

    flat.push({ node, hasChildren, isExpanded });

    if (hasChildren && isExpanded) {
      for (const child of node.children) {
        visit(child);
      }
    }
  };

  for (const node of nodes) {
    visit(node);
  }

  return flat;
}

/**
 * Garante a existência dos baralhos correspondentes aos caminhos `Pai::Filho` importados
 * e retorna um mapa `caminhoOriginal -> deckId` + novos `CustomFlashcardDeck` criados.
 */
export function resolveOrCreateDeckHierarchy(
  deckPaths: string[],
  existingDecks: CustomFlashcardDeck[],
  nowIso: string = new Date().toISOString()
): {
  deckIdByPath: Map<string, string>;
  createdDecks: CustomFlashcardDeck[];
} {
  const deckIdByPath = new Map<string, string>();
  const createdDecks: CustomFlashcardDeck[] = [];
  const existingByNormName = new Map<string, CustomFlashcardDeck>();

  for (const d of existingDecks) {
    const norm = normalizeDeckPathKey(parseDeckPathSegments(d.name));
    if (norm) existingByNormName.set(norm, d);
  }

  let seq = 0;
  for (const rawPath of deckPaths) {
    const trimmed = String(rawPath || '').trim();
    if (!trimmed) continue;

    const segments = parseDeckPathSegments(trimmed);
    if (segments.length === 0) continue;

    const cleanFullPath = segments.join('::');
    const normKey = normalizeDeckPathKey(segments);

    if (normKey === normalizeText('Baralho Padrão') || normKey === normalizeText('Default')) {
      deckIdByPath.set(trimmed, 'deck-padrao');
      deckIdByPath.set(cleanFullPath, 'deck-padrao');
      continue;
    }

    const existing = existingByNormName.get(normKey);
    if (existing) {
      deckIdByPath.set(trimmed, existing.id);
      deckIdByPath.set(cleanFullPath, existing.id);
      continue;
    }

    seq += 1;
    const newDeck: CustomFlashcardDeck = {
      id: `deck-${Date.now()}-${seq}-${Math.random().toString(36).slice(2, 6)}`,
      name: cleanFullPath,
      description:
        segments.length > 1
          ? `Sub-baralho importado (${segments.join(' › ')})`
          : 'Baralho importado em Cartões Originais',
      specialties: [],
      createdAt: nowIso
    };

    existingByNormName.set(normKey, newDeck);
    createdDecks.push(newDeck);
    deckIdByPath.set(trimmed, newDeck.id);
    deckIdByPath.set(cleanFullPath, newDeck.id);
  }

  return { deckIdByPath, createdDecks };
}

/**
 * Avalia se um cartão satisfaz todos os critérios de filtro dinâmico (`Smart Deck` / barra de filtros).
 */
export function matchesDynamicFilterCriteria(
  card: FlashcardItem,
  filters: DynamicFilterCriterion[],
  decks: CustomFlashcardDeck[] = [],
  now: Date = new Date()
): boolean {
  if (!filters || filters.length === 0) return true;

  return filters.every((filter) => {
    if (filter.type === 'specialty') {
      return normalizeText(card.specialty).includes(normalizeText(filter.value));
    }
    if (filter.type === 'theme') {
      return normalizeText(card.theme).includes(normalizeText(filter.value));
    }
    if (filter.type === 'focus') {
      return normalizeText(card.focus).includes(normalizeText(filter.value));
    }
    if (filter.type === 'subfocus') {
      return card.subfocus ? normalizeText(card.subfocus).includes(normalizeText(filter.value)) : false;
    }
    if (filter.type === 'subSubfocus') {
      const ss = card.sub_subfocus || card.subSubfocus;
      return ss ? normalizeText(ss).includes(normalizeText(filter.value)) : false;
    }
    if (filter.type === 'deck') {
      const matchedDeck = decks.find((d) => d.name === filter.value || d.id === filter.value);
      const targetId = matchedDeck ? matchedDeck.id : filter.value;
      return (card.deckId || 'deck-padrao') === targetId;
    }
    if (filter.type === 'status') {
      const p = card.progress;
      if (filter.value === 'Para Revisar') {
        return Boolean(p && p.state === 'review' && p.nextReviewDate && new Date(p.nextReviewDate) <= now);
      }
      if (filter.value === 'Novos') {
        return !p || p.state === 'new';
      }
      if (filter.value === 'Em Aprendizado') {
        return Boolean(p && (p.state === 'learning' || p.state === 'relearning'));
      }
    }
    if (filter.type === 'depth') {
      const depth = getFlashcardDepth(card);
      if (filter.value === 'Estudo Detalhado') return depth === 'study';
      if (filter.value === 'Revisão Rápida') return depth === 'review';
    }
    if (filter.type === 'priority') {
      if (filter.value === 'Essenciais') return card.priority === 'essential';
      return card.priority !== 'essential';
    }
    if (filter.type === 'tag') {
      const cleanTag = filter.value.replace(/^#/, '').toLowerCase();
      return Boolean(card.tags && card.tags.some((t) => t.toLowerCase().includes(cleanTag)));
    }
    return true;
  });
}
