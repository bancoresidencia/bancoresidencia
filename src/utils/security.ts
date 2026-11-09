/**
 * Utilitários de Segurança e Sanitização de Input
 * Banco Residência Médica
 */

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const VALID_ANSWERS = new Set(['A', 'B', 'C', 'D', 'E', 'ANULADA', '']);

/**
 * Sanitiza termos de busca enviados para filtros PostgREST do Supabase,
 * prevenindo injeções de filtros lógicos, colchetes, ponto-e-vírgula e subqueries.
 */
export function sanitizePostgrestTerm(term: string): string {
  if (!term || typeof term !== 'string') return '';
  return term
    .replace(/[\u200B-\u200D\uFEFF\u2060]/g, '')
    .replace(/\u00A0|&nbsp;/gi, ' ')
    .replace(/--/g, ' ')
    .replace(/[,();\\"%_]/g, ' ')
    .replace(/\.or\.|\.and\.|\.not\.|\.eq\.|\.neq\./gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Valida se um ID de questão é seguro e não vazio
 */
export function validateQuestionId(id: unknown): boolean {
  if (typeof id !== 'string') return false;
  const trimmed = id.trim();
  if (trimmed.length === 0 || trimmed.length > 128) return false;
  // Permite alfanuméricos, hífens e underscores típicos de IDs de questão
  return /^[a-zA-Z0-9_\-]+$/.test(trimmed);
}

/**
 * Valida se o gabarito informado é uma alternativa válida (A-E ou ANULADA)
 */
export function validateAnswerOption(answer: unknown): boolean {
  if (typeof answer !== 'string') return false;
  return VALID_ANSWERS.has(answer.toUpperCase().trim());
}

export const VALID_ADMIN_ROLES = new Set(['admin', 'curador', 'curator', 'superadmin']);

/**
 * Valida se uma role possui privilégios de administração ou curadoria
 */
export function isPrivilegedRole(role: unknown): boolean {
  if (!role || typeof role !== 'string') return false;
  return VALID_ADMIN_ROLES.has(role.toLowerCase().trim());
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
