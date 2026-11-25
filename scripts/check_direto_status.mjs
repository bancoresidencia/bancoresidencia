import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const specs = ['Pediatria', 'Cirurgia Geral', 'Ginecologia', 'Obstetrícia', 'Clínica Médica', 'Medicina Preventiva e Social'];

console.log('=== ACESSO DIRETO / R+ POR ESPECIALIDADE ===');
const rows = [];
for (const s of specs) {
  const row = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN commentary IS NOT NULL AND length(trim(commentary)) > 50 THEN 1 ELSE 0 END) as concluidas,
      SUM(CASE WHEN (commentary IS NULL OR length(trim(commentary)) <= 50) AND ((UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E')) OR is_anulada = 1) THEN 1 ELSE 0 END) as faltam_com_gabarito,
      SUM(CASE WHEN (commentary IS NULL OR length(trim(commentary)) <= 50) AND ((UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E')) OR is_anulada = 1) AND (has_images = 0 OR has_images IS NULL) AND (images IS NULL OR images = '[]' OR images = '') THEN 1 ELSE 0 END) as faltam_texto_puro
    FROM questions_curated_staging
    WHERE (modalidade IS NULL OR modalidade != 'Revalida')
      AND especialidade = ?
  `).get(s);
  
  const perc = ((row.concluidas / row.total) * 100).toFixed(1);
  rows.push({
    especialidade: s,
    total: row.total,
    concluidas: row.concluidas,
    faltam_com_gabarito: row.faltam_com_gabarito,
    faltam_texto_puro: row.faltam_texto_puro,
    perc_concluido: `${perc}%`
  });
}
console.table(rows);
