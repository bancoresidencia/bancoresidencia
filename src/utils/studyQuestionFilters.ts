import type { AdvancedFilterState } from '../types/index';

export const clinicalFields = ['especialidades', 'temas', 'focos', 'subfocos', 'subSubfocos'] as const;

export function normalizeStudySpecialty(specialty: string): string {
  switch (specialty) {
    case 'Cirurgia': return 'Cirurgia Geral';
    case 'Medicina Preventiva': return 'Medicina Preventiva e Social';
    case 'Outras / Em Curadoria': return '';
    default: return specialty;
  }
}

export function clinicalPathKey(path: string[]): string {
  return path.map((part, depth) => depth === 0 ? normalizeStudySpecialty(part) : part).join('\u001f');
}

export function isClinicalPathPrefix(parent: string[], path: string[]): boolean {
  return parent.length <= path.length && parent.every((part, depth) => part === path[depth]);
}

export function legacyClinicalSelections(filters: Partial<AdvancedFilterState>): (string | null)[][] {
  return clinicalFields.flatMap((field, depth) => {
    const values = filters[field];
    return Array.isArray(values) ? values
      .filter((value) => typeof value === 'string' && value.length > 0)
      .map((value) => [...Array<null>(depth).fill(null), value]) : [];
  });
}

export function hasSelectedClinicalPath(filters: AdvancedFilterState, path: string[]): boolean {
  const label = path[path.length - 1];
  const explicit = filters.clinicalPaths?.filter((selected) =>
    selected.length === path.length && selected.at(-1) === label);
  return explicit?.length
    ? explicit.some((selected) => isClinicalPathPrefix(selected, path))
    : (filters[clinicalFields[path.length - 1]] ?? []).includes(label);
}

export function recentExamYears(count: number, currentYear = new Date().getFullYear()): number[] {
  return Array.from({ length: count }, (_, index) => currentYear - index);
}

export function normalizeStudyFormats(format?: string): string[] | null {
  const value = format?.trim().toLowerCase();
  switch (value) {
    case undefined:
    case '':
    case 'todas': return null;
    case 'discursiva':
    case 'dissertativa': return ['discursiva', 'dissertativa'];
    case 'certo ou errado':
    case 'certo e errado':
    case 'verdadeiro ou falso': return ['certo ou errado', 'certo e errado', 'verdadeiro ou falso'];
    case 'multipla escolha':
    case 'múltipla escolha': return ['múltipla escolha', 'multipla escolha'];
    default: return [value];
  }
}
