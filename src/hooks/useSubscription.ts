'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

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

export function useSubscription() {
  const { user } = useAuth();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [currentTimestamp] = useState(() => Date.now());
  const [dailyResolvedCount, setDailyResolvedCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const todayKey = `bancoresidencia_daily_q_${new Date().toISOString().slice(0, 10)}`;
      return parseInt(localStorage.getItem(todayKey) || '0', 10);
    } catch {
      return 0;
    }
  });

  // Checagem de Administrador / Curador
  const isAdmin = Boolean(
    user && (
      user.role === 'admin' ||
      user.role === 'curator' ||
      user.role === 'curador' ||
      user.role === 'superadmin'
    )
  );

  // Checagem de Expiração da Assinatura
  const isSubscriptionExpired = Boolean(
    user?.subscriptionExpiresAt &&
    new Date(user.subscriptionExpiresAt).getTime() <= currentTimestamp
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

  const incrementDailyCount = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const todayKey = `bancoresidencia_daily_q_${new Date().toISOString().slice(0, 10)}`;
      const current = parseInt(localStorage.getItem(todayKey) || '0', 10);
      const next = current + 1;
      localStorage.setItem(todayKey, String(next));
      setDailyResolvedCount(next);
    } catch {
      // ignore
    }
  }, []);

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

  return {
    plan,
    planConfig,
    isAdmin,
    isSubscriptionExpired,
    isUpgradeModalOpen,
    setIsUpgradeModalOpen,
    dailyResolvedCount,
    questionsRemainingToday,
    isFreeLimitReached,
    canSolveQuestion,
    incrementDailyCount
  };
}
