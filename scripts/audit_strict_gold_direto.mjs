import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

const rows = db.prepare(`
SELECT 
  COALESCE(especialidade, 'Não Definida') as especialidade,
  count(*) as total,
  sum(CASE WHEN correct_answer IN ('A','B','C','D','E') OR is_anulada = 1 THEN 1 ELSE 0 END) as homologadas,
  sum(CASE WHEN (correct_answer IN ('A','B','C','D','E') OR is_anulada = 1) 
            AND commentary IS NOT NULL 
            AND (commentary LIKE '%Take-Home Message%' OR commentary LIKE '%Take-Home%') 
       THEN 1 ELSE 0 END) as gold,
  sum(CASE WHEN (correct_answer IN ('A','B','C','D','E') OR is_anulada = 1) 
            AND (commentary IS NULL OR commentary NOT LIKE '%Take-Home%') 
       THEN 1 ELSE 0 END) as faltam_gold_total,
  sum(CASE WHEN (correct_answer IN ('A','B','C','D','E') OR is_anulada = 1) 
            AND (commentary IS NULL OR commentary NOT LIKE '%Take-Home%') 
            AND (images IS NULL OR images = '[]' OR images = '')
       THEN 1 ELSE 0 END) as faltam_gold_texto_puro,
  sum(CASE WHEN (correct_answer IN ('A','B','C','D','E') OR is_anulada = 1) 
            AND (commentary IS NULL OR commentary NOT LIKE '%Take-Home%') 
            AND images IS NOT NULL AND images != '[]' AND images != ''
       THEN 1 ELSE 0 END) as faltam_gold_com_imagem
FROM questions_curated_staging 
WHERE modalidade = 'Acesso Direto'
GROUP BY especialidade
ORDER BY homologadas DESC
`).all();

const formatted = rows.map(r => ({
  especialidade: r.especialidade,
  homologadas: r.homologadas,
  padraoOuro: r.gold,
  pctOuro: ((r.gold / (r.homologadas || 1)) * 100).toFixed(1) + '%',
  faltamOuroTotal: r.faltam_gold_total,
  faltamTextoPuro: r.faltam_gold_texto_puro,
  faltamComImagem: r.faltam_gold_com_imagem
}));

console.log('='.repeat(90));
console.log('📊 CENSO ESTRITO PADRÃO-OURO: questions_direto (206.599 questões)');
console.log('='.repeat(90));
console.table(formatted);

const totals = rows.reduce((acc, r) => {
  acc.homologadas += r.homologadas;
  acc.gold += r.gold;
  acc.faltam_gold_total += r.faltam_gold_total;
  acc.faltam_gold_texto_puro += r.faltam_gold_texto_puro;
  acc.faltam_gold_com_imagem += r.faltam_gold_com_imagem;
  return acc;
}, { homologadas: 0, gold: 0, faltam_gold_total: 0, faltam_gold_texto_puro: 0, faltam_gold_com_imagem: 0 });

console.log('\n📌 TOTAIS GERAIS:');
console.log(` - Total Homologadas: ${totals.homologadas.toLocaleString('pt-BR')}`);
console.log(` - Comentário Padrão-Ouro Ativo: ${totals.gold.toLocaleString('pt-BR')} (${((totals.gold / totals.homologadas) * 100).toFixed(1)}%)`);
console.log(` - FALTAM PADRÃO-OURO TOTAL: ${totals.faltam_gold_total.toLocaleString('pt-BR')} (${((totals.faltam_gold_total / totals.homologadas) * 100).toFixed(1)}%)`);
console.log(`   └─ Texto Puro (Prontas para Gerar): ${totals.faltam_gold_texto_puro.toLocaleString('pt-BR')}`);
console.log(`   └─ Com Imagens (Multimodal): ${totals.faltam_gold_com_imagem.toLocaleString('pt-BR')}`);

