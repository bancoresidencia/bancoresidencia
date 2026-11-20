/**
 * Utilitários de Segurança, RBAC e Sanitização de Input
 * Banco Residência Médica
 */

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const VALID_ANSWERS = new Set(['A', 'B', 'C', 'D', 'E', 'ANULADA', '']);

/**
 * Sanitiza termos de busca livres enviados para filtros PostgREST do Supabase,
 * prevenindo injeções de filtros lógicos, wildcards excessivos (*, %, _), colchetes e subqueries.
 */
export function sanitizePostgrestTerm(term: string): string {
  if (!term || typeof term !== 'string') return '';
  return term
    .replace(/[\u200B-\u200D\uFEFF\u2060\u0000-\u001F]/g, '')
    .replace(/\u00A0|&nbsp;/gi, ' ')
    .replace(/--/g, ' ')
    .replace(/[,();\\"%_*]/g, ' ')
    .replace(/\.(?:or|and|not|eq|neq|gt|gte|lt|lte|like|ilike|is|in|cs|cd|ov|fts|plfts|phfts|wfts|imatch|match)\./gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

/**
 * Sanitiza valores exatos inseridos entre aspas duplas dentro de listas .or(col.in.("...")) do PostgREST,
 * eliminando caracteres capazes de fechar aspas/parênteses ou injetar operadores lógicos,
 * mas preservando nomes clínicos legítimos da árvore taxonômica.
 */
export function sanitizePostgrestQuotedValue(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u200B-\u200D\uFEFF\u2060\u0000-\u001F]/g, '')
    .replace(/\u00A0|&nbsp;/gi, ' ')
    .replace(/["\\();*%\r\n]/g, '')
    .replace(/--/g, ' ')
    .replace(/\.(?:or|and|not|eq|neq|gt|gte|lt|lte|like|ilike|is|in|cs|cd|ov|fts|plfts|phfts|wfts|imatch|match)\./gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 140);
}

function isValidIpAddress(ip: string): boolean {
  // IPv4 estrito (0-255 por octeto, sem zeros à esquerda ambíguos)
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(ip)) {
    const octets = ip.split('.');
    return octets.every((o) => {
      if (o.length > 1 && o.startsWith('0')) return false;
      const n = Number(o);
      return Number.isInteger(n) && n >= 0 && n <= 255;
    });
  }
  // IPv6 (completo ou comprimido com ::, incluindo IPv4-mapped)
  if (ip.includes(':')) {
    try {
      const parsed = new URL(`http://[${ip}]/`);
      return parsed.hostname === `[${ip.toLowerCase()}]` || parsed.hostname.startsWith('[');
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Extrai o IP confiável do cliente sem permitir falsificação de X-Vercel-Forwarded-For ou X-Real-IP
 * quando executado fora da infraestrutura gerenciada da Vercel.
 */
export function extractTrustedClientIpFromHeaders(
  headers: { get(name: string): string | null },
  options?: { isVercelRuntime?: boolean; trustRealIpHeader?: boolean }
): string {
  const isVercel = options?.isVercelRuntime ?? process.env.VERCEL === '1';
  const trustRealIp = options?.trustRealIpHeader ?? (isVercel || process.env.TRUST_X_REAL_IP === 'true');

  const sanitizeIpCandidate = (raw?: string | null): string | null => {
    if (!raw) return null;
    let candidate = raw.trim();
    if (!candidate) return null;
    // Remove porta em IPv4 (ex: 203.0.113.10:54321)
    if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(candidate)) {
      candidate = candidate.split(':')[0];
    }
    candidate = candidate.replace(/^\[|\]$/g, '');
    return isValidIpAddress(candidate) ? candidate : null;
  };

  if (isVercel) {
    const vercelIp = sanitizeIpCandidate(headers.get('x-vercel-forwarded-for')?.split(',')[0]);
    if (vercelIp) return vercelIp;
  }

  if (trustRealIp) {
    const realIp = sanitizeIpCandidate(headers.get('x-real-ip'));
    if (realIp) return realIp;
  }

  const xff = headers.get('x-forwarded-for');
  if (xff) {
    const parts = xff
      .split(',')
      .map((s) => sanitizeIpCandidate(s))
      .filter((ip): ip is string => Boolean(ip));
    if (parts.length > 0) {
      // Usa o último IP válido anexado pelo reverse proxy da borda
      return parts[parts.length - 1];
    }
  }

  return 'unknown-ip';
}

/**
 * Oculta mensagens internas de infraestrutura/SQL em ambiente de produção (CWE-209).
 */
export function safeErrorMessage(err: unknown, fallbackMessage: string): string {
  if (process.env.NODE_ENV === 'production') {
    return fallbackMessage;
  }
  return err instanceof Error && err.message ? err.message : fallbackMessage;
}

/**
 * Valida se um ID de questão é seguro e não vazio
 */
export function validateQuestionId(id: unknown): boolean {
  if (typeof id !== 'string') return false;
  const trimmed = id.trim();
  if (trimmed.length === 0 || trimmed.length > 128) return false;
  return /^[a-zA-Z0-9_-]+$/.test(trimmed);
}

/**
 * Valida se o gabarito informado é uma alternativa válida (A-E ou ANULADA)
 */
export function validateAnswerOption(answer: unknown): boolean {
  if (typeof answer !== 'string') return false;
  return VALID_ANSWERS.has(answer.toUpperCase().trim());
}

export const VALID_ADMIN_ROLES = new Set(['admin', 'curador', 'curator', 'superadmin']);
export const STRICT_ADMIN_ROLES = new Set(['admin', 'superadmin']);

/**
 * Valida se uma role possui privilégios de administração ou curadoria médica
 */
export function isPrivilegedRole(role: unknown): boolean {
  if (!role || typeof role !== 'string') return false;
  return VALID_ADMIN_ROLES.has(role.toLowerCase().trim());
}

/**
 * Valida se uma role é estritamente Administrador Geral (exclui curadores terceirizados)
 */
export function isStrictAdminRole(role: unknown): boolean {
  if (!role || typeof role !== 'string') return false;
  return STRICT_ADMIN_ROLES.has(role.toLowerCase().trim());
}

export interface PasswordValidationResult {
  isValid: boolean;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  errorMessage?: string;
}

/**
 * Validação de políticas de senha da plataforma
 * Regras: Mínimo 6 caracteres, letras maiúsculas e minúsculas, um número e um símbolo.
 */
export function validatePasswordRequirements(password: string): PasswordValidationResult {
  const pwd = password || '';
  const hasMinLength = pwd.length >= 6;
  const hasUppercase = /[A-Z]/.test(pwd);
  const hasLowercase = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSymbol = /[^A-Za-z0-9]/.test(pwd);

  let errorMessage: string | undefined;
  if (!hasMinLength) {
    errorMessage = 'A senha deve conter no mínimo 6 caracteres.';
  } else if (!hasUppercase || !hasLowercase) {
    errorMessage = 'A senha deve conter letras maiúsculas e minúsculas.';
  } else if (!hasNumber) {
    errorMessage = 'A senha deve conter pelo menos um número (0-9).';
  } else if (!hasSymbol) {
    errorMessage = 'A senha deve conter pelo menos um símbolo (ex: !@#$%&*?).';
  }

  return {
    isValid: hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSymbol,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSymbol,
    errorMessage
  };
}
