import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const stagingDb = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const q = stagingDb.prepare('SELECT id, institution, year, statement FROM questions_curated_staging WHERE id = ?')
  .get('questions_9949f1b9-3196-4a09-ae33-d4c54e943144');
console.log(q);

const dec = JSON.parse(fs.readFileSync('data/supabase_tables/image_watermark_decisions.json', 'utf8'));
console.log('Decision for 9949f1b9:', dec.medq_actions ? dec.medq_actions[q.id] : null);

// Search files with 9949f1b9
const files = fs.readdirSync('data/imagens_banco_geral');
const words = q.statement.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length > 5).slice(0, 5);
console.log('Words:', words);
const matches = files.filter(f => words.every(w => f.includes(w)));
console.log('Banco geral matches:', matches);
