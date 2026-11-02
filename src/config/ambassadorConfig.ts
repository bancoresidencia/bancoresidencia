/**
 * Configurações e Utilitários do Programa de Indicação & Embaixadores Banco Residência
 * Todos os parâmetros comerciais e psicométricos são centralizados aqui.
 */

import { UserAccount } from '@/types/auth';
import { PlanDefinition } from '@/config/plans';

export interface AmbassadorConfig {
  discountPercent: number; // Desconto dado ao aluno indicado (ex: 10%)
  commissionPercent: number; // Comissão dada ao embaixador por venda (ex: 15%)
  minSalesForPixWithdrawal: number; // Mínimo de indicações válidas para liberar saque PIX (3)
  minSalesForAmbassadorBadge: number; // Mínimo de indicações válidas para o Selo de Embaixador (10)
  minSalesForPlanRefund: number; // Mínimo de indicações válidas para o Reembolso Total do Plano Adquirido (10)
  retentionDays: number; // Período de garantia e permanência obrigatório (7 dias após confirmação)
}

export const AMBASSADOR_CONFIG: AmbassadorConfig = {
  discountPercent: 10,
  commissionPercent: 15,
  minSalesForPixWithdrawal: 3,
  minSalesForAmbassadorBadge: 10,
  minSalesForPlanRefund: 10,
  retentionDays: 7,
};

export interface ReferralSale {
  id: string;
  studentName: string;
  studentEmailMasked: string;
  planName: string;
  planAmount: number;
  discountApplied: number;
  netAmount: number;
  commissionAmount: number;
  date: string;
  confirmedAt: string; // Data ISO de confirmação do plano
  maturesAt: string; // Data ISO em que completa os 7 dias de permanência
  retentionDays: number; // 7 dias
  isMatured: boolean; // True se já passaram 7 dias desde a confirmação e está confirmada
  daysRemaining: number; // Dias restantes para completar os 7 dias (0 se já matured)
  status: 'confirmed' | 'refunded' | 'cancelled';
}

export interface AmbassadorWithdrawalRecord {
  id: string;
  amount: number;
  pixKey: string;
  pixKeyType: 'cpf' | 'email' | 'phone' | 'random';
  requestedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
}

export interface AmbassadorStats {
  referralCode: string;
  salesCount: number; // Total de indicações
  validSalesCount: number; // Total de indicações válidas (que completaram 7 dias de permanência)
  pendingSalesCount: number; // Indicações ainda dentro dos 7 dias de permanência
  totalVolume: number;
  totalCommission: number;
  maturedCommission: number; // Comissão já liberada das indicações de 7+ dias
  pendingCommission: number; // Comissão aguardando período de 7 dias
  availableBalance: number; // Saldo líquido disponível para saque (maturedCommission - withdrawnBalance)
  withdrawnBalance: number;
  canWithdrawPix: boolean; // validSalesCount >= 3 && availableBalance > 0
  hasAmbassadorBadge: boolean; // validSalesCount >= 10
  canRequestPlanRefund: boolean; // validSalesCount >= 10
  salesNeededForPix: number; // Math.max(0, 3 - validSalesCount)
  salesNeededForAmbassador: number; // Math.max(0, 10 - validSalesCount)
  salesNeededForPlanRefund: number; // Math.max(0, 10 - validSalesCount)
  sales: ReferralSale[];
  withdrawals: AmbassadorWithdrawalRecord[];
  pixKey?: string;
  pixKeyType?: 'cpf' | 'email' | 'phone' | 'random';
  planRefundRequested?: boolean;
}

export interface AppliedReferral {
  code: string;
  referrerName: string;
  discountPercent: number;
  appliedAt: string;
}

const STORAGE_PREFIX = 'bancoresidencia_ambassador_';
const APPLIED_REFERRAL_KEY = 'bancoresidencia_applied_referral';

