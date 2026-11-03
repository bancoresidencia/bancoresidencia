/**
 * MAPA TÉCNICO E INVENTÁRIO COMPLETO EXCLUSIVO DA ABA INÍCIO (DASHBOARD)
 * Banco Residência Médica
 * 
 * Delimitação Estrita:
 * Rota: /dashboard (e componente StudentHomeDashboard)
 * Mecanismo de Customização: Figma-style Layout Engine
 */

import { DashboardCardConfig, DashboardColSpan } from '../../src/types/dashboardLayout';

export interface CardInventoryItem {
  id: string;
  name: string;
  defaultOrder: number;
  defaultColSpan: DashboardColSpan;
  minColSpan: DashboardColSpan;
  maxColSpan: DashboardColSpan;
  minHeight: number;
  maxHeight: number;
  defaultCustomHeight?: number;
  canMove: boolean;
  canResizeWidth: boolean;
  canResizeHeight: boolean;
  canHide: boolean;
  responsiveMobile: string;
  responsiveDesktop: string;
  initialVisibility: boolean;
  persistenceKey: string;
  drawerAction?: string;
}

export const DASHBOARD_TECHNICAL_MAP = {
  route: '/dashboard',
  orchestratorComponent: 'src/app/(platform)/dashboard/page.tsx',
  mainComponent: 'src/components/StudentHomeDashboard.tsx',
  layoutHook: 'src/hooks/useDashboardLayout.ts',
  defaultsFile: 'src/components/dashboard/dashboardDefaults.ts',
  cardWrapper: 'src/components/dashboard/FigmaCardWrapper.tsx',
  customizerBar: 'src/components/dashboard/FigmaCustomizerBar.tsx',
  smartGuidesComponent: 'src/components/dashboard/FigmaSmartGuides.tsx',
  smartGuidesEngine: 'src/components/dashboard/smartGuidesEngine.ts',
  cardContext: 'src/components/dashboard/CardLayoutContext.tsx',
  themeContext: 'src/context/ThemeContext.tsx',
  themeSelector: 'src/components/ThemeSelector.tsx',
  storageKey: 'bancoresidencia_layout_home_v2',
  legacyStorageKey: 'bancoresidencia_layout_home',
  gridSystem: {
    type: 'Tailwind CSS v4 12-column responsive grid',
    containerClasses: 'grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 auto-rows-auto grid-flow-dense relative items-stretch',
    mobileBreakpoint: '768px (md:)',
    desktopColumns: 12,
    mobileColumns: 1,
    containerQueries: '@container em cada FigmaCardWrapper'
  },
  dndSystem: {
    type: 'Native Pointer Events with 3D Transform and elementFromPoint detection',
    activationThreshold: '6px pointer movement',
    dragFeedback: 'opacity-85 scale-[1.02] shadow-2xl cursor-grabbing + real-time smart guides',
    dropTargetFeedback: 'dashed blue border overlay with "Soltar para posicionar aqui" badge'
  },
  resizeSystem: {
    type: 'Multi-directional Pointer Events with 75% colWidth magnetic snap and 24px height snap',
    handles: [
      { id: 'nw', name: 'Superior Esquerda (Diagonal)', cursor: 'cursor-nwse-resize', origins: ['left', 'top'] },
      { id: 'ne', name: 'Superior Direita (Diagonal)', cursor: 'cursor-nesw-resize', origins: ['right', 'top'] },
      { id: 'sw', name: 'Inferior Esquerda (Diagonal)', cursor: 'cursor-nesw-resize', origins: ['left', 'bottom'] },
      { id: 'se', name: 'Inferior Direita (Diagonal)', cursor: 'cursor-nwse-resize', origins: ['right', 'bottom'] },
      { id: 'left', name: 'Lateral Esquerda', cursor: 'cursor-ew-resize', origins: ['left', 'none'] },
      { id: 'right', name: 'Lateral Direita', cursor: 'cursor-ew-resize', origins: ['right', 'none'] },
      { id: 'top', name: 'Superior Central', cursor: 'cursor-ns-resize', origins: ['none', 'top'] },
      { id: 'bottom', name: 'Inferior Central', cursor: 'cursor-ns-resize', origins: ['none', 'bottom'] }
    ]
  },
  responsiveResolutions: [
    { width: 320, height: 568, device: 'iPhone SE (1st gen) / Compact' },
    { width: 360, height: 640, device: 'Galaxy S5 / Android Compact' },
    { width: 375, height: 667, device: 'iPhone 6/7/8/SE 2' },
    { width: 390, height: 844, device: 'iPhone 12/13/14' },
    { width: 414, height: 896, device: 'iPhone XR/11' },
    { width: 480, height: 800, device: 'Android Mid-size' },
    { width: 768, height: 1024, device: 'iPad Mini / Tablet Portrait' },
    { width: 820, height: 1180, device: 'iPad Air 10.9' },
    { width: 1024, height: 768, device: 'iPad Landscape / Small Laptop' },
    { width: 1280, height: 720, device: 'HD Ready Widescreen' },
    { width: 1366, height: 768, device: 'Laptop Standard WXGA' },
    { width: 1440, height: 900, device: 'MacBook Pro 15 WXGA+' },
    { width: 1536, height: 864, device: 'Modern Ultrabook FHD Scaling' },
    { width: 1920, height: 1080, device: 'Full HD Desktop 1080p' },
    { width: 2560, height: 1440, device: '2K QHD Desktop' },
    { width: 3440, height: 1440, device: 'Ultra-Wide UWQHD Monitor' }
  ]
};

