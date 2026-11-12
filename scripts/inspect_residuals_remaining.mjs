import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const catalog = JSON.parse(fs.readFileSync('data/supabase_tables/gate6_missing_catalog.json', 'utf8')).catalog || [];

console.log('='.repeat(80));
console.log('🔍 ANÁLISE DE FRASES RESIDUAIS NAS 607 FALTANTES RESTANTES');
console.log('='.repeat(80));

const RESIDUAL_PHRASES = [
  /\((?:ver|conforme|veja|observe|vide)\s+(?:a\s+)?(?:imagem|figura|foto|caderno\s+de\s+quest[õo]es)[^)]*\)/gi,
  /\[(?:ver|conforme|veja|observe|vide)\s+(?:a\s+)?(?:imagem|figura|foto|caderno\s+de\s+quest[õo]es)[^\]]*\]/gi,
  /\bconforme\s+(?:a\s+)?(?:imagem|figura|foto)\s+(?:do\s+caderno\s+de\s+quest[õo]es|abaixo|a\s+seguir)\b/gi,
  /\bque\s+pode\s+ser\s+vist[ao]\s+na\s+figura\s+(?:abaixo|a\s+seguir)\b/gi,
  /\(imagem\s+(?:abaixo|a\s+seguir)\)/gi,
  /\[imagem\s+(?:abaixo|a\s+seguir)\]/gi
];

let withResidual = [];

for (const cat of catalog) {
  const fullQ = db.prepare('SELECT id, statement, options, correct_answer FROM questions_curated_staging WHERE id = ?').get(cat.id);
  if (!fullQ || !fullQ.statement) continue;

  const stmt = fullQ.statement;
  let matches = [];
  for (const pat of RESIDUAL_PHRASES) {
    const m = stmt.match(pat);
    if (m) matches.push(...m);
  }

  if (matches.length > 0) {
    let cleaned = stmt;
    for (const pat of RESIDUAL_PHRASES) {
      cleaned = cleaned.replace(pat, '');
    }
    cleaned = cleaned.replace(/\s{2,}/g, ' ').replace(/\(\s*\)/g, '').replace(/\s+([.,;:])/g, '$1').trim();

    withResidual.push({
      id: cat.id,
      matches,
      original: stmt,
      cleaned
    });
  }
}

console.log(`Questões com frases residuais explícitas identificadas: ${withResidual.length}`);
console.log('\nAmostra de 5 questões:');
for (const item of withResidual.slice(0, 5)) {
  console.log(`\nID: ${item.id}`);
  console.log(`Frases detectadas:`, item.matches);
  console.log(`Original:`, item.original.slice(0, 150) + '...');
  console.log(`Higienizado:`, item.cleaned.slice(0, 150) + '...');
}

