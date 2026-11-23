import assert from 'assert';
import {
  getDefaultPricingSettings,
  getStoredPlanPricing,
  getEffectivePlan
} from '../src/services/planPricingService';

async function runTests() {
  console.log('=== TESTES DO SERVIÇO DE PREÇOS DOS PLANOS & MERCADO PAGO ===\n');

  // 1. Testa configurações padrões de fábrica
  const defaults = getDefaultPricingSettings();
  assert(defaults !== null, 'Defaults não devem ser nulos');
  assert.strictEqual(defaults.showPricesOnSite, false, 'Preços devem iniciar ocultos no site');
  assert(defaults.plans.monthly, 'Plano mensal deve existir');
  assert(defaults.plans.annual, 'Plano anual deve existir');
  assert.strictEqual(defaults.plans.monthly.totalPrice, 49.90, 'Preço mensal padrão deve ser 49.90');
  assert.strictEqual(defaults.plans.annual.totalPrice, 310.80, 'Preço anual padrão deve ser 310.80');
  console.log('✓ 1. Configurações padrões de fábrica validadas.');

  // 2. Testa carregamento de preços (getStoredPlanPricing)
  const stored = await getStoredPlanPricing();
  assert(stored !== null, 'Configuração armazenada não deve ser nula');
  assert(typeof stored.showPricesOnSite === 'boolean', 'showPricesOnSite deve ser booleano');
  assert(stored.plans.semiannual.totalPrice > 0, 'Plano semestral deve ter preço > 0');
  console.log('✓ 2. Carregamento resiliente (Supabase / cache em disco) validado.');

  // 3. Testa getEffectivePlan para cobrança dinâmica no Mercado Pago
  const effectiveAnnual = await getEffectivePlan('annual');
  assert.strictEqual(effectiveAnnual.id, 'annual', 'ID do plano deve ser annual');
  assert(effectiveAnnual.totalPrice > 0, 'Preço do plano anual para o Mercado Pago deve ser > 0');
  assert(effectiveAnnual.maxInstallments >= 1, 'Parcelamento máximo deve ser >= 1');
  console.log('✓ 3. Resolução de plano dinâmico para Mercado Pago validada.');

  console.log('\n🎉 TODOS OS TESTES DE PREÇOS DE PLANOS FORAM APROVADOS!');
}

runTests().catch((err) => {
  console.error('Falha nos testes de planPricingService:', err);
  process.exit(1);
});
