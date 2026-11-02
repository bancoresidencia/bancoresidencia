import { DashboardCardConfig } from '@/types/dashboardLayout';

export const DEFAULT_HOME_CARDS: DashboardCardConfig[] = [
  {
    id: 'home_hero',
    title: 'Status & Alvo (Hero)',
    colSpan: 12,
    order: 0,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
  {
    id: 'home_meta_diaria',
    title: 'Metas Diárias',
    colSpan: 4,
    order: 1,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
  {
    id: 'home_aproveitamento',
    title: 'Aproveitamento Geral',
    colSpan: 4,
    order: 2,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
  {
    id: 'home_percentil',
    title: 'Percentil TRI & Ranking',
    colSpan: 4,
    order: 3,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
  {
    id: 'home_recomendacao',
    title: 'Recomendação do Dia',
    colSpan: 6,
    order: 4,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
  {
    id: 'home_retencao',
    title: 'Retenção & Repetição',
    colSpan: 6,
    order: 5,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
  {
    id: 'home_mnemonico',
    title: 'Mnemônico Clínico',
    colSpan: 6,
    order: 6,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
  {
    id: 'home_agenda',
    title: 'Agenda do Dia',
    colSpan: 6,
    order: 7,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
  {
    id: 'home_raiox_areas',
    title: 'Raio-X das 6 Áreas',
    colSpan: 12,
    order: 8,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
  {
    id: 'home_retomada',
    title: 'Retomada de Estudos',
    colSpan: 12,
    order: 9,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
  {
    id: 'home_carrossel',
    title: 'Acesso Rápido / Atalhos',
    colSpan: 12,
    order: 10,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
];

export const DEFAULT_STATS_OVERVIEW_CARDS: DashboardCardConfig[] = [
  {
    id: 'stats_kpi_volume',
    title: 'Volume Resolvido',
    colSpan: 3,
    order: 0,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
  {
    id: 'stats_kpi_taxa',
    title: 'Taxa de Acerto Global',
    colSpan: 3,
    order: 1,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
  {
    id: 'stats_kpi_media',
    title: 'Média Diária',
    colSpan: 3,
    order: 2,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
  {
    id: 'stats_kpi_ritmo',
    title: 'Ritmo Médio',
    colSpan: 3,
    order: 3,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
  {
    id: 'stats_evolucao',
    title: 'Gráfico de Evolução Diária',
    colSpan: 12,
    order: 4,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
  {
    id: 'stats_habits',
    title: 'Hábitos Diários & Cronobiologia',
    colSpan: 12,
    order: 5,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
];
