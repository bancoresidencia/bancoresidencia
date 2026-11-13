import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

const query = `
  SELECT count(*) as match_count 
  FROM questions_curated_staging ssot 
  JOIN supabase_live_questions supa ON (
    CASE 
      WHEN ssot.id LIKE 'questions_expansion_titulo_especialista_%' THEN substr(ssot.id, 41) 
      WHEN ssot.id LIKE 'questions_expansion_direto_%' THEN substr(ssot.id, 28) 
      WHEN ssot.id LIKE 'questions_expansion_revalida_%' THEN substr(ssot.id, 30) 
      WHEN ssot.id LIKE 'questions_expansion_r_plus_%' THEN substr(ssot.id, 28) 
      WHEN ssot.id LIKE 'questions_%' THEN substr(ssot.id, 11) 
      ELSE ssot.id 
    END
  ) = supa.id
`;

const res = db.prepare(query).get();
console.log('Match Count:', res);

