import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const rows = db.prepare('SELECT id, images FROM questions_curated_staging WHERE has_images = 1').all();

const urlTypes = {};
for (const r of rows) {
  let parsed = [];
  try {
    parsed = JSON.parse(r.images);
    if (!Array.isArray(parsed)) parsed = [parsed];
  } catch {
    parsed = [r.images];
  }

  for (const u of parsed) {
    if (!u) continue;
    let type = 'other';
    if (u.includes('resgatadas/')) type = 'resgatadas';
    else if (u.includes('imagens_higienizadas_medq/')) type = 'higienizadas_medq';
    else if (u.includes('converted_')) type = 'converted_webp';
    else if (u.includes('provaderesidencia')) type = 'provaderesidencia';
    else if (u.includes('banco_geral')) type = 'banco_geral';
    else if (u.includes('ginecologia')) type = 'ginecologia';
    else if (u.includes('urologia')) type = 'urologia';
    else if (u.includes('medevo')) type = 'medevo';
    else if (u.includes('supabase.co')) type = 'supabase_other';
    urlTypes[type] = (urlTypes[type] || 0) + 1;
  }
}

console.log('Distribution of image URL types across all questions:');
console.log(urlTypes);
