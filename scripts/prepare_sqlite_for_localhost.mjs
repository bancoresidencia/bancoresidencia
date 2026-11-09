import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const dbPath = path.resolve('data/questoes_132k.db');
console.log('Connecting to:', dbPath);
const db = new DatabaseSync(dbPath);

// 1. Check existing columns
const cols = db.prepare('PRAGMA table_info(questions)').all().map(c => c.name);

if (!cols.includes('antigo_tema')) {
  console.log('Adding column antigo_tema...');
  db.exec('ALTER TABLE questions ADD COLUMN antigo_tema TEXT;');
}
if (!cols.includes('antigo_foco')) {
  console.log('Adding column antigo_foco...');
  db.exec('ALTER TABLE questions ADD COLUMN antigo_foco TEXT;');
}
if (!cols.includes('antigo_subfoco')) {
  console.log('Adding column antigo_subfoco...');
  db.exec('ALTER TABLE questions ADD COLUMN antigo_subfoco TEXT;');
}

// 2. Populate antigo_* if empty
console.log('Preserving original antigo_tema / antigo_foco / antigo_subfoco...');
db.exec(`
  UPDATE questions 
  SET antigo_tema = tema, antigo_foco = foco, antigo_subfoco = subfoco 
  WHERE antigo_tema IS NULL;
`);

// 3. Promote novo_* to tema, foco, subfoco
console.log('Promoting novo_tema, novo_foco, novo_subfoco to canonical tema, foco, subfoco...');
db.exec(`
  UPDATE questions 
  SET tema = novo_tema, foco = novo_foco, subfoco = novo_subfoco 
  WHERE novo_tema IS NOT NULL;
`);

// 4. Ensure high-performance indexes exist
console.log('Creating fast query indexes...');
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_questions_tema ON questions(tema);
  CREATE INDEX IF NOT EXISTS idx_questions_foco ON questions(foco);
  CREATE INDEX IF NOT EXISTS idx_questions_subfoco ON questions(subfoco);
  CREATE INDEX IF NOT EXISTS idx_questions_especialidade ON questions(especialidade);
  CREATE INDEX IF NOT EXISTS idx_questions_banca ON questions(banca);
  CREATE INDEX IF NOT EXISTS idx_questions_year ON questions(year);
  CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
  CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
  CREATE INDEX IF NOT EXISTS idx_questions_is_anulada ON questions(is_anulada);
`);

const stats = db.prepare(`
  SELECT 
    count(*) as total,
    count(tema) as com_tema,
    count(DISTINCT tema) as dist_temas,
    count(DISTINCT foco) as dist_focos,
    count(DISTINCT subfoco) as dist_subfocos
  FROM questions
`).get();

console.log('SQLite Ready for Localhost:');
console.log(stats);
db.close();

