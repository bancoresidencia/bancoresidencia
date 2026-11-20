import { getSupabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/adminClient';
import {
  AMBASSADOR_CONFIG,
  DEFAULT_PRESET_REFERRALS,
  AmbassadorStats,
  ReferralSale,
  AmbassadorWithdrawalRecord,
  normalizeReferralCode,
  computeSaleMaturity
} from '@/config/ambassadorConfig';

const IS_PROD = process.env.NODE_ENV === 'production';

// Store em memória para fallback caso o banco Postgres não tenha a migration 013 executada ainda
interface FallbackStore {
  sales: Record<string, ReferralSale[]>;
  withdrawals: Record<string, AmbassadorWithdrawalRecord[]>;
  codes: Record<string, string>;
  pixKeys: Record<string, { key: string; type: 'cpf' | 'email' | 'phone' | 'random' }>;
  refunds: Record<string, boolean>;
}

const memoryFallback: FallbackStore = {
  sales: {},
  withdrawals: {},
  codes: {},
  pixKeys: {},
  refunds: {}
};

/**
 * Obtém ou gera o código de indicação do aluno no banco de dados
 */
export async function getOrGenerateUserReferralCode(userId: string, userName?: string): Promise<string> {
  const cleanIdPart = userId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() || '10';
  const namePart = (userName || 'ALUNO')
    .split(' ')[0]
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '') || 'MED';

  const defaultCode = `MED-${namePart}-${cleanIdPart}`;

  try {
    const supabase = getSupabaseAdmin();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('referral_code')
      .eq('id', userId)
      .maybeSingle();

    if (!error && profile?.referral_code) {
      return normalizeReferralCode(profile.referral_code);
    }

    // Se a coluna existir mas estiver nula, salva o código gerado
    if (!error && profile && !profile.referral_code) {
      await supabase
        .from('profiles')
        .update({ referral_code: defaultCode })
        .eq('id', userId);
      return defaultCode;
    }
  } catch {
    // Se tabela ou coluna não existir ainda, usa fallback
  }

  if (memoryFallback.codes[userId]) {
    return memoryFallback.codes[userId];
  }

  memoryFallback.codes[userId] = defaultCode;
  return defaultCode;
}

/**
 * Atualiza o código de indicação customizado do aluno
 */
export async function updateUserReferralCode(
  userId: string,
  newCode: string
): Promise<{ success: boolean; message: string; code?: string }> {
  const clean = normalizeReferralCode(newCode);
  if (clean.length < 3) {
    return { success: false, message: 'O código deve ter pelo menos 3 caracteres.' };
  }
  if (clean.length > 20) {
    return { success: false, message: 'O código pode ter no máximo 20 caracteres.' };
  }

  try {
    const supabase = getSupabaseAdmin();

    // Checa se outro usuário já usa esse código
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('referral_code', clean)
      .neq('id', userId)
      .maybeSingle();

    if (existing) {
      return { success: false, message: 'Este código de indicação já está sendo utilizado por outro estudante.' };
    }

    const { error } = await supabase
      .from('profiles')
      .update({ referral_code: clean })
      .eq('id', userId);

    if (error) {
      // Fallback
      memoryFallback.codes[userId] = clean;
      return { success: true, message: 'Código de indicação atualizado com sucesso!', code: clean };
    }

    return { success: true, message: 'Código de indicação atualizado com sucesso!', code: clean };
  } catch {
    memoryFallback.codes[userId] = clean;
    return { success: true, message: 'Código de indicação atualizado com sucesso!', code: clean };
  }
}

/**
 * Retorna as estatísticas completas de embaixador do aluno pelo backend
 */
