import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

function exportSpecialty(spec, outPath) {
  const query = `
    SELECT *
    FROM questions_curated_staging
    WHERE modalidade = 'Acesso Direto'
      AND especialidade = ?
      AND (correct_answer IN ('A','B','C','D','E') OR is_anulada = 1)
  `;
  const rows = db.prepare(query).all(spec);
  console.log(`Extraídas ${rows.length} questões de ${spec} para ${outPath}`);

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
    // Normaliza id para o id original sem prefixo
    const cleanId = r.id.replace(/^questions_expansion_direto_/, '').replace(/^questions_/, '');
    return {
      ...r,
      id: cleanId,
      raw_staging_id: r.id,
      options: opts,
      images: imgs
    };
  });

  fs.writeFileSync(outPath, JSON.stringify(mapped, null, 2), 'utf8');

  // Conta quantas faltam Padrão-Ouro e quantas são de texto puro
  const pending = mapped.filter(q => {
    const comm = q.commentary || '';
    const hasGold = comm.includes('Take-Home Message:') || comm.includes('Take-Home');
    const isImg = (Array.isArray(q.images) && q.images.length > 0) || (q.statement || '').includes('![');
    return !hasGold && !isImg;
  });

  console.log(` - ${spec}: ${pending.length} questões de TEXTO PURO pendentes de Padrão-Ouro.`);
}

exportSpecialty('Ginecologia', 'data/ginecologia_direto_questions.json');
exportSpecialty('Obstetrícia', 'data/obstetricia_direto_questions.json');
