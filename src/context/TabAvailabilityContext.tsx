'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  PlatformTabKey,
  TabConfig,
  TabStatusMap,
  PLATFORM_TABS,
  DEFAULT_TAB_STATUS
} from '@/types/tabAvailability';
import { createClient } from '@/lib/supabase/client';

const STORAGE_KEY = 'bancoresidencia_tab_availability_v1';
const SUPABASE_SETTINGS_KEY = 'tab_availability_settings';

interface TabAvailabilityContextType {
  tabStatus: TabStatusMap;
  isTabActive: (tabKey: PlatformTabKey) => boolean;
  toggleTab: (tabKey: PlatformTabKey, explicitState?: boolean) => Promise<void>;
  resetAllTabs: () => Promise<void>;
  previewAsStudent: boolean;
  setPreviewAsStudent: (preview: boolean) => void;
  getTabByPath: (pathname: string) => TabConfig | undefined;
}

const TabAvailabilityContext = createContext<TabAvailabilityContextType | undefined>(undefined);

export const TabAvailabilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tabStatus, setTabStatus] = useState<TabStatusMap>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...DEFAULT_TAB_STATUS, ...parsed };
        }
      } catch (err) {
        console.warn('Erro ao carregar status de abas do storage:', err);
      }
    }
    return DEFAULT_TAB_STATUS;
  });

  const [previewAsStudent, setPreviewAsStudent] = useState<boolean>(false);
  const supabase = useMemo(() => createClient(), []);

  // Sincroniza inicialmente com Supabase se a tabela/config existir
  useEffect(() => {
    let isMounted = true;

    async function loadFromRemote() {
      try {
        const { data, error } = await supabase
          .from('platform_settings')
          .select('value')
          .eq('key', SUPABASE_SETTINGS_KEY)
          .maybeSingle();

        if (!error && data?.value && isMounted) {
          const remoteStatus = data.value as TabStatusMap;
          setTabStatus((prev) => {
            const merged = { ...prev, ...remoteStatus };
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      } catch {
        // Tabela opcional ou offline: fallback gracioso para localStorage
      }
    }

    loadFromRemote();

    // Sincroniza abas abertas no mesmo navegador
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setTabStatus((prev) => ({ ...prev, ...parsed }));
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [supabase]);

  const isTabActive = useCallback(
    (tabKey: PlatformTabKey): boolean => {
      return tabStatus[tabKey] !== false;
    },
    [tabStatus]
  );

  const toggleTab = useCallback(
    async (tabKey: PlatformTabKey, explicitState?: boolean) => {
      const nextState = explicitState !== undefined ? explicitState : !tabStatus[tabKey];
      const updatedStatus: TabStatusMap = {
        ...tabStatus,
        [tabKey]: nextState
      };

      // 1. Atualiza estado e localStorage instantaneamente (0ms feedback)
      setTabStatus(updatedStatus);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStatus));
      } catch (err) {
        console.warn('Erro ao salvar status de abas no localStorage:', err);
      }

      // 2. Tenta persistir no Supabase para sincronizar com todos os estudantes
      try {
        await supabase
          .from('platform_settings')
          .upsert({
            key: SUPABASE_SETTINGS_KEY,
            value: updatedStatus,
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });
      } catch {
        // Fallback silencioso mantendo o localStorage
      }
    },
    [tabStatus, supabase]
  );

  const resetAllTabs = useCallback(async () => {
    setTabStatus(DEFAULT_TAB_STATUS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TAB_STATUS));
      await supabase
        .from('platform_settings')
        .upsert({
          key: SUPABASE_SETTINGS_KEY,
          value: DEFAULT_TAB_STATUS,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
    } catch {}
  }, [supabase]);

  const getTabByPath = useCallback((pathname: string): TabConfig | undefined => {
    if (!pathname) return undefined;
    const cleanPath = pathname.split('?')[0];

    // Mapeamento de rotas para abas
    if (cleanPath === '/' || cleanPath === '/dashboard') {
      return PLATFORM_TABS.find((t) => t.key === 'home');
    }
    if (cleanPath.startsWith('/agenda')) {
      return PLATFORM_TABS.find((t) => t.key === 'agenda');
    }
    if (cleanPath.startsWith('/questoes')) {
      return PLATFORM_TABS.find((t) => t.key === 'banco');
    }
    if (cleanPath.startsWith('/caderno-de-erros')) {
      return PLATFORM_TABS.find((t) => t.key === 'caderno_erros');
    }
    if (cleanPath.startsWith('/flashcards')) {
      return PLATFORM_TABS.find((t) => t.key === 'flashcards');
    }
    if (cleanPath.startsWith('/resumos')) {
      return PLATFORM_TABS.find((t) => t.key === 'resumos');
    }
    if (cleanPath.startsWith('/listas')) {
      return PLATFORM_TABS.find((t) => t.key === 'listas');
    }
    if (cleanPath.startsWith('/provas')) {
      return PLATFORM_TABS.find((t) => t.key === 'provas');
    }
    if (cleanPath.startsWith('/simulados')) {
      return PLATFORM_TABS.find((t) => t.key === 'simulados');
    }
    if (cleanPath.startsWith('/desempenho')) {
      return PLATFORM_TABS.find((t) => t.key === 'stats');
    }
    if (cleanPath.startsWith('/ranking')) {
      return PLATFORM_TABS.find((t) => t.key === 'ranking');
    }
    if (cleanPath.startsWith('/configuracoes')) {
      return PLATFORM_TABS.find((t) => t.key === 'configuracoes');
    }

    return undefined;
  }, []);

  return (
    <TabAvailabilityContext.Provider
      value={{
        tabStatus,
        isTabActive,
        toggleTab,
        resetAllTabs,
        previewAsStudent,
        setPreviewAsStudent,
        getTabByPath
      }}
    >
      {children}
    </TabAvailabilityContext.Provider>
  );
};

export const useTabAvailability = () => {
  const context = useContext(TabAvailabilityContext);
  if (!context) {
    return {
      tabStatus: DEFAULT_TAB_STATUS,
      isTabActive: () => true,
      toggleTab: async () => {},
      resetAllTabs: async () => {},
      previewAsStudent: false,
      setPreviewAsStudent: () => {},
      getTabByPath: () => undefined
    };
  }
  return context;
};
