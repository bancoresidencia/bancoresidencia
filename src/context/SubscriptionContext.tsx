'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PlanDefinition } from '@/config/plans';
import { SubscriptionModal } from '@/components/SubscriptionModal';
import { createClient } from '@/lib/supabase/client';

export type PlanType = 'free' | 'pro' | 'premium';

export interface SubscriptionFeatures {
  name: string;
  maxDailyQuestions: number;
  hasIRTMetrics: boolean;
  hasOfficialExamsFull: boolean;
  hasCustomNotebooks: boolean;
  hasSpecialtyAnalytics: boolean;
  hasPrioritySupport: boolean;
}

export const PLAN_CONFIGS: Record<PlanType, SubscriptionFeatures> = {
  free: {
    name: 'Gratuito',
    maxDailyQuestions: 10,
    hasIRTMetrics: false,
    hasOfficialExamsFull: false,
    hasCustomNotebooks: true,
    hasSpecialtyAnalytics: false,
    hasPrioritySupport: false
  },
  pro: {
    name: 'Pro Residência',
    maxDailyQuestions: Infinity,
    hasIRTMetrics: true,
    hasOfficialExamsFull: true,
    hasCustomNotebooks: true,
    hasSpecialtyAnalytics: true,
    hasPrioritySupport: false
  },
  premium: {
    name: 'R+ & Título Premium',
    maxDailyQuestions: Infinity,
    hasIRTMetrics: true,
    hasOfficialExamsFull: true,
    hasCustomNotebooks: true,
    hasSpecialtyAnalytics: true,
    hasPrioritySupport: true
  }
};

