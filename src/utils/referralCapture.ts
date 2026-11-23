/**
 * Utilitário de Captura e Persistência de Código de Indicação / Cupom (Programa de Embaixadores)
 * Garante rastreabilidade integral de cliques em links com ?ref= ou ?cupom=
 * Compatível com SSR (Next.js) e armazenamento redundante em Cookie + LocalStorage.
 */

import {
  normalizeReferralCode,
  verifyCheckoutCoupon,
  AppliedReferral
} from '@/config/ambassadorConfig';

const APPLIED_REFERRAL_KEY = 'bancoresidencia_applied_referral';
const REFERRAL_COOKIE_NAME = 'br_referral_code';
const COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 dias

/**
 * Lê o cookie no lado do cliente
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Grava o cookie no lado do cliente com validade de 30 dias e SameSite=Lax
 */
function setCookie(name: string, value: string, maxAgeSeconds: number = COOKIE_MAX_AGE_SECONDS): void {
  if (typeof document === 'undefined') return;
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

/**
 * Remove o cookie no lado do cliente
 */
function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * Obtém o código de indicação persistido no navegador (prioriza LocalStorage, fallback para Cookie)
 */
export function getPersistedReferralCode(): AppliedReferral | null {
  if (typeof window === 'undefined') return null;

  // 1. Tenta ler do LocalStorage
  try {
    const raw = localStorage.getItem(APPLIED_REFERRAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppliedReferral;
      if (parsed && parsed.code) {
        return parsed;
      }
    }
  } catch {
    // Falha silenciosa de JSON
  }

  // 2. Fallback: Lê do Cookie
  const cookieCode = getCookie(REFERRAL_COOKIE_NAME);
  if (cookieCode) {
    const clean = normalizeReferralCode(cookieCode);
    if (clean.length >= 3 && clean.length <= 20) {
      return {
        code: clean,
        referrerName: 'Embaixador Banco Residência',
        discountPercent: 10,
        appliedAt: new Date().toISOString()
      };
    }
  }

  return null;
}

/**
 * Captura e valida código de indicação a partir dos parâmetros de busca da URL (?ref= ou ?cupom=).
 * Se for válido, persiste em cookie (30 dias) e LocalStorage.
 */
export async function captureReferralFromUrl(searchParams?: URLSearchParams | null): Promise<AppliedReferral | null> {
  if (typeof window === 'undefined') return null;

  let rawCode: string | null = null;

  if (searchParams) {
    rawCode = searchParams.get('ref') || searchParams.get('cupom') || searchParams.get('coupon');
  } else {
    try {
      const currentUrl = new URL(window.location.href);
      rawCode = currentUrl.searchParams.get('ref') || currentUrl.searchParams.get('cupom') || currentUrl.searchParams.get('coupon');
    } catch {
      rawCode = null;
    }
  }

  if (!rawCode) {
    // Se não há na URL, retorna o que já estiver persistido
    return getPersistedReferralCode();
  }

  const clean = normalizeReferralCode(rawCode);
  if (clean.length < 3 || clean.length > 20) {
    return getPersistedReferralCode();
  }

  try {
    // Valida no backend para garantir que o cupom seja legítimo
    const res = await verifyCheckoutCoupon(clean);
    if (res.success && res.referral) {
      setCookie(REFERRAL_COOKIE_NAME, clean);
      return res.referral;
    }
  } catch {
    // Se a validação remota falhar por rede, grava temporariamente com flag otimista
    const fallbackReferral: AppliedReferral = {
      code: clean,
      referrerName: 'Colega Embaixador',
      discountPercent: 10,
      appliedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(APPLIED_REFERRAL_KEY, JSON.stringify(fallbackReferral));
      setCookie(REFERRAL_COOKIE_NAME, clean);
      return fallbackReferral;
    } catch {
      // ignore
    }
  }

  return getPersistedReferralCode();
}

/**
 * Limpa completamente o cupom/indicação aplicado (LocalStorage + Cookie)
 */
export function clearPersistedReferral(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(APPLIED_REFERRAL_KEY);
    } catch {
      // ignore
    }
    deleteCookie(REFERRAL_COOKIE_NAME);
  }
}
