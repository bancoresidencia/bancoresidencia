import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

const tablesInLive = db.prepare(`SELECT supabase_table, count(*) as c, sum(has_take_home) as gold, sum(has_commentary) as comm FROM supabase_live_questions GROUP BY supabase_table`).all();
console.log('Tabelas em supabase_live_questions:');
console.table(tablesInLive);

// E em questions_curated_staging:
const stagingSample = db.prepare(`SELECT modalidade, count(*) as total FROM questions_curated_staging GROUP BY modalidade`).all();
console.log('\nModalidades em questions_curated_staging:');
console.table(stagingSample);