export async function getBackendAmbassadorStats(userId: string, userName?: string): Promise<AmbassadorStats> {
  const referralCode = await getOrGenerateUserReferralCode(userId, userName);

  let rawSales: ReferralSale[] = [];
  let rawWithdrawals: AmbassadorWithdrawalRecord[] = [];
  let planRefundRequested = false;

  try {
    const supabase = getSupabaseAdmin();

    // 1. Busca vendas registradas no PostgreSQL
    const { data: dbSales, error: salesErr } = await supabase
      .from('ambassador_referrals')
      .select('*')
      .eq('referrer_id', userId)
      .order('confirmed_at', { ascending: false });

    if (!salesErr && dbSales) {
      rawSales = dbSales.map((s) => ({
        id: s.id,
        studentName: s.student_name,
        studentEmailMasked: s.student_email_masked,
        planName: s.plan_name,
        planAmount: Number(s.plan_amount),
        discountApplied: Number(s.discount_applied),
        netAmount: Number(s.net_amount),
        commissionAmount: Number(s.commission_amount),
        date: new Date(s.confirmed_at).toLocaleDateString('pt-BR'),
        confirmedAt: s.confirmed_at,
        maturesAt: s.matures_at,
        retentionDays: s.retention_days || AMBASSADOR_CONFIG.retentionDays,
        isMatured: false,
        daysRemaining: 0,
        status: s.status as 'confirmed' | 'refunded' | 'cancelled'
      }));
    } else {
      rawSales = memoryFallback.sales[userId] || [];
    }

    // 2. Busca saques solicitados no PostgreSQL
    const { data: dbWithdrawals, error: withErr } = await supabase
      .from('ambassador_withdrawals')
      .select('*')
      .eq('user_id', userId)
      .order('requested_at', { ascending: false });

    if (!withErr && dbWithdrawals) {
      rawWithdrawals = dbWithdrawals.map((w) => ({
        id: w.id,
        amount: Number(w.amount),
        pixKey: w.pix_key,
        pixKeyType: w.pix_key_type,
        requestedAt: w.requested_at,
        status: w.status
      }));
    } else {
      rawWithdrawals = memoryFallback.withdrawals[userId] || [];
    }

    // 3. Busca solicitações de reembolso de plano no PostgreSQL
    const { data: dbRefund, error: refErr } = await supabase
      .from('ambassador_refund_requests')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!refErr && dbRefund) {
      planRefundRequested = true;
    } else {
      planRefundRequested = !!memoryFallback.refunds[userId];
    }
  } catch {
    rawSales = memoryFallback.sales[userId] || [];
    rawWithdrawals = memoryFallback.withdrawals[userId] || [];
    planRefundRequested = !!memoryFallback.refunds[userId];
  }

  // Processa as vendas calculando maturidade com base na regra de 7 dias
  const sales: ReferralSale[] = rawSales.map((sale) => {
    const maturity = computeSaleMaturity(sale);
    return {
      ...sale,
      confirmedAt: maturity.confirmedAt,
      maturesAt: maturity.maturesAt,
      isMatured: maturity.isMatured,
      daysRemaining: maturity.daysRemaining
    };
  });

  const confirmedSales = sales.filter((s) => s.status === 'confirmed');
  const validSales = confirmedSales.filter((s) => s.isMatured);
  const pendingSales = confirmedSales.filter((s) => !s.isMatured);

  const salesCount = confirmedSales.length;
  const validSalesCount = validSales.length;
  const pendingSalesCount = pendingSales.length;

  const totalVolume = confirmedSales.reduce((acc, s) => acc + s.netAmount, 0);
  const totalCommission = confirmedSales.reduce((acc, s) => acc + s.commissionAmount, 0);
  const maturedCommission = validSales.reduce((acc, s) => acc + s.commissionAmount, 0);
  const pendingCommission = pendingSales.reduce((acc, s) => acc + s.commissionAmount, 0);

  const withdrawnBalance = rawWithdrawals
    .filter((w) => w.status !== 'rejected')
    .reduce((acc, w) => acc + w.amount, 0);

  // O saldo disponível para saque decorre exclusivamente das vendas maduras (permanência >= 7 dias)
  const availableBalance = Math.max(0, parseFloat((maturedCommission - withdrawnBalance).toFixed(2)));

  // Regra Estrita do Aluno:
  // Ao atingir 3 indicações válidas de 7+ dias, o botão de saque via PIX é liberado!
  const canWithdrawPix = validSalesCount >= AMBASSADOR_CONFIG.minSalesForPixWithdrawal && availableBalance > 0;
  const hasAmbassadorBadge = validSalesCount >= AMBASSADOR_CONFIG.minSalesForAmbassadorBadge;
  const canRequestPlanRefund = validSalesCount >= AMBASSADOR_CONFIG.minSalesForPlanRefund;

  const salesNeededForPix = Math.max(0, AMBASSADOR_CONFIG.minSalesForPixWithdrawal - validSalesCount);
  const salesNeededForAmbassador = Math.max(0, AMBASSADOR_CONFIG.minSalesForAmbassadorBadge - validSalesCount);
  const salesNeededForPlanRefund = Math.max(0, AMBASSADOR_CONFIG.minSalesForPlanRefund - validSalesCount);

  const pixInfo = memoryFallback.pixKeys[userId];

  return {
    referralCode,
    salesCount,
    validSalesCount,
    pendingSalesCount,
    totalVolume,
    totalCommission,
    maturedCommission,
    pendingCommission,
    availableBalance,
    withdrawnBalance,
    canWithdrawPix,
    hasAmbassadorBadge,
    canRequestPlanRefund,
    salesNeededForPix,
    salesNeededForAmbassador,
    salesNeededForPlanRefund,
    sales,
    withdrawals: rawWithdrawals,
    pixKey: pixInfo?.key,
    pixKeyType: pixInfo?.type,
    planRefundRequested
  };
}

