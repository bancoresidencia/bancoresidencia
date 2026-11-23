import fs from 'fs';
import path from 'path';
import { PLANS, PlanId, PlanDefinition } from '@/config/plans';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/adminClient';
import { PlatformPricingSettings, PlanPricingItem } from '@/types/planPricing';
import { getDefaultPricingSettings } from '@/config/planPricingDefaults';

export type { PlatformPricingSettings, PlanPricingItem };
export { getDefaultPricingSettings };

export const SETTINGS_PLAN_PRICING_KEY = 'plan_pricing';
const CACHE_FILE_PATH = path.resolve(process.cwd(), 'data', 'platform_plans.json');

let inMemoryCache: PlatformPricingSettings | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 15000; // 15 segundos

function readFromFile(): PlatformPricingSettings | null {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const raw = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.plans === 'object') {
        return parsed as PlatformPricingSettings;
      }
    }
  } catch (err) {
    console.warn('[planPricingService] Erro ao ler platform_plans.json:', err);
  }
  return null;
}

function writeToFile(settings: PlatformPricingSettings): void {
  try {
    const dir = path.dirname(CACHE_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[planPricingService] Erro ao gravar platform_plans.json:', err);
  }
}

/**
 * Obtém a configuração vigente de preços de planos (Supabase -> Cache Local -> Padrão)
 */
export async function getStoredPlanPricing(): Promise<PlatformPricingSettings> {
  const now = Date.now();
  if (inMemoryCache && now - lastCacheTime < CACHE_TTL_MS) {
    return inMemoryCache;
  }

  const defaultSettings = getDefaultPricingSettings();

  // 1. Tenta carregar do Supabase (platform_settings)
  if (isSupabaseAdminConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', SETTINGS_PLAN_PRICING_KEY)
        .maybeSingle();

      if (!error && data?.value && typeof data.value === 'object') {
        const val = data.value as Partial<PlatformPricingSettings>;
        const merged: PlatformPricingSettings = {
          showPricesOnSite: typeof val.showPricesOnSite === 'boolean' ? val.showPricesOnSite : defaultSettings.showPricesOnSite,
          plans: {
            ...defaultSettings.plans,
            ...(val.plans || {})
          },
          updatedAt: val.updatedAt || defaultSettings.updatedAt,
          updatedBy: val.updatedBy
        };

        inMemoryCache = merged;
        lastCacheTime = now;
        writeToFile(merged);
        return merged;
      }
    } catch (err) {
      console.warn('[planPricingService] Falha ao consultar Supabase, utilizando fallback:', err);
    }
  }

  // 2. Fallback de alta disponibilidade em disco
  const fileSettings = readFromFile();
  if (fileSettings) {
    const merged: PlatformPricingSettings = {
      ...defaultSettings,
      ...fileSettings,
      plans: {
        ...defaultSettings.plans,
        ...fileSettings.plans
      }
    };
    inMemoryCache = merged;
    lastCacheTime = now;
    return merged;
  }

  // 3. Padrão inicial
  inMemoryCache = defaultSettings;
  lastCacheTime = now;
  return defaultSettings;
}

/**
 * Salva a configuração atualizada de preços no Supabase e no cache local
 */
export async function savePlanPricing(
  settings: PlatformPricingSettings,
  userEmail?: string
): Promise<{ success: boolean; error?: string; settings?: PlatformPricingSettings }> {
  try {
    const defaultSettings = getDefaultPricingSettings();
    const updatedSettings: PlatformPricingSettings = {
      showPricesOnSite: Boolean(settings.showPricesOnSite),
      plans: {
        ...defaultSettings.plans,
        ...settings.plans
      },
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail || 'admin'
    };

    // Grava no disco imediatamente
    writeToFile(updatedSettings);
    inMemoryCache = updatedSettings;
    lastCacheTime = Date.now();

    // Persiste no Supabase
    if (isSupabaseAdminConfigured()) {
      const supabase = getSupabaseAdmin();
      const { error } = await supabase
        .from('platform_settings')
        .upsert({
          key: SETTINGS_PLAN_PRICING_KEY,
          value: updatedSettings,
          updated_at: updatedSettings.updatedAt
        }, { onConflict: 'key' });

      if (error) {
        console.error('[planPricingService] Erro ao persistir no Supabase:', error);
        return { success: false, error: error.message };
      }
    }

    return { success: true, settings: updatedSettings };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Falha ao salvar configurações de preços.';
    console.error('[planPricingService] Erro:', err);
    return { success: false, error: msg };
  }
}

/**
 * Retorna uma definição canônica PlanDefinition enriquecida com os preços atuais do Supabase
 */
export async function getEffectivePlan(planId: PlanId): Promise<PlanDefinition> {
  const base = PLANS[planId] || PLANS.annual;
  try {
    const config = await getStoredPlanPricing();
    const stored = config.plans[planId];
    if (stored) {
      return {
        ...base,
        name: stored.name || base.name,
        badge: stored.badge !== undefined ? stored.badge : base.badge,
        totalPrice: Number(stored.totalPrice) || base.totalPrice,
        monthlyEquivalent: Number(stored.monthlyEquivalent) || base.monthlyEquivalent,
        maxInstallments: Number(stored.maxInstallments) || base.maxInstallments,
        installmentValue: Number(stored.installmentValue) || base.installmentValue,
        savingsPercentage: Number(stored.savingsPercentage) || base.savingsPercentage
      };
    }
  } catch (err) {
    console.warn('[planPricingService] Falha ao recuperar plano dinâmico, usando fallback estático:', err);
  }
  return base;
}
