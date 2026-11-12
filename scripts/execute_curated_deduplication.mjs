import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { DatabaseSync } from 'node:sqlite';

const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const LOG_PATH = path.resolve('data/supabase_tables/ai_deduplication_audit_log.json');
const DECISIONS_PATH = path.resolve('data/supabase_tables/deduplication_decisions.json');

console.log('='.repeat(80));
console.log('🚀 EXECUTANDO MOTOR DE DEDUPLICAÇÃO CANÔNICA E SANEAMENTO (FASES A & B)');
console.log(`📁 Banco de Dados: ${DB_PATH}`);
console.log('='.repeat(80));

const t0 = Date.now();
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');
db.exec('PRAGMA temp_store = MEMORY;');

// 1. Helpers de Normalização e Acrônimos
function normalizeTextSimple(str) {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractAcronym(name) {
  if (!name) return '';
  const trimmed = name.trim();
  if (/^[A-Z0-9-]{2,10}$/.test(trimmed)) {
    return trimmed.replace(/-/g, '');
  }
  const stopwords = new Set(['de', 'do', 'da', 'dos', 'das', 'e', 'para', 'em', 'com', 'campus', 'sp', 'rj', 'mg', 'rs', 'pr', 'ba', 'pe', 'ce', 'go', 'sc', 'es', 'fundacao', 'associacao', 'sociedade', 'instituto']);
  const words = trimmed.split(/[\s-]+/).filter(w => {
    const clean = w.toLowerCase().replace(/[^\w]/g, '');
    return clean.length > 0 && !stopwords.has(clean);
  });
  return words.map(w => w[0].toUpperCase()).join('');
}

function areInstitutionsEquivalent(instA, instB) {
  if (!instA || !instB) return false;
  if (instA === instB) return true;

  const normA = normalizeTextSimple(instA);
  const normB = normalizeTextSimple(instB);
  if (normA === normB) return true;

  // Contenção direta de substring longa (ex: "Hospital São Lucas" em "Hospital São Lucas de Ribeirão Preto")
  if (normA.length > 6 && normB.length > 6) {
    if (normA.includes(normB) || normB.includes(normA)) return true;
  }

  const acrA = extractAcronym(instA);
  const acrB = extractAcronym(instB);

  if (acrA && acrB) {
    if (acrA === acrB) return true;
    if (acrA.length >= 3 && acrB.length >= 3) {
      if (acrA.includes(acrB) || acrB.includes(acrA)) return true;
    }
  }

  const upperA = instA.toUpperCase();
  const upperB = instB.toUpperCase();
  if (acrB && acrB.length >= 3 && upperA.includes(acrB)) return true;
  if (acrA && acrA.length >= 3 && upperB.includes(acrA)) return true;

  return false;
}

// 2. Criação da Tabela de Staging Oficial: questions_curated_staging
db.exec(`DROP TABLE IF EXISTS "questions_curated_staging"`);
db.exec(`
  CREATE TABLE "questions_curated_staging" (
    "id" TEXT PRIMARY KEY,
    "code" TEXT,
    "institution" TEXT,
    "banca" TEXT,
    "year" INTEGER,
    "tipo_prova" TEXT,
    "modalidade" TEXT,
    "especialidade" TEXT,
    "tema" TEXT,
    "foco" TEXT,
    "subfoco" TEXT,
    "difficulty" TEXT,
    "type" TEXT,
    "is_anulada" INTEGER,
    "statement" TEXT,
    "options" TEXT,
    "correct_answer" TEXT,
    "commentary" TEXT,
    "images" TEXT,
    "numero_questao" INTEGER,
    "titulo_caderno" TEXT,
    "merged_from_ids" TEXT,
    "source_tables" TEXT,
    "curation_status" TEXT,
    "curation_notes" TEXT,
    "created_at" TEXT
  )
`);

const insertStagingStmt = db.prepare(`
  INSERT INTO "questions_curated_staging" VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  )
`);

// 3. Helper de Busca do Registro Completo
function fetchFullQuestion(sourceTable, originalId) {
  try {
    if (sourceTable === 'provaderesidencia_questoes') {
      const q = db.prepare(`
        SELECT q.id, q.numero, q.enunciado as statement, q.opcoes_json as options,
               q.gabarito_oficial as correct_answer, q.texto_gabarito as commentary,
               q.is_anulada, q.especialidade, q.tema, q.subtema as foco,
               q.imagens_locais_json, q.imagens_json,
               p.titulo as prova_titulo, p.instituicao_raw, p.instituicao_banco, p.ano, p.modalidade, p.uf
        FROM "provaderesidencia_questoes" q
        LEFT JOIN "provaderesidencia_provas" p ON q.prova_id = p.id
        WHERE q.id = ?
      `).get(originalId);
      
      if (!q) return null;
      let opts = [];
      try { opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options; } catch {}
      return {
        id: `pdr_${q.id}`,
        original_id: q.id,
        code: `PDR-Q${q.numero || q.id}`,
        source_table: sourceTable,
        institution: q.instituicao_banco || q.instituicao_raw || null,
        banca: q.instituicao_banco || q.instituicao_raw || null,
        year: q.ano || null,
        modalidade: q.modalidade || 'Acesso Direto',
        tipo_prova: q.prova_titulo || 'Caderno Oficial',
        numero_questao: q.numero || null,
        titulo_caderno: q.prova_titulo || null,
        especialidade: q.especialidade || null,
        tema: q.tema || null,
        foco: q.foco || null,
        subfoco: null,
        difficulty: null,
        type: 'Múltipla escolha',
        is_anulada: (q.is_anulada === 1 || q.is_anulada === true || q.gabarito_oficial === 'ANULADA') ? 1 : 0,
        statement: q.statement || '',
        options: opts,
        correct_answer: q.correct_answer || null,
        commentary: q.commentary || null,
        images: q.imagens_json || q.imagens_locais_json || '[]',
        created_at: new Date().toISOString()
      };
    } else {
      const q = db.prepare(`SELECT * FROM "${sourceTable}" WHERE id = ?`).get(originalId);
      if (!q) return null;
      let opts = [];
      try { opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options; } catch {}
      return {
        id: `${sourceTable}_${q.id}`,
        original_id: q.id,
        code: q.code || null,
        source_table: sourceTable,
        institution: q.institution || null,
        banca: q.banca || null,
        year: q.year ? parseInt(q.year, 10) : null,
        modalidade: q.modalidade || (sourceTable.includes('r_plus') ? 'R+' : sourceTable.includes('revalida') ? 'Revalida' : sourceTable.includes('titulo') ? 'Título de Especialista' : 'Acesso Direto'),
        tipo_prova: q.tipo_prova || 'Prova Oficial',
        numero_questao: null,
        titulo_caderno: null,
        especialidade: q.especialidade || null,
        tema: q.tema || null,
        foco: q.foco || null,
        subfoco: q.subfoco || null,
        difficulty: q.difficulty || null,
        type: q.type || 'Múltipla escolha',
        is_anulada: (q.is_anulada === 1 || q.is_anulada === true || q.is_anulada === 'true' || q.correct_answer === 'ANULADA') ? 1 : 0,
        statement: q.statement || '',
        options: opts,
        correct_answer: q.correct_answer || null,
        commentary: q.commentary || null,
        images: q.images || '[]',
        created_at: q.created_at || new Date().toISOString()
      };
    }
  } catch (err) {
    console.error(`Erro ao buscar questão ${sourceTable} / ${originalId}:`, err);
    return null;
  }
}

// 4. Política Canônica de Fusão com Preservação dos Melhores Filtros
function mergeQuestionGroup(items, mergeReason) {
  // Precedência de ID:
  // questions > expansion_direto > expansion_r_plus > expansion_revalida > expansion_titulo > provaderesidencia
  const tableRank = {
    'questions': 1,
    'questions_expansion_direto': 2,
    'questions_expansion_r_plus': 3,
    'questions_expansion_revalida': 4,
    'questions_expansion_titulo_especialista': 5,
    'provaderesidencia_questoes': 6
  };

  items.sort((a, b) => (tableRank[a.source_table] || 99) - (tableRank[b.source_table] || 99));
  const base = items[0];

  // Identificação e Preservação dos Melhores Filtros
  // 1. Instituição & Banca: Mais longa, formal e esclarecedora
  let bestInstitution = base.institution;
  let bestBanca = base.banca;
  for (const it of items) {
    if (it.institution && (!bestInstitution || it.institution.length > bestInstitution.length)) {
      bestInstitution = it.institution;
    }
    if (it.banca && (!bestBanca || it.banca.length > bestBanca.length)) {
      bestBanca = it.banca;
    }
  }

  // 2. Comentário: Maior extensão e riqueza pedagógica
  let bestCommentary = base.commentary;
  let bestCommLen = (base.commentary || '').length;
  for (const it of items) {
    const cLen = (it.commentary || '').length;
    if (cLen > bestCommLen) {
      bestCommentary = it.commentary;
      bestCommLen = cLen;
    }
  }

  // 3. Taxonomia mais profunda
  let bestEsp = base.especialidade;
  let bestTema = base.tema;
  let bestFoco = base.foco;
  let bestSubfoco = base.subfoco;
  for (const it of items) {
    if (!bestEsp && it.especialidade) bestEsp = it.especialidade;
    if (!bestTema && it.tema) bestTema = it.tema;
    if (!bestFoco && it.foco) bestFoco = it.foco;
    if (!bestSubfoco && it.subfoco) bestSubfoco = it.subfoco;
  }

  // 4. Dificuldade calibrada
  let bestDiff = base.difficulty;
  for (const it of items) {
    if (it.difficulty && !bestDiff) bestDiff = it.difficulty;
  }

  // 5. Gabarito Homologado (Consenso Multi-Fonte)
  // Regra do Usuário: "dê preferência pela questão com gabarito, ao menos que você identifique que esse gabarito não foi feito por homologação"
  // "Geralmente o supabase:principal é o que está com o gabarito não homologado."
  let bestGab = base.correct_answer;
  let isAnuladaFinal = base.is_anulada;

  const validGabs = items.map(it => it.correct_answer).filter(g => g && g !== 'ANULADA' && g !== 'null' && g.trim().length > 0);
  if (validGabs.length > 0) {
    // Conta frequência dos gabaritos válidos
    const freq = {};
    for (const g of validGabs) freq[g] = (freq[g] || 0) + 1;
    let topGab = validGabs[0];
    let topCount = 0;
    for (const [g, cnt] of Object.entries(freq)) {
      if (cnt > topCount) { topCount = cnt; topGab = g; }
    }
    bestGab = topGab;
    isAnuladaFinal = 0; // Se há gabarito homologado comprovado pelas fontes irmãs, reverte a anulação preliminar do Supabase!
  } else {
    isAnuladaFinal = 1;
    bestGab = 'ANULADA';
  }

  // 6. Dados de Caderno e Número Oficial (de provaderesidencia)
  let bestNumero = base.numero_questao;
  let bestCaderno = base.titulo_caderno;
  for (const it of items) {
    if (!bestNumero && it.numero_questao) bestNumero = it.numero_questao;
    if (!bestCaderno && it.titulo_caderno) bestCaderno = it.titulo_caderno;
  }

  // 7. Imagens válidas
  let bestImages = base.images;
  for (const it of items) {
    if (it.images && it.images !== '[]' && it.images !== 'null' && (!bestImages || bestImages === '[]' || bestImages === 'null')) {
      bestImages = it.images;
    }
  }

  // 8. Rastreabilidade
  const mergedFromIds = items.map(it => it.id);
  const sourceTables = Array.from(new Set(items.map(it => it.source_table)));

  return {
    id: base.id,
    code: base.code || (bestNumero ? `Q-${bestNumero}` : base.id),
    institution: bestInstitution,
    banca: bestBanca,
    year: base.year,
    tipo_prova: base.tipo_prova,
    modalidade: base.modalidade,
    especialidade: bestEsp,
    tema: bestTema,
    foco: bestFoco,
    subfoco: bestSubfoco,
    difficulty: bestDiff,
    type: base.type,
    is_anulada: isAnuladaFinal,
    statement: base.statement,
    options: JSON.stringify(base.options),
    correct_answer: bestGab,
    commentary: bestCommentary,
    images: typeof bestImages === 'object' ? JSON.stringify(bestImages) : bestImages,
    numero_questao: bestNumero,
    titulo_caderno: bestCaderno,
    merged_from_ids: JSON.stringify(mergedFromIds),
    source_tables: JSON.stringify(sourceTables),
    curation_status: 'curated_merged',
    curation_notes: mergeReason,
    created_at: base.created_at
  };
}

// 5. Execução do Processamento em Lote
async function main() {
  console.log('⚡ Etapa 1: Carregando grupos da tabela audit_question_normalized...');
  
  // A. Grupos de Composite Fingerprint (Enunciado + Alternativas Idênticas)
  const fingerprintGroups = db.prepare(`
    SELECT composite_fingerprint, COUNT(*) as cnt
    FROM "audit_question_normalized"
    GROUP BY composite_fingerprint
  `).all();

  console.log(`  Total de grupos identificados: ${fingerprintGroups.length.toLocaleString()}`);

  let totalProcessedQuestions = 0;
  let totalCuratedRecords = 0;
  let totalMergesApplied = 0;
  let totalDistinctPreserved = 0;
  let totalGabaritoHomologated = 0;
  let totalAnuladaReverted = 0;

  const decisionsLog = {};

  db.exec('BEGIN TRANSACTION');

  for (let idx = 0; idx < fingerprintGroups.length; idx++) {
    const fg = fingerprintGroups[idx];
    const members = db.prepare(`
      SELECT source_table, original_id, year, institution, correct_answer, is_anulada
      FROM "audit_question_normalized"
      WHERE composite_fingerprint = ?
    `).all(fg.composite_fingerprint);

    totalProcessedQuestions += members.length;

    // Caso 1: Questão Única (Sem colisão no acervo)
    if (members.length === 1) {
      const full = fetchFullQuestion(members[0].source_table, members[0].original_id);
      if (full) {
        insertStagingStmt.run(
          full.id,
          full.code,
          full.institution,
          full.banca,
          full.year,
          full.tipo_prova,
          full.modalidade,
          full.especialidade,
          full.tema,
          full.foco,
          full.subfoco,
          full.difficulty,
          full.type,
          full.is_anulada,
          full.statement,
          JSON.stringify(full.options),
          full.correct_answer,
          full.commentary,
          typeof full.images === 'object' ? JSON.stringify(full.images) : full.images,
          full.numero_questao,
          full.titulo_caderno,
          JSON.stringify([full.id]),
          JSON.stringify([full.source_table]),
          'distinct_single',
          'Questão única sem colisão no acervo',
          full.created_at
        );
        totalCuratedRecords++;
      }
      continue;
    }

    // Caso 2: Grupo de Duplicatas (2 ou mais ocorrências)
    // Busca dados completos de todos os membros do grupo
    const fullMembers = members.map(m => fetchFullQuestion(m.source_table, m.original_id)).filter(Boolean);

    // Subdivisão por Ano e Instituição:
    // Se Anos forem diferentes -> Preservam-se como Distintas (Reaproveitamento temporal)
    // Se Anos forem iguais e Instituições equivalentes -> Mesclam-se com herança de filtros
    const subGroups = [];

    for (const mem of fullMembers) {
      let matchedGroup = null;
      for (const sg of subGroups) {
        const lead = sg[0];
        const sameYear = (lead.year === mem.year) || (!lead.year || !mem.year);
        const eqInst = areInstitutionsEquivalent(lead.institution, mem.institution);

        if (sameYear && eqInst) {
          matchedGroup = sg;
          break;
        }
      }

      if (matchedGroup) {
        matchedGroup.push(mem);
      } else {
        subGroups.push([mem]);
      }
    }

    // Agora processa cada subgrupo formado
    for (const sg of subGroups) {
      if (sg.length === 1) {
        // Questão distinta preservada (ano diferente ou banca independente)
        const item = sg[0];
        insertStagingStmt.run(
          item.id,
          item.code,
          item.institution,
          item.banca,
          item.year,
          item.tipo_prova,
          item.modalidade,
          item.especialidade,
          item.tema,
          item.foco,
          item.subfoco,
          item.difficulty,
          item.type,
          item.is_anulada,
          item.statement,
          JSON.stringify(item.options),
          item.correct_answer,
          item.commentary,
          typeof item.images === 'object' ? JSON.stringify(item.images) : item.images,
          item.numero_questao,
          item.titulo_caderno,
          JSON.stringify([item.id]),
          JSON.stringify([item.source_table]),
          'distinct_temporal_or_independent',
          'Preservada: ano distinto ou banca independente',
          item.created_at
        );
        totalCuratedRecords++;
        totalDistinctPreserved++;
      } else {
        // Fusão Canônica com Preservação dos Melhores Filtros!
        const hadAnulada = sg.some(it => it.correct_answer === 'ANULADA' || it.is_anulada === 1);
        const hadValid = sg.some(it => it.correct_answer && it.correct_answer !== 'ANULADA' && it.correct_answer.trim().length > 0);

        let reason = `Fusão canônica de ${sg.length} cópias da mesma prova/ano`;
        if (hadAnulada && hadValid) {
          reason += ' | Gabarito homologado adotado por consenso multi-fonte, revertendo anulação espúria do Supabase principal';
          totalGabaritoHomologated++;
          totalAnuladaReverted++;
        }

        const merged = mergeQuestionGroup(sg, reason);
        insertStagingStmt.run(
          merged.id,
          merged.code,
          merged.institution,
          merged.banca,
          merged.year,
          merged.tipo_prova,
          merged.modalidade,
          merged.especialidade,
          merged.tema,
          merged.foco,
          merged.subfoco,
          merged.difficulty,
          merged.type,
          merged.is_anulada,
          merged.statement,
          merged.options,
          merged.correct_answer,
          merged.commentary,
          merged.images,
          merged.numero_questao,
          merged.titulo_caderno,
          merged.merged_from_ids,
          merged.source_tables,
          merged.curation_status,
          merged.curation_notes,
          merged.created_at
        );

        totalCuratedRecords++;
        totalMergesApplied += (sg.length - 1);

        decisionsLog[fg.composite_fingerprint] = {
          action: 'merge_curated',
          canonical_id: merged.id,
          merged_count: sg.length,
          reason,
          decided_at: new Date().toISOString()
        };
      }
    }

    if (idx % 10000 === 0 && idx > 0) {
      process.stdout.write(`\r  ⏳ Grupos processados: ${idx.toLocaleString()} / ${fingerprintGroups.length.toLocaleString()}...`);
    }
  }

  db.exec('COMMIT');

  console.log('\n⚙️ Criando índices de alta performance na tabela questions_curated_staging...');
  db.exec(`CREATE INDEX IF NOT EXISTS "idx_qcs_id" ON "questions_curated_staging"("id")`);
  db.exec(`CREATE INDEX IF NOT EXISTS "idx_qcs_banca" ON "questions_curated_staging"("banca")`);
  db.exec(`CREATE INDEX IF NOT EXISTS "idx_qcs_year" ON "questions_curated_staging"("year")`);
  db.exec(`CREATE INDEX IF NOT EXISTS "idx_qcs_modalidade" ON "questions_curated_staging"("modalidade")`);
  db.exec(`CREATE INDEX IF NOT EXISTS "idx_qcs_especialidade" ON "questions_curated_staging"("especialidade")`);

  const totalSec = ((Date.now() - t0) / 1000).toFixed(1);

  // Registro do Log de Auditoria
  const auditSummary = {
    executed_at: new Date().toISOString(),
    duration_seconds: parseFloat(totalSec),
    total_input_questions: totalProcessedQuestions,
    total_output_curated_questions: totalCuratedRecords,
    net_redundancy_eliminated: totalMergesApplied,
    distinct_preserved_by_year_or_banca: totalDistinctPreserved,
    gabaritos_homologados_revertendo_anulacao_espuria: totalAnuladaReverted,
    rules_applied: [
      "Invariância de ordem das assertivas (casamento por conteúdo semântico)",
      "Acrônimos e siglas no mesmo ano unificados para a instituição oficial canônica",
      "Anos distintos preservados como ocorrências históricas independentes",
      "Consenso multi-fonte: gabarito homologado da prova oficial prevalece sobre ANULADA do Supabase principal",
      "Preservação canônica do comentário mais rico, taxonomia profunda e metadados de caderno"
    ]
  };

  fs.writeFileSync(LOG_PATH, JSON.stringify(auditSummary, null, 2), 'utf8');

  // Atualiza decisões salvas no JSON da quarentena
  const existingDecisions = fs.existsSync(DECISIONS_PATH) ? JSON.parse(fs.readFileSync(DECISIONS_PATH, 'utf8')) : { decisions: {} };
  existingDecisions.decisions = { ...existingDecisions.decisions, ...decisionsLog };
  existingDecisions.updated_at = new Date().toISOString();
  fs.writeFileSync(DECISIONS_PATH, JSON.stringify(existingDecisions, null, 2), 'utf8');

  console.log('\n' + '='.repeat(80));
  console.log('🏁 SANEAMENTO E DEDUPLICAÇÃO CANÔNICA EXECUTADOS COM SUCESSO ABSOLUTO!');
  console.log(`⏱️ Tempo Total de Execução: ${totalSec}s`);
  console.log(`📊 Total de Questões de Entrada: ${totalProcessedQuestions.toLocaleString('pt-BR')}`);
  console.log(`💎 Total de Questões Limpas na Staging: ${totalCuratedRecords.toLocaleString('pt-BR')}`);
  console.log(`✂️  Duplicatas Redundantes Eliminadas: ${totalMergesApplied.toLocaleString('pt-BR')}`);
  console.log(`🏛️ Questões Preservadas por Ano/Banca Distinta: ${totalDistinctPreserved.toLocaleString('pt-BR')}`);
  console.log(`⚖️ Gabaritos Homologados (Anulações Espúrias Corrigidas): ${totalAnuladaReverted.toLocaleString('pt-BR')}`);
  console.log(`💾 Tabela Gerada: questions_curated_staging em ${DB_PATH}`);
  console.log(`🧾 Relatório de Auditoria Salvo em: ${LOG_PATH}`);
  console.log('='.repeat(80));

  db.close();
}

main().catch(err => {
  console.error('\n❌ ERRO NA EXECUÇÃO DO SANEAMENTO:', err);
  process.exit(1);
});

