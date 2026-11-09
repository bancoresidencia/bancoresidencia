import path from 'path';
import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';
import { ExtendedFilterState, resolveBancaList } from '@/services/questionService';
import { Question } from '@/types';
import { hierarchyQuestionCounts } from '@/data/hierarchyCounts';
import { generateSessionTicket } from '@/utils/securityTickets';
import { clinicalHierarchy } from '@/data/mockQuestions';
import { sanitizeMedicalText } from '@/utils/textSanitizer';

let cachedDb: DatabaseSync | null = null;

export function getDbPath(): string {
  return path.resolve(process.cwd(), 'data/questoes_132k.db');
}

export function isSqliteAvailable(): boolean {
  return fs.existsSync(getDbPath());
}

export function getSqliteDb(): DatabaseSync | null {
  if (!isSqliteAvailable()) return null;
  if (!cachedDb) {
    try {
      cachedDb = new DatabaseSync(getDbPath(), { readOnly: true });
    } catch (e) {
      console.warn('[sqliteQuestions] Falha ao abrir SQLite:', e);
      return null;
    }
  }
  return cachedDb;
}

export function mapSqliteRowToQuestion(row: Record<string, unknown>, includeGabarito: boolean = false): Question {
  let parsedOptions: Array<{ letter: 'A' | 'B' | 'C' | 'D' | 'E'; text: string }> = [];
  if (typeof row.options === 'string') {
    try {
      parsedOptions = JSON.parse(row.options);
    } catch {
      parsedOptions = [];
    }
  } else if (Array.isArray(row.options)) {
    parsedOptions = row.options as Array<{ letter: 'A' | 'B' | 'C' | 'D' | 'E'; text: string }>;
  }

  let parsedImages: string[] = [];
  if (typeof row.images === 'string') {
    try {
      parsedImages = JSON.parse(row.images);
    } catch {
      parsedImages = [];
    }
  } else if (Array.isArray(row.images)) {
    parsedImages = row.images as string[];
  }

  const rawInst = String(row.institution || '').trim();
  const rawBanca = String(row.banca || '').trim();
  const code = String(row.code || '').trim();

  let resolvedYear = Number(row.year) || 2024;
  if (code) {
    const m = code.match(/-(\d{4})-/);
    if (m) {
      const codeYear = parseInt(m[1], 10);
      if (codeYear >= 2000 && codeYear <= 2030 && (!row.year || (Number(row.year) === 2024 && codeYear !== 2024))) {
        resolvedYear = codeYear;
      }
    }
  }

  const institution = (rawInst && rawInst !== 'Oficial' && rawInst !== 'Banca Oficial')
    ? rawInst
    : (rawBanca && rawBanca !== 'Oficial' ? rawBanca : (rawInst || 'Banca Oficial'));

  const banca = (rawBanca && rawBanca !== 'Oficial' && rawBanca !== 'Banca Oficial')
    ? rawBanca
    : (institution.includes(' - ') ? institution.split(' - ')[0].trim() : institution);

  return {
    id: String(row.id || ''),
    code,
    institution,
    banca,
    year: resolvedYear,
    tipoProva: String(row.tipo_prova || 'Prova 1'),
    modalidade: (row.modalidade as Question['modalidade']) || 'Residência Médica',
    modalidades: row.modalidade ? [(row.modalidade as Question['modalidade'])] : ['Residência Médica'],
    especialidade: String(row.especialidade || ''),
    specialty: String(row.especialidade || ''),
    tema: String(row.novo_tema || row.tema || ''),
    foco: String(row.novo_foco || row.foco || ''),
    subfoco: String(row.novo_subfoco || row.subfoco || ''),
    sub_subfoco: row.novo_sub_subfoco ? String(row.novo_sub_subfoco) : undefined,
    difficulty: (row.difficulty as Question['difficulty']) || 'Médio',
    type: (row.type as Question['type']) || 'Múltipla escolha',
    isAnulada: Boolean(row.is_anulada),
    statement: sanitizeMedicalText(String(row.statement || '')),
    options: parsedOptions.map(opt => ({ ...opt, text: sanitizeMedicalText(opt.text) })),
    correctAnswer: includeGabarito ? (row.correct_answer as Question['correctAnswer']) || '' : '',
    commentary: includeGabarito ? sanitizeMedicalText(String(row.commentary || '')) : '',
    images: parsedImages
  };
}

