'use client';
import { useState } from 'react';
import { ShieldCheck, Gift, Tag, Loader2, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { BackArrowButton } from '@/components/ui/BackArrowButton';
import type { PlanDefinition } from '@/config/plans';
import { verifyCheckoutCoupon, removeAppliedReferralCode, type AppliedReferral } from '@/config/ambassadorConfig';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  basePlan: PlanDefinition;
  effectivePlan: PlanDefinition;
  appliedReferral: AppliedReferral | null;
  onCouponChange: (value: AppliedReferral | null) => void;
  onBack: () => void;
}
export function CheckoutPlanSummary({ basePlan, effectivePlan, appliedReferral, onCouponChange, onBack }: Props) {
  const { accentConfig } = useTheme();
  const discountPercent = appliedReferral?.discountPercent || 0;
  const hasDiscount = discountPercent > 0;
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Aplica cupom de desconto
  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCouponFeedback(null);
    if (!couponInput.trim()) {
      setCouponFeedback({ type: 'error', text: 'Informe um código de cupom ou indicação válido.' });
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const res = await verifyCheckoutCoupon(couponInput);
      if (res.success && res.referral) {
        onCouponChange(res.referral);
        setCouponFeedback({
          type: 'success',
          text: `Cupom ${res.referral.code} aplicado com sucesso! ${res.referral.discountPercent}% de desconto ativado.`
        });
        setCouponInput('');
      } else {
        setCouponFeedback({ type: 'error', text: res.message });
      }
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Remove cupom de desconto
  const handleRemoveCoupon = () => {
    removeAppliedReferralCode();
    onCouponChange(null);
    setCouponFeedback({ type: 'success', text: 'Cupom removido.' });
  };


  return <>      {/* Botão Voltar e Resumo do Plano */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <BackArrowButton onClick={onBack} title="Trocar de plano" ariaLabel="Voltar" />
        <div className="text-right">
          <div className="text-xs text-slate-400">Plano Selecionado</div>
          <div className="text-sm font-black text-slate-900 dark:text-white">{basePlan.name}</div>
        </div>
      </div>

      {/* Caixa de Resumo de Valor e Garantia */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Total a ser pago
            </span>
            {hasDiscount && (
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                {discountPercent}% OFF
              </span>
            )}
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
            R$ {effectivePlan.totalPrice.toFixed(2).replace('.', ',')}
            {hasDiscount && (
              <span className="text-xs font-semibold text-slate-400 line-through ml-2">
                R$ {basePlan.totalPrice.toFixed(2).replace('.', ',')}
              </span>
            )}
            {effectivePlan.maxInstallments > 1 && (
              <span className="text-xs font-normal text-slate-500 ml-2">
                (em até {effectivePlan.maxInstallments}x de R$ {effectivePlan.installmentValue.toFixed(2).replace('.', ',')})
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl shrink-0">
          <ShieldCheck className="w-4 h-4" />
          Garantia 7 dias
        </div>
      </div>

      {/* SEÇÃO DINÂMICA DE CUPOM DE DESCONTO / CÓDIGO DE INDICAÇÃO */}
      {appliedReferral ? (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-between gap-3 shadow-xs animate-in zoom-in-95">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Gift className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-black text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 tracking-wider">
                  {appliedReferral.code}
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                  {appliedReferral.discountPercent}% OFF Aplicado
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate mt-0.5">
                Cupom de <strong>{appliedReferral.referrerName}</strong>. Desconto aplicado no total!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemoveCoupon}
            className="text-xs font-bold text-slate-500 hover:text-rose-500 underline transition-colors shrink-0 cursor-pointer"
          >
            Remover cupom
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Tem um cupom de desconto ou código de indicação?
            </span>
          </div>
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => {
                setCouponInput(e.target.value.toUpperCase());
                setCouponFeedback(null);
              }}
              placeholder="Cupom (ex: RESIDENCIA10)"
              className="flex-1 min-w-0 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-base sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!couponInput.trim() || isApplyingCoupon}
              className="px-4 py-2 rounded-xl text-xs font-extrabold text-white shadow-sm transition-all hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shrink-0"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              {isApplyingCoupon ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>Aplicar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {couponFeedback && (
            <div
              className={`mt-2 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                couponFeedback.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
              }`}
            >
              {couponFeedback.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{couponFeedback.text}</span>
            </div>
          )}
        </div>
      )}

</>;
}