export const DASHBOARD_CARD_INVENTORY: CardInventoryItem[] = [
  {
    id: 'home_hero',
    name: 'Status & Alvo (Hero)',
    defaultOrder: 0,
    defaultColSpan: 12,
    minColSpan: 6,
    maxColSpan: 12,
    minHeight: 65,
    maxHeight: 280,
    canMove: true,
    canResizeWidth: true,
    canResizeHeight: true,
    canHide: true,
    responsiveMobile: 'col-span-12',
    responsiveDesktop: 'col-span-12',
    initialVisibility: true,
    persistenceKey: 'home_hero'
  },
  {
    id: 'home_meta_diaria',
    name: 'Metas Diárias',
    defaultOrder: 1,
    defaultColSpan: 4,
    minColSpan: 3,
    maxColSpan: 12,
    minHeight: 65,
    maxHeight: 360,
    canMove: true,
    canResizeWidth: true,
    canResizeHeight: true,
    canHide: true,
    responsiveMobile: 'col-span-12',
    responsiveDesktop: 'col-span-12 sm:col-span-6 lg:col-span-4',
    initialVisibility: true,
    persistenceKey: 'home_meta_diaria'
  },
  {
    id: 'home_aproveitamento',
    name: 'Aproveitamento Geral',
    defaultOrder: 2,
    defaultColSpan: 4,
    minColSpan: 3,
    maxColSpan: 12,
    minHeight: 65,
    maxHeight: 360,
    canMove: true,
    canResizeWidth: true,
    canResizeHeight: true,
    canHide: true,
    responsiveMobile: 'col-span-12',
    responsiveDesktop: 'col-span-12 sm:col-span-6 lg:col-span-4',
    initialVisibility: true,
    persistenceKey: 'home_aproveitamento'
  },
  {
    id: 'home_percentil',
    name: 'Percentil TRI & Ranking',
    defaultOrder: 3,
    defaultColSpan: 4,
    minColSpan: 3,
    maxColSpan: 12,
    minHeight: 65,
    maxHeight: 360,
    canMove: true,
    canResizeWidth: true,
    canResizeHeight: true,
    canHide: true,
    responsiveMobile: 'col-span-12',
    responsiveDesktop: 'col-span-12 sm:col-span-6 lg:col-span-4',
    initialVisibility: true,
    persistenceKey: 'home_percentil'
  },
  {
    id: 'home_recomendacao',
    name: 'Recomendação do Dia',
    defaultOrder: 4,
    defaultColSpan: 6,
    minColSpan: 3,
    maxColSpan: 12,
    minHeight: 65,
    maxHeight: 360,
    canMove: true,
    canResizeWidth: true,
    canResizeHeight: true,
    canHide: true,
    responsiveMobile: 'col-span-12',
    responsiveDesktop: 'col-span-12 sm:col-span-6 lg:col-span-6',
    initialVisibility: true,
    persistenceKey: 'home_recomendacao',
    drawerAction: 'treinar_recomendacao'
  },
  {
    id: 'home_retencao',
    name: 'Retenção & Repetição',
    defaultOrder: 5,
    defaultColSpan: 6,
    minColSpan: 3,
    maxColSpan: 12,
    minHeight: 65,
    maxHeight: 340,
    canMove: true,
    canResizeWidth: true,
    canResizeHeight: true,
    canHide: true,
    responsiveMobile: 'col-span-12',
    responsiveDesktop: 'col-span-12 sm:col-span-6 lg:col-span-6',
    initialVisibility: true,
    persistenceKey: 'home_retencao'
  },
  {
    id: 'home_mnemonico',
    name: 'Mnemônico Clínico (Critérios de Light / Apgar)',
    defaultOrder: 6,
    defaultColSpan: 6,
    minColSpan: 3,
    maxColSpan: 12,
    minHeight: 65,
    maxHeight: 350,
    canMove: true,
    canResizeWidth: true,
    canResizeHeight: true,
    canHide: true,
    responsiveMobile: 'col-span-12',
    responsiveDesktop: 'col-span-12 sm:col-span-6 lg:col-span-6',
    initialVisibility: true,
    persistenceKey: 'home_mnemonico',
    drawerAction: 'mnemonico_detalhado'
  },
  {
    id: 'home_agenda',
    name: 'Agenda do Dia (Conecte sua agenda / Cronograma)',
    defaultOrder: 7,
    defaultColSpan: 6,
    minColSpan: 3,
    maxColSpan: 12,
    minHeight: 65,
    maxHeight: 310,
    canMove: true,
    canResizeWidth: true,
    canResizeHeight: true,
    canHide: true,
    responsiveMobile: 'col-span-12',
    responsiveDesktop: 'col-span-12 sm:col-span-6 lg:col-span-6',
    initialVisibility: true,
    persistenceKey: 'home_agenda',
    drawerAction: 'agenda_detalhada'
  },
  {
    id: 'home_raiox_areas',
    name: 'Raio-X das 6 Áreas',
    defaultOrder: 8,
    defaultColSpan: 12,
    minColSpan: 4,
    maxColSpan: 12,
    minHeight: 65,
    maxHeight: 700,
    canMove: true,
    canResizeWidth: true,
    canResizeHeight: true,
    canHide: true,
    responsiveMobile: 'col-span-12',
    responsiveDesktop: 'col-span-12',
    initialVisibility: true,
    persistenceKey: 'home_raiox_areas'
  },
  {
    id: 'home_retomada',
    name: 'Retomada de Estudos (Caderno de Erros / Listas / Provas)',
    defaultOrder: 9,
    defaultColSpan: 12,
    minColSpan: 4,
    maxColSpan: 12,
    minHeight: 65,
    maxHeight: 600,
    canMove: true,
    canResizeWidth: true,
    canResizeHeight: true,
    canHide: true,
    responsiveMobile: 'col-span-12',
    responsiveDesktop: 'col-span-12',
    initialVisibility: true,
    persistenceKey: 'home_retomada'
  },
  {
    id: 'home_carrossel',
    name: 'Acesso Rápido / Atalhos (Flashcards / Provas / Simulados)',
    defaultOrder: 10,
    defaultColSpan: 12,
    minColSpan: 4,
    maxColSpan: 12,
    minHeight: 65,
    maxHeight: 550,
    canMove: true,
    canResizeWidth: true,
    canResizeHeight: true,
    canHide: true,
    responsiveMobile: 'col-span-12',
    responsiveDesktop: 'col-span-12',
    initialVisibility: true,
    persistenceKey: 'home_carrossel'
  }
];

