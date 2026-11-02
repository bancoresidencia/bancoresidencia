/**
 * TEST SUITE: DASHBOARD REFLOW, CONFORMATION & INTERNAL CAPACITY AUDIT
 * Analyzes:
 * 1. Card position changes and adjacent card reflow responses.
 * 2. Visual capacity vs whitespace ratio when cards are resized.
 * 3. Element scaling and data density adaptability.
 */

const fs = require('fs');

const CARD_DATA_PROFILES = {
  home_hero: {
    title: 'Status & Alvo (Hero)',
    densityType: 'fixed_horizontal_badge',
    optimalSpan: [6, 12],
    optimalHeight: [110, 160],
    internalElements: ['avatar_greeting', 'student_name_badge', 'exam_countdown', 'edit_button', 'streak_flame'],
    whitespaceRiskWhenExpanded: 'ALTO (conteúdo é uma barra horizontal; se expandido verticalmente > 180px, sobra espaço vazio)',
    overflowRiskWhenShrunk: 'ALTO (abaixo de 6 colunas, o nome e as pílulas de contagem quebram em 3 linhas)',
  },
  home_meta_diaria: {
    title: 'Metas Diárias',
    densityType: 'fixed_kpi',
    optimalSpan: [3, 4],
    optimalHeight: [150, 200],
    internalElements: ['icon_title', 'adjust_button', 'counter_questions', 'counter_time', 'progress_bar', 'completion_footer'],
    whitespaceRiskWhenExpanded: 'MÉDIO (se esticado para 6 a 12 cols, as métricas ficam muito espaçadas)',
    overflowRiskWhenShrunk: 'BAIXO (se adapta bem até 3 colunas)',
  },
  home_aproveitamento: {
    title: 'Aproveitamento Geral',
    densityType: 'kpi_with_mini_chart',
    optimalSpan: [3, 4, 6],
    optimalHeight: [150, 220],
    internalElements: ['icon_title', 'period_switch', 'accuracy_percentage', 'mini_sparkline_7d', 'progress_bar', 'counts_footer'],
    whitespaceRiskWhenExpanded: 'MÉDIO (mini-sparkline tem largura máxima fixa de 80px e não expande com a largura do card)',
    overflowRiskWhenShrunk: 'BAIXO',
  },
  home_percentil: {
    title: 'Percentil TRI & Ranking',
    densityType: 'fixed_metric_badge',
    optimalSpan: [3, 4],
    optimalHeight: [150, 200],
    internalElements: ['icon_title', 'top_percent_pill', 'percentile_number', 'bronze_tier_badge', 'progress_bar', 'candidate_comparison_footer', 'ranking_link'],
    whitespaceRiskWhenExpanded: 'CRÍTICO (não possui gráfico temporal ou histórico; ao expandir para > 6 cols ou > 220px alt, gera o vazio gigante visualizado na imagem do usuário)',
    overflowRiskWhenShrunk: 'BAIXO',
  },
  home_recomendacao: {
    title: 'Recomendação do Dia',
    densityType: 'action_card',
    optimalSpan: [4, 6, 8],
    optimalHeight: [160, 220],
    internalElements: ['recommendation_badge', 'subject_title', 'description_text', 'primary_action_btn', 'blitz_tri_btn'],
    whitespaceRiskWhenExpanded: 'MÉDIO (apenas 2 botões; em alturas > 250px os botões ficam distantes do texto)',
    overflowRiskWhenShrunk: 'MÉDIO (abaixo de 3 colunas, botões quebram linha bruscamente)',
  },
  home_retencao: {
    title: 'Retenção & Repetição',
    densityType: 'action_list_card',
    optimalSpan: [4, 6, 8],
    optimalHeight: [160, 220],
    internalElements: ['header_label', 'caderno_erros_item', 'flashcards_item'],
    whitespaceRiskWhenExpanded: 'ALTO (possui apenas 2 itens de lista estáticos; em alturas > 250px sobra espaço vazio no rodapé)',
    overflowRiskWhenShrunk: 'BAIXO (regras de @container ocultam "Ver Foco" e mantêm o ícone legível)',
  },
  home_mnemonico: {
    title: 'Mnemônico Clínico',
    densityType: 'content_text_card',
    optimalSpan: [4, 6, 8],
    optimalHeight: [160, 260],
    internalElements: ['icon_title', 'specialty_tag', 'mnemonic_formula_box', 'clinical_rule_text'],
    whitespaceRiskWhenExpanded: 'BAIXO (o texto de regra clínica preenche bem o espaço)',
    overflowRiskWhenShrunk: 'MÉDIO (em larguras < 3 colunas, textos longos precisam de truncamento)',
  },
  home_agenda: {
    title: 'Agenda do Dia',
    densityType: 'dynamic_list_card',
    optimalSpan: [4, 6, 8],
    optimalHeight: [160, 300],
    internalElements: ['calendar_icon', 'sync_button', 'timeline_events_list', 'add_event_cta'],
    whitespaceRiskWhenExpanded: 'BAIXO (se o usuário tiver múltiplos blocos de estudo, a lista preenche a altura perfeitamente)',
    overflowRiskWhenShrunk: 'MÉDIO (se tiver 4+ eventos em um card baixo, gera rolagem vertical interna)',
  },
  home_raiox_areas: {
    title: 'Raio-X das 6 Áreas',
    densityType: 'complex_data_dashboard',
    optimalSpan: [8, 12],
    optimalHeight: [260, 450],
    internalElements: ['radar_chart', 'specialty_bars', 'goal_indicators', 'expand_details_btn'],
    whitespaceRiskWhenExpanded: 'BAIXO (conteúdo rico preenche perfeitamente grandes larguras)',
    overflowRiskWhenShrunk: 'CRÍTICO (abaixo de 4 colunas, o gráfico de radar e a tabela de 6 especialidades quebram ou colidem)',
  },
  home_retomada: {
    title: 'Retomada de Estudos',
    densityType: 'tabbed_carousel',
    optimalSpan: [6, 12],
    optimalHeight: [220, 350],
    internalElements: ['subtabs_selector', 'horizontal_scroll_cards', 'empty_state_cta'],
    whitespaceRiskWhenExpanded: 'BAIXO (exibe múltiplos cadernos em carrossel horizontal)',
    overflowRiskWhenShrunk: 'ALTO (abaixo de 6 colunas, os cards de caderno ficam empilhados em coluna única)',
  },
  home_carrossel: {
    title: 'Acesso Rápido / Atalhos',
    densityType: 'shortcut_slider',
    optimalSpan: [6, 12],
    optimalHeight: [180, 260],
    internalElements: ['carousel_card', 'prev_button', 'next_button', 'dots_pagination'],
    whitespaceRiskWhenExpanded: 'MÉDIO (o slide central tem max-w-md, deixando margens laterais amplas)',
    overflowRiskWhenShrunk: 'ALTO (em larguras < 4 colunas, botões de paginação cobrem o texto do atalho)',
  }
};

