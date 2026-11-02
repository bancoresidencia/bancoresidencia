import { DashboardCardConfig } from '@/types/dashboardLayout';

export const DEFAULT_HOME_CARDS: DashboardCardConfig[] = [
  {
    id: 'home_hero',
    title: 'Status & Alvo (Hero)',
    colSpan: 12,
    minColSpan: 6,
    minHeight: 120,
    maxHeight: 280,
    order: 0,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
  {
    id: 'home_meta_diaria',
    title: 'Metas Diárias',
    colSpan: 4,
    minColSpan: 3,
    minHeight: 150,
    maxHeight: 360,
    order: 1,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
  {
    id: 'home_aproveitamento',
    title: 'Aproveitamento Geral',
    colSpan: 4,
    minColSpan: 3,
    minHeight: 150,
    maxHeight: 360,
    order: 2,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
  {
    id: 'home_percentil',
    title: 'Percentil TRI & Ranking',
    colSpan: 4,
    minColSpan: 3,
    minHeight: 150,
    maxHeight: 360,
    order: 3,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
  {
    id: 'home_recomendacao',
    title: 'Recomendação do Dia',
    colSpan: 6,
    minColSpan: 3,
    minHeight: 160,
    maxHeight: 360,
    order: 4,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
  {
    id: 'home_retencao',
    title: 'Retenção & Repetição',
    colSpan: 6,
    minColSpan: 3,
    minHeight: 160,
    maxHeight: 340,
    order: 5,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
  {
    id: 'home_mnemonico',
    title: 'Mnemônico Clínico',
    colSpan: 6,
    minColSpan: 3,
    minHeight: 160,
    maxHeight: 350,
    order: 6,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
  {
    id: 'home_agenda',
    title: 'Agenda do Dia',
    colSpan: 6,
    minColSpan: 3,
    minHeight: 160,
    maxHeight: 310,
    order: 7,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
  {
    id: 'home_raiox_areas',
    title: 'Raio-X das 6 Áreas',
    colSpan: 12,
    minColSpan: 4,
    minHeight: 240,
    maxHeight: 700,
    order: 8,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
  {
    id: 'home_retomada',
    title: 'Retomada de Estudos',
    colSpan: 12,
    minColSpan: 4,
    minHeight: 200,
    maxHeight: 600,
    order: 9,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
  {
    id: 'home_carrossel',
    title: 'Acesso Rápido / Atalhos',
    colSpan: 12,
    minColSpan: 4,
    minHeight: 180,
    maxHeight: 550,
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
    minColSpan: 2,
    minHeight: 120,
    maxHeight: 350,
    order: 0,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
  {
    id: 'stats_kpi_taxa',
    title: 'Taxa de Acerto Global',
    colSpan: 3,
    minColSpan: 2,
    minHeight: 120,
    maxHeight: 350,
    order: 1,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
  {
    id: 'stats_kpi_media',
    title: 'Média Diária',
    colSpan: 3,
    minColSpan: 2,
    minHeight: 120,
    maxHeight: 350,
    order: 2,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
  {
    id: 'stats_kpi_ritmo',
    title: 'Ritmo Médio',
    colSpan: 3,
    minColSpan: 2,
    minHeight: 120,
    maxHeight: 350,
    order: 3,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
  {
    id: 'stats_evolucao',
    title: 'Gráfico de Evolução Diária',
    colSpan: 12,
    minColSpan: 4,
    minHeight: 240,
    maxHeight: 750,
    order: 4,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
  {
    id: 'stats_habits',
    title: 'Hábitos Diários & Cronobiologia',
    colSpan: 12,
    minColSpan: 4,
    minHeight: 240,
    maxHeight: 750,
    order: 5,
    isVisible: true,
    settings: { showIcons: true, showDetails: true, compactMode: false }
  },
];