export interface SqliteQueryParams {
  filters?: ExtendedFilterState;
  page?: number;
  pageSize?: number;
  questionIds?: string[];
  includeGabarito?: boolean;
  authenticatedUserId?: string;
}

export function buildSqlWhereClauses(filters: ExtendedFilterState = {}, questionIds?: string[]) {
  const whereParts: string[] = [];
  const params: unknown[] = [];

  // 1. IDs explícitos
  if (questionIds && questionIds.length > 0) {
    const placeholders = questionIds.map(() => '?').join(',');
    whereParts.push(`id IN (${placeholders})`);
    params.push(...questionIds);
    return { whereClause: `WHERE ${whereParts.join(' AND ')}`, params };
  }

  // 2. Gabarito Status
  if (filters.gabaritoStatus === 'sem_gabarito') {
    whereParts.push(`(correct_answer IS NULL OR correct_answer = '') AND is_anulada = 0`);
  } else if (filters.gabaritoStatus === 'com_gabarito') {
    whereParts.push(`(correct_answer IN ('A','B','C','D','E','ANULADA') OR is_anulada = 1)`);
  }

  // 3. Status do Estudante
  if (filters.status === 'Resolvidas') {
    if (filters.userSolvedIds && filters.userSolvedIds.length > 0) {
      const placeholders = filters.userSolvedIds.map(() => '?').join(',');
      whereParts.push(`id IN (${placeholders})`);
      params.push(...filters.userSolvedIds);
    } else {
      whereParts.push(`1 = 0`);
    }
  } else if (filters.status === 'Acertadas') {
    if (filters.userCorrectIds && filters.userCorrectIds.length > 0) {
      const placeholders = filters.userCorrectIds.map(() => '?').join(',');
      whereParts.push(`id IN (${placeholders})`);
      params.push(...filters.userCorrectIds);
    } else {
      whereParts.push(`1 = 0`);
    }
  } else if (filters.status === 'Erradas') {
    if (filters.userWrongIds && filters.userWrongIds.length > 0) {
      const placeholders = filters.userWrongIds.map(() => '?').join(',');
      whereParts.push(`id IN (${placeholders})`);
      params.push(...filters.userWrongIds);
    } else {
      whereParts.push(`1 = 0`);
    }
  } else if (filters.status === 'Não vistas') {
    if (filters.userSolvedIds && filters.userSolvedIds.length > 0) {
      const placeholders = filters.userSolvedIds.map(() => '?').join(',');
      whereParts.push(`id NOT IN (${placeholders})`);
      params.push(...filters.userSolvedIds);
    }
  }

  // 4. Busca textual
  if (filters.search && filters.search.trim()) {
    const q = `%${filters.search.trim().toLowerCase()}%`;
    whereParts.push(`(
      LOWER(statement) LIKE ? OR 
      LOWER(code) LIKE ? OR 
      LOWER(tema) LIKE ? OR 
      LOWER(foco) LIKE ? OR 
      LOWER(subfoco) LIKE ? OR 
      LOWER(multi_tags) LIKE ?
    )`);
    params.push(q, q, q, q, q, q);
  }

  // 5. Árvore Clínica: Especialidades, Temas, Focos, Subfocos
  const selectedSpecs = new Set(filters.especialidades || []);
  const selectedTemas = new Set(filters.temas || []);
  const selectedFocos = new Set(filters.focos || []);
  const selectedSubfocos = new Set(filters.subfocos || []);

  const specsWithChildren = new Set<string>();
  const temasWithChildren = new Set<string>();
  const focosWithChildren = new Set<string>();

  clinicalHierarchy.forEach((esp) => {
    esp.temas.forEach((tem) => {
      if (selectedTemas.has(tem.tema)) {
        specsWithChildren.add(esp.especialidade);
      }
      tem.focos.forEach((foc) => {
        if (selectedFocos.has(foc.foco)) {
          specsWithChildren.add(esp.especialidade);
          temasWithChildren.add(tem.tema);
        }
        foc.subfocos.forEach((subItem) => {
          const sub = typeof subItem === 'string' ? subItem : subItem.subfoco;
          if (selectedSubfocos.has(sub)) {
            specsWithChildren.add(esp.especialidade);
            temasWithChildren.add(tem.tema);
            focosWithChildren.add(foc.foco);
          }
        });
      });
    });
  });

  const clinicalOrParts: string[] = [];

  // Especialidades standalone
  const standaloneSpecs = new Set<string>();
  selectedSpecs.forEach((sp) => {
    if (!specsWithChildren.has(sp)) {
      if (sp === 'Cirurgia' || sp === 'Cirurgia Geral') {
        standaloneSpecs.add('Cirurgia');
        standaloneSpecs.add('Cirurgia Geral');
      } else if (sp === 'Ginecologia e Obstetrícia') {
        standaloneSpecs.add('Ginecologia');
        standaloneSpecs.add('Obstetrícia');
      } else if (sp === 'Medicina Preventiva' || sp === 'Medicina Preventiva e Social') {
        standaloneSpecs.add('Medicina Preventiva');
        standaloneSpecs.add('Medicina Preventiva e Social');
      } else {
        standaloneSpecs.add(sp);
      }
    }
  });

  if (standaloneSpecs.size > 0) {
    const list = Array.from(standaloneSpecs);
    clinicalOrParts.push(`especialidade IN (${list.map(() => '?').join(',')})`);
    params.push(...list);
  }

  // Temas standalone
  const standaloneTemas = new Set<string>();
  selectedTemas.forEach((t) => {
    if (!temasWithChildren.has(t)) {
      standaloneTemas.add(t);
    }
  });
  if (standaloneTemas.size > 0) {
    const list = Array.from(standaloneTemas);
    clinicalOrParts.push(`COALESCE(novo_tema, tema) IN (${list.map(() => '?').join(',')})`);
    params.push(...list);
  }

  // Focos standalone
  const standaloneFocos = new Set<string>();
  selectedFocos.forEach((f) => {
    if (!focosWithChildren.has(f)) {
      standaloneFocos.add(f);
    }
  });
  if (standaloneFocos.size > 0) {
    const list = Array.from(standaloneFocos);
    clinicalOrParts.push(`COALESCE(novo_foco, foco) IN (${list.map(() => '?').join(',')})`);
    params.push(...list);
  }

  // Subfocos com parent Foco
  const subfocosByParentFoco = new Map<string, string[]>();
  if (selectedSubfocos.size > 0) {
    clinicalHierarchy.forEach((esp) => {
      esp.temas.forEach((tem) => {
        tem.focos.forEach((foc) => {
          foc.subfocos.forEach((subItem) => {
            const sub = typeof subItem === 'string' ? subItem : subItem.subfoco;
            if (selectedSubfocos.has(sub)) {
              const list = subfocosByParentFoco.get(foc.foco) || [];
              if (!list.includes(sub)) list.push(sub);
              subfocosByParentFoco.set(foc.foco, list);
            }
          });
        });
      });
    });
  }

  subfocosByParentFoco.forEach((subs, parentFoc) => {
    clinicalOrParts.push(`(COALESCE(novo_foco, foco) = ? AND COALESCE(novo_subfoco, subfoco) IN (${subs.map(() => '?').join(',')}))`);
    params.push(parentFoc, ...subs);
  });

  if (selectedSubfocos.size > 0 && subfocosByParentFoco.size === 0) {
    const list = Array.from(selectedSubfocos);
    clinicalOrParts.push(`COALESCE(novo_subfoco, subfoco) IN (${list.map(() => '?').join(',')})`);
    params.push(...list);
  }

  // 4º Nível (Sub-subfocos)
  if (filters.subSubfocos && filters.subSubfocos.length > 0) {
    const list = Array.from(filters.subSubfocos);
    clinicalOrParts.push(`novo_sub_subfoco IN (${list.map(() => '?').join(',')})`);
    params.push(...list);
  }

  if (clinicalOrParts.length > 0) {
    whereParts.push(`(${clinicalOrParts.join(' OR ')})`);
  }

  // 6. Modalidades
  if (filters.modalidades && filters.modalidades.length > 0) {
    const hasRevalida = filters.modalidades.some((m) => m.toLowerCase().includes('revalida'));
    const isOnlyDefault = filters.modalidades.length === 1 && filters.modalidades[0] === 'Residência Médica';

    if (hasRevalida) {
      whereParts.push(`(modalidade = 'Revalida' OR banca IN ('INEP Revalida', 'UFMT Revalida', 'UEPA Revalida', 'UNIRG Revalida', 'FMRP-USP'))`);
    } else {
      whereParts.push(`(modalidade != 'Revalida' AND banca NOT IN ('INEP Revalida', 'UFMT Revalida', 'UEPA Revalida', 'UNIRG Revalida', 'FMRP-USP'))`);
      if (!isOnlyDefault) {
        const placeholders = filters.modalidades.map(() => '?').join(',');
        whereParts.push(`modalidade IN (${placeholders})`);
        params.push(...filters.modalidades);
      }
    }
  }

  // 7. Instituições / Bancas
  if (filters.instituicoes && filters.instituicoes.length > 0) {
    const resolved = resolveBancaList(filters.instituicoes);
    if (resolved.length > 0) {
      const placeholders = resolved.map(() => '?').join(',');
      whereParts.push(`banca IN (${placeholders})`);
      params.push(...resolved);
    }
  }

  // 8. Anos
  if (filters.anos && filters.anos.length > 0 && filters.anos.length < 18) {
    const placeholders = filters.anos.map(() => '?').join(',');
    whereParts.push(`year IN (${placeholders})`);
    params.push(...filters.anos);
  }

  // 9. Tipo de Prova
  if (filters.tipoProva && filters.tipoProva.length > 0) {
    const placeholders = filters.tipoProva.map(() => '?').join(',');
    whereParts.push(`tipo_prova IN (${placeholders})`);
    params.push(...filters.tipoProva);
  }

  // 10. Dificuldade
  if (filters.dificuldade && filters.dificuldade !== 'Todas') {
    whereParts.push(`difficulty = ?`);
    params.push(filters.dificuldade);
  }

  // 11. Tipo de Questão
  if (filters.tipoQuestao && filters.tipoQuestao !== 'Todas') {
    whereParts.push(`type = ?`);
    params.push(filters.tipoQuestao);
  }

  // 12. Ocultar Anuladas
  if (filters.ocultarAnuladasErro) {
    whereParts.push(`is_anulada = 0`);
  }

  // 13. Últimos 5 Anos
  if (filters.ultimos5Anos) {
    const minYear = new Date().getFullYear() - 4;
    whereParts.push(`year >= ?`);
    params.push(minYear);
  }

  const whereClause = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';
  return { whereClause, params };
}

