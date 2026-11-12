import { UserAccount } from '@/types/auth';

export interface AccountExamInfo {
  examName: string;
  examDate: string;
  daysLeft: number;
}

/**
 * Retorna os dados da prova alvo e contagem de dias específicos da conta do aluno.
 * Prioridade:
 * 1. user.targetExamName e user.targetExamDate (salvos no perfil/metadados da conta)
 * 2. localStorage com chave específica do ID do usuário (ex: user_target_exam_name_<id>)
 * 3. Migração única de chave legada se pertencer a esta conta
 * 4. Fallback padrão baseado no ano de formatura do aluno
 */
export function getAccountTargetExam(user: UserAccount | null | undefined): AccountExamInfo {
  const currentYear = new Date().getFullYear();

  let name = user?.targetExamName;
  let date = user?.targetExamDate;

  if (typeof window !== 'undefined' && user?.id) {
    const userScopedNameKey = `user_target_exam_name_${user.id}`;
    const userScopedDateKey = `user_target_exam_date_${user.id}`;

    if (!name) {
      name = localStorage.getItem(userScopedNameKey) || undefined;
    }
    if (!date) {
      date = localStorage.getItem(userScopedDateKey) || undefined;
    }

    // Se ainda não houver salvo na chave específica do usuário, verifica se existe valor legado e migra
    if (!name || !date) {
      const legacyName = localStorage.getItem('user_target_exam_name');
      const legacyDate = localStorage.getItem('user_target_exam_date');
      if (legacyName && legacyDate) {
        name = name || legacyName;
        date = date || legacyDate;
        localStorage.setItem(userScopedNameKey, name);
        localStorage.setItem(userScopedDateKey, date);
        // Limpa a chave legada global para não contaminar outras contas no mesmo navegador
        localStorage.removeItem('user_target_exam_name');
        localStorage.removeItem('user_target_exam_date');
      }
    }
  }

  const now = new Date();
  // Se estamos nos últimos meses do ano (a partir de outubro), a próxima edição principal de residência é no ano seguinte
  const nextTargetYear = now.getMonth() >= 9 ? currentYear + 1 : currentYear;

  // Fallback inteligente caso o aluno ainda não tenha configurado prova alvo
  if (!name || !date) {
    const gradYear = user?.graduationYear && user.graduationYear >= nextTargetYear
      ? user.graduationYear
      : nextTargetYear;
    if (!name) name = `ENARE ${gradYear}`;
    if (!date) date = `${gradYear}-10-24`;
  }

  let daysLeft = 0;
  try {
    let target = new Date(date + 'T00:00:00');
    let diffMs = target.getTime() - now.getTime();
    // Se a data já expirou e for o padrão automático ENARE, avança suavemente para a próxima edição
    if (diffMs < 0 && name.startsWith('ENARE ') && !user?.targetExamDate) {
      name = `ENARE ${nextTargetYear}`;
      date = `${nextTargetYear}-10-24`;
      target = new Date(date + 'T00:00:00');
      diffMs = target.getTime() - now.getTime();
    }
    daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  } catch {
    daysLeft = 0;
  }

  return {
    examName: name,
    examDate: date,
    daysLeft
  };
}

export function saveAccountTargetExam(userId: string | undefined, examName: string, examDate: string) {
  if (typeof window === 'undefined' || !userId) return;
  localStorage.setItem(`user_target_exam_name_${userId}`, examName);
  localStorage.setItem(`user_target_exam_date_${userId}`, examDate);
  window.dispatchEvent(new Event('bancoresidencia_target_exam_changed'));
}