/**
 * Valida no servidor se um cupom de indicação realmente pertence a um embaixador ativo ou campanha oficial,
 * impedindo cupons inventados e bloqueando auto-indicação (inclusive com códigos customizados).
 */
export async function validateBackendReferralCoupon(
  couponCode: string,
  buyerUserId: string,
  buyerName?: string
): Promise<{ valid: boolean; discountPercent: number; referrerId?: string; referrerName?: string; message: string }> {
  const clean = normalizeReferralCode(couponCode || '');
  if (!clean || clean.length < 3 || clean.length > 20) {
    return { valid: false, discountPercent: 0, message: 'Código de indicação inválido.' };
  }

  // 1. Checa código inicial determinístico e código customizado do próprio comprador (bloqueia auto-indicação)
  const buyerEffectiveCode = await getOrGenerateUserReferralCode(buyerUserId, buyerName);
  if (normalizeReferralCode(buyerEffectiveCode) === clean) {
    return {
      valid: false,
      discountPercent: 0,
      message: 'Você não pode utilizar seu próprio código de indicação na sua própria conta.'
    };
  }

  // 2. Verifica nos códigos oficiais de campanha pré-homologados
  if (DEFAULT_PRESET_REFERRALS[clean]) {
    return {
      valid: true,
      discountPercent: AMBASSADOR_CONFIG.discountPercent,
      referrerName: DEFAULT_PRESET_REFERRALS[clean],
      message: `Código válido! ${AMBASSADOR_CONFIG.discountPercent}% de desconto concedido.`
    };
  }

  // 3. Verifica na tabela public.profiles se o código pertence a outro estudante real
  if (isSupabaseAdminConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      const { data: referrerProfile } = await supabase
        .from('profiles')
        .select('id, name, referral_code')
        .eq('referral_code', clean)
        .maybeSingle();

      if (referrerProfile) {
        if (referrerProfile.id === buyerUserId) {
          return {
            valid: false,
            discountPercent: 0,
            message: 'Você não pode utilizar seu próprio código de indicação na sua própria conta.'
          };
        }
        return {
          valid: true,
          discountPercent: AMBASSADOR_CONFIG.discountPercent,
          referrerId: referrerProfile.id,
          referrerName: referrerProfile.name || 'Estudante Embaixador',
          message: `Código ${clean} validado com sucesso!`
        };
      }
    } catch (err) {
      console.warn('[AmbassadorService] Erro ao validar cupom no banco:', err);
    }
  }

  // 4. Em ambiente local de testes (sem banco), consulta memoryFallback
  if (!IS_PROD) {
    for (const [uid, storedCode] of Object.entries(memoryFallback.codes)) {
      if (normalizeReferralCode(storedCode) === clean) {
        if (uid === buyerUserId) {
          return {
            valid: false,
            discountPercent: 0,
            message: 'Você não pode utilizar seu próprio código de indicação na sua própria conta.'
          };
        }
        return {
          valid: true,
          discountPercent: AMBASSADOR_CONFIG.discountPercent,
          referrerName: 'Estudante Embaixador',
          message: `Código ${clean} validado em ambiente de teste.`
        };
      }
    }
  }

  return {
    valid: false,
    discountPercent: 0,
    message: 'Código de indicação não localizado ou inexistente.'
  };
}