export function queryQuestionsFromSqlite(params: SqliteQueryParams) {
  const db = getSqliteDb();
  if (!db) return null;

  const {
    filters = {},
    page = 1,
    pageSize = 20,
    questionIds,
    includeGabarito = false,
    authenticatedUserId = 'anonymous'
  } = params;

  const { whereClause, params: sqlParams } = buildSqlWhereClauses(filters, questionIds);

  // 1. Contagem total
  const countSql = `SELECT count(*) as total FROM questions ${whereClause};`;
  const countRow = db.prepare(countSql).get(...sqlParams) as { total: number };
  const total = countRow ? countRow.total : 0;

  // 2. Ordenação e Paginação
  let orderClause = `ORDER BY year DESC, id ASC`;
  if (filters.aleatorizar) {
    orderClause = `ORDER BY RANDOM()`;
  }

  const from = (page - 1) * pageSize;
  const dataSql = `
    SELECT 
      id, code, institution, banca, year, tipo_prova, modalidade, 
      especialidade, 
      COALESCE(novo_tema, tema) AS tema, 
      COALESCE(novo_foco, foco) AS foco, 
      COALESCE(novo_subfoco, subfoco) AS subfoco,
      novo_tema, novo_foco, novo_subfoco, novo_sub_subfoco,
      difficulty, type, is_anulada, 
      statement, options, images, correct_answer, commentary
    FROM questions
    ${whereClause}
    ${orderClause}
    LIMIT ? OFFSET ?;
  `;

  const rows = db.prepare(dataSql).all(...sqlParams, pageSize, from) as Record<string, unknown>[];
  const questions = rows.map((r) => mapSqliteRowToQuestion(r, includeGabarito));

  const pageQuestionIds = questions.map((q) => q.id).filter(Boolean);
  const sessionTicket = generateSessionTicket(authenticatedUserId, pageQuestionIds);
  const totalPages = Math.ceil(total / pageSize);

  return {
    questions,
    total,
    page,
    pageSize,
    totalPages,
    sessionTicket
  };
}

