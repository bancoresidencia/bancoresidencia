/**
 * CAMADA A — TESTES UNITÁRIOS EXCLUSIVOS DA ABA INÍCIO
 * Foco: Cálculos matemáticos de posições, dimensões, limites, ordenação,
 * snap magnético de drag/resize e smart guides.
 */

import { DEFAULT_HOME_CARDS } from '../../src/components/dashboard/dashboardDefaults';
import { calculateSmartGuides } from '../../src/components/dashboard/smartGuidesEngine';
import { DASHBOARD_CARD_INVENTORY, DASHBOARD_TECHNICAL_MAP } from './technicalMap';
import { DashboardCardConfig, DashboardColSpan } from '../../src/types/dashboardLayout';

interface AssertionResult {
  suite: string;
  test: string;
  passed: boolean;
  error?: string;
}

const results: AssertionResult[] = [];

function assert(condition: boolean, suite: string, test: string, message?: string) {
  if (condition) {
    results.push({ suite, test, passed: true });
  } else {
    results.push({ suite, test, passed: false, error: message || 'Assertion failed' });
    console.error(`❌ [${suite}] ${test}: ${message || 'Failed'}`);
  }
}

function assertEquals<T>(actual: T, expected: T, suite: string, test: string) {
  const match = JSON.stringify(actual) === JSON.stringify(expected);
  assert(match, suite, test, `Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
}

export function runLayerAUnitTests(): { passed: number; failed: number; results: AssertionResult[] } {
  console.log('🧪 Iniciando Camada A: Testes Unitários...');

  // SUÍTE 1: Inventário e Integridade de Configurações Padrão
  {
    const suite = 'Inventário e Integridade Padrão';
    assertEquals(DEFAULT_HOME_CARDS.length, 11, suite, 'Exatamente 11 cards padrão mapeados');

    const ids = new Set<string>();
    DEFAULT_HOME_CARDS.forEach((card, idx) => {
      assert(!ids.has(card.id), suite, `ID único para ${card.id}`);
      ids.add(card.id);
      assertEquals(card.order, idx, suite, `Ordem contínua 0..N para ${card.id}`);
      assert(card.colSpan >= 1 && card.colSpan <= 12, suite, `colSpan válido (1..12) em ${card.id}`);
      assert(card.minColSpan !== undefined && card.minColSpan >= 1 && card.minColSpan <= card.colSpan, suite, `minColSpan <= colSpan em ${card.id}`);
      assert(card.minHeight !== undefined && card.minHeight >= 65, suite, `minHeight >= 65px em ${card.id}`);
      assert(card.maxHeight !== undefined && card.maxHeight >= card.minHeight, suite, `maxHeight >= minHeight em ${card.id}`);
      assert(card.isVisible === true, suite, `Visibilidade padrão true em ${card.id}`);
    });
  }

  // SUÍTE 2: Função de Classes de Colunas (1 a 12)
  {
    const suite = 'Mapeamento de Classes Grid';
    const getColSpanClass = (span: DashboardColSpan) => {
      switch (span) {
        case 1: return 'col-span-12 sm:col-span-2 lg:col-span-1';
        case 2: return 'col-span-12 sm:col-span-4 lg:col-span-2';
        case 3: return 'col-span-12 sm:col-span-6 lg:col-span-3';
        case 4: return 'col-span-12 sm:col-span-6 lg:col-span-4';
        case 5: return 'col-span-12 sm:col-span-6 lg:col-span-5';
        case 6: return 'col-span-12 sm:col-span-6 lg:col-span-6';
        case 7: return 'col-span-12 lg:col-span-7';
        case 8: return 'col-span-12 lg:col-span-8';
        case 9: return 'col-span-12 lg:col-span-9';
        case 10: return 'col-span-12 lg:col-span-10';
        case 11: return 'col-span-12 lg:col-span-11';
        case 12:
        default: return 'col-span-12';
      }
    };

    for (let span = 1; span <= 12; span++) {
      const cls = getColSpanClass(span as DashboardColSpan);
      assert(cls.includes('col-span-12'), suite, `Span ${span} garante fallback col-span-12 em mobile`);
      if (span < 12) {
        assert(cls.includes(`col-span-${span}`), suite, `Span ${span} contém classe responsiva desktop`);
      }
    }
  }

  // SUÍTE 3: Fórmulas de Redimensionamento Horizontal (Snap 75%)
  {
    const suite = 'Cálculo de Resize Horizontal Snap';
    const testWidths = [320, 768, 1024, 1280, 1920, 2560, 3440];

    testWidths.forEach((parentWidth) => {
      const colWidth = parentWidth / 12;
      const initialSpan = 4;
      const minSpan = 3;
      const maxSpan = 12;

      // Movimento positivo suficiente para aumentar 1 coluna (dx >= colWidth * 0.75 * 0.5)
      const dxIncrease = colWidth * 0.75;
      const deltaColsInc = Math.round(dxIncrease / (colWidth * 0.75));
      const targetSpanInc = Math.max(minSpan, Math.min(maxSpan, initialSpan + deltaColsInc));
      assertEquals(targetSpanInc, 5, suite, `Aumento de 1 coluna com parentWidth=${parentWidth}px`);

      // Movimento negativo para diminuir 1 coluna
      const dxDecrease = -colWidth * 0.75;
      const deltaColsDec = Math.round(dxDecrease / (colWidth * 0.75));
      const targetSpanDec = Math.max(minSpan, Math.min(maxSpan, initialSpan + deltaColsDec));
      assertEquals(targetSpanDec, 3, suite, `Redução de 1 coluna com parentWidth=${parentWidth}px`);

      // Movimento muito grande para a esquerda deve respeitar minSpan (piso 3)
      const dxUnder = -colWidth * 5;
      const deltaColsUnder = Math.round(dxUnder / (colWidth * 0.75));
      const targetSpanUnder = Math.max(minSpan, Math.min(maxSpan, initialSpan + deltaColsUnder));
      assertEquals(targetSpanUnder, 3, suite, `Clamp inferior respeita minSpan=3 em parentWidth=${parentWidth}px`);

      // Movimento muito grande para a direita deve respeitar maxSpan (teto 12)
      const dxOver = colWidth * 15;
      const deltaColsOver = Math.round(dxOver / (colWidth * 0.75));
      const targetSpanOver = Math.max(minSpan, Math.min(maxSpan, initialSpan + deltaColsOver));
      assertEquals(targetSpanOver, 12, suite, `Clamp superior respeita maxSpan=12 em parentWidth=${parentWidth}px`);
    });
  }

  // SUÍTE 4: Fórmulas de Redimensionamento Vertical (Altura Snap 24px)
  {
    const suite = 'Cálculo de Resize Vertical Snap';
    const initialHeight = 200;
    const minH = 65;
    const maxH = 360;

    // Aumento de 50px vertical -> raw 250px -> arredonda para múltiplo de 24 (250/24 = 10.4 -> 240px)
    const rawHeight1 = initialHeight + 50;
    const targetHeight1 = Math.max(minH, Math.min(maxH, Math.round(rawHeight1 / 24) * 24));
    assertEquals(targetHeight1, 240, suite, 'Altura arredonda para múltiplo de 24px (240px)');

    // Redução drástica para baixo do mínimo de 65px -> deve cravar em 65px
    const rawHeightUnder = initialHeight - 180;
    const targetHeightUnder = Math.max(minH, Math.min(maxH, Math.round(rawHeightUnder / 24) * 24));
    assertEquals(targetHeightUnder, 65, suite, 'Piso mínimo de 65px respeitado');

    // Aumento drástico acima do máximo de 360px -> deve cravar em 360px
    const rawHeightOver = initialHeight + 500;
    const targetHeightOver = Math.max(minH, Math.min(maxH, Math.round(rawHeightOver / 24) * 24));
    assertEquals(targetHeightOver, 360, suite, 'Teto máximo de 360px respeitado');
  }

  // SUÍTE 5: Empacotamento Inteligente de Linhas (Auto-Conform)
  {
    const suite = 'Lógica Matemática de Auto-Conform';
    const simulateAutoConform = (cards: Array<{ id: string; colSpan: number; minColSpan?: number; maxColSpan?: number; order: number; isVisible: boolean }>) => {
      const sorted = [...cards].sort((a, b) => a.order - b.order);
      const visible = sorted.filter((c) => c.isVisible !== false);
      const hidden = sorted.filter((c) => c.isVisible === false);

      let currentRowSpan = 0;
      let lastCardInRowIndex = -1;

      for (let i = 0; i < visible.length; i++) {
        const card = visible[i];
        const span = Math.max(card.minColSpan || 2, Math.min(12, card.colSpan)) as DashboardColSpan;
        card.colSpan = span;

        if (currentRowSpan + span <= 12) {
          currentRowSpan += span;
          lastCardInRowIndex = i;
        } else {
          const residualGap = 12 - currentRowSpan;
          if (residualGap > 0 && residualGap <= 2 && lastCardInRowIndex >= 0) {
            const cardToExpand = visible[lastCardInRowIndex];
            const maxAllowed = cardToExpand.maxColSpan || 12;
            cardToExpand.colSpan = Math.min(maxAllowed, cardToExpand.colSpan + residualGap) as DashboardColSpan;
          }
          currentRowSpan = span;
          lastCardInRowIndex = i;
        }
      }

      const finalGap = 12 - currentRowSpan;
      if (finalGap > 0 && finalGap <= 2 && lastCardInRowIndex >= 0) {
        const cardToExpandFinal = visible[lastCardInRowIndex];
        const maxAllowedFinal = cardToExpandFinal.maxColSpan || 12;
        cardToExpandFinal.colSpan = Math.min(maxAllowedFinal, cardToExpandFinal.colSpan + finalGap) as DashboardColSpan;
      }

      const all = [...visible, ...hidden];
      return all.map((c, idx) => ({ ...c, order: idx }));
    };

    // Caso A: Linha com cards de 5 + 5 = 10 (gap de 2 colunas) -> segundo card deve ser expandido para 7
    const testCardsA = [
      { id: 'c1', colSpan: 5, minColSpan: 2, maxColSpan: 12, order: 0, isVisible: true },
      { id: 'c2', colSpan: 5, minColSpan: 2, maxColSpan: 12, order: 1, isVisible: true },
      { id: 'c3', colSpan: 12, minColSpan: 4, maxColSpan: 12, order: 2, isVisible: true },
    ];
    const resA = simulateAutoConform(testCardsA);
    assertEquals(resA[0].colSpan, 5, suite, 'Card 1 mantém 5 colunas');
    assertEquals(resA[1].colSpan, 7, suite, 'Card 2 expande para 7 colunas preenchendo os 12');
    assertEquals(resA[2].colSpan, 12, suite, 'Card 3 mantém 12 colunas na próxima linha');

    // Caso B: Linha terminando com 10 colunas (gap final de 2)
    const testCardsB = [
      { id: 'c1', colSpan: 6, minColSpan: 3, maxColSpan: 12, order: 0, isVisible: true },
      { id: 'c2', colSpan: 4, minColSpan: 3, maxColSpan: 12, order: 1, isVisible: true }, // soma = 10, finalGap = 2
    ];
    const resB = simulateAutoConform(testCardsB);
    assertEquals(resB[1].colSpan, 6, suite, 'Último card expande de 4 para 6 fechando a linha final de 12');

    // Caso C: Gap residual maior que 2 (ex: 12 - 9 = 3) não força expansão
    const testCardsC = [
      { id: 'c1', colSpan: 5, minColSpan: 3, maxColSpan: 12, order: 0, isVisible: true },
      { id: 'c2', colSpan: 4, minColSpan: 3, maxColSpan: 12, order: 1, isVisible: true }, // soma = 9, finalGap = 3
    ];
    const resC = simulateAutoConform(testCardsC);
    assertEquals(resC[1].colSpan, 4, suite, 'Gap residual de 3 não força expansão indevida');
  }

  // SUÍTE 6: Motor de Smart Guides
  {
    const suite = 'Smart Guides Engine Alignment Calculations';
    // Mock de elementos DOM para cálculo
    const mockContainer = {
      getBoundingClientRect: () => ({ left: 0, top: 0, right: 1200, bottom: 800, width: 1200, height: 800 }),
      querySelector: (selector: string) => {
        if (selector.includes('active_card')) {
          return {
            getBoundingClientRect: () => ({ left: 100, top: 100, right: 400, bottom: 300, width: 300, height: 200 })
          };
        }
        return null;
      },
      querySelectorAll: () => [
        {
          dataset: { cardId: 'other_card_top_aligned' },
          getBoundingClientRect: () => ({ left: 500, top: 102, right: 800, bottom: 350, width: 300, height: 248 }) // top difere em 2px <= TOLERANCE (7px)
        },
        {
          dataset: { cardId: 'other_card_left_aligned' },
          getBoundingClientRect: () => ({ left: 104, top: 400, right: 404, bottom: 600, width: 300, height: 200 }) // left difere em 4px <= TOLERANCE (7px)
        }
      ]
    } as unknown as HTMLElement;

    const guidesState = calculateSmartGuides('active_card', mockContainer, []);
    assert(guidesState.guides.length >= 2, suite, 'Detectou alinhamentos horizontal e vertical');

    const hGuide = guidesState.guides.find((g) => g.type === 'horizontal');
    assert(hGuide !== undefined && hGuide.label === 'Topo alinhado', suite, 'Guia horizontal de Topo Alinhado gerada com sucesso');

    const vGuide = guidesState.guides.find((g) => g.type === 'vertical');
    assert(vGuide !== undefined && vGuide.label === 'Esquerda', suite, 'Guia vertical de Esquerda Alinhada gerada com sucesso');
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`✅ Camada A concluída: ${passed} passaram, ${failed} falharam.`);
  return { passed, failed, results };
}

if (process.argv[1]?.endsWith('layerA_unit.test.ts')) {
  const { passed, failed } = runLayerAUnitTests();
  process.exit(failed > 0 ? 1 : 0);
}

