import canonicalData from '@/data/canonicalInstitutions.json';

export interface CanonicalInstitution {
  slug: string;
  shortName: string;
  name: string;
  state: string | null;
  logoSlug: string;
  supabase_institution: string;
  has_live_questions: boolean;
  live_questions_count: number;
  aliases: string[];
}

interface CanonicalDictionaryPayload {
  version: string;
  generated_at: string;
  description: string;
  institutions: Record<string, CanonicalInstitution>;
}

const payload = canonicalData as unknown as CanonicalDictionaryPayload;
const institutionsMap = payload.institutions;

// Índice reverso para busca ultra-rápida O(1) por aliases e siglas em minúsculas
const aliasIndex = new Map<string, CanonicalInstitution>();

function indexKey(key: string, inst: CanonicalInstitution) {
  if (!key || typeof key !== 'string') return;
  const k = key.toLowerCase().trim();
  aliasIndex.set(k, inst);
  const clean = cleanTerm(k);
  if (clean.length > 2) {
    aliasIndex.set(clean, inst);
  }
}

// 1. Indexar aliases e nomes formais (precedência base)
Object.values(institutionsMap).forEach((inst) => {
  if (Array.isArray(inst.aliases)) {
    inst.aliases.forEach((a) => indexKey(a, inst));
  }
  if (inst.supabase_institution) {
    indexKey(inst.supabase_institution, inst);
  }
});

// 2. Indexar shortName (precedência intermediária)
Object.values(institutionsMap).forEach((inst) => {
  indexKey(inst.shortName, inst);
});

// 3. Indexar slug canônico por último (precedência máxima absoluta)
Object.values(institutionsMap).forEach((inst) => {
  indexKey(inst.slug, inst);
});

/**
 * Normaliza um termo de busca removendo pontuação e preposições conectivas
 */
function cleanTerm(term: string): string {
  return term
    .toLowerCase()
    .replace(/\b(de|da|do|dos|das|e|o|a)\b/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .trim();
}

/**
 * Resolve qualquer identificador, sigla, slug ou nome aproximado de instituição
 * para a entidade canônica oficial do Banco Residência.
 */
export function resolveInstitution(query?: string | null): CanonicalInstitution | undefined {
  if (!query || typeof query !== 'string') return undefined;

  const q = query.trim().toLowerCase();

  // 1. Busca exata direta no índice de aliases
  if (aliasIndex.has(q)) {
    return aliasIndex.get(q);
  }

  // 2. Busca limpa sem pontuação
  const cleanQ = cleanTerm(q);
  if (aliasIndex.has(cleanQ)) {
    return aliasIndex.get(cleanQ);
  }

  // 3. Fallback: varredura por inclusão em nome ou aliases
  for (const inst of Object.values(institutionsMap)) {
    if (inst.name.toLowerCase().includes(q)) return inst;
    if (inst.shortName.toLowerCase().includes(q)) return inst;
    if (inst.aliases.some((a) => a.toLowerCase().includes(q))) return inst;
  }

  return undefined;
}

/**
 * Retorna o nome exato esperado pela coluna 'institution' no Supabase
 * para garantir que queries nunca retornem zero questões por falha de nomenclatura.
 */
export function getSupabaseInstitutionName(query: string): string {
  const resolved = resolveInstitution(query);
  return resolved?.supabase_institution || query;
}

/**
 * Retorna o slug universal limpo da instituição (para rotas e URLs seguras)
 */
export function getCanonicalSlug(query: string): string {
  const resolved = resolveInstitution(query);
  return resolved?.slug || query.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/**
 * Retorna todas as instituições canônicas catalogadas
 */
export function getAllCanonicalInstitutions(): CanonicalInstitution[] {
  return Object.values(institutionsMap);
}