export interface SubscriptionContextType {
  plan: PlanType;
  planConfig: SubscriptionFeatures;
  isAdmin: boolean;
  isSubscriptionExpired: boolean;
  isUpgradeModalOpen: boolean;
  selectedPlanForCheckout: PlanDefinition | null;
  isLimitReached: boolean;
  dailyResolvedCount: number;
  questionsRemainingToday: number;
  isFreeLimitReached: boolean;
  openUpgradeModal: (initialPlan?: PlanDefinition | null, limitReached?: boolean) => void;
  closeUpgradeModal: () => void;
  setIsUpgradeModalOpen: (open: boolean) => void;
  canSolveQuestion: () => boolean;
  incrementDailyCount: () => void;
  syncDailyCountFromRemote?: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isUpgradeModalOpen, setIsUpgradeModalOpenState] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PlanDefinition | null>(null);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const getDailyQuotaStorageKey = useCallback((uid?: string | null) => {
    const todayUtc = new Date().toISOString().slice(0, 10);
    return `bancoresidencia_daily_q_${uid || 'guest'}_${todayUtc}`;
  }, []);

  const [dailyResolvedCount, setDailyResolvedCount] = useState<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const key = getDailyQuotaStorageKey(user?.id);
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        setDailyResolvedCount(parseInt(saved, 10) || 0);
      } else if (!user?.id) {
        const legacyKey = `bancoresidencia_daily_q_${new Date().toISOString().slice(0, 10)}`;
        setDailyResolvedCount(parseInt(localStorage.getItem(legacyKey) || '0', 10) || 0);
      } else {
        setDailyResolvedCount(0);
      }
    } catch {
      setDailyResolvedCount(0);
    }
  }, [user?.id, getDailyQuotaStorageKey]);

  // Checagem de Administrador / Curador
  const isAdmin = Boolean(
    user && (
      user.role === 'admin' ||
      user.role === 'curator' ||
      user.role === 'curador' ||
      user.role === 'superadmin'
    )
  );

  // Checagem dinâmica de Expiração da Assinatura (atualiza caso atravesse meia-noite)
  const [nowTimestamp, setNowTimestamp] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNowTimestamp(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const isSubscriptionExpired = Boolean(
    user?.subscriptionExpiresAt &&
    new Date(user.subscriptionExpiresAt).getTime() <= nowTimestamp
  );

  // Plano Efetivo
  let plan: PlanType = 'free';
  if (isAdmin) {
    plan = 'pro';
  } else if (
    (user?.subscriptionPlan === 'pro' || user?.subscriptionPlan === 'premium') &&
    user?.subscriptionStatus === 'active' &&
    !isSubscriptionExpired
  ) {
    plan = user.subscriptionPlan as PlanType;
  }

  const planConfig = PLAN_CONFIGS[plan] || PLAN_CONFIGS.free;

  // Sincronização em segundo plano da contagem diária real no Supabase
  const syncDailyCountFromRemote = useCallback(async () => {
    if (!user?.id || user.id === 'demo-student' || typeof window === 'undefined') return;

    try {
      const supabase = createClient();
      const startOfDay = new Date();
      startOfDay.setUTCHours(0, 0, 0, 0);

      const { count, error } = await supabase
        .from('user_answers')
        .select('question_id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('answered_at', startOfDay.toISOString());

      if (!error && typeof count === 'number') {
        setDailyResolvedCount((prevLocal) => {
          const synced = Math.max(prevLocal, count);
          try {
            const todayKey = getDailyQuotaStorageKey(user.id);
            localStorage.setItem(todayKey, String(synced));
          } catch {}
          return synced;
        });
      }
    } catch (err) {
      console.warn('[SubscriptionContext] Erro ao sincronizar contagem diária:', err);
    }
  }, [user?.id, getDailyQuotaStorageKey]);

  useEffect(() => {
    syncDailyCountFromRemote();

    if (typeof window === 'undefined') return;
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncDailyCountFromRemote();
      }
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === getDailyQuotaStorageKey(user?.id) && e.newValue) {
        setDailyResolvedCount(parseInt(e.newValue, 10) || 0);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('online', syncDailyCountFromRemote);
    window.addEventListener('storage', handleStorage);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('online', syncDailyCountFromRemote);
      window.removeEventListener('storage', handleStorage);
    };
  }, [syncDailyCountFromRemote, getDailyQuotaStorageKey, user?.id]);

  const incrementDailyCount = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const todayKey = getDailyQuotaStorageKey(user?.id);
      const current = parseInt(localStorage.getItem(todayKey) || '0', 10);
      const next = current + 1;
      localStorage.setItem(todayKey, String(next));
      setDailyResolvedCount(next);
    } catch {
      // ignore
    }
  }, [user?.id, getDailyQuotaStorageKey]);

  const canSolveQuestion = useCallback(() => {
    if (isAdmin) return true;
    if (planConfig.maxDailyQuestions === Infinity) return true;
    return dailyResolvedCount < planConfig.maxDailyQuestions;
  }, [isAdmin, planConfig.maxDailyQuestions, dailyResolvedCount]);

  const isFreeLimitReached = Boolean(
    !isAdmin &&
    planConfig.maxDailyQuestions !== Infinity &&
    dailyResolvedCount >= planConfig.maxDailyQuestions
  );

  const questionsRemainingToday =
    planConfig.maxDailyQuestions === Infinity
      ? Infinity
      : Math.max(0, planConfig.maxDailyQuestions - dailyResolvedCount);

  const openUpgradeModal = useCallback((initialPlan?: PlanDefinition | null, limitReached?: boolean) => {
    setSelectedPlanForCheckout(initialPlan || null);
    setIsLimitReached(Boolean(limitReached));
    setIsUpgradeModalOpenState(true);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpenState(false);
    setSelectedPlanForCheckout(null);
    setIsLimitReached(false);
  }, []);

  const setIsUpgradeModalOpen = useCallback((open: boolean) => {
    if (open) {
      openUpgradeModal();
    } else {
      closeUpgradeModal();
    }
  }, [openUpgradeModal, closeUpgradeModal]);

  const value = useMemo<SubscriptionContextType>(() => ({
    plan,
    planConfig,
    isAdmin,
    isSubscriptionExpired,
    isUpgradeModalOpen,
    selectedPlanForCheckout,
    isLimitReached,
    dailyResolvedCount,
    questionsRemainingToday,
    isFreeLimitReached,
    openUpgradeModal,
    closeUpgradeModal,
    setIsUpgradeModalOpen,
    canSolveQuestion,
    incrementDailyCount,
    syncDailyCountFromRemote
  }), [
    plan,
    planConfig,
    isAdmin,
    isSubscriptionExpired,
    isUpgradeModalOpen,
    selectedPlanForCheckout,
    isLimitReached,
    dailyResolvedCount,
    questionsRemainingToday,
    isFreeLimitReached,
    openUpgradeModal,
    closeUpgradeModal,
    setIsUpgradeModalOpen,
    canSolveQuestion,
    incrementDailyCount,
    syncDailyCountFromRemote
  ]);

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
      <SubscriptionModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        currentPlan={plan}
        initialPlan={selectedPlanForCheckout}
        limitReached={isLimitReached}
      />
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextType {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
