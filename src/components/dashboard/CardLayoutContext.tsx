'use client';

import React, { createContext, useContext } from 'react';
import { DashboardColSpan, CardInternalSettings } from '@/types/dashboardLayout';

export interface CardLayoutContextValue {
  colSpan: DashboardColSpan;
  settings: CardInternalSettings;
  isSelected: boolean;
  isCustomizing: boolean;
  isExtraSmall: boolean; // span <= 3
  isSmall: boolean;      // span <= 5
  isMedium: boolean;     // span 6..7
  isLarge: boolean;      // span >= 8
}

const CardLayoutContext = createContext<CardLayoutContextValue>({
  colSpan: 12,
  settings: { showIcons: true, showDetails: true, compactMode: false },
  isSelected: false,
  isCustomizing: false,
  isExtraSmall: false,
  isSmall: false,
  isMedium: false,
  isLarge: true,
});

export const CardLayoutProvider: React.FC<{
  value: CardLayoutContextValue;
  children: React.ReactNode;
}> = ({ value, children }) => {
  return (
    <CardLayoutContext.Provider value={value}>
      {children}
    </CardLayoutContext.Provider>
  );
};

export const useCardLayout = () => useContext(CardLayoutContext);