/**
 * Solicitação de Saque PIX validada pelo backend (com serialização local + lock transacional PostgreSQL)
 */
const activeWithdrawalLocks = new Set<string>();

export async function requestBackendAmbassadorWithdrawal(
  userId: string,
  amount: number,
  pixKey: string,
  pixKeyType: 'cpf' | 'email' | 'phone' | 'random' = 'cpf'
): Promise<{ success: boolean; message: string; withdrawal?: AmbassadorWithdrawalRecord }> {
  if (activeWithdrawalLocks.has(userId)) {
    return {
      success: false,
      message: 'Uma solicitação de saque já está sendo processada para esta conta. Aguarde alguns instantes.'
    };
  }
  activeWithdrawalLocks.add(userId);

  try {
    const cleanPix = (pixKey || '').trim();
    if (!cleanPix || cleanPix.length > 140) {
      return { success: false, message: 'Chave PIX inválida.' };
    }

    // 1. Caminho Padrão-Ouro Transacional no PostgreSQL (pg_advisory_xact_lock imune a Serverless TOCTOU)
    if (isSupabaseAdminConfigured()) {
      try {
        const supabase = getSupabaseAdmin();
        const { data: rpcRes, error: rpcErr } = await supabase.rpc('request_ambassador_withdrawal_atomic', {
          p_user_id: userId,
          p_amount: amount,
          p_pix_key: cleanPix,
          p_pix_key_type: pixKeyType,
          p_min_sales: AMBASSADOR_CONFIG.minSalesForPixWithdrawal
        });

        if (!rpcErr && rpcRes && typeof rpcRes === 'object') {
          const parsed = rpcRes as {
            success: boolean;
            message?: string;
            withdrawal?: AmbassadorWithdrawalRecord;
          };
          if (!parsed.success) {
            return {
              success: false,
              message: parsed.message || 'Não foi possível concluir a solicitação de saque.'
            };
          }
          return {
            success: true,
            message: `Saque de R$ ${amount.toFixed(2).replace('.', ',')} solicitado com sucesso via PIX (${cleanPix})! O valor será processado e enviado para sua conta bancária.`,
            withdrawal: parsed.withdrawal
          };
        }

        if (IS_PROD) {
          console.error('[AmbassadorService] Falha na RPC atômica de saque em produção:', rpcErr);
          return {
            success: false,
            message: 'Serviço financeiro temporariamente indisponível. Tente novamente em instantes.'
          };
        }
      } catch (dbErr) {
        if (IS_PROD) {
          console.error('[AmbassadorService] Exceção ao processar saque em produção:', dbErr);
          return {
            success: false,
            message: 'Falha ao registrar saque seguro no banco de dados.'
          };
        }
      }
    } else if (IS_PROD) {
      return {
        success: false,
        message: 'Configuração de banco indisponível para processamento de saques.'
      };
    }

    // 2. Caminho exclusivo de desenvolvimento/testes locais offline (memoryFallback serializado por activeWithdrawalLocks)
    const stats = await getBackendAmbassadorStats(userId);

    if (stats.validSalesCount < AMBASSADOR_CONFIG.minSalesForPixWithdrawal) {
      return {
        success: false,
        message: `Saque bloqueado. Você precisa de pelo menos ${AMBASSADOR_CONFIG.minSalesForPixWithdrawal} indicações válidas (com 7+ dias de permanência após a confirmação do plano) para liberar saques via PIX. Faltam ${stats.salesNeededForPix} indicação(ões).`
      };
    }

    if (amount <= 0 || amount > stats.availableBalance) {
      return {
        success: false,
        message: `Valor solicitado (R$ ${amount.toFixed(2).replace('.', ',')}) inválido ou excede o saldo disponível liberado (R$ ${stats.availableBalance.toFixed(2).replace('.', ',')}).`
      };
    }

    const withdrawalRecord: AmbassadorWithdrawalRecord = {
      id: 'pix_' + Math.random().toString(36).substring(2, 9),
      amount,
      pixKey: cleanPix,
      pixKeyType,
      requestedAt: new Date().toISOString(),
      status: 'pending'
    };

    if (!memoryFallback.withdrawals[userId]) memoryFallback.withdrawals[userId] = [];
    memoryFallback.withdrawals[userId].unshift(withdrawalRecord);
    memoryFallback.pixKeys[userId] = { key: cleanPix, type: pixKeyType };

    return {
      success: true,
      message: `Saque de R$ ${amount.toFixed(2).replace('.', ',')} solicitado com sucesso via PIX (${cleanPix})! O valor será processado e enviado para sua conta bancária.`,
      withdrawal: withdrawalRecord
    };
  } finally {
    activeWithdrawalLocks.delete(userId);
  }
}

