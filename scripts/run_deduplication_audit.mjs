import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const OUT_REPORT_PATH = path.resolve('data/supabase_tables/audit_deduplication_deep_report.json');

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';
  let s = text;
  
  // 1. Remove HTML tags
  s = s.replace(/<[^>]+>/g, ' ');
  
  // 2. Remove markdown images/links
  s = s.replace(/!\[.*?\]\(.*?\)/g, ' ');
  s = s.replace(/\[(.*?)\]\(.*?\)/g, '$1');
  
  // 3. Remove markdown formatting chars
  s = s.replace(/[*_#`~]/g, ' ');
  
  // 4. Remove leading question numbers e.g. "Questão 1:", "01.", "1 - "
  s = s.replace(/^(?:quest[aã]o\s*\d+[\s:.-]*|\d+[\s:.-]+)/i, '');
  
  // 5. Remove common boilerplate prefixes & suffixes
  s = s.replace(/(?:com base no (?:texto|caso|quadro)[^,.]*[,.]?|a respeito do (?:caso|quadro)[^,.]*[,.]?|assinale a (?:alternativa )?(?:correta|incorreta|falsa|verdadeira)[^:.]*[:.]?)/gi, ' ');
  
  // 6. Normalize Unicode diacritics
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // 7. Lowercase
  s = s.toLowerCase();
  
  // 8. Normalize clinical units
  s = s.replace(/\bmg\/dl\b/g, 'mg/dl');
  s = s.replace(/\bmmhg\b/g, 'mmhg');
  s = s.replace(/\bpct\b/g, '%');
  
  // 9. Replace non-alphanumeric chars except % with space
  s = s.replace(/[^\w\s%]/g, ' ');
  
  // 10. Collapse multiple whitespaces
  s = s.replace(/\s+/g, ' ').trim();
  
  return s;
}

function parseOptions(optionsRaw) {
  if (!optionsRaw) return [];
  let parsed = [];
  try {
    let obj = typeof optionsRaw === 'string' ? JSON.parse(optionsRaw) : optionsRaw;
    if (Array.isArray(obj)) {
      parsed = obj.map(o => ({
        letter: (o.letter || '').toUpperCase().trim(),
        text: (o.text || '').trim()
      }));
    } else if (typeof obj === 'object') {
      parsed = Object.entries(obj).map(([k, v]) => ({
        letter: k.toUpperCase().trim(),
        text: (typeof v === 'object' && v !== null ? v.text || '' : String(v)).trim()
      }));
    }
  } catch (e) {
    parsed = [];
  }
  return parsed;
}

async function main() {
  console.log('='.repeat(80));
  console.log('🔍 EXECUTANDO AUDITORIA APROFUNDADA DE DEDUPLICAÇÃO & CRUZAMENTO');
  console.log(`📁 Banco de Dados: ${DB_PATH}`);
  console.log('='.repeat(80));

  const t0 = Date.now();
  const db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA synchronous = NORMAL;');
  db.exec('PRAGMA temp_store = MEMORY;');

  // Cria tabela de staging para os metadados normalizados
  db.exec(`DROP TABLE IF EXISTS "audit_question_normalized"`);
  db.exec(`
    CREATE TABLE "audit_question_normalized" (
      "global_id" TEXT PRIMARY KEY,
      "source_table" TEXT,
      "original_id" TEXT,
      "code" TEXT,
      "institution" TEXT,
      "banca" TEXT,
      "year" INTEGER,
      "specialty" TEXT,
      "tema" TEXT,
      "foco" TEXT,
      "subfoco" TEXT,
      "difficulty" TEXT,
      "is_anulada" INTEGER,
      "correct_answer" TEXT,
      "correct_answer_text_hash" TEXT,
      "has_commentary" INTEGER,
      "commentary_len" INTEGER,
      "has_images" INTEGER,
      "num_options" INTEGER,
      "raw_statement_len" INTEGER,
      "norm_statement_len" INTEGER,
      "norm_statement_hash" TEXT,
      "norm_options_hash" TEXT,
      "composite_fingerprint" TEXT,
      "short_statement_prefix" TEXT
    )
  `);

  const insertStmt = db.prepare(`
    INSERT INTO "audit_question_normalized" VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  const sources = [
    {
      table: 'questions',
      idCol: 'id',
      codeCol: 'code',
      instCol: 'institution',
      bancaCol: 'banca',
      yearCol: 'year',
      espCol: 'especialidade',
      temaCol: 'tema',
      focoCol: 'foco',
      subfocoCol: 'subfoco',
      diffCol: 'difficulty',
      anuladaCol: 'is_anulada',
      stmtCol: 'statement',
      optsCol: 'options',
      gabCol: 'correct_answer',
      commCol: 'commentary',
      imgCol: 'images'
    },
    {
      table: 'questions_expansion_direto',
      idCol: 'id',
      codeCol: 'code',
      instCol: 'institution',
      bancaCol: 'banca',
      yearCol: 'year',
      espCol: 'especialidade',
      temaCol: 'tema',
      focoCol: 'foco',
      subfocoCol: 'subfoco',
      diffCol: 'difficulty',
      anuladaCol: 'is_anulada',
      stmtCol: 'statement',
      optsCol: 'options',
      gabCol: 'correct_answer',
      commCol: 'commentary',
      imgCol: 'images'
    },
    {
      table: 'questions_expansion_r_plus',
      idCol: 'id',
      codeCol: 'code',
      instCol: 'institution',
      bancaCol: 'banca',
      yearCol: 'year',
      espCol: 'especialidade',
      temaCol: 'tema',
      focoCol: 'foco',
      subfocoCol: 'subfoco',
      diffCol: 'difficulty',
      anuladaCol: 'is_anulada',
      stmtCol: 'statement',
      optsCol: 'options',
      gabCol: 'correct_answer',
      commCol: 'commentary',
      imgCol: 'images'
    },
    {
      table: 'questions_expansion_revalida',
      idCol: 'id',
      codeCol: 'code',
      instCol: 'institution',
      bancaCol: 'banca',
      yearCol: 'year',
      espCol: 'especialidade',
      temaCol: 'tema',
      focoCol: 'foco',
      subfocoCol: 'subfoco',
      diffCol: 'difficulty',
      anuladaCol: 'is_anulada',
      stmtCol: 'statement',
      optsCol: 'options',
      gabCol: 'correct_answer',
      commCol: 'commentary',
      imgCol: 'images'
    },
    {
      table: 'questions_expansion_titulo_especialista',
      idCol: 'id',
      codeCol: 'code',
      instCol: 'institution',
      bancaCol: 'banca',
      yearCol: 'year',
      espCol: 'especialidade',
      temaCol: 'tema',
      focoCol: 'foco',
      subfocoCol: 'subfoco',
      diffCol: 'difficulty',
      anuladaCol: 'is_anulada',
      stmtCol: 'statement',
      optsCol: 'options',
      gabCol: 'correct_answer',
      commCol: 'commentary',
      imgCol: 'images'
    },
    {
      table: 'provaderesidencia_questoes',
      isPdr: true
    }
  ];

  let totalProcessed = 0;
  console.log('⚡ Normalizando e indexando 263.197 questões...');

  for (const src of sources) {
    const tTable0 = Date.now();
    let rows = [];
    
    if (src.isPdr) {
      rows = db.prepare(`
        SELECT q.id, q.numero, q.enunciado, q.opcoes_json, q.gabarito_oficial,
               q.texto_gabarito, q.is_anulada, q.especialidade, q.tema, q.subtema,
               q.imagens_locais_json, q.imagens_json,
               p.titulo as prova_titulo, p.instituicao_raw, p.instituicao_banco, p.ano as prova_ano
        FROM "provaderesidencia_questoes" q
        LEFT JOIN "provaderesidencia_provas" p ON q.prova_id = p.id
      `).all();
    } else {
      rows = db.prepare(`SELECT * FROM "${src.table}"`).all();
    }

    db.exec('BEGIN TRANSACTION');
    for (const r of rows) {
      totalProcessed++;
      const globalId = src.isPdr ? `pdr_${r.id}` : `${src.table}_${r[src.idCol]}`;
      const originalId = String(r[src.idCol] || r.id);
      const code = src.isPdr ? `PDR-Q${r.numero || r.id}` : (r[src.codeCol] || null);
      
      const institution = src.isPdr
        ? (r.instituicao_banco || r.instituicao_raw || null)
        : (r[src.instCol] || null);
      
      const banca = src.isPdr
        ? (r.instituicao_banco || r.instituicao_raw || null)
        : (r[src.bancaCol] || null);
      
      const year = src.isPdr ? (r.prova_ano || null) : (r[src.yearCol] ? parseInt(r[src.yearCol], 10) : null);
      const specialty = src.isPdr ? (r.especialidade || null) : (r[src.espCol] || null);
      const tema = src.isPdr ? (r.tema || null) : (r[src.temaCol] || null);
      const foco = src.isPdr ? (r.subtema || null) : (r[src.focoCol] || null);
      const subfoco = src.isPdr ? null : (r[src.subfocoCol] || null);
      const diff = src.isPdr ? null : (r[src.diffCol] || null);
      
      const isAnuladaRaw = src.isPdr ? r.is_anulada : r[src.anuladaCol];
      const isAnulada = (isAnuladaRaw === true || isAnuladaRaw === 1 || isAnuladaRaw === 'true' || isAnuladaRaw === '1') ? 1 : 0;
      
      const rawStmt = String(src.isPdr ? r.enunciado || '' : r[src.stmtCol] || '');
      const rawOpts = src.isPdr ? r.opcoes_json : r[src.optsCol];
      const correctAns = String(src.isPdr ? r.gabarito_oficial || '' : r[src.gabCol] || '').trim().toUpperCase();
      
      const commentary = src.isPdr ? String(r.texto_gabarito || '') : String(r[src.commCol] || '');
      const commLen = commentary.trim().length;
      const hasComm = commLen > 10 ? 1 : 0;
      
      let hasImg = 0;
      if (src.isPdr) {
        if ((r.imagens_json && r.imagens_json.length > 5) || (r.imagens_locais_json && r.imagens_locais_json.length > 5)) hasImg = 1;
      } else {
        const imgVal = r[src.imgCol];
        if (imgVal && imgVal !== '[]' && imgVal !== 'null' && imgVal !== '') hasImg = 1;
      }

      // Normalização
      const normStmt = normalizeText(rawStmt);
      const normStmtHash = sha256(normStmt);
      const shortPrefix = normStmt.slice(0, 60);

      const parsedOpts = parseOptions(rawOpts);
      const numOptions = parsedOpts.length;
      
      // Ordenação das opções por texto normalizado (invariante à permutação de letras)
      const normOptsTexts = [];
      let correctAnsText = '';

      for (const opt of parsedOpts) {
        const normOpt = normalizeText(opt.text);
        if (normOpt) normOptsTexts.push(normOpt);
        if (opt.letter && opt.letter === correctAns) {
          correctAnsText = normOpt;
        }
      }

      normOptsTexts.sort();
      const normOptsHash = sha256(normOptsTexts.join('||'));
      const compositeFingerprint = sha256(`${normStmtHash}::${normOptsHash}`);
      const correctAnsTextHash = correctAnsText ? sha256(correctAnsText) : (correctAns ? sha256(correctAns) : null);

      insertStmt.run(
        globalId,
        src.isPdr ? 'provaderesidencia_questoes' : src.table,
        originalId,
        code,
        institution,
        banca,
        isNaN(year) ? null : year,
        specialty,
        tema,
        foco,
        subfoco,
        diff,
        isAnulada,
        correctAns || null,
        correctAnsTextHash,
        hasComm,
        commLen,
        hasImg,
        numOptions,
        rawStmt.length,
        normStmt.length,
        normStmtHash,
        normOptsHash,
        compositeFingerprint,
        shortPrefix
      );
    }
    db.exec('COMMIT');
    const tableElapsed = ((Date.now() - tTable0) / 1000).toFixed(1);
    console.log(`  ✓ ${(src.isPdr ? 'provaderesidencia_questoes' : src.table).padEnd(42)} -> ${rows.length.toLocaleString().padStart(8)} processadas em ${tableElapsed}s`);
  }

  console.log('\n⚙️ Criando índices analíticos na tabela de staging...');
  db.exec(`CREATE INDEX IF NOT EXISTS "idx_aqn_fingerprint" ON "audit_question_normalized"("composite_fingerprint")`);
  db.exec(`CREATE INDEX IF NOT EXISTS "idx_aqn_stmthash" ON "audit_question_normalized"("norm_statement_hash")`);
  db.exec(`CREATE INDEX IF NOT EXISTS "idx_aqn_source" ON "audit_question_normalized"("source_table")`);
  db.exec(`CREATE INDEX IF NOT EXISTS "idx_aqn_prefix" ON "audit_question_normalized"("short_statement_prefix")`);

  console.log('\n📊 Analisando colisões, agrupamentos e categorias de duplicatas...');

  // 1. Agrupamento por Composite Fingerprint (Enunciado + Alternativas Idênticas)
  const fingerprintGroups = db.prepare(`
    SELECT composite_fingerprint, COUNT(*) as cnt,
           COUNT(DISTINCT source_table) as distinct_tables,
           COUNT(DISTINCT correct_answer) as distinct_answers,
           COUNT(DISTINCT correct_answer_text_hash) as distinct_answer_texts,
           MAX(has_commentary) as any_has_comm,
           MIN(has_commentary) as all_have_comm,
           MAX(commentary_len) as max_comm_len,
           MAX(has_images) as any_has_img,
           GROUP_CONCAT(DISTINCT source_table) as tables_involved
    FROM "audit_question_normalized"
    GROUP BY composite_fingerprint
    HAVING cnt > 1
  `).all();

  console.log(`  Identificados ${fingerprintGroups.length.toLocaleString()} grupos de questões com enunciado e alternativas idênticas.`);

  let totalQuestionsInDuplicateGroups = 0;
  let indiscutivelmenteIguaisGroups = 0;
  let indiscutivelmenteIguaisQuestions = 0;
  let emDuvidaFingerprintGroups = 0;
  let emDuvidaFingerprintQuestions = 0;

  // Tabela cruzada de origens
  const crossTableStats = {};

  for (const g of fingerprintGroups) {
    totalQuestionsInDuplicateGroups += g.cnt;
    const isAnswerConsistent = (g.distinct_answer_texts <= 1) || (g.distinct_answers <= 1);
    
    if (isAnswerConsistent) {
      indiscutivelmenteIguaisGroups++;
      indiscutivelmenteIguaisQuestions += g.cnt;
    } else {
      emDuvidaFingerprintGroups++;
      emDuvidaFingerprintQuestions += g.cnt;
    }

    const tbls = g.tables_involved.split(',').sort().join(' <-> ');
    crossTableStats[tbls] = (crossTableStats[tbls] || 0) + g.cnt;
  }

  // 2. Agrupamento por Statement Hash apenas (Enunciado idêntico mas alternativas diferentes)
  const statementOnlyGroups = db.prepare(`
    SELECT norm_statement_hash, COUNT(*) as cnt,
           COUNT(DISTINCT composite_fingerprint) as distinct_fingerprints,
           COUNT(DISTINCT correct_answer) as distinct_answers,
           GROUP_CONCAT(DISTINCT source_table) as tables_involved
    FROM "audit_question_normalized"
    GROUP BY norm_statement_hash
    HAVING cnt > 1 AND COUNT(DISTINCT composite_fingerprint) > 1
  `).all();

  console.log(`  Identificados ${statementOnlyGroups.length.toLocaleString()} grupos de enunciados idênticos com alternativas variantes (Em Dúvida / Variações).`);

  let statementDivergentQuestions = 0;
  for (const g of statementOnlyGroups) {
    statementDivergentQuestions += g.cnt;
  }

  // 3. Métricas de Ganho de Qualidade ao Mesclar (Data Enrichment)
  // Quantas questões duplicadas que NÃO tinham comentário ganham comentário da questão irmã?
  const commentaryGains = db.prepare(`
    SELECT COUNT(*) as count_gain
    FROM "audit_question_normalized" a
    WHERE a.has_commentary = 0
      AND EXISTS (
        SELECT 1 FROM "audit_question_normalized" b
        WHERE b.composite_fingerprint = a.composite_fingerprint
          AND b.global_id != a.global_id
          AND b.has_commentary = 1
      )
  `).get().count_gain;

  // Quantas questões duplicadas que NÃO tinham imagem ganham imagens da questão irmã?
  const imageGains = db.prepare(`
    SELECT COUNT(*) as image_gain
    FROM "audit_question_normalized" a
    WHERE a.has_images = 0
      AND EXISTS (
        SELECT 1 FROM "audit_question_normalized" b
        WHERE b.composite_fingerprint = a.composite_fingerprint
          AND b.global_id != a.global_id
          AND b.has_images = 1
      )
  `).get().image_gain;

  // Quantas questões de provaderesidencia dão match com tabelas do Supabase?
  const pdrSupabaseMatches = db.prepare(`
    SELECT COUNT(DISTINCT a.original_id) as pdr_matches_count
    FROM "audit_question_normalized" a
    JOIN "audit_question_normalized" b ON a.composite_fingerprint = b.composite_fingerprint
    WHERE a.source_table = 'provaderesidencia_questoes'
      AND b.source_table != 'provaderesidencia_questoes'
  `).get().pdr_matches_count;

  // Quantas questões de provaderesidencia são totalmente INÉDITAS (não existem em nenhuma tabela do Supabase)?
  const pdrTotal = db.prepare(`SELECT COUNT(*) as total FROM "audit_question_normalized" WHERE source_table = 'provaderesidencia_questoes'`).get().total;
  const pdrIneditas = pdrTotal - pdrSupabaseMatches;

  // 4. Coleta de Amostras para o Relatório
  // Amostra de Indiscutivelmente Iguais
  const sampleIndiscutivel = db.prepare(`
    SELECT a.global_id, a.source_table, a.code, a.institution, a.banca, a.year, a.specialty, a.tema, a.foco, a.difficulty,
           a.correct_answer, a.has_commentary, a.commentary_len, a.has_images, a.raw_statement_len
    FROM "audit_question_normalized" a
    WHERE a.composite_fingerprint IN (
      SELECT composite_fingerprint FROM "audit_question_normalized"
      GROUP BY composite_fingerprint
      HAVING COUNT(*) = 2 AND COUNT(DISTINCT correct_answer) = 1 AND MAX(has_commentary) = 1 AND MIN(has_commentary) = 0
      LIMIT 1
    )
  `).all();

  // Amostra de Em Dúvida (mesmo enunciado, gabaritos diferentes)
  const sampleDuvidaGabarito = db.prepare(`
    SELECT a.global_id, a.source_table, a.code, a.institution, a.banca, a.year, a.specialty, a.tema, a.foco,
           a.correct_answer, a.has_commentary, a.commentary_len, a.has_images, a.raw_statement_len
    FROM "audit_question_normalized" a
    WHERE a.composite_fingerprint IN (
      SELECT composite_fingerprint FROM "audit_question_normalized"
      GROUP BY composite_fingerprint
      HAVING COUNT(*) >= 2 AND COUNT(DISTINCT correct_answer) > 1
      LIMIT 1
    )
  `).all();

  // Amostra de Enunciado Idêntico com Alternativas Diferentes
  const sampleEnunciadoVariante = db.prepare(`
    SELECT a.global_id, a.source_table, a.code, a.institution, a.banca, a.year, a.specialty,
           a.correct_answer, a.has_commentary, a.commentary_len, a.raw_statement_len, a.composite_fingerprint
    FROM "audit_question_normalized" a
    WHERE a.norm_statement_hash IN (
      SELECT norm_statement_hash FROM "audit_question_normalized"
      GROUP BY norm_statement_hash
      HAVING COUNT(DISTINCT composite_fingerprint) >= 2
      LIMIT 1
    )
  `).all();

  // Contagem por tabela
  const tableCounts = db.prepare(`
    SELECT source_table, COUNT(*) as count
    FROM "audit_question_normalized"
    GROUP BY source_table
    ORDER BY count DESC
  `).all();

  const totalQuestions = totalProcessed;
  const uniqueQuestionsIfMerged = totalQuestions - (indiscutivelmenteIguaisQuestions - indiscutivelmenteIguaisGroups);
  const totalDeduplicationSavings = indiscutivelmenteIguaisQuestions - indiscutivelmenteIguaisGroups;

  const deepReport = {
    generated_at: new Date().toISOString(),
    total_questions_analyzed: totalQuestions,
    unique_questions_after_merge: uniqueQuestionsIfMerged,
    net_redundancy_reduction: totalDeduplicationSavings,
    percentage_redundancy_reduction: ((totalDeduplicationSavings / totalQuestions) * 100).toFixed(2) + '%',
    table_distribution: tableCounts,
    classification_breakdown: {
      indiscutivelmente_iguais: {
        grupos_detectados: indiscutivelmenteIguaisGroups,
        questoes_envolvidas: indiscutivelmenteIguaisQuestions,
        questoes_excedentes_para_fusao: totalDeduplicationSavings,
        criterio: "Hash SHA-256 idêntico do enunciado normalizado + Hash das alternativas ordenadas + Gabarito e conteúdo compatíveis"
      },
      em_duvida_inconclusivo: {
        grupos_gabarito_divergente_mesmo_fingerprint: emDuvidaFingerprintGroups,
        questoes_gabarito_divergente: emDuvidaFingerprintQuestions,
        grupos_enunciado_igual_alternativas_diferentes: statementOnlyGroups.length,
        questoes_enunciado_igual_alternativas_diferentes: statementDivergentQuestions,
        total_questoes_para_quarentena_manual: emDuvidaFingerprintQuestions + statementDivergentQuestions,
        criterio: "Enunciado e alternativas idênticas com gabaritos conflitantes OU mesmo enunciado com conjunto de assertivas parcialmente alterado/adaptado"
      },
      distintas_unicas: {
        total_questoes_sem_colisao: totalQuestions - totalQuestionsInDuplicateGroups - statementDivergentQuestions,
        total_ineditas_pdr: pdrIneditas,
        criterio: "Sem sobreposição com nenhuma outra questão do acervo"
      }
    },
    cruzamento_provaderesidencia_vs_supabase: {
      total_pdr_questoes: pdrTotal,
      pdr_repetidas_no_supabase: pdrSupabaseMatches,
      pdr_pct_repetidas: ((pdrSupabaseMatches / pdrTotal) * 100).toFixed(2) + '%',
      pdr_ineditas_para_expansao: pdrIneditas,
      pdr_pct_ineditas: ((pdrIneditas / pdrTotal) * 100).toFixed(2) + '%',
      diagnostico: "Das 39.165 questões da Coleta Parte 2, as que já existem no Supabase enriquecerão o banco com dados oficiais de caderno/prova e imagens originais; as inéditas expandirão o acervo legítimo."
    },
    ganhos_de_qualidade_por_fusao: {
      questoes_sem_comentario_que_ganham_comentario_ouro: commentaryGains,
      questoes_sem_imagem_que_ganham_imagens_recuperadas: imageGains
    },
    matriz_cruzamento_origens: crossTableStats,
    amostras_para_auditoria: {
      indiscutivelmente_iguais: sampleIndiscutivel,
      em_duvida_gabarito_divergente: sampleDuvidaGabarito,
      em_duvida_enunciado_com_alternativas_variantes: sampleEnunciadoVariante
    },
    tempo_execucao_segundos: parseFloat(((Date.now() - t0) / 1000).toFixed(1))
  };

  fs.writeFileSync(OUT_REPORT_PATH, JSON.stringify(deepReport, null, 2), 'utf8');

  console.log('\n' + '='.repeat(80));
  console.log('🏁 AUDITORIA DE DEDUPLICAÇÃO CONCLUÍDA COM SUCESSO!');
  console.log(`⏱️ Tempo de Processamento: ${deepReport.tempo_execucao_segundos}s`);
  console.log(`📊 Questões Analisadas: ${deepReport.total_questions_analyzed.toLocaleString('pt-BR')}`);
  console.log(`🎯 Duplicatas Indiscutíveis: ${deepReport.classification_breakdown.indiscutivelmente_iguais.questoes_envolvidas.toLocaleString('pt-BR')} questões (${deepReport.net_redundancy_reduction.toLocaleString('pt-BR')} excedentes)`);
  console.log(`⚠️ Casos em Dúvida (Quarentena): ${deepReport.classification_breakdown.em_duvida_inconclusivo.total_questoes_para_quarentena_manual.toLocaleString('pt-BR')} questões`);
  console.log(`💎 Inéditas Coleta Parte 2: ${deepReport.cruzamento_provaderesidencia_vs_supabase.pdr_ineditas_para_expansao.toLocaleString('pt-BR')} questões`);
  console.log(`✨ Questões que Ganham Comentário Ouro na Fusão: ${deepReport.ganhos_de_qualidade_por_fusao.questoes_sem_comentario_que_ganham_comentario_ouro.toLocaleString('pt-BR')}`);
  console.log(`📄 Relatório JSON Salvo em: ${OUT_REPORT_PATH}`);
  console.log('='.repeat(80));

  db.close();
}

main().catch(err => {
  console.error('\n❌ ERRO NA EXECUÇÃO DA AUDITORIA:', err);
  process.exit(1);
});

