import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = path.resolve('data/supabase_tables/supabase_tables.db');
const db = new DatabaseSync(dbPath);

console.log('--- PRAGMA table_info(provaderesidencia_imagens_arquivo) ---');
const cols = db.prepare("PRAGMA table_info(provaderesidencia_imagens_arquivo)").all();
console.log(cols.map(c => `${c.name} (${c.type})`).join(', '));

const count = db.prepare("SELECT count(*) as c FROM provaderesidencia_imagens_arquivo").get().c;
console.log(`Total rows in provaderesidencia_imagens_arquivo: ${count}`);

const sample = db.prepare("SELECT * FROM provaderesidencia_imagens_arquivo LIMIT 3").all();
console.log(JSON.stringify(sample, null, 2));