// Códigos pré-cadastrados para validação do sistema
const DEFAULT_PRESET_REFERRALS: Record<string, string> = {
  'MED-LUCAS-10': 'Dr. Lucas Silva (Clínica Médica)',
  'RESIDENCIA10': 'Prof. Dr. Marcos Arcuri',
  'MED-MARIANNA': 'Dra. Mariana Costa (Pediatria)',
  'ENARE2026': 'Equipe Pedagógica Banco Residência',
  'MED-GABRIEL': 'Dr. Gabriel Andrade (Cirurgia)',
  'MED-BEATRIZ': 'Dra. Beatriz Fernandes (G.O.)',
  'BANCO-VIP': 'Embaixador Oficial Banco Residência',
  'REVALIDA10': 'Comunidade Revalida BR',
  'RPLUS10': 'Mentoria R+ Cirúrgico',
  'CUPOM10': 'Desconto Especial Banco Residência',
  'DESCONTO10': 'Desconto Especial Banco Residência',
  'PROMO10': 'Promoção Oficial Banco Residência',
  'MED10': 'Comunidade Médica Banco Residência',
  'RESIDENCIA2026': 'Ciclo Residência 2026'
};

/**
 * Normaliza um código de indicação (sem espaços, maiúsculas, sem caracteres especiais exceto hífens)
 */
export function normalizeReferralCode(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
}

/**
 * Calcula maturidade da venda baseada na regra de 7 dias de permanência
 */
export function computeSaleMaturity(sale: {
  confirmedAt?: string;
  date?: string;
  maturesAt?: string;
  retentionDays?: number;
  status?: string;
}): { isMatured: boolean; daysRemaining: number; confirmedAt: string; maturesAt: string } {
  const now = Date.now();
  const confirmedAt = sale.confirmedAt || (sale.date ? new Date(sale.date).toISOString() : new Date().toISOString());
  const retentionDays = sale.retentionDays || AMBASSADOR_CONFIG.retentionDays;

  let maturesAt = sale.maturesAt;
  if (!maturesAt) {
    const cTime = new Date(confirmedAt).getTime();
    maturesAt = new Date(cTime + retentionDays * 24 * 60 * 60 * 1000).toISOString();
  }

  const maturesTime = new Date(maturesAt).getTime();
  const isMatured = now >= maturesTime && sale.status !== 'refunded' && sale.status !== 'cancelled';
  const diffMs = maturesTime - now;
  const daysRemaining = isMatured ? 0 : Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  return {
    isMatured,
    daysRemaining,
    confirmedAt,
    maturesAt
  };
}

/**
 * Calcula os valores de um plano com o desconto do cupom/indicação aplicado proporcionalmente
 */
export function computeDiscountedPlan(basePlan: PlanDefinition, discountPercent: number): PlanDefinition {
  if (!discountPercent || discountPercent <= 0) return basePlan;
  const discountFactor = 1 - discountPercent / 100;
  const discountedTotal = parseFloat((basePlan.totalPrice * discountFactor).toFixed(2));
  const discountedMonthly = parseFloat((basePlan.monthlyEquivalent * discountFactor).toFixed(2));
  const discountedInstallment = parseFloat((discountedTotal / basePlan.maxInstallments).toFixed(2));

  return {
    ...basePlan,
    totalPrice: discountedTotal,
    monthlyEquivalent: discountedMonthly,
    installmentValue: discountedInstallment
  };
}

/**
 * Gera um código de indicação inicial determinístico e único para o perfil
 */
