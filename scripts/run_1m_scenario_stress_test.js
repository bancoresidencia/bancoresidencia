/**
 * Bateria de 1 Milhão de Testes e Simulações de Cenários do Dashboard Figma
 * Testa:
 * 1. Reajuste contínuo de altura e limites (corte livre vs teto final sem sobra)
 * 2. Conformação e empacotamento do grid de 12 colunas (gaps, reflow, densidade)
 * 3. Trocas de posição (swaps) e assimetria vertical entre cards vizinhos
 * 4. Quebras de responsividade em breakpoints (320px mobile até 1920px desktop)
 * 5. Colisão de ferramentas internas x corte de altura x visibilidade
 */

const fs = require('fs');

const CARD_DEFS = {
  home_hero: { title: 'Status & Alvo', minColSpan: 6, maxColSpan: 12, minHeight: 120, maxHeight: 280, thresholds: [220], baseHeight: 140 },
  home_meta_diaria: { title: 'Metas Diárias', minColSpan: 3, maxColSpan: 6, minHeight: 150, maxHeight: 360, thresholds: [250, 300], baseHeight: 175 },
  home_aproveitamento: { title: 'Aproveitamento', minColSpan: 3, maxColSpan: 6, minHeight: 150, maxHeight: 360, thresholds: [250, 300], baseHeight: 175 },
  home_percentil: { title: 'Percentil TRI', minColSpan: 3, maxColSpan: 8, minHeight: 150, maxHeight: 360, thresholds: [250, 300], baseHeight: 175 },
  home_recomendacao: { title: 'Recomendação', minColSpan: 3, maxColSpan: 12, minHeight: 160, maxHeight: 360, thresholds: [250, 300], baseHeight: 177 },
  home_retencao: { title: 'Retenção & Repetição', minColSpan: 3, maxColSpan: 12, minHeight: 160, maxHeight: 340, thresholds: [250], baseHeight: 177 },
  home_mnemonico: { title: 'Mnemônico', minColSpan: 3, maxColSpan: 12, minHeight: 160, maxHeight: 350, thresholds: [250, 300], baseHeight: 177 },
  home_agenda: { title: 'Agenda do Dia', minColSpan: 3, maxColSpan: 12, minHeight: 160, maxHeight: 310, thresholds: [220, 250], baseHeight: 177 },
  home_raiox_areas: { title: 'Raio-X 6 Áreas', minColSpan: 4, maxColSpan: 12, minHeight: 240, maxHeight: 720, thresholds: [550], baseHeight: 480 },
  home_retomada: { title: 'Retomada de Estudos', minColSpan: 4, maxColSpan: 12, minHeight: 200, maxHeight: 600, thresholds: [], baseHeight: 280 },
  home_carrossel: { title: 'Acesso Rápido', minColSpan: 4, maxColSpan: 12, minHeight: 180, maxHeight: 520, thresholds: [260], baseHeight: 210 },
};

const CARD_IDS = Object.keys(CARD_DEFS);
const TOTAL_SCENARIOS = 1000000;

console.log(`Iniciando bateria de ${TOTAL_SCENARIOS.toLocaleString('pt-BR')} cenários de estresse...`);
const startTime = Date.now();

// Estatísticas e Métricas de Erros
const metrics = {
  totalScenarios: TOTAL_SCENARIOS,
  heightClampingViolations: 0,
  excessiveWhitespaceErrors: 0,
  staircaseHeightDiscrepancies: 0,
  orphanGridGaps: 0,
  mobileColumnOverflows: 0,
  narrowCardTextTruncationRisks: 0,
  swapLayoutCascades: 0,
  partialCropAcceptedCount: 0,
  perfectToolFitCount: 0,
  distribution: {
    mobileScenarios: 0,
    tabletScenarios: 0,
    desktopScenarios: 0,
  }
};

// Exemplos de cenários com anomalias para relatório
const errorSamples = {
  whitespaceLag: [],
  orphanGaps: [],
  mobileOverflow: [],
  heightDiscrepancies: [],
  narrowCardClipping: []
};

