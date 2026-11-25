import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve('.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(l => {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
  });
}

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

console.log('=== 1. AUDITORIA GERAL DE COMENTARIOS NO SQLITE SSOT (questions_curated_staging) ===');
const summaryByModality = db.prepare(`
  SELECT 
    COALESCE(modalidade, 'NULL') as modalidade,
    COUNT(*) as total,
    SUM(CASE WHEN commentary LIKE '%Take-Home%' THEN 1 ELSE 0 END) as padrao_ouro,
    SUM(CASE WHEN commentary IS NOT NULL AND length(trim(commentary)) > 50 AND commentary NOT LIKE '%Take-Home%' THEN 1 ELSE 0 END) as legado_sem_ouro,
    SUM(CASE WHEN commentary IS NULL OR length(trim(commentary)) <= 50 THEN 1 ELSE 0 END) as sem_comentario,
    SUM(CASE WHEN (commentary IS NULL OR commentary NOT LIKE '%Take-Home%') AND ((UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E')) OR is_anulada = 1) THEN 1 ELSE 0 END) as pendente_ouro_com_gabarito,
    SUM(CASE WHEN (UPPER(TRIM(correct_answer)) NOT IN ('A','B','C','D','E') OR correct_answer IS NULL) AND (is_anulada IS NULL OR is_anulada = 0) THEN 1 ELSE 0 END) as sem_gabarito
  FROM questions_curated_staging
  GROUP BY COALESCE(modalidade, 'NULL')
`).all();
console.table(summaryByModality);

console.log('\n=== 2. ACESSO DIRETO: OURO vs LEGADO vs VAZIO POR ESPECIALIDADE ===');
const diretoBySpec = db.prepare(`
  SELECT 
    COALESCE(especialidade, 'NULL') as especialidade,
    COUNT(*) as total,
    SUM(CASE WHEN commentary LIKE '%Take-Home%' THEN 1 ELSE 0 END) as padrao_ouro,
    SUM(CASE WHEN commentary IS NOT NULL AND length(trim(commentary)) > 50 AND commentary NOT LIKE '%Take-Home%' THEN 1 ELSE 0 END) as legado,
    SUM(CASE WHEN commentary IS NULL OR length(trim(commentary)) <= 50 THEN 1 ELSE 0 END) as vazio,
    SUM(CASE WHEN (commentary IS NULL OR commentary NOT LIKE '%Take-Home%') AND ((UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E')) OR is_anulada = 1) AND (has_images = 0 OR has_images IS NULL) AND (images IS NULL OR images = '[]' OR images = '') THEN 1 ELSE 0 END) as fila_texto_puro_elegivel,
    SUM(CASE WHEN (commentary IS NULL OR commentary NOT LIKE '%Take-Home%') AND ((UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E')) OR is_anulada = 1) AND ((has_images = 1) OR (images IS NOT NULL AND images != '[]' AND images != '')) THEN 1 ELSE 0 END) as retido_com_imagem,
    SUM(CASE WHEN (UPPER(TRIM(correct_answer)) NOT IN ('A','B','C','D','E') OR correct_answer IS NULL) AND (is_anulada IS NULL OR is_anulada = 0) THEN 1 ELSE 0 END) as retido_sem_gabarito
  FROM questions_curated_staging
  WHERE modalidade = 'Acesso Direto'
  GROUP BY COALESCE(especialidade, 'NULL')
  ORDER BY total DESC
`).all();
console.table(diretoBySpec);

console.log('\n=== 3. ORIGEM (prefixo do ID) NO ACESSO DIRETO ===');
const diretoByOrigin = db.prepare(`
  SELECT 
    CASE 
      WHEN id LIKE 'questions_expansion_direto_%' THEN 'questions_expansion_direto'
      WHEN id LIKE 'questions_direto_%' THEN 'questions_direto'
      WHEN id LIKE 'questions_%' THEN 'questions'
      ELSE 'outro'
    END as origem_id,
    COUNT(*) as total,
    SUM(CASE WHEN commentary LIKE '%Take-Home%' THEN 1 ELSE 0 END) as padrao_ouro,
    SUM(CASE WHEN commentary IS NOT NULL AND length(trim(commentary)) > 50 AND commentary NOT LIKE '%Take-Home%' THEN 1 ELSE 0 END) as legado,
    SUM(CASE WHEN commentary IS NULL OR length(trim(commentary)) <= 50 THEN 1 ELSE 0 END) as vazio
  FROM questions_curated_staging
  WHERE modalidade = 'Acesso Direto'
  GROUP BY origem_id
`).all();
console.table(diretoByOrigin);

console.log('\n=== 4. AMOSTRA DE FILTROS: PERIOPERATORIO E METABOLISMO (CIRURGIA) ===');
const perioMetab = db.prepare(`
  SELECT 
    COALESCE(tema, 'NULL') as tema,
    COALESCE(foco, 'NULL') as foco,
    COALESCE(modalidade, 'NULL') as modalidade,
    COUNT(*) as total,
    SUM(CASE WHEN commentary LIKE '%Take-Home%' THEN 1 ELSE 0 END) as padrao_ouro,
    SUM(CASE WHEN commentary IS NOT NULL AND length(trim(commentary)) > 50 AND commentary NOT LIKE '%Take-Home%' THEN 1 ELSE 0 END) as legado,
    SUM(CASE WHEN commentary IS NULL OR length(trim(commentary)) <= 50 THEN 1 ELSE 0 END) as vazio,
    SUM(CASE WHEN (UPPER(TRIM(correct_answer)) NOT IN ('A','B','C','D','E') OR correct_answer IS NULL) AND (is_anulada IS NULL OR is_anulada = 0) THEN 1 ELSE 0 END) as sem_gabarito,
    SUM(CASE WHEN (has_images = 1) OR (images IS NOT NULL AND images != '[]' AND images != '') THEN 1 ELSE 0 END) as com_imagem
  FROM questions_curated_staging
  WHERE lower(tema) LIKE '%perioperat%' 
     OR lower(foco) LIKE '%perioperat%'
     OR lower(tema) LIKE '%metabol%'
     OR lower(foco) LIKE '%metabol%'
     OR lower(tema) LIKE '%resposta end%'
     OR lower(subfoco) LIKE '%perioperat%'
  GROUP BY COALESCE(tema, 'NULL'), COALESCE(foco, 'NULL'), COALESCE(modalidade, 'NULL')
  ORDER BY total DESC
  LIMIT 30
`).all();
console.table(perioMetab);

console.log('\n=== 5. STATUS EXATO EM SUPABASE (AMOSTRAGEM DE TABELAS E CONTAGENS) ===');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSupabase() {
  const tables = ['questions', 'questions_direto', 'questions_expansion_direto', 'questions_revalida', 'questions_expansion_revalida'];
  for (const t of tables) {
    const { count: total, error: e1 } = await supabase.from(t).select('*', { count: 'exact', head: true });
    const { count: ouro, error: e2 } = await supabase.from(t).select('*', { count: 'exact', head: true }).ilike('commentary', '%Take-Home%');
    const { count: vazio, error: e3 } = await supabase.from(t).select('*', { count: 'exact', head: true }).or('commentary.is.null,commentary.eq.""');
    console.log(`${t}: total=${total ?? e1?.message} | ouro=${ouro ?? e2?.message} | vazio=${vazio ?? e3?.message}`);
  }
}

checkSupabase().catch(console.error);
