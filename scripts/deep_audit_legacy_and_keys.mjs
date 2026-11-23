import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
}

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

console.log('=== AUDITORIA PROFUNDA DE COMENTÁRIOS E GABARITOS NO ACESSO DIRETO ===\n');

// 1. Análise na Base Local SQLite (SSOT)
const localStats = db.prepare(`
  SELECT 
    count(*) as total,
    
    -- Gabarito
    sum(CASE WHEN (correct_answer IN ('A','B','C','D','E') OR is_anulada = 1) THEN 1 ELSE 0 END) as com_gabarito_valido,
    sum(CASE WHEN (correct_answer NOT IN ('A','B','C','D','E') AND (is_anulada = 0 OR is_anulada IS NULL)) THEN 1 ELSE 0 END) as sem_gabarito_valido,
    
    -- Comentários
    sum(CASE WHEN commentary LIKE '%Take-Home%' THEN 1 ELSE 0 END) as padrao_ouro_real,
    sum(CASE WHEN commentary NOT LIKE '%Take-Home%' AND commentary IS NOT NULL AND TRIM(commentary) != '' THEN 1 ELSE 0 END) as comentarios_legados,
    sum(CASE WHEN commentary LIKE '[Gabarito Oficial Homologado]%' THEN 1 ELSE 0 END) as placeholder_gabarito_oficial,
    sum(CASE WHEN commentary IS NULL OR TRIM(commentary) = '' THEN 1 ELSE 0 END) as sem_comentario_nenhum,
    
    -- Imagens
    sum(CASE WHEN has_images = 1 THEN 1 ELSE 0 END) as com_imagem,
    sum(CASE WHEN has_images = 0 OR has_images IS NULL THEN 1 ELSE 0 END) as texto_puro

  FROM questions_curated_staging
  WHERE modalidade = 'Acesso Direto'
`).get();

console.log('1. PANORAMA GLOBAL ACESSO DIRETO (LOCAL SQLITE):');
console.log(JSON.stringify(localStats, null, 2));

// 2. Detalhe do que são esses "Comentários Legados"
console.log('\n2. AMOSTRAS DE COMENTÁRIOS LEGADOS (sem Take-Home):');
const legacySamples = db.prepare(`
  SELECT code, especialidade, tema, correct_answer, commentary
  FROM questions_curated_staging
  WHERE modalidade = 'Acesso Direto'
    AND commentary IS NOT NULL 
    AND TRIM(commentary) != ''
    AND commentary NOT LIKE '%Take-Home%'
  LIMIT 5
`).all();

legacySamples.forEach((s, idx) => {
  console.log(`\n--- Amostra Legada ${idx + 1} ---`);
  console.log(`Código: ${s.code} | Gabarito: ${s.correct_answer} | Esp: ${s.especialidade} | Tema: ${s.tema}`);
  console.log(`Comentário: ${s.commentary.slice(0, 250)}...`);
});

// 3. Detalhe das "Sem Gabarito Homologado"
console.log('\n3. AMOSTRAS DE QUESTÕES SEM GABARITO HOMOLOGADO:');
const noKeySamples = db.prepare(`
  SELECT code, institution, banca, year, correct_answer, is_anulada, statement
  FROM questions_curated_staging
  WHERE modalidade = 'Acesso Direto'
    AND (correct_answer NOT IN ('A','B','C','D','E') AND (is_anulada = 0 OR is_anulada IS NULL))
  LIMIT 5
`).all();

noKeySamples.forEach((s, idx) => {
  console.log(`\n--- Amostra Sem Gabarito ${idx + 1} ---`);
  console.log(`Código: ${s.code} | Banca: ${s.banca || s.institution} | Ano: ${s.year}`);
  console.log(`correct_answer no banco: '${s.correct_answer}' | is_anulada: ${s.is_anulada}`);
  console.log(`Enunciado: ${s.statement ? s.statement.slice(0, 150) : ''}...`);
});

// 4. Cruzamento: Gabarito x Tipo de Comentário x Especialidade
console.log('\n4. MATRIZ CRUZADA POR ESPECIALIDADE:');
const matrix = db.prepare(`
  SELECT 
    COALESCE(especialidade, 'Não Definida') as especialidade,
    count(*) as total,
    -- Padrão Ouro Real (com Take-Home)
    sum(CASE WHEN commentary LIKE '%Take-Home%' THEN 1 ELSE 0 END) as padrao_ouro,
    -- Comentário Legado / Placeholder (TEM comentário, mas NÃO é Padrão Ouro)
    sum(CASE WHEN commentary NOT LIKE '%Take-Home%' AND commentary IS NOT NULL AND TRIM(commentary) != '' THEN 1 ELSE 0 END) as comentario_legado,
    -- Sem comentário nenhum
    sum(CASE WHEN commentary IS NULL OR TRIM(commentary) = '' THEN 1 ELSE 0 END) as sem_nenhum_comentario,
    -- Gabarito
    sum(CASE WHEN (correct_answer IN ('A','B','C','D','E') OR is_anulada = 1) THEN 1 ELSE 0 END) as com_gabarito_homologado,
    sum(CASE WHEN (correct_answer NOT IN ('A','B','C','D','E') AND (is_anulada = 0 OR is_anulada IS NULL)) THEN 1 ELSE 0 END) as sem_gabarito_homologado,
    -- Elegíveis Reais para Produção (Com Gabarito Homologado + Sem Padrão Ouro + Texto Puro)
    sum(CASE 
      WHEN (correct_answer IN ('A','B','C','D','E') OR is_anulada = 1) 
       AND (commentary NOT LIKE '%Take-Home%' OR commentary IS NULL)
       AND (has_images = 0 OR has_images IS NULL)
      THEN 1 ELSE 0 
    END) as elegiveis_texto_puro_precisam_padrao_ouro
  FROM questions_curated_staging
  WHERE modalidade = 'Acesso Direto'
  GROUP BY especialidade
  ORDER BY total DESC
`).all();

console.table(matrix);