export function queryFacetsFromSqlite(filters: ExtendedFilterState = {}) {
  const db = getSqliteDb();
  if (!db) return null;

  // Clona filtros removendo a árvore clínica
  const filtersWithoutClinical: ExtendedFilterState = {
    ...filters,
    especialidades: [],
    temas: [],
    focos: [],
    subfocos: []
  };

  const { whereClause, params } = buildSqlWhereClauses(filtersWithoutClinical);

  // 1. Total Right Card Count
  const totalRow = db.prepare(`SELECT count(*) as total FROM questions ${whereClause}`).get(...params) as { total: number };
  const totalRightCardCount = totalRow ? totalRow.total : 0;

  // 2. Agrupamento por especialidade
  const specRows = db.prepare(`
    SELECT especialidade, count(*) as count 
    FROM questions 
    ${whereClause} 
    GROUP BY especialidade
  `).all(...params) as Array<{ especialidade: string; count: number }>;

  const especialidades: Record<string, number> = {};
  let cirurgiaSum = 0;
  let goSum = 0;

  for (const r of specRows) {
    especialidades[r.especialidade] = r.count;
    if (r.especialidade === 'Cirurgia' || r.especialidade === 'Cirurgia Geral') {
      cirurgiaSum += r.count;
    }
    if (r.especialidade === 'Ginecologia' || r.especialidade === 'Obstetrícia') {
      goSum += r.count;
    }
  }
  especialidades['Cirurgia Geral'] = cirurgiaSum;
  especialidades['Cirurgia'] = cirurgiaSum;
  especialidades['Ginecologia e Obstetrícia'] = goSum;
  if (especialidades['Medicina Preventiva e Social']) {
    especialidades['Medicina Preventiva'] = especialidades['Medicina Preventiva e Social'];
  }

  // 3. Agrupamento por tema
  const temaWhere = whereClause
    ? whereClause + " AND COALESCE(novo_tema, tema) IS NOT NULL AND COALESCE(novo_tema, tema) != ''"
    : "WHERE COALESCE(novo_tema, tema) IS NOT NULL AND COALESCE(novo_tema, tema) != ''";

  const temaRows = db.prepare(
    "SELECT COALESCE(novo_tema, tema) as tema, count(*) as count " +
    "FROM questions " +
    temaWhere + " " +
    "GROUP BY COALESCE(novo_tema, tema)"
  ).all(...params) as Array<{ tema: string; count: number }>;

  const temas: Record<string, number> = {};
  for (const r of temaRows) {
    temas[r.tema] = r.count;
  }

  // 4. Proporção para focos e subfocos
  const globalTotal = 132947;
  const overallRatio = globalTotal > 0 ? totalRightCardCount / globalTotal : 1;
  const focos: Record<string, number> = {};
  const subfocos: Record<string, number> = {};

  if (totalRightCardCount > 0) {
    for (const [f, count] of Object.entries(hierarchyQuestionCounts.focos || {})) {
      focos[f] = Math.max(0, Math.round((count as number) * overallRatio));
    }
    for (const [s, count] of Object.entries(hierarchyQuestionCounts.subfocos || {})) {
      subfocos[s] = Math.max(0, Math.round((count as number) * overallRatio));
    }
  }

  return {
    facets: {
      totalRightCardCount,
      especialidades,
      temas,
      focos,
      subfocos
    }
  };
}