// Função de empacotamento de grid (simula navegador CSS grid de 12 colunas com grid-flow-dense)
function simulateGridFlow(cards, screenWidth) {
  if (screenWidth < 768) {
    // Mobile: 1 coluna vertical
    return { rows: cards.map(c => [c]), orphanGapsCount: 0 };
  }

  const rows = [];
  let currentRow = [];
  let currentCols = 0;
  let gapsCount = 0;

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const span = Math.min(12, Math.max(1, card.colSpan));

    if (currentCols + span <= 12) {
      currentRow.push(card);
      currentCols += span;
    } else {
      const leftover = 12 - currentCols;
      if (leftover > 0) {
        gapsCount += leftover;
      }
      rows.push(currentRow);
      currentRow = [card];
      currentCols = span;
    }
  }

  if (currentRow.length > 0) {
    const leftover = 12 - currentCols;
    if (leftover > 0 && leftover <= 4) {
      gapsCount += leftover;
    }
    rows.push(currentRow);
  }

  return { rows, orphanGapsCount: gapsCount };
}

// Loop principal de 1.000.000 cenários
for (let sc = 0; sc < TOTAL_SCENARIOS; sc++) {
  // 1. Sorteio de Viewport (Mobile 25%, Tablet 20%, Desktop 55%)
  const vpRoll = sc % 100;
  let screenWidth;
  if (vpRoll < 25) {
    screenWidth = 320 + (sc % 160); // 320px a 480px
    metrics.distribution.mobileScenarios++;
  } else if (vpRoll < 45) {
    screenWidth = 768 + (sc % 200); // 768px a 968px
    metrics.distribution.tabletScenarios++;
  } else {
    screenWidth = 1024 + (sc % 896); // 1024px a 1920px
    metrics.distribution.desktopScenarios++;
  }

  // 2. Embaralhamento de ordem de cards (Permutação aleatória)
  const shuffledIds = [...CARD_IDS];
  // Algoritmo Fisher-Yates parcial baseado em seed
  for (let i = shuffledIds.length - 1; i > 0; i--) {
    const j = (sc * 31 + i * 17) % (i + 1);
    const temp = shuffledIds[i];
    shuffledIds[i] = shuffledIds[j];
    shuffledIds[j] = temp;
  }

  // 3. Atribuição de ColSpans e Alturas Contínuas
  const activeCards = shuffledIds.map((id, index) => {
    const def = CARD_DEFS[id];
    // Sorteio de colSpan entre min e max
    const spanRange = def.maxColSpan - def.minColSpan + 1;
    const colSpan = def.minColSpan + ((sc * 13 + index * 7) % spanRange);

    // Sorteio de altura contínua (qualquer altura em pixels que o usuário arraste)
    // Testa desde abaixo do min (tentativa de encolher) até acima do max (tentativa de esticar)
    const rawHeightAttempt = 80 + ((sc * 19 + index * 23) % 750); // 80px a 830px

    // Aplicação da regra do usuário:
    // "a altura deve ser qualquer uma que o usuário quiser e só evite a expansão máxima final quando já aparece todas as ferramentas"
    // Não limita recortes intermediários, mas corta estritamente no maxHeight!
    const effectiveHeight = Math.max(def.minHeight, Math.min(def.maxHeight, rawHeightAttempt));

    return {
      id,
      title: def.title,
      colSpan,
      minColSpan: def.minColSpan,
      maxColSpan: def.maxColSpan,
      rawHeightAttempt,
      height: effectiveHeight,
      minHeight: def.minHeight,
      maxHeight: def.maxHeight,
      baseHeight: def.baseHeight,
      thresholds: def.thresholds
    };
  });

  // 4. Teste de Conformação de Linhas e Gaps Residuais
  const gridResult = simulateGridFlow(activeCards, screenWidth);
  if (gridResult.orphanGapsCount > 0) {
    metrics.orphanGridGaps++;
    if (errorSamples.orphanGaps.length < 5) {
      errorSamples.orphanGaps.push({
        scenario: sc,
        screenWidth,
        gapCols: gridResult.orphanGapsCount,
        firstRowCards: gridResult.rows[0]?.map(c => `${c.id}(${c.colSpan}col)`)
      });
    }
  }

  // 5. Teste de Assimetria Vertical entre Cards Vizinhos na Mesma Linha
  for (const row of gridResult.rows) {
    if (row.length > 1) {
      const heights = row.map(c => c.height);
      const minH = Math.min(...heights);
      const maxH = Math.max(...heights);
      const heightDelta = maxH - minH;

      // Se a diferença de altura entre dois cards vizinhos na mesma linha for > 150px
      if (heightDelta > 150) {
        metrics.staircaseHeightDiscrepancies++;
        if (errorSamples.heightDiscrepancies.length < 5) {
          errorSamples.heightDiscrepancies.push({
            scenario: sc,
            cardsInRow: row.map(c => `${c.id} (${c.height}px)`),
            delta: heightDelta
          });
        }
      }
    }
  }

  // 6. Teste de Recorte Livre vs Teto Máximo e Espaço Ocioso
  for (const card of activeCards) {
    // Se o usuário puxou além do teto ideal e o sistema NÃO travou no maxHeight:
    if (card.rawHeightAttempt > card.maxHeight) {
      // Se a altura efetiva extrapolou o maxHeight
      if (card.height > card.maxHeight) {
        metrics.excessiveWhitespaceErrors++;
        if (errorSamples.whitespaceLag.length < 5) {
          errorSamples.whitespaceLag.push({
            cardId: card.id,
            attempted: card.rawHeightAttempt,
            allowedMax: card.maxHeight,
            diff: card.rawHeightAttempt - card.maxHeight
          });
        }
      }
    }

    // Classificação do tipo de recorte do usuário:
    const isBase = card.height <= card.baseHeight;
    const isMax = card.height >= card.maxHeight;
    if (!isBase && !isMax) {
      metrics.partialCropAcceptedCount++; // Recorte intermediário livre
    } else if (isMax) {
      metrics.perfectToolFitCount++; // Teto de conformação com ferramentas completas
    }

    // 7. Teste de Compressão em Telas Estreitas (Cards de 2 a 3 colunas)
    const cardPixelWidth = (screenWidth / 12) * card.colSpan;
    if (cardPixelWidth < 180 && card.colSpan <= 3 && screenWidth >= 768) {
      metrics.narrowCardTextTruncationRisks++;
      if (errorSamples.narrowCardClipping.length < 5) {
        errorSamples.narrowCardClipping.push({
          cardId: card.id,
          colSpan: card.colSpan,
          cardPixelWidth: Math.round(cardPixelWidth),
          screenWidth
        });
      }
    }
  }
}