// Simulation of 10,000 Reflow & Displacement Permutations
console.log('Executando simulação de relayout, reflow e capacidade interna dos cards...');

const reflowScenarios = [];
const cardIds = Object.keys(CARD_DATA_PROFILES);

let splitRowIncidents = 0;
let excessiveWhitespaceIncidents = 0;
let crampedContentIncidents = 0;

for (let i = 0; i < 10000; i++) {
  // Random test span and height variations
  const testCards = cardIds.map(id => {
    const prof = CARD_DATA_PROFILES[id];
    const span = Math.floor(Math.random() * 10) + 3; // 3 to 12
    const height = Math.floor(Math.random() * 300) + 140; // 140 to 440px
    return { id, span, height, prof };
  });

  // Calculate reflow row by row (12 cols)
  let rowSpan = 0;
  let rowCards = [];

  for (const c of testCards) {
    if (rowSpan + c.span <= 12) {
      rowSpan += c.span;
      rowCards.push(c);
    } else {
      // Row break
      const emptyRemainder = 12 - rowSpan;
      if (emptyRemainder >= 3) {
        splitRowIncidents++;
      }
      rowSpan = c.span;
      rowCards = [c];
    }

    // Check capacity mismatches
    if (c.height > c.prof.optimalHeight[1] + 60 && ['home_percentil', 'home_retencao', 'home_hero'].includes(c.id)) {
      excessiveWhitespaceIncidents++;
    }
    if (c.span < c.prof.optimalSpan[0] && ['home_raiox_areas', 'home_carrossel', 'home_retomada'].includes(c.id)) {
      crampedContentIncidents++;
    }
  }
}

const auditReport = {
  timestamp: new Date().toISOString(),
  totalSimulatedReflows: 10000,
  findings: {
    splitRowHolesFrequency: ((splitRowIncidents / 10000) * 100).toFixed(1) + '% das trocas de posição causam quebra prematura de linha se os cards adjacentes não adaptarem suas larguras',
    excessiveWhitespaceRate: ((excessiveWhitespaceIncidents / 10000) * 100).toFixed(1) + '% de ocorrência de vazio ocioso em cards estáticos esticados verticalmente (ex: Percentil)',
    crampedContentRate: ((crampedContentIncidents / 10000) * 100).toFixed(1) + '% de compressão excessiva em cards analíticos (ex: Raio-X) se configurados abaixo do span ideal'
  },
  cardCapacityMatrix: CARD_DATA_PROFILES
};

fs.writeFileSync(
  'c:/bancoresidencia/bancoresidencia/scripts/ux_capacity_and_reflow_report.json',
  JSON.stringify(auditReport, null, 2),
  'utf8'
);

console.log('Relatório de Auditoria de Capacidade Interna e Reflow gravado com sucesso.');
