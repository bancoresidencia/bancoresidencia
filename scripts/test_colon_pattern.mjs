import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const db = new DatabaseSync(DB_PATH);

const rows = db.prepare(`
  SELECT id, statement, images
  FROM questions_curated_staging
  WHERE images IS NOT NULL AND images != '[]' AND images != ''
`).all();

const EXAM_COLON_REGEX = /(?:(?:o|a|os|as|seu|sua)\s+)?(?:eletrocardiograma|ecg|radiografia|raio[\s-]x|rx|tomografia|tc|resson[âa]ncia|rm|ultrassom|usg|imagem|figura|foto|esquema|gr[áa]fico|partograma|tra[çc]ado|les[ãa]o|exame)(?:\s+[\wçãõáéíóúâêô,-]+){0,6}\s*:[ \t]*/i;

const INTRO_COLON_REGEX = /(?:reprodu[çc][ãa]o|evidenciou|mostra|apresenta|exibe|abaixo|a\s+seguir)\s*(?:de\s+[\wçãõáéíóúâêô]+){0,3}\s*:[ \t]*/i;

let matchColon = 0;
for (const r of rows) {
  if (EXAM_COLON_REGEX.test(r.statement) || INTRO_COLON_REGEX.test(r.statement)) {
    matchColon++;
  }
}

console.log(`Total de questões capturadas pelo padrão de exame com dois-pontos: ${matchColon} de ${rows.length}`);