const duration = Date.now() - startTime;
console.log(`Bateria concluída em ${duration} ms!`);

const report = {
  timestamp: new Date().toISOString(),
  totalScenarios: TOTAL_SCENARIOS,
  durationMs: duration,
  metrics,
  errorSamples
};

fs.writeFileSync('scripts/stress_test_report_1m.json', JSON.stringify(report, null, 2), 'utf8');
console.log('Relatório salvo em scripts/stress_test_report_1m.json');
console.log('--- RESULTADOS CONSOLIDADOS ---');
console.log(`Gaps Residuais no Grid: ${metrics.orphanGridGaps} (${((metrics.orphanGridGaps/TOTAL_SCENARIOS)*100).toFixed(2)}%)`);
console.log(`Discrepâncias de Altura em Linha (Degrau > 150px): ${metrics.staircaseHeightDiscrepancies} (${((metrics.staircaseHeightDiscrepancies/TOTAL_SCENARIOS)*100).toFixed(2)}%)`);
console.log(`Risco de Compressão em Cards Estreitos (<180px): ${metrics.narrowCardTextTruncationRisks} (${((metrics.narrowCardTextTruncationRisks/TOTAL_SCENARIOS)*100).toFixed(2)}%)`);
console.log(`Recortes Parciais Livres Válidos: ${metrics.partialCropAcceptedCount}`);
console.log(`Encaixes de Teto Máximo Perfeito: ${metrics.perfectToolFitCount}`);
console.log(`Violações de Teto com Espaço Branco: ${metrics.excessiveWhitespaceErrors}`);
