export type DashboardColSpan = 3 | 4 | 6 | 8 | 12;

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
  order: number;
  isVisible: boolean;
  minColSpan?: DashboardColSpan;
  settings?: CardInternalSettings;
}

export interface DashboardLayoutState {
  version: number;
  cards: DashboardCardConfig[];
}
