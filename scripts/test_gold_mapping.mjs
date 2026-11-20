import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables.db');
const mappingCount = db.prepare("SELECT count(*) as c FROM ssot_id_mapping").get().c;
console.log('Total mappings in ssot_id_mapping:', mappingCount);

const countGoldInStaging = db.prepare(`
  SELECT count(*) as c 
  FROM questions_curated_staging
  WHERE ((correct_answer IS NOT NULL AND trim(correct_answer) != '' AND trim(correct_answer) != 'null') OR is_anulada = 1)
    AND commentary_tier = 'padrao_ouro'
`).get().c;
console.log('Total gold in staging:', countGoldInStaging);

// How many gold staging questions map to clean_id in ssot_id_mapping?
const mappedGold = db.prepare(`
  SELECT count(DISTINCT m.clean_id) as c
  FROM questions_curated_staging s
  JOIN ssot_id_mapping m ON m.ssot_id = s.id
  WHERE ((s.correct_answer IS NOT NULL AND trim(s.correct_answer) != '' AND trim(s.correct_answer) != 'null') OR s.is_anulada = 1)
    AND s.commentary_tier = 'padrao_ouro'
`).get().c;
console.log('Distinct clean_ids mapped from gold questions:', mappedGold);
