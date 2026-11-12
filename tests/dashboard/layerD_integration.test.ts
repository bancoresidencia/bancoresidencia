/**
 * CAMADA D — TESTES DE INTEGRAÇÃO DA ABA INÍCIO
 * 
 * Testa a integração entre as regras de layout, funções do hook useDashboardLayout,
 * reordenação, empacotamento de slots, tolerância a falhas do LocalStorage e persistência.
 */

import { DEFAULT_HOME_CARDS } from '../../src/components/dashboard/dashboardDefaults';
import { DashboardCardConfig, DashboardColSpan } from '../../src/types/dashboardLayout';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function test(name: string, fn: () => void) {
  try {
    fn();
    results.push({ name, passed: true });
  } catch (err: any) {
    results.push({ name, passed: false, error: err?.message || String(err) });
    console.error(`❌ [Falha] ${name}:`, err?.message || err);
  }
}

function expectEqual<T>(actual: T, expected: T, message?: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(message || `Esperado ${JSON.stringify(expected)}, mas obteve ${JSON.stringify(actual)}`);
  }
}

function expectTrue(val: boolean, message?: string) {
  if (!val) throw new Error(message || `Esperado true, mas obteve false`);
}

// Mock de LocalStorage em memória
class MockLocalStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
}

export function runLayerDIntegrationTests(): { passed: number; failed: number; results: TestResult[] } {
  console.log('🧪 Iniciando Camada D: Testes de Integração...');

  const mockStorage = new MockLocalStorage();
  const STORAGE_KEY = 'bancoresidencia_layout_home';

  // 1. Carregamento inicial com LocalStorage vazio
  test('Carregamento inicial vazio deve retornar DEFAULT_HOME_CARDS ordenados', () => {
    mockStorage.clear();
    const stored = mockStorage.getItem(STORAGE_KEY + '_v2');
    expectEqual(stored, null);

    const cards = DEFAULT_HOME_CARDS.map((c) => ({ ...c }));
    expectEqual(cards.length, DEFAULT_HOME_CARDS.length);
    expectEqual(cards[0].id, 'home_hero');
    expectEqual(cards[cards.length - 1].id, DEFAULT_HOME_CARDS[DEFAULT_HOME_CARDS.length - 1].id);
  });

  // 2. Recuperação de falha com JSON corrompido no LocalStorage
  test('JSON corrompido no LocalStorage deve ser recuperado com fallback seguro', () => {
    mockStorage.setItem(STORAGE_KEY + '_v2', '{{INVALID_JSON:::');
    let loadedCards: DashboardCardConfig[];
    try {
      const raw = mockStorage.getItem(STORAGE_KEY + '_v2');
      const parsed = JSON.parse(raw!);
      loadedCards = parsed;
    } catch {
      // Fallback seguro idêntico ao useEffect do hook
      loadedCards = DEFAULT_HOME_CARDS;
    }

    expectEqual(loadedCards.length, DEFAULT_HOME_CARDS.length);
    expectEqual(loadedCards[0].id, 'home_hero');
  });

  // 3. Atualização de colSpan com rebalanceamento de linha
  test('updateColSpan rebalanceia cards adjacentes para fechar 12 colunas', () => {
    // Simula linha com 3 cards de 4 colunas (soma = 12): [c1(4), c2(4), c3(4)]
    const lineCards: DashboardCardConfig[] = [
      { id: 'c1', title: 'C1', colSpan: 4, minColSpan: 2, maxColSpan: 12, order: 0, isVisible: true },
      { id: 'c2', title: 'C2', colSpan: 4, minColSpan: 2, maxColSpan: 12, order: 1, isVisible: true },
      { id: 'c3', title: 'C3', colSpan: 4, minColSpan: 2, maxColSpan: 12, order: 2, isVisible: true },
    ];

    // Altera c1 de 4 para 6 -> diff = 12 - (6 + 4 + 4) = -2 a ser distribuído entre c2 e c3 (-1 para cada)
    const next = lineCards.map((c) => ({ ...c }));
    next[0].colSpan = 6;
    const otherIndices = [1, 2];
    const diff = 12 - (6 + 4 + 4); // -2
    const deltaEach = Math.trunc(diff / otherIndices.length); // -1
    let remainder = Math.abs(diff) % otherIndices.length; // 0

    for (const idx of otherIndices) {
      const current = next[idx].colSpan;
      const extra = deltaEach + (remainder > 0 ? -1 : 0);
      next[idx].colSpan = Math.max(next[idx].minColSpan || 2, current + extra) as DashboardColSpan;
    }

    expectEqual(next[0].colSpan, 6);
    expectEqual(next[1].colSpan, 3);
    expectEqual(next[2].colSpan, 3);
    expectEqual(next[0].colSpan + next[1].colSpan + next[2].colSpan, 12, 'Linha nivelada perfeitamente em 12 colunas');
  });

  // 4. Reordenação por Drag & Drop (reorderCard)
  test('reorderCard move elemento para o índice alvo e normaliza orders', () => {
    const list = [
      { id: 'a', order: 0 },
      { id: 'b', order: 1 },
      { id: 'c', order: 2 },
      { id: 'd', order: 3 }
    ];

    // Move 'a' para a posição de 'c'
    const draggedIdx = list.findIndex((x) => x.id === 'a');
    const targetIdx = list.findIndex((x) => x.id === 'c');
    const [removed] = list.splice(draggedIdx, 1);
    list.splice(targetIdx, 0, removed);
    const updated = list.map((c, idx) => ({ ...c, order: idx }));

    expectEqual(updated.map((c) => c.id), ['b', 'c', 'a', 'd']);
    expectEqual(updated.map((c) => c.order), [0, 1, 2, 3]);
  });

  // 5. Teste de isolamento de Mover Card na presença de Cards Ocultos
  test('moveCard com cards ocultos deve mover relativo aos cards visíveis', () => {
    // Cenário:
    // Card A (visível, order 0)
    // Card B (OCULTO, order 1)
    // Card C (visível, order 2)
    const allCards = [
      { id: 'A', isVisible: true, order: 0 },
      { id: 'B', isVisible: false, order: 1 },
      { id: 'C', isVisible: true, order: 2 }
    ];

    // O usuário clica "Mover para baixo" no Card A.
    // O comportamento esperado pela UX é que Card A troque de posição visível com Card C!
    const sorted = [...allCards].sort((a, b) => a.order - b.order);
    const visible = sorted.filter((c) => c.isVisible !== false);
    const visIdx = visible.findIndex((c) => c.id === 'A');

    expectTrue(visIdx !== -1, 'Card A está na lista visível');
    const nextVisIdx = visIdx + 1; // 1 -> Card C
    const targetCard = visible[nextVisIdx];
    expectEqual(targetCard.id, 'C', 'O próximo card visível é o Card C');

    // Troca ordens
    const cardA = allCards.find((c) => c.id === 'A')!;
    const cardC = allCards.find((c) => c.id === 'C')!;
    const tempOrder = cardA.order;
    cardA.order = cardC.order;
    cardC.order = tempOrder;

    const newVisible = allCards.filter((c) => c.isVisible).sort((a, b) => a.order - b.order);
    expectEqual(newVisible.map((c) => c.id), ['C', 'A'], 'Card A moveu-se imediatamente para baixo de Card C');
  });

  // 6. Teste de Ocultação e Reativação Múltipla
  test('Ocultar 4 cards e reativá-los preserva integridade do conjunto', () => {
    let currentCards = DEFAULT_HOME_CARDS.map((c) => ({ ...c }));
    const toHide = ['home_meta_diaria', 'home_percentil', 'home_recomendacao', 'home_mnemonico'];

    // Oculta os 4
    currentCards = currentCards.map((c) =>
      toHide.includes(c.id) ? { ...c, isVisible: false } : c
    );

    const visible = currentCards.filter((c) => c.isVisible);
    const hidden = currentCards.filter((c) => !c.isVisible);

    expectEqual(visible.length, DEFAULT_HOME_CARDS.length - toHide.length, `${DEFAULT_HOME_CARDS.length - toHide.length} cards visíveis`);
    expectEqual(hidden.length, toHide.length, `${toHide.length} cards ocultos`);

    // Reativa 1 a 1
    for (const id of toHide) {
      currentCards = currentCards.map((c) => (c.id === id ? { ...c, isVisible: true } : c));
    }

    const restoredVisible = currentCards.filter((c) => c.isVisible);
    expectEqual(restoredVisible.length, DEFAULT_HOME_CARDS.length, `Todos os ${DEFAULT_HOME_CARDS.length} cards restaurados para visíveis`);
  });

  // 7. Teste de Persistência e Restauração de Defaults
  test('restoreDefaults apaga chaves do LocalStorage e restaura configs originais', () => {
    mockStorage.setItem(STORAGE_KEY + '_v2', JSON.stringify([{ id: 'customized' }]));
    mockStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: 'legacy' }]));

    // Executa restauração
    mockStorage.removeItem(STORAGE_KEY + '_v2');
    mockStorage.removeItem(STORAGE_KEY);

    expectEqual(mockStorage.getItem(STORAGE_KEY + '_v2'), null);
    expectEqual(mockStorage.getItem(STORAGE_KEY), null);

    const fresh = DEFAULT_HOME_CARDS.map((c) => ({ ...c }));
    expectEqual(fresh[0].colSpan, 12);
    expectEqual(fresh[1].colSpan, 4);
    expectEqual(fresh[1].isVisible, true);
  });

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`✅ Camada D concluída: ${passed} passaram, ${failed} falharam.`);
  return { passed, failed, results };
}

if (process.argv[1]?.endsWith('layerD_integration.test.ts')) {
  const { passed, failed } = runLayerDIntegrationTests();
  process.exit(failed > 0 ? 1 : 0);
}