export function generateInitialReferralCode(user: UserAccount | null): string {
  if (!user) return 'MED-ALUNO-10';

  const namePart = (user.name || 'MED')
    .split(' ')[0]
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

  const idClean = (user.id || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const idPart = idClean.slice(0, 3) || '10';

  return `MED-${namePart || 'ALUNO'}-${idPart}`;
}

/**
 * Obtém o código de indicação do usuário logado
 */
export function getUserReferralCode(user: UserAccount | null): string {
  if (!user) return 'MED-ALUNO-10';
  if (user.referralCode) return normalizeReferralCode(user.referralCode);

  if (typeof window === 'undefined') {
    return generateInitialReferralCode(user);
  }

  const stored = localStorage.getItem(`${STORAGE_PREFIX}code_${user.id}`);
  if (stored) return stored;

  const generated = generateInitialReferralCode(user);
  localStorage.setItem(`${STORAGE_PREFIX}code_${user.id}`, generated);
  return generated;
}

/**
 * Atualiza o código customizado do aluno
 */
export function setUserReferralCode(userId: string, newCode: string): { success: boolean; message: string } {
  const clean = normalizeReferralCode(newCode);
  if (clean.length < 3) {
    return { success: false, message: 'O código deve ter pelo menos 3 caracteres.' };
  }
  if (clean.length > 20) {
    return { success: false, message: 'O código pode ter no máximo 20 caracteres.' };
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${STORAGE_PREFIX}code_${userId}`, clean);
  }
  return { success: true, message: 'Código de indicação atualizado com sucesso!' };
}

/**
 * Valida um código de indicação digitado por um aluno
 */
export function validateReferralCode(
  code: string,
  currentUserCode?: string,
  currentUserId?: string,
  user?: UserAccount | null
): { valid: boolean; referrerName?: string; discountPercent: number; message: string } {
  const clean = normalizeReferralCode(code);
  if (!clean || clean.length < 3) {
    return { valid: false, discountPercent: 0, message: 'Digite um código válido de no mínimo 3 caracteres.' };
  }

  // Autoindicação proibida: o aluno não pode usar o próprio código de indicação na sua própria conta
  if (currentUserCode && normalizeReferralCode(currentUserCode) === clean) {
    return {
      valid: false,
      discountPercent: 0,
      message: 'Você não pode utilizar seu próprio código de indicação na sua própria conta.'
    };
  }

  if (user) {
    const calculatedCode = normalizeReferralCode(getUserReferralCode(user));
    const initialCode = normalizeReferralCode(generateInitialReferralCode(user));
    if (calculatedCode === clean || initialCode === clean || (user.referralCode && normalizeReferralCode(user.referralCode) === clean)) {
      return {
        valid: false,
        discountPercent: 0,
        message: 'Você não pode utilizar seu próprio código de indicação na sua própria conta.'
      };
    }
  }

  if (typeof window !== 'undefined' && currentUserId) {
    const userCode = localStorage.getItem(`${STORAGE_PREFIX}code_${currentUserId}`);
    if (userCode && normalizeReferralCode(userCode) === clean) {
      return {
        valid: false,
        discountPercent: 0,
        message: 'Você não pode utilizar seu próprio código de indicação na sua própria conta.'
      };
    }
  }

  // Verifica nos presets conhecidos
  if (DEFAULT_PRESET_REFERRALS[clean]) {
    return {
      valid: true,
      referrerName: DEFAULT_PRESET_REFERRALS[clean],
      discountPercent: AMBASSADOR_CONFIG.discountPercent,
      message: `Código válido! 10% de desconto concedido por ${DEFAULT_PRESET_REFERRALS[clean]}.`
    };
  }

  // Verifica se é um código no formato MED-XXX, DR-XXX, DRA-XXX ou alfanumérico
  if (clean.startsWith('MED-') || clean.startsWith('DR-') || clean.startsWith('DRA-') || clean.length >= 4) {
    const parsedName = clean.replace(/^(MED-|DR-|DRA-)/, '').split('-')[0];
    const friendlyName = parsedName ? `Colega ${parsedName}` : 'Estudante Embaixador';
    return {
      valid: true,
      referrerName: friendlyName,
      discountPercent: AMBASSADOR_CONFIG.discountPercent,
      message: `Código ${clean} ativado com sucesso! 10% de desconto garantido.`
    };
  }

  return {
    valid: false,
    discountPercent: 0,
    message: 'Código de indicação não localizado ou expirado.'
  };
}

/**
 * Salva o cupom de indicação aplicado pelo aluno atual
 */
export function applyReferralCode(
  code: string,
  currentUserCode?: string,
  currentUserId?: string,
  user?: UserAccount | null
): { success: boolean; message: string; referral?: AppliedReferral } {
  const validation = validateReferralCode(code, currentUserCode, currentUserId, user);
  if (!validation.valid) {
    return { success: false, message: validation.message };
  }

  const clean = normalizeReferralCode(code);
  const applied: AppliedReferral = {
    code: clean,
    referrerName: validation.referrerName || 'Embaixador Banco Residência',
    discountPercent: validation.discountPercent,
    appliedAt: new Date().toISOString()
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(APPLIED_REFERRAL_KEY, JSON.stringify(applied));
  }

  return { success: true, message: validation.message, referral: applied };
}

/**
 * Obtém o cupom de indicação atualmente aplicado na sessão
 */
export function getAppliedReferralCode(currentUserCode?: string, user?: UserAccount | null): AppliedReferral | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(APPLIED_REFERRAL_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as AppliedReferral;
    if (!parsed || !parsed.code) return null;
    const clean = normalizeReferralCode(parsed.code);
    if (currentUserCode && normalizeReferralCode(currentUserCode) === clean) {
      localStorage.removeItem(APPLIED_REFERRAL_KEY);
      return null;
    }
    if (user) {
      const calculatedCode = normalizeReferralCode(getUserReferralCode(user));
      const initialCode = normalizeReferralCode(generateInitialReferralCode(user));
      if (calculatedCode === clean || initialCode === clean || (user.referralCode && normalizeReferralCode(user.referralCode) === clean)) {
        localStorage.removeItem(APPLIED_REFERRAL_KEY);
        return null;
      }
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Remove o cupom de indicação aplicado
 */
export function removeAppliedReferralCode(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(APPLIED_REFERRAL_KEY);
  }
}

/**
 * Retorna as estatísticas do aluno como embaixador, aplicando estritamente
 * a regra de 7 dias de permanência do indicado para contabilização de saldo e saques.
 */
export function getAmbassadorStats(userId: string, userName?: string): AmbassadorStats {
  const defaultCode = `MED-${(userName || 'ALUNO').split(' ')[0].toUpperCase()}-10`;

  if (typeof window === 'undefined') {
    return {
      referralCode: defaultCode,
      salesCount: 0,
      validSalesCount: 0,
      pendingSalesCount: 0,
      totalVolume: 0,
      totalCommission: 0,
      maturedCommission: 0,
      pendingCommission: 0,
      availableBalance: 0,
      withdrawnBalance: 0,
      canWithdrawPix: false,
      hasAmbassadorBadge: false,
      canRequestPlanRefund: false,
      salesNeededForPix: AMBASSADOR_CONFIG.minSalesForPixWithdrawal,
      salesNeededForAmbassador: AMBASSADOR_CONFIG.minSalesForAmbassadorBadge,
      salesNeededForPlanRefund: AMBASSADOR_CONFIG.minSalesForPlanRefund,
      sales: [],
      withdrawals: []
    };
  }

  const code = localStorage.getItem(`${STORAGE_PREFIX}code_${userId}`) || defaultCode;
  const rawSales = localStorage.getItem(`${STORAGE_PREFIX}sales_${userId}`);
  let rawSalesList: Array<Partial<ReferralSale> & { date?: string }> = [];

  if (rawSales) {
    try {
      rawSalesList = JSON.parse(rawSales);
    } catch {
      rawSalesList = [];
    }
  }

  // Processa e normaliza cada venda aplicando a regra dos 7 dias
  const sales: ReferralSale[] = rawSalesList.map((item, index) => {
    const maturity = computeSaleMaturity(item);
    const dateFormatted = item.date || new Date(maturity.confirmedAt).toLocaleDateString('pt-BR');

    return {
      id: item.id || `sale_${index}_${Date.now()}`,
      studentName: item.studentName || 'Estudante de Medicina',
      studentEmailMasked: item.studentEmailMasked || 'med***@gmail.com',
      planName: item.planName || 'Plano Anual',
      planAmount: item.planAmount || 310.80,
      discountApplied: item.discountApplied || 31.08,
      netAmount: item.netAmount || 279.72,
      commissionAmount: item.commissionAmount || 41.96,
      date: dateFormatted,
      confirmedAt: maturity.confirmedAt,
      maturesAt: maturity.maturesAt,
      retentionDays: AMBASSADOR_CONFIG.retentionDays,
      isMatured: maturity.isMatured,
      daysRemaining: maturity.daysRemaining,
      status: (item.status as 'confirmed' | 'refunded' | 'cancelled') || 'confirmed'
    };
  });

  const rawWithdrawn = localStorage.getItem(`${STORAGE_PREFIX}withdrawn_${userId}`);
  const withdrawnBalance = rawWithdrawn ? parseFloat(rawWithdrawn) : 0;

  const rawPix = localStorage.getItem(`${STORAGE_PREFIX}pix_${userId}`);
  let pixInfo: { key?: string; type?: 'cpf' | 'email' | 'phone' | 'random' } = {};
  if (rawPix) {
    try {
      pixInfo = JSON.parse(rawPix);
    } catch {
      // ignore
    }
  }

  const rawWithdrawals = localStorage.getItem(`${STORAGE_PREFIX}withdrawals_${userId}`);
  let withdrawals: AmbassadorWithdrawalRecord[] = [];
  if (rawWithdrawals) {
    try {
      withdrawals = JSON.parse(rawWithdrawals);
    } catch {
      withdrawals = [];
    }
  }

  const planRefundRequested = localStorage.getItem(`${STORAGE_PREFIX}refund_requested_${userId}`) === 'true';

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

  // O saldo disponível para saque decorre exclusivamente das vendas maduras (permanência >= 7 dias)
  const availableBalance = Math.max(0, parseFloat((maturedCommission - withdrawnBalance).toFixed(2)));

  // Regras estritas:
  // 1. Saque liberado apenas ao atingir no mínimo 3 indicações válidas de 7+ dias e ter saldo > 0
  const canWithdrawPix = validSalesCount >= AMBASSADOR_CONFIG.minSalesForPixWithdrawal && availableBalance > 0;
  // 2. Selo de Embaixador e Reembolso conquistados com 10 indicações válidas de 7+ dias
  const hasAmbassadorBadge = validSalesCount >= AMBASSADOR_CONFIG.minSalesForAmbassadorBadge;
  const canRequestPlanRefund = validSalesCount >= AMBASSADOR_CONFIG.minSalesForPlanRefund;

  const salesNeededForPix = Math.max(0, AMBASSADOR_CONFIG.minSalesForPixWithdrawal - validSalesCount);
  const salesNeededForAmbassador = Math.max(0, AMBASSADOR_CONFIG.minSalesForAmbassadorBadge - validSalesCount);
  const salesNeededForPlanRefund = Math.max(0, AMBASSADOR_CONFIG.minSalesForPlanRefund - validSalesCount);

  return {
    referralCode: code,
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
    withdrawals,
    pixKey: pixInfo.key,
    pixKeyType: pixInfo.type,
    planRefundRequested
  };
}

/**
 * Salva os dados de PIX do embaixador
 */
export function saveAmbassadorPixKey(
  userId: string,
  key: string,
  type: 'cpf' | 'email' | 'phone' | 'random'
): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      `${STORAGE_PREFIX}pix_${userId}`,
      JSON.stringify({ key: key.trim(), type })
    );
  }
}

/**
 * Solicita saque via PIX (desbloqueado exclusivamente ao atingir 3 indicações válidas de 7+ dias)
 */
export function requestAmbassadorPixWithdrawal(
  userId: string,
  amount: number,
  pixKey: string,
  pixKeyType: 'cpf' | 'email' | 'phone' | 'random' = 'cpf'
): { success: boolean; message: string; withdrawal?: AmbassadorWithdrawalRecord } {
  if (typeof window === 'undefined') return { success: false, message: 'Operação inválida no ambiente atual.' };

  const stats = getAmbassadorStats(userId);
  if (stats.validSalesCount < AMBASSADOR_CONFIG.minSalesForPixWithdrawal) {
    return {
      success: false,
      message: `Saque bloqueado. Você precisa de pelo menos ${AMBASSADOR_CONFIG.minSalesForPixWithdrawal} indicações válidas (com 7+ dias de permanência após a confirmação do plano) para liberar saques via PIX. Faltam ${stats.salesNeededForPix} indicação(ões).`
    };
  }

  if (amount <= 0 || amount > stats.availableBalance) {
    return {
      success: false,
      message: `Valor solicitado (R$ ${amount.toFixed(2).replace('.', ',')}) inválido ou superior ao saldo disponível contabilizado (R$ ${stats.availableBalance.toFixed(2).replace('.', ',')}).`
    };
  }

  const newWithdrawn = parseFloat((stats.withdrawnBalance + amount).toFixed(2));
  localStorage.setItem(`${STORAGE_PREFIX}withdrawn_${userId}`, newWithdrawn.toString());

  const newWithdrawal: AmbassadorWithdrawalRecord = {
    id: 'pix_' + Math.random().toString(36).substring(2, 9),
    amount,
    pixKey: pixKey.trim(),
    pixKeyType,
    requestedAt: new Date().toISOString(),
    status: 'pending'
  };

  const rawWithdrawals = localStorage.getItem(`${STORAGE_PREFIX}withdrawals_${userId}`);
  let withdrawals: AmbassadorWithdrawalRecord[] = [];
  if (rawWithdrawals) {
    try {
      withdrawals = JSON.parse(rawWithdrawals);
    } catch {
      withdrawals = [];
    }
  }
  withdrawals.unshift(newWithdrawal);
  localStorage.setItem(`${STORAGE_PREFIX}withdrawals_${userId}`, JSON.stringify(withdrawals));

  return {
    success: true,
    message: `Saque de R$ ${amount.toFixed(2).replace('.', ',')} solicitado com sucesso via PIX (${pixKey})! O valor será processado e enviado para sua conta bancária.`,
    withdrawal: newWithdrawal
  };
}

/**
 * Solicita o reembolso do plano contratado (desbloqueado com 10 indicações válidas)
 */
export function requestAmbassadorPlanRefund(userId: string): { success: boolean; message: string } {
  if (typeof window === 'undefined') return { success: false, message: 'Operação inválida no ambiente atual.' };

  const stats = getAmbassadorStats(userId);
  if (stats.validSalesCount < AMBASSADOR_CONFIG.minSalesForPlanRefund) {
    return {
      success: false,
      message: `Você precisa de ${AMBASSADOR_CONFIG.minSalesForPlanRefund} indicações válidas (com 7+ dias de permanência) para ter direito ao reembolso integral do plano. Faltam ${stats.salesNeededForPlanRefund} indicação(ões).`
    };
  }

  localStorage.setItem(`${STORAGE_PREFIX}refund_requested_${userId}`, 'true');

  return {
    success: true,
    message: 'Solicitação de reembolso total do seu plano registrada com sucesso! Como Embaixador Oficial com 10+ indicações válidas, o valor pago será 100% estornado mantendo seu acesso liberado.'
  };
}

/**
 * Função utilitária para simular uma nova venda pelo código do embaixador.
 * Permite simular tanto vendas recém-feitas (em período de 7 dias de garantia)
 * quanto vendas válidas (já com mais de 7 dias de permanência).
 */
export function simulateAmbassadorSale(
  userId: string,
  planType: 'annual' | 'semiannual' | 'monthly' | 'biennial' = 'annual',
  options?: { matured?: boolean; daysAgo?: number }
): ReferralSale {
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
    'Bruno Alcantara', 'Carolina Mendonça', 'Lucas Pinheiro',
    'Beatriz Siqueira', 'Guilherme Prado', 'Amanda Fontes'
  ];
  const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
  const emailPart = randomName.toLowerCase().split(' ')[0].normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const now = Date.now();
  // Se for simulada como matured (válida), coloca data de 8+ dias atrás
  const daysAgo = options?.matured ? (options.daysAgo || 8) : 0;
  const confirmedTime = now - daysAgo * 24 * 60 * 60 * 1000;
  const confirmedAt = new Date(confirmedTime).toISOString();
  const maturesAt = new Date(confirmedTime + AMBASSADOR_CONFIG.retentionDays * 24 * 60 * 60 * 1000).toISOString();

  const isMatured = now >= new Date(maturesAt).getTime();
  const daysRemaining = isMatured ? 0 : Math.max(1, Math.ceil((new Date(maturesAt).getTime() - now) / (1000 * 60 * 60 * 24)));

  const newSale: ReferralSale = {
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

  if (typeof window !== 'undefined') {
    const rawSales = localStorage.getItem(`${STORAGE_PREFIX}sales_${userId}`);
    let sales: ReferralSale[] = [];
    if (rawSales) {
      try {
        sales = JSON.parse(rawSales);
      } catch {
        sales = [];
      }
    }
    sales.unshift(newSale);
    localStorage.setItem(`${STORAGE_PREFIX}sales_${userId}`, JSON.stringify(sales));
  }

  return newSale;
}
