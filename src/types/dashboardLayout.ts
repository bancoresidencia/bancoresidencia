export type DashboardColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface CardInternalSettings {
  showIcons?: boolean;
  showDetails?: boolean;
  compactMode?: boolean;
}

export interface DashboardCardConfig {
  id: string;
  title: string;
  description?: string;
  colSpan: DashboardColSpan;
  customHeight?: number;
  order: number;
  isVisible: boolean;
  minColSpan?: DashboardColSpan;
  settings?: CardInternalSettings;
}

export interface DashboardLayoutState {
  version: number;
  cards: DashboardCardConfig[];
}
