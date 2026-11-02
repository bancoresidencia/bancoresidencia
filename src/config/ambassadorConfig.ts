/**
 * Configurações e Utilitários do Programa de Indicação & Embaixadores Banco Residência
 * Todos os parâmetros comerciais podem ser alterados e ajustados aqui de forma centralizada.
 */

import { UserAccount } from '@/types/auth';

export interface AmbassadorConfig {
  discountPercent: number; // Desconto dado ao aluno indicado (ex: 10%)
  commissionPercent: number; // Comissão dada ao embaixador por venda (ex: 15%)
  minSalesForPixWithdrawal: number; // Mínimo de vendas para liberar saque PIX (ex: 3 vendas)
  minSalesForAmbassadorBadge: number; // Mínimo de vendas para conquistar o Selo de Embaixador (ex: 10 vendas)
  minSalesForPlanRefund: number; // Mínimo de vendas para ter direito ao reembolso do plano contratado (ex: 10 vendas)
}

export const AMBASSADOR_CONFIG: AmbassadorConfig = {
  discountPercent: 10,
  commissionPercent: 15,
  minSalesForPixWithdrawal: 3,
  minSalesForAmbassadorBadge: 10,
  minSalesForPlanRefund: 10,
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
  status: 'confirmed' | 'refunded' | 'pending';
}

export interface AmbassadorStats {
  referralCode: string;
  salesCount: number;
  totalVolume: number;
  totalCommission: number;
  availableBalance: number;
  withdrawnBalance: number;
  canWithdrawPix: boolean;
  hasAmbassadorBadge: boolean;
  canRequestPlanRefund: boolean;
  salesNeededForPix: number;
  salesNeededForAmbassador: number;
  sales: ReferralSale[];
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
  'RPLUS10': 'Mentoria R+ Cirúrgico'
};

/**
 * Normaliza um código de indicação (sem espaços, maiúsculas)
 */
export function normalizeReferralCode(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
}

/**
 * Gera um código de indicação inicial para o usuário
 */
export function generateInitialReferralCode(user: UserAccount | null): string {
  if (!user) return 'MED-ALUNO-10';
  const namePart = (user.name || 'MED')
    .split(' ')[0]
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  const idPart = (user.id || '10').replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase();
  return `MED-${namePart || 'ALUNO'}-${idPart || '10'}`;
}

/**
 * Obtém o código de indicação do usuário logado
 */
