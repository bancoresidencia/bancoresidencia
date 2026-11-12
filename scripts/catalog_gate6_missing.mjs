import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const db = new DatabaseSync(DB_PATH);

console.log('='.repeat(80));
console.log('🔍 MAPEAMENTO DAS 710 QUESTÕES COM IMAGEM FALTANTE');
console.log('='.repeat(80));

const CLINICAL_IMG_CLUES = [
  /observe\s+(?:a\s+)?(?:imagem|figura|foto|radiografia|tomografia|ilustra[çc][ãa]o)/i,
  /conforme\s+(?:a\s+)?(?:imagem|figura|foto|radiografia|tomografia|ilustra[çc][ãa]o)/i,
  /(?:imagem|figura|foto|radiografia|tomografia|eletrocardiograma|ecg|tc|rm|rx)\s+(?:abaixo|a\s+seguir|acima|mostrad[ao]|anex[ao]|ilustrad[ao])/i,
  /(?:abaixo|a\s+seguir|anex[ao])\s+(?:est[áa]|encontra-se|demonstrad[ao]|ilustrad[ao])\s+(?:o\s+)?(?:eletrocardiograma|ecg|radiografia|imagem|figura|tc|exame)/i,
  /(?:ilustrad[ao]|demonstrad[ao]|apresentad[ao]|reproduzid[ao])\s+(?:a\s+seguir|abaixo)/i,
  /basead[ao]\s+na\s+(?:imagem|figura|foto|radiografia)/i,
  /analise\s+(?:a\s+)?(?:imagem|figura|foto|radiografia|o\s+eletrocardiograma)/i,
  /veja\s+(?:a\s+)?(?:imagem|figura|foto)/i,
  /de\s+acordo\s+com\s+(?:a\s+)?(?:imagem|figura|foto)/i,
  /laudo\s+da\s+(?:tomografia|radiografia|resson[âa]ncia)\s+(?:abaixo|anex[ao])/i,
  /aspecto\s+(?:da\s+les[ãa]o|macrosc[óo]pico|microsc[óo]pico|tomogr[áa]fico|radiogr[áa]fico)\s+(?:abaixo|a\s+seguir|na\s+foto)/i,
  /quadro\s+cl[íi]nico\s+e\s+(?:a\s+)?(?:imagem|figura|foto)/i,
  /\bfigura\s+[1-9]\b/i,
  /\bimagem\s+[1-9]\b/i
];

const missingRows = db.prepare(`
  SELECT id, code, banca, institution, year, numero_questao, titulo_caderno, statement, options, correct_answer
  FROM questions_curated_staging
  WHERE images IS NULL OR images = '[]' OR images = 'null' OR images = ''
`).all();

const missingQuestions = [];

for (const r of missingRows) {
  if (!r.statement) continue;
  let hasClue = false;
  let matchedClue = '';
  for (const c of CLINICAL_IMG_CLUES) {
    const m = c.exec(r.statement);
    if (m) {
      hasClue = true;
      matchedClue = m[0];
      break;
    }
  }

  // Também verificar se options tem (VER IMAGEM)
  let hasOptVerImagem = false;
  if (r.options && /(?:\(ver\s+imagem\)|\[ver\s+imagem\])/i.test(r.options)) {
    hasOptVerImagem = true;
  }

  if (hasClue || hasOptVerImagem) {
    missingQuestions.push({
      ...r,
      matchedClue,
      hasOptVerImagem
    });
  }
}

console.log(`Total de questões catalogadas no Gate 6: ${missingQuestions.length}`);

// Agrupar por Banca e Ano
const byBancaYear = {};
for (const q of missingQuestions) {
  const b = q.banca || q.institution || 'OUTROS';
  const y = q.year || 0;
  const key = `${b} (${y})`;
  byBancaYear[key] = (byBancaYear[key] || 0) + 1;
}

console.log('\nTop 20 Grupos Banca / Ano no Gate 6:');
console.table(Object.entries(byBancaYear).sort((a,b) => b[1] - a[1]).slice(0, 20).map(([k, v]) => ({ grupo: k, count: v })));

// Salvar catálogo completo do Gate 6 em JSON
const outPath = path.resolve('data/supabase_tables/gate6_missing_catalog.json');
fs.writeFileSync(outPath, JSON.stringify({
  total: missingQuestions.length,
  catalog: missingQuestions.map(q => ({
    id: q.id,
    code: q.code,
    banca: q.banca,
    institution: q.institution,
    year: q.year,
    numero_questao: q.numero_questao,
    titulo_caderno: q.titulo_caderno,
    matchedClue: q.matchedClue,
    hasOptVerImagem: q.hasOptVerImagem,
    statement_snippet: q.statement.slice(0, 200) + '...'
  }))
}, null, 2), 'utf-8');

console.log(`Catálogo das questões faltantes salvo em: ${outPath}`);