/**
 * Solicitação de Reembolso do Plano do Aluno (Meta 10) validada pelo backend
 */
export async function requestBackendPlanRefund(
  userId: string
): Promise<{ success: boolean; message: string }> {
  const stats = await getBackendAmbassadorStats(userId);

  if (stats.planRefundRequested) {
    return {
      success: false,
      message: 'Você já possui uma solicitação de reembolso de embaixador em análise ou aprovada.'
    };
  }

  if (stats.validSalesCount < AMBASSADOR_CONFIG.minSalesForPlanRefund) {
    return {
      success: false,
      message: `Você precisa de ${AMBASSADOR_CONFIG.minSalesForPlanRefund} indicações válidas (com 7+ dias de permanência) para ter direito ao reembolso integral do plano. Faltam ${stats.salesNeededForPlanRefund} indicação(ões).`
    };
  }

  if (isSupabaseAdminConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      const { error } = await supabase.from('ambassador_refund_requests').insert({
        user_id: userId,
        valid_referrals_count: stats.validSalesCount,
        status: 'pending'
      });
      if (error && IS_PROD) {
        return { success: false, message: 'Não foi possível registrar a solicitação de reembolso no momento.' };
      }
    } catch {
      if (IS_PROD) {
        return { success: false, message: 'Erro ao salvar solicitação de reembolso.' };
      }
    }
  }

  if (!IS_PROD) {
    memoryFallback.refunds[userId] = true;
  }

  return {
    success: true,
    message: 'Solicitação de reembolso total do seu plano registrada com sucesso! Como Embaixador Oficial com 10+ indicações válidas, o valor pago será 100% estornado mantendo seu acesso liberado.'
  };
}

/**
 * Registra uma nova venda de indicação no backend quando um aluno compra com cupom
 */