export function getUserReferralCode(user: UserAccount | null): string {
  if (typeof window === 'undefined') return 'MED-ALUNO-10';
  if (!user) return 'MED-ALUNO-10';

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

  // Regra Estrita: Autoindicação proibida! O aluno não pode usar o próprio código de indicação na sua própria conta
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
    if (calculatedCode === clean || initialCode === clean) {
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

  // Verifica se é um código no formato MED-XXX ou alfanumérico
  if (clean.startsWith('MED-') || clean.startsWith('DR-') || clean.startsWith('DRA-') || clean.length >= 4) {
    // Código de colega aceito
    const parsedName = clean.replace(/^(MED-|DR-|DRA-)/, '').split('-')[0];
    const friendlyName = parsedName ? `Colega ${parsedName}` : 'Estudante Indicador';
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
      if (calculatedCode === clean || initialCode === clean) {
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
 * Retorna as estatísticas do aluno como embaixador
 */
export function getAmbassadorStats(userId: string, userName?: string): AmbassadorStats {
  const defaultCode = `MED-${(userName || 'ALUNO').split(' ')[0].toUpperCase()}-10`;

  if (typeof window === 'undefined') {
    return {
      referralCode: defaultCode,
      salesCount: 0,
      totalVolume: 0,
      totalCommission: 0,
      availableBalance: 0,
      withdrawnBalance: 0,
      canWithdrawPix: false,
      hasAmbassadorBadge: false,
      canRequestPlanRefund: false,
      salesNeededForPix: AMBASSADOR_CONFIG.minSalesForPixWithdrawal,
      salesNeededForAmbassador: AMBASSADOR_CONFIG.minSalesForAmbassadorBadge,
      sales: []
    };
  }

  const code = localStorage.getItem(`${STORAGE_PREFIX}code_${userId}`) || defaultCode;
  const rawSales = localStorage.getItem(`${STORAGE_PREFIX}sales_${userId}`);
  let sales: ReferralSale[] = [];

  if (rawSales) {
    try {
      sales = JSON.parse(rawSales);
    } catch {
      sales = [];
    }
  }

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

  const planRefundRequested = localStorage.getItem(`${STORAGE_PREFIX}refund_requested_${userId}`) === 'true';

  const confirmedSales = sales.filter((s) => s.status === 'confirmed');
  const salesCount = confirmedSales.length;
  const totalVolume = confirmedSales.reduce((acc, s) => acc + s.netAmount, 0);
  const totalCommission = confirmedSales.reduce((acc, s) => acc + s.commissionAmount, 0);
  const availableBalance = Math.max(0, totalCommission - withdrawnBalance);

  const canWithdrawPix = salesCount >= AMBASSADOR_CONFIG.minSalesForPixWithdrawal;
  const hasAmbassadorBadge = salesCount >= AMBASSADOR_CONFIG.minSalesForAmbassadorBadge;
  const canRequestPlanRefund = salesCount >= AMBASSADOR_CONFIG.minSalesForPlanRefund;

  const salesNeededForPix = Math.max(0, AMBASSADOR_CONFIG.minSalesForPixWithdrawal - salesCount);
  const salesNeededForAmbassador = Math.max(0, AMBASSADOR_CONFIG.minSalesForAmbassadorBadge - salesCount);

  return {
    referralCode: code,
    salesCount,
    totalVolume,
    totalCommission,
    availableBalance,
    withdrawnBalance,
    canWithdrawPix,
    hasAmbassadorBadge,
    canRequestPlanRefund,
    salesNeededForPix,
    salesNeededForAmbassador,
    sales,
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
 * Solicita saque via PIX
 */
export function requestAmbassadorPixWithdrawal(
  userId: string,
  amount: number,
  pixKey: string
): { success: boolean; message: string } {
  if (typeof window === 'undefined') return { success: false, message: 'Operação inválida.' };

  const stats = getAmbassadorStats(userId);
  if (stats.salesCount < AMBASSADOR_CONFIG.minSalesForPixWithdrawal) {
    return {
      success: false,
      message: `Você precisa de pelo menos ${AMBASSADOR_CONFIG.minSalesForPixWithdrawal} vendas confirmadas com seu código para liberar saques via PIX.`
    };
  }

  if (amount <= 0 || amount > stats.availableBalance) {
    return {
      success: false,
      message: 'Valor solicitado inválido ou superior ao saldo disponível.'
    };
  }

  const newWithdrawn = stats.withdrawnBalance + amount;
  localStorage.setItem(`${STORAGE_PREFIX}withdrawn_${userId}`, newWithdrawn.toString());

  return {
    success: true,
    message: `Saque de R$ ${amount.toFixed(2).replace('.', ',')} solicitado com sucesso via PIX (${pixKey})! Em breve o valor estará na sua conta.`
  };
}

/**
 * Solicita o reembolso do plano contratado (desbloqueado com 10 vendas)
 */
export function requestAmbassadorPlanRefund(userId: string): { success: boolean; message: string } {
  if (typeof window === 'undefined') return { success: false, message: 'Operação inválida.' };

  const stats = getAmbassadorStats(userId);
  if (stats.salesCount < AMBASSADOR_CONFIG.minSalesForPlanRefund) {
    return {
      success: false,
      message: `Você precisa de ${AMBASSADOR_CONFIG.minSalesForPlanRefund} indicações para conquistar o direito ao reembolso total do seu plano.`
    };
  }

  localStorage.setItem(`${STORAGE_PREFIX}refund_requested_${userId}`, 'true');

  return {
    success: true,
    message: 'Solicitação de reembolso integral do seu plano registrada com sucesso! Como Embaixador Oficial com 10+ indicações, sua assinatura será 100% estornada mantendo seu acesso vitalício/ativo.'
  };
}

/**
 * Função utilitária para simular uma nova venda pelo código do embaixador (ideal para testes do usuário!)
 */
export function simulateAmbassadorSale(
  userId: string,
  planType: 'annual' | 'semiannual' | 'monthly' | 'biennial' = 'annual'
): ReferralSale {
  const planInfo = {
    monthly: { name: 'Plano Mensal', price: 49.90 },
    semiannual: { name: 'Plano Semestral', price: 179.40 },
    annual: { name: 'Plano Anual', price: 310.80 },
    biennial: { name: 'Plano Bienal', price: 477.60 }
  }[planType];

  const discountAmount = planInfo.price * (AMBASSADOR_CONFIG.discountPercent / 100);
  const netAmount = planInfo.price - discountAmount;
  const commissionAmount = netAmount * (AMBASSADOR_CONFIG.commissionPercent / 100);

  const mockNames = [
    'Mariana Ribeiro', 'Felipe Castro', 'Camila Nogueira',
    'Rodrigo Sampaio', 'Larissa Duarte', 'Thiago Meireles',
    'Renata Vasconcelos', 'Matheus Figueiredo', 'Juliana Rezende',
    'Bruno Alcantara', 'Carolina Mendonça', 'Lucas Pinheiro'
  ];
  const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
  const emailPart = randomName.toLowerCase().split(' ')[0];

  const newSale: ReferralSale = {
    id: 'sale_' + Math.random().toString(36).substring(2, 9),
    studentName: randomName,
    studentEmailMasked: `${emailPart}***@gmail.com`,
    planName: planInfo.name,
    planAmount: planInfo.price,
    discountApplied: discountAmount,
    netAmount,
    commissionAmount,
    date: new Date().toLocaleDateString('pt-BR'),
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

