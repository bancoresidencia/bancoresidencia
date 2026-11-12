import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const db = new DatabaseSync(DB_PATH);

const rows = db.prepare(`
  SELECT id, statement, images
  FROM questions_curated_staging
  WHERE images IS NOT NULL AND images != '[]' AND images != ''
  LIMIT 15
`).all();

const EXPLICIT_IMAGE_SENTENCE_REGEX = /(?:(?:o|a|os|as|seu|sua)\s+)?(?:eletrocardiograma|ecg|radiografia|raio[\s-]x|rx|tomografia|tc|resson[âa]ncia|rm|ultrassom|usg|imagem|figura|foto|esquema|gr[áa]fico|partograma|tra[çc]ado|les[ãa]o|exame)(?:\s+[\wçãõáéíóúâêô]+){0,4}\s+(?:est[áa]\s+)?(?:demonstrad[ao]|ilustrad[ao]|apresentad[ao]|mostrad[ao]|reproduzid[ao]|anex[ao]|abaixo|a\s+seguir)[^.!?\n]*[.!?:]?/i;
const IMPERATIVE_IMAGE_SENTENCE_REGEX = /(?:observe|veja|analise|considere|conforme|de\s+acordo\s+com|basead[ao]\s+n[ao]|tendo\s+em\s+vista)\s+(?:a\s+|o\s+)?(?:imagem|figura|foto|radiografia|tomografia|ilustra[çc][ãa]o|tra[çc]ado|eletrocardiograma|ecg|exame)(?:\s+[\wçãõáéíóúâêô]+){0,4}[^.!?\n]*[.!?:]?/i;
const ANEXAS_REGEX = /(?:imagens?|figuras?|fotos?|exames?)\s+anex[ao]s?:?/i;
const QUESTION_PROMPT_REGEX = /(?:(?:\r?\n)+|[.!?]\s+)(?=(?:com\s+base|diante\s+d|considerando|a\s+conduta|o\s+diagn[óo]stico|diagn[óo]stico\s+mais|hip[óo]tese\s+diagn[óo]stica|assinale|qual\s+(?:[eé]|a|o)|em\s+rela[çc][ãa]o|sobre\s+o\s+caso|quanto\s+[aà]|o\s+tratamento|o\s+achado|podemos\s+afirmar|marqu?e|o\s+quadro\s+sugere)\b)/i;
const LEGACY_TAG_PATTERNS = [/\[IMG:\s*[^\]]+\]/gi, /<img\s+[^>]*>/gi, /!\[[^\]]*\]\([^)]+\)/gi];

console.log('--- AMOSTRAS QUE CAEM EM FALLBACK ---');
let c = 0;
for (const r of rows) {
  let text = r.statement;
  let hasLegacy = LEGACY_TAG_PATTERNS.some(p => p.test(text));
  if (!hasLegacy && !text.match(ANEXAS_REGEX) && !text.match(EXPLICIT_IMAGE_SENTENCE_REGEX) && !text.match(IMPERATIVE_IMAGE_SENTENCE_REGEX) && !text.match(QUESTION_PROMPT_REGEX)) {
    c++;
    console.log(`\n[${c}] ID: ${r.id}`);
    console.log(`Stmt: ${text}`);
    if (c >= 5) break;
  }
}