export async function recordReferralSale(params: {
  couponCode: string;
  referredUserId?: string;
  orderId?: string;
  studentName: string;
  studentEmail?: string;
  planId: 'monthly' | 'semiannual' | 'annual' | 'biennial';
  planName: string;
  planAmount: number;
  discountApplied: number;
  netAmount: number;
  commissionPercent?: number;
}): Promise<{ success: boolean; referralId?: string }> {
  const cleanCode = normalizeReferralCode(params.couponCode);
  const commissionPercent = params.commissionPercent || AMBASSADOR_CONFIG.commissionPercent;
  const commissionAmount = parseFloat((params.netAmount * (commissionPercent / 100)).toFixed(2));

  let referrerId: string | null = null;

  if (isSupabaseAdminConfigured()) {
    try {
      const supabase = getSupabaseAdmin();

      // Idempotência: Se orderId foi informado, checa se a indicação já foi computada
      if (params.orderId) {
        const { data: existingReferral } = await supabase
          .from('ambassador_referrals')
          .select('id')
          .eq('order_id', params.orderId)
          .maybeSingle();

        if (existingReferral) {
          return { success: true, referralId: existingReferral.id };
        }
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', cleanCode)
        .maybeSingle();

      if (profile) {
        referrerId = profile.id;
      }
    } catch {
      // ignore
    }
  }

  // Se não localizou o dono no banco e estiver fora de produção, verifica memoryFallback
  if (!referrerId && !IS_PROD) {
    for (const [uid, c] of Object.entries(memoryFallback.codes)) {
      if (normalizeReferralCode(c) === cleanCode) {
        referrerId = uid;
        break;
      }
    }
  }

  if (!referrerId) {
    return { success: false };
  }

  // Bloqueio absoluto de auto-indicação no servidor
  if (params.referredUserId && referrerId === params.referredUserId) {
    console.warn('[AmbassadorService] Tentativa de auto-indicação bloqueada para userId:', referrerId);
    return { success: false };
  }

  // Idempotência no fallback em memória
  if (!IS_PROD && params.orderId && memoryFallback.sales[referrerId]) {
    const existingMemory = memoryFallback.sales[referrerId].find((s) => s.orderId === params.orderId);
    if (existingMemory) {
      return { success: true, referralId: existingMemory.id };
    }
  }

  const now = new Date();
  const maturesAt = new Date(now.getTime() + AMBASSADOR_CONFIG.retentionDays * 24 * 60 * 60 * 1000);
  const maskedEmail = params.studentEmail
    ? `${params.studentEmail.split('@')[0].slice(0, 3)}***@${params.studentEmail.split('@')[1] || 'gmail.com'}`
    : 'aluno***@gmail.com';

  const referralItem: ReferralSale = {
    id: 'sale_' + Math.random().toString(36).substring(2, 9),
    orderId: params.orderId,
    studentName: params.studentName,
    studentEmailMasked: maskedEmail,
    planName: params.planName,
    planAmount: params.planAmount,
    discountApplied: params.discountApplied,
    netAmount: params.netAmount,
    commissionAmount,
    date: now.toLocaleDateString('pt-BR'),
    confirmedAt: now.toISOString(),
    maturesAt: maturesAt.toISOString(),
    retentionDays: AMBASSADOR_CONFIG.retentionDays,
    isMatured: false,
    daysRemaining: AMBASSADOR_CONFIG.retentionDays,
    status: 'confirmed'
  };

  if (isSupabaseAdminConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      const { data: inserted, error } = await supabase
        .from('ambassador_referrals')
        .insert({
          referrer_id: referrerId,
          referred_user_id: params.referredUserId || null,
          order_id: params.orderId || null,
          referral_code: cleanCode,
          student_name: params.studentName,
          student_email_masked: maskedEmail,
          plan_name: params.planName,
          plan_id: params.planId,
          plan_amount: params.planAmount,
          discount_applied: params.discountApplied,
          net_amount: params.netAmount,
          commission_percent: commissionPercent,
          commission_amount: commissionAmount,
          status: 'confirmed',
          retention_days: AMBASSADOR_CONFIG.retentionDays,
          confirmed_at: now.toISOString(),
          matures_at: maturesAt.toISOString()
        })
        .select('id')
        .maybeSingle();

      if (!error && inserted) {
        return { success: true, referralId: inserted.id };
      }
      if (IS_PROD) {
        return { success: false };
      }
    } catch {
      if (IS_PROD) return { success: false };
    }
  }

  if (!IS_PROD) {
    if (!memoryFallback.sales[referrerId]) {
      memoryFallback.sales[referrerId] = [];
    }
    memoryFallback.sales[referrerId].unshift(referralItem);
  }

  return { success: true, referralId: referralItem.id };
}

