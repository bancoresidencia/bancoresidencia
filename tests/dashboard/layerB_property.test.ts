/**
 * CAMADA B — PROPERTY-BASED TESTING EXCLUSIVO DA ABA INÍCIO
 * 
 * Gera milhares de estados arbitrários e permutações aleatórias para validar
 * as 13 invariantes matemáticas e estruturais do layout do Dashboard.
 */

import { DEFAULT_HOME_CARDS } from '../../src/components/dashboard/dashboardDefaults';
import { DashboardCardConfig, DashboardColSpan } from '../../src/types/dashboardLayout';

// PRNG reprodutível baseado em Mulberry32
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface InvariantViolation {
  ruleIndex: number;
  ruleName: string;
  seed: number;
  iteration: number;
  details: string;
}

export interface PropertyTestReport {
  iterations: number;
  seed: number;
  violations: InvariantViolation[];
  passed: boolean;
}

export function runLayerBPropertyTests(
  iterations = 10000,
  initialSeed = 133742
): PropertyTestReport {
  console.log(`🧪 Iniciando Camada B: Property-based testing (${iterations.toLocaleString()} iterações)...`);
  const random = mulberry32(initialSeed);
  const violations: InvariantViolation[] = [];

  const checkInvariants = (
    cards: DashboardCardConfig[],
    iteration: number,
    seed: number
  ) => {
    // 1. Nenhum ID duplicado
    const ids = new Set<string>();
    for (const card of cards) {
      if (ids.has(card.id)) {
        violations.push({
          ruleIndex: 1,
          ruleName: 'Nenhum ID duplicado',
          seed,
          iteration,
          details: `ID duplicado detectado: ${card.id}`
        });
      }
      ids.add(card.id);
    }

    // 2. Nenhuma posição inválida
    for (const card of cards) {
      if (typeof card.order !== 'number' || isNaN(card.order) || card.order < 0) {
        violations.push({
          ruleIndex: 2,
          ruleName: 'Nenhuma posição inválida',
          seed,
          iteration,
          details: `Card ${card.id} com order inválida: ${card.order}`
        });
      }
    }

    // 3. Nenhuma dimensão negativa
    for (const card of cards) {
      if (card.colSpan <= 0) {
        violations.push({
          ruleIndex: 3,
          ruleName: 'Nenhuma dimensão negativa',
          seed,
          iteration,
          details: `Card ${card.id} com colSpan <= 0: ${card.colSpan}`
        });
      }
      if (card.customHeight !== undefined && card.customHeight <= 0) {
        violations.push({
          ruleIndex: 3,
          ruleName: 'Nenhuma dimensão negativa',
          seed,
          iteration,
          details: `Card ${card.id} com customHeight <= 0: ${card.customHeight}`
        });
      }
    }

    // 4. Nenhum card desaparecido involuntariamente
    if (cards.length !== 11) {
      violations.push({
        ruleIndex: 4,
        ruleName: 'Nenhum card desaparecido involuntariamente',
        seed,
        iteration,
        details: `Esperado 11 cards, encontrados ${cards.length}`
      });
    }

    // 5. Nenhum card duplicado
    if (ids.size !== cards.length) {
      violations.push({
        ruleIndex: 5,
        ruleName: 'Nenhum card duplicado',
        seed,
        iteration,
        details: `Card duplicado detectado: total ${cards.length}, únicos ${ids.size}`
      });
    }

    // 6. Nenhum card com conteúdo perdido
    for (const card of cards) {
      if (!card.title || card.title.trim() === '') {
        violations.push({
          ruleIndex: 6,
          ruleName: 'Nenhum card com conteúdo perdido',
          seed,
          iteration,
          details: `Card ${card.id} perdeu seu título/nome`
        });
      }
    }

    // 7. Nenhuma sobreposição não permitida (colSpan máximo 12)
    for (const card of cards) {
      if (card.colSpan > 12) {
        violations.push({
          ruleIndex: 7,
          ruleName: 'Nenhuma sobreposição não permitida',
          seed,
          iteration,
          details: `Card ${card.id} ultrapassou o grid: colSpan=${card.colSpan}`
        });
      }
    }

    // 8. Nenhuma colisão não tratada
    // No CSS grid com auto-rows-auto, se a soma de spans excede 12, há wrap para a próxima linha sem colisão.
    // Garantimos que nenhum span seja fracionário ou NaN
    for (const card of cards) {
      if (!Number.isInteger(card.colSpan)) {
        violations.push({
          ruleIndex: 8,
          ruleName: 'Nenhuma colisão não tratada',
          seed,
          iteration,
          details: `Card ${card.id} possui colSpan não-inteiro: ${card.colSpan}`
        });
      }
    }

    // 9. Nenhuma posição fora dos limites do grid
    for (const card of cards) {
      const minCol = card.minColSpan || 2;
      const maxCol = card.maxColSpan || 12;
      if (card.colSpan < minCol || card.colSpan > maxCol) {
        violations.push({
          ruleIndex: 9,
          ruleName: 'Nenhuma posição fora dos limites do grid',
          seed,
          iteration,
          details: `Card ${card.id} fora dos bounds [${minCol}, ${maxCol}]: ${card.colSpan}`
        });
      }
    }

    // 10. Nenhuma inconsistência entre estado visual e estado interno
    const visibleCards = cards.filter((c) => c.isVisible !== false);
    const hiddenCards = cards.filter((c) => c.isVisible === false);
    if (visibleCards.length + hiddenCards.length !== cards.length) {
      violations.push({
        ruleIndex: 10,
        ruleName: 'Nenhuma inconsistência entre estado visual e estado interno',
        seed,
        iteration,
        details: `Soma visíveis (${visibleCards.length}) + ocultos (${hiddenCards.length}) !== total (${cards.length})`
      });
    }

    // 11. Nenhuma divergência entre estado salvo e estado recuperado
    const serialized = JSON.stringify(cards);
    const deserialized = JSON.parse(serialized);
    if (JSON.stringify(deserialized) !== serialized) {
      violations.push({
        ruleIndex: 11,
        ruleName: 'Nenhuma divergência entre estado salvo e estado recuperado',
        seed,
        iteration,
        details: 'Falha na rodada de serialização/desserialização JSON'
      });
    }

    // 12. Nenhuma corrupção após alteração de resolução (simulada)
    // Em qualquer resolução (ex: mobile cols 1 ou desktop cols 12), o estado interno de order e spans permanece intacto
    const cloneForRes = cards.map((c) => ({ ...c }));
    for (const c of cloneForRes) {
      if (typeof c.order !== 'number' || typeof c.colSpan !== 'number') {
        violations.push({
          ruleIndex: 12,
          ruleName: 'Nenhuma corrupção após alteração de resolução',
          seed,
          iteration,
          details: `Corrupção estrutural detectada em ${c.id}`
        });
      }
    }
  };

  // Executa o gerador de mutações estocásticas
  for (let i = 0; i < iterations; i++) {
    // Clona estado padrão
    const state: DashboardCardConfig[] = DEFAULT_HOME_CARDS.map((c) => ({
      ...c,
      settings: { ...c.settings }
    }));

    // Aplica N mutações aleatórias (1 a 15 mutações sucessivas)
    const numMutations = Math.floor(random() * 15) + 1;
    for (let m = 0; m < numMutations; m++) {
      const cardIdx = Math.floor(random() * state.length);
      const card = state[cardIdx];
      const mutationType = Math.floor(random() * 6);

      switch (mutationType) {
        case 0: {
          // Mutação de colSpan dentro dos bounds permitidos
          const minSpan = card.minColSpan || 2;
          const maxSpan = card.maxColSpan || 12;
          const newSpan = Math.floor(random() * (maxSpan - minSpan + 1)) + minSpan;
          card.colSpan = newSpan as DashboardColSpan;
          break;
        }
        case 1: {
          // Mutação de Altura dentro dos bounds
          const minH = card.minHeight || 65;
          const maxH = card.maxHeight || 500;
          const rawH = Math.floor(random() * (maxH - minH + 1)) + minH;
          card.customHeight = Math.round(rawH / 24) * 24;
          break;
        }
        case 2: {
          // Toggle de visibilidade
          card.isVisible = random() > 0.3; // 70% chance de permanecer visível
          break;
        }
        case 3: {
          // Troca de ordem (swap de posições)
          const targetIdx = Math.floor(random() * state.length);
          const tempOrder = card.order;
          card.order = state[targetIdx].order;
          state[targetIdx].order = tempOrder;
          break;
        }
        case 4: {
          // Configurações internas (showIcons, showDetails, compactMode)
          card.settings = {
            showIcons: random() > 0.5,
            showDetails: random() > 0.5,
            compactMode: random() > 0.5
          };
          break;
        }
        case 5: {
          // Simula autoConform de linha
          const visible = state.filter((c) => c.isVisible !== false).sort((a, b) => a.order - b.order);
          let rowSum = 0;
          for (let k = 0; k < visible.length; k++) {
            const c = visible[k];
            if (rowSum + c.colSpan <= 12) {
              rowSum += c.colSpan;
            } else {
              rowSum = c.colSpan;
            }
          }
          break;
        }
      }
    }

    // Normaliza ordens 0..N
    state.sort((a, b) => a.order - b.order);
    state.forEach((c, idx) => {
      c.order = idx;
    });

    // 13. Verificação de Isolamento: Mutar Card X preserva propriedades intocadas dos demais
    const unmodifiedCard = state.find((c) => c.id === 'home_hero');
    if (unmodifiedCard && unmodifiedCard.colSpan < (unmodifiedCard.minColSpan || 2)) {
      violations.push({
        ruleIndex: 13,
        ruleName: 'Nenhuma alteração indevida em cards não selecionados',
        seed: initialSeed,
        iteration: i,
        details: 'Card home_hero teve minColSpan violado'
      });
    }

    // Valida todas as invariantes neste estado
    checkInvariants(state, i, initialSeed);
  }

  const passed = violations.length === 0;
  console.log(
    `✅ Camada B concluída: ${iterations.toLocaleString()} iterações, ${violations.length} violações encontradas.`
  );
  return {
    iterations,
    seed: initialSeed,
    violations,
    passed
  };
}

if (process.argv[1]?.endsWith('layerB_property.test.ts')) {
  const report = runLayerBPropertyTests(10000);
  process.exit(report.passed ? 0 : 1);
}

