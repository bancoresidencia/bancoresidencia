import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
  const t = line.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Credentials missing in .env.local');
  process.exit(1);
}

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

// Create staging table for Supabase live records
db.exec(`
  DROP TABLE IF EXISTS supabase_live_questions;
  CREATE TABLE supabase_live_questions (
    id TEXT PRIMARY KEY,
    supabase_table TEXT,
    modalidade TEXT,
    type TEXT,
    has_commentary INTEGER,
    comm_len INTEGER,
    is_placeholder INTEGER,
    is_llm INTEGER,
    has_take_home INTEGER,
    has_motivo INTEGER,
    has_justificativa INTEGER
  );
  CREATE INDEX IF NOT EXISTS idx_slq_id ON supabase_live_questions(id);
  CREATE INDEX IF NOT EXISTS idx_slq_table ON supabase_live_questions(supabase_table);
`);

const insertStmt = db.prepare(`
  INSERT OR REPLACE INTO supabase_live_questions (
    id, supabase_table, modalidade, type, has_commentary, comm_len,
    is_placeholder, is_llm, has_take_home, has_motivo, has_justificativa
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const TABLES = [
  { name: 'questions_titulo', expected: 692 },
  { name: 'questions_revalida', expected: 4358 },
  { name: 'questions_rplus', expected: 43979 },
  { name: 'questions_direto', expected: 177765 }
];

async function fetchTable(tableName) {
  console.log(`\n📥 Coletando metadados de '${tableName}' do Supabase...`);
  const pageSize = 1000;
  let lastId = null;
  let totalFetched = 0;
  const t0 = Date.now();

  while (true) {
    let url = `${SUPABASE_URL}/rest/v1/${tableName}?select=id,modalidade,type,commentary&limit=${pageSize}&order=id.asc`;
    if (lastId) {
      url += `&id=gt.${encodeURIComponent(lastId)}`;
    }

    let res = null;
    let attempt = 0;
    while (attempt < 5) {
      try {
        attempt++;
        res = await fetch(url, {
          headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`
          }
        });
        if (res.ok) break;
        await new Promise(r => setTimeout(r, 500 * attempt));
      } catch (err) {
        if (attempt >= 5) throw err;
        await new Promise(r => setTimeout(r, 500 * attempt));
      }
    }

    const rows = await res.json();
    if (!rows || rows.length === 0) break;

    db.exec('BEGIN TRANSACTION');
    for (const r of rows) {
      const comm = r.commentary || '';
      const hasComm = comm.trim().length > 0 ? 1 : 0;
      const commLen = comm.length;
      const isPlaceholder = comm.includes('Gabarito Oficial Homologado') ? 1 : 0;
      const hasTakeHome = comm.includes('Take-Home') ? 1 : 0;
      const hasMotivo = (comm.includes('Motivo') || comm.includes('Armadilha')) ? 1 : 0;
      const hasJust = (comm.includes('Justificativa') || comm.includes('Alternativa')) ? 1 : 0;
      const isLlm = (hasTakeHome || hasMotivo) ? 1 : 0;

      insertStmt.run(
        String(r.id),
        tableName,
        r.modalidade || null,
        r.type || null,
        hasComm,
        commLen,
        isPlaceholder,
        isLlm,
        hasTakeHome,
        hasMotivo,
        hasJust
      );
      lastId = String(r.id);
    }
    db.exec('COMMIT');

    totalFetched += rows.length;
    if (totalFetched % 20000 === 0 || rows.length < pageSize) {
      const sec = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(`  ⏳ ${tableName}: ${totalFetched.toLocaleString('pt-BR')} registros coletados em ${sec}s...`);
    }
  }

  const finalSec = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`  ✅ ${tableName} concluído: ${totalFetched.toLocaleString('pt-BR')} registros em ${finalSec}s.`);
}