/**
 * Simula uma venda para fins de teste no backend
 */
export async function simulateBackendAmbassadorSale(
  userId: string,
  planType: 'annual' | 'semiannual' | 'monthly' | 'biennial' = 'annual',
  options?: { matured?: boolean; daysAgo?: number }
): Promise<ReferralSale> {
  const planInfo = {
    monthly: { name: 'Plano Mensal', price: 49.90 },
    semiannual: { name: 'Plano Semestral', price: 179.40 },
    annual: { name: 'Plano Anual', price: 310.80 },
    biennial: { name: 'Plano Bienal', price: 477.60 }
  }[planType];

  const discountAmount = parseFloat((planInfo.price * (AMBASSADOR_CONFIG.discountPercent / 100)).toFixed(2));
  const netAmount = parseFloat((planInfo.price - discountAmount).toFixed(2));
  const commissionAmount = parseFloat((netAmount * (AMBASSADOR_CONFIG.commissionPercent / 100)).toFixed(2));

  const mockNames = [
    'Mariana Ribeiro', 'Felipe Castro', 'Camila Nogueira',
    'Rodrigo Sampaio', 'Larissa Duarte', 'Thiago Meireles',
    'Renata Vasconcelos', 'Matheus Figueiredo', 'Juliana Rezende',
    'Bruno Alcantara', 'Carolina Mendonça', 'Lucas Pinheiro'
  ];
  const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
  const emailPart = randomName.toLowerCase().split(' ')[0].normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const now = Date.now();
  const daysAgo = options?.matured ? (options.daysAgo || 8) : 0;
  const confirmedTime = now - daysAgo * 24 * 60 * 60 * 1000;
  const confirmedAt = new Date(confirmedTime).toISOString();
  const maturesAt = new Date(confirmedTime + AMBASSADOR_CONFIG.retentionDays * 24 * 60 * 60 * 1000).toISOString();

  const isMatured = now >= new Date(maturesAt).getTime();
  const daysRemaining = isMatured ? 0 : Math.max(1, Math.ceil((new Date(maturesAt).getTime() - now) / (1000 * 60 * 60 * 24)));

  const code = await getOrGenerateUserReferralCode(userId);

  const sale: ReferralSale = {
    id: 'sale_' + Math.random().toString(36).substring(2, 9),
    studentName: randomName,
    studentEmailMasked: `${emailPart}***@gmail.com`,
    planName: planInfo.name,
    planAmount: planInfo.price,
    discountApplied: discountAmount,
    netAmount,
    commissionAmount,
    date: new Date(confirmedTime).toLocaleDateString('pt-BR'),
    confirmedAt,
    maturesAt,
    retentionDays: AMBASSADOR_CONFIG.retentionDays,
    isMatured,
    daysRemaining,
    status: 'confirmed'
  };

  try {
    const supabase = getSupabaseAdmin();
    await supabase.from('ambassador_referrals').insert({
      referrer_id: userId,
      referral_code: code,
      student_name: randomName,
      student_email_masked: sale.studentEmailMasked,
      plan_name: planInfo.name,
      plan_id: planType,
      plan_amount: planInfo.price,
      discount_applied: discountAmount,
      net_amount: netAmount,
      commission_percent: AMBASSADOR_CONFIG.commissionPercent,
      commission_amount: commissionAmount,
      status: 'confirmed',
      retention_days: AMBASSADOR_CONFIG.retentionDays,
      confirmed_at: confirmedAt,
      matures_at: maturesAt
    });
  } catch {
    // ignore
  }

  if (!memoryFallback.sales[userId]) memoryFallback.sales[userId] = [];
  memoryFallback.sales[userId].unshift(sale);

  return sale;
}

