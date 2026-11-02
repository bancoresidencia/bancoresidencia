'use client';

import React, { createContext, useContext } from 'react';
import { DashboardColSpan, CardInternalSettings } from '@/types/dashboardLayout';

interface CardLayoutContextValue {
  colSpan: DashboardColSpan;
  settings: CardInternalSettings;
  isSelected: boolean;
  isCustomizing: boolean;
}

const CardLayoutContext = createContext<CardLayoutContextValue>({
  colSpan: 12,
  settings: { showIcons: true, showDetails: true, compactMode: false },
  isSelected: false,
  isCustomizing: false,
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