async function run() {
  console.log('='.repeat(75));
  console.log('🚀 INICIANDO AUDITORIA CRUZADA: SUPABASE LIVE VS SSOT (questions_curated_staging)');
  console.log('='.repeat(75));

  for (const t of TABLES) {
    await fetchTable(t.name);
  }

  console.log('\n📊 Executando cruzamentos relacionais em SQLite...');

  // 1. Totalizadores gerais
  const totalSSOT = db.prepare('SELECT count(*) as c FROM questions_curated_staging').get().c;
  const totalSupa = db.prepare('SELECT count(*) as c FROM supabase_live_questions').get().c;

  // 2. IDs correspondentes (Match exato por ID)
  const matching = db.prepare(`
    SELECT count(*) as c 
    FROM questions_curated_staging ssot
    INNER JOIN supabase_live_questions supa ON ssot.id = supa.id
  `).get().c;

  // 3. Inéditas na SSOT (IDs em questions_curated_staging mas NÃO no Supabase)
  const ineditsTotal = db.prepare(`
    SELECT count(*) as c 
    FROM questions_curated_staging ssot
    LEFT JOIN supabase_live_questions supa ON ssot.id = supa.id
    WHERE supa.id IS NULL
  `).get().c;

  // 4. Inéditas por modalidade / tabela de destino
  const ineditsByModalidade = db.prepare(`
    SELECT ssot.modalidade, count(*) as c 
    FROM questions_curated_staging ssot
    LEFT JOIN supabase_live_questions supa ON ssot.id = supa.id
    WHERE supa.id IS NULL
    GROUP BY ssot.modalidade
    ORDER BY c DESC
  `).all();

  // 5. Presentes no Supabase mas NÃO na SSOT
  const supaOnlyTotal = db.prepare(`
    SELECT count(*) as c 
    FROM supabase_live_questions supa
    LEFT JOIN questions_curated_staging ssot ON supa.id = ssot.id
    WHERE ssot.id IS NULL
  `).get().c;

  const supaOnlyByTable = db.prepare(`
    SELECT supa.supabase_table, count(*) as c 
    FROM supabase_live_questions supa
    LEFT JOIN questions_curated_staging ssot ON supa.id = ssot.id
    WHERE ssot.id IS NULL
    GROUP BY supa.supabase_table
  `).all();

  // 6. Divergência de Tabela/Modalidade (Questão está no Supabase em uma tabela, mas SSOT tem modalidade que pertence a outra tabela)
  // Mapeamento correto:
  // Acesso Direto -> questions_direto
  // R+ -> questions_rplus
  // Revalida -> questions_revalida
  // Título de Especialista -> questions_titulo
  const modalidadeDivergences = db.prepare(`
    SELECT 
      supa.supabase_table as current_supa_table,
      ssot.modalidade as ssot_modalidade,
      CASE 
        WHEN ssot.modalidade = 'Acesso Direto' THEN 'questions_direto'
        WHEN ssot.modalidade = 'R+' THEN 'questions_rplus'
        WHEN ssot.modalidade = 'Revalida' THEN 'questions_revalida'
        WHEN ssot.modalidade = 'Título de Especialista' THEN 'questions_titulo'
        ELSE 'unknown'
      END as target_supa_table,
      count(*) as c
    FROM questions_curated_staging ssot
    INNER JOIN supabase_live_questions supa ON ssot.id = supa.id
    WHERE 
      (supa.supabase_table = 'questions_direto' AND ssot.modalidade != 'Acesso Direto')
      OR (supa.supabase_table = 'questions_rplus' AND ssot.modalidade != 'R+')
      OR (supa.supabase_table = 'questions_revalida' AND ssot.modalidade != 'Revalida')
      OR (supa.supabase_table = 'questions_titulo' AND ssot.modalidade != 'Título de Especialista')
    GROUP BY current_supa_table, ssot_modalidade, target_supa_table
    ORDER BY c DESC
  `).all();

  // 7. Divergência de tipo de questão (Ex: múltipla escolha vs dissertativa)
  const typeDivergences = db.prepare(`
    SELECT 
      supa.type as supa_type,
      ssot.type as ssot_type,
      count(*) as c
    FROM questions_curated_staging ssot
    INNER JOIN supabase_live_questions supa ON ssot.id = supa.id
    WHERE supa.type != ssot.type OR (supa.type IS NULL AND ssot.type IS NOT NULL)
    GROUP BY supa_type, ssot_type
    ORDER BY c DESC
  `).all();

  // 8. Análise profunda dos comentários no Supabase por tabela
  const supaCommentsByTable = db.prepare(`
    SELECT 
      supabase_table,
      count(*) as total_questions,
      sum(has_commentary) as with_commentary,
      sum(is_placeholder) as with_placeholder,
      sum(with_commentary - is_placeholder) as with_real_commentary,
      sum(is_llm) as with_llm,
      sum(has_take_home) as with_take_home,
      sum(has_motivo) as with_motivo,
      sum(has_justificativa) as with_justificativa,
      round(avg(CASE WHEN comm_len > 0 THEN comm_len ELSE NULL END), 0) as avg_comm_len
    FROM supabase_live_questions
    GROUP BY supabase_table
  `).all();

  // 9. Comparação de Comentários entre Supabase e SSOT para as questões coincidentes
  const commentaryMergeComparison = db.prepare(`
    SELECT 
      CASE 
        WHEN (supa.has_commentary = 1 AND supa.is_placeholder = 0) AND (ssot.commentary IS NOT NULL AND length(trim(ssot.commentary)) > 0) THEN 'Ambos possuem comentário real'
        WHEN (supa.has_commentary = 1 AND supa.is_placeholder = 0) AND (ssot.commentary IS NULL OR length(trim(ssot.commentary)) = 0) THEN 'Apenas Supabase possui comentário real'
        WHEN (supa.has_commentary = 0 OR supa.is_placeholder = 1) AND (ssot.commentary IS NOT NULL AND length(trim(ssot.commentary)) > 0) THEN 'Apenas SSOT possui comentário real'
        ELSE 'Nenhum possui comentário real'
      END as status,
      count(*) as c
    FROM questions_curated_staging ssot
    INNER JOIN supabase_live_questions supa ON ssot.id = supa.id
    GROUP BY status
    ORDER BY c DESC
  `).all();

  const report = {
    generated_at: new Date().toISOString(),
    totals: {
      ssot_total: totalSSOT,
      supabase_total: totalSupa,
      matching_by_id: matching,
      inedits_in_ssot: ineditsTotal,
      supabase_only: supaOnlyTotal
    },
    inedits_by_modalidade: ineditsByModalidade,
    supabase_only_by_table: supaOnlyByTable,
    modalidade_divergences: modalidadeDivergences,
    type_divergences: typeDivergences,
    supabase_comments_by_table: supaCommentsByTable,
    commentary_merge_comparison: commentaryMergeComparison
  };

  fs.writeFileSync('data/supabase_tables/audit_cross_reference_report.json', JSON.stringify(report, null, 2));
  console.log('\n✅ Relatório completo gerado com sucesso em data/supabase_tables/audit_cross_reference_report.json');
  console.log(JSON.stringify(report, null, 2));
}

run().catch(console.error);

