import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

// 1. Junk questions in questions_direto
const junkDireto = db.prepare(`
  SELECT supa.id, supa.modalidade 
  FROM supabase_live_questions supa
  LEFT JOIN ssot_id_mapping m ON supa.id = m.clean_id
  WHERE m.clean_id IS NULL AND supa.supabase_table = 'questions_direto'
`).all();
console.log('Junk in questions_direto:', junkDireto);

// 2. Orphan questions in questions_titulo
const junkTitulo = db.prepare(`
  SELECT supa.id, supa.modalidade 
  FROM supabase_live_questions supa
  LEFT JOIN ssot_id_mapping m ON supa.id = m.clean_id
  WHERE m.clean_id IS NULL AND supa.supabase_table = 'questions_titulo'
`).all();
console.log('Orphans in questions_titulo:', junkTitulo);

// 3. The 72 IDs in questions_rplus that belong in questions_direto
const moveRplusToDireto = db.prepare(`
  SELECT DISTINCT supa.id
  FROM questions_curated_staging q
  INNER JOIN ssot_id_mapping m ON q.id = m.ssot_id
  INNER JOIN supabase_live_questions supa ON m.clean_id = supa.id
  WHERE supa.supabase_table = 'questions_rplus' AND q.modalidade = 'Acesso Direto'
`).all();
console.log('Total to move from R+ to Direto:', moveRplusToDireto.length);

// 4. The 4 IDs in questions_direto that belong in questions_rplus
const moveDiretoToRplus = db.prepare(`
  SELECT DISTINCT supa.id
  FROM questions_curated_staging q
  INNER JOIN ssot_id_mapping m ON q.id = m.ssot_id
  INNER JOIN supabase_live_questions supa ON m.clean_id = supa.id
  WHERE supa.supabase_table = 'questions_direto' AND q.modalidade = 'R+'
`).all();
console.log('Total to move from Direto to R+:', moveDiretoToRplus.length);

