import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const rows = db.prepare(`SELECT id, options FROM questions_curated_staging WHERE options LIKE '%http%'`).all();

console.log('Remaining questions with remote options:', rows.length);

const DIR_RAW = path.resolve('data/imagens_banco_geral');

for (const r of rows) {
  let opts = JSON.parse(r.options);
  let changed = false;

  for (let i = 0; i < opts.length; i++) {
    const o = opts[i];
    if (o.text && o.text.startsWith('http')) {
      const u = o.text;
      const base = path.basename(u.split('?')[0]);
      
      // Look for downloaded file in DIR_RAW
      let found = null;
      for (const f of fs.readdirSync(DIR_RAW)) {
        if (f.endsWith(base)) {
          found = f;
          break;
        }
      }
      
      if (found) {
        opts[i].text = `/storage/questoes/imagens_banco_geral/${found}`;
        changed = true;
      }
    }
  }

  if (changed) {
    db.prepare('UPDATE questions_curated_staging SET options = ? WHERE id = ?').run(JSON.stringify(opts), r.id);
  }
}

const check = db.prepare(`SELECT count(id) as c FROM questions_curated_staging WHERE options LIKE '%http%'`).get().c;
console.log('Remaining remote options after fix:', check);
