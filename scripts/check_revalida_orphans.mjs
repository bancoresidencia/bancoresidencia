import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

const orphans = db.prepare(`
  SELECT supa.id, supa.supabase_table, supa.modalidade, supa.type, supa.has_commentary, supa.has_take_home
  FROM supabase_live_questions supa
  LEFT JOIN ssot_id_mapping m ON supa.id = m.clean_id
  WHERE m.clean_id IS NULL AND supa.supabase_table = 'questions_revalida'
  LIMIT 10
`).all();

console.log('Sample orphans in questions_revalida:', JSON.stringify(orphans, null, 2));

// Check if these IDs exist anywhere in supabase_tables.db
const sampleId = orphans[0]?.id;
console.log('Checking sampleId:', sampleId);
const inQuestions = db.prepare('SELECT count(*) as c FROM questions WHERE id = ?').get(sampleId);
const inRevalidaBase = db.prepare("SELECT count(*) as c FROM sqlite_master WHERE type='table' AND name='questions_revalida_base'").get();
console.log('inQuestions:', inQuestions);

