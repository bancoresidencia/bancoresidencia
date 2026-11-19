import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const outPath = 'data/clinica_direto_questions.json';

console.log('🔄 Exportando Clínica Médica (Acesso Direto) de questions_curated_staging...');

const query = `
  SELECT *
  FROM questions_curated_staging
  WHERE modalidade = 'Acesso Direto'
    AND especialidade = 'Clínica Médica'
    AND (correct_answer IN ('A','B','C','D','E') OR is_anulada = 1)
`;

const rows = db.prepare(query).all();
console.log(`📊 Extraídas ${rows.length} questões de Clínica Médica para ${outPath}`);

// Trata options e images se forem string JSON
const mapped = rows.map(r => {
  let opts = r.options;
  if (typeof opts === 'string') {
    try { opts = JSON.parse(opts); } catch { opts = []; }
  }
  let imgs = r.images;
  if (typeof imgs === 'string') {
    try { imgs = JSON.parse(imgs); } catch { imgs = []; }
  }
  const cleanId = (r.id || '').replace(/^questions_expansion_direto_/, '').replace(/^questions_/, '');
  return {
    ...r,
    id: cleanId,
    raw_staging_id: r.id,
    options: opts,
    images: imgs
  };
});

fs.writeFileSync(outPath, JSON.stringify(mapped, null, 2), 'utf8');

// Verificação de pendentes
const pending = mapped.filter(q => {
  const comm = q.commentary || '';
  const hasGold = comm.includes('Take-Home Message:') || comm.includes('Take-Home');
  const hasImg = (Array.isArray(q.images) && q.images.length > 0) || (q.statement || '').includes('![');
  return !hasGold && !hasImg;
});

console.log(`✅ Exportação concluída com sucesso!`);
console.log(` - Total no arquivo: ${mapped.length}`);
console.log(` - Com Padrão-Ouro já existente: ${mapped.length - pending.length}`);
console.log(` - Pendentes TEXTO PURO a processar: ${pending.length}`);
