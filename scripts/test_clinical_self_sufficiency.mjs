import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const catalog = JSON.parse(fs.readFileSync('data/supabase_tables/gate6_missing_catalog.json', 'utf8')).catalog || [];

console.log('='.repeat(80));
console.log('🔍 ANÁLISE DE AUTOSSUFICIÊNCIA CLÍNICA & FRASES RESIDUAIS');
console.log('='.repeat(80));

// Frases residuais que denunciam a dependência de imagem e precisam ser removidas
const RESIDUAL_IMG_PATTERNS = [
  /\((?:ver|conforme|veja|observe|vide)\s+(?:a\s+)?(?:imagem|figura|foto|caderno\s+de\s+quest[õo]es)[^)]*\)/gi,
  /\[(?:ver|conforme|veja|observe|vide)\s+(?:a\s+)?(?:imagem|figura|foto|caderno\s+de\s+quest[õo]es)[^\]]*\]/gi,
  /\bconforme\s+(?:a\s+)?(?:imagem|figura|foto)\s+(?:do\s+caderno\s+de\s+quest[õo]es|abaixo|a\s+seguir)\b/gi,
  /\b(?:imagem|figura|foto|radiografia|tomografia|eletrocardiograma)\s+(?:abaixo|a\s+seguir|anex[ao]|ilustrad[ao]|demonstrad[ao]|apresentad[ao]|mostrad[ao])\b/gi,
  /\bque\s+pode\s+ser\s+vist[ao]\s+na\s+figura\s+(?:abaixo|a\s+seguir)\b/gi,
  /\bno\s+esquema\s+abaixo\b/gi
];

// Critérios para avaliar se o enunciado já descreve o achado patológico/diagnóstico completo
// Exemplo: se tem um achado radiológico descritivo (infiltrado, consolidação, fratura, massa, nódulo, ritmo, etc.)
const CLINICAL_FINDINGS_REGEX = /(?:evidenciou|revelou|mostrou|apresentando|apresenta|com|notou-se|observa-se|com\s+presen[çc]a\s+de)\s+[\w\s,]{4,60}?(?:consolida[çc][ãa]o|infiltrado|derrame|pneumot[óo]rax|fratura|luxa[çc][ãa]o|massa|n[óo]dulo|espessamento|dilata[çc][ãa]o|ritmo\s+sinusal|fibrila[çc][ãa]o|bloqueio|isquemia|necrose|estenose|oclus[ãa]o|edema|cole[çc][ãa]o|abscesso|hematoma|cálculo|divert[íi]culo)/i;

const candidatesSelfSufficient = [];

for (const cat of catalog) {
  const fullQ = db.prepare('SELECT id, statement, options, correct_answer FROM questions_curated_staging WHERE id = ?').get(cat.id);
  if (!fullQ || !fullQ.statement) continue;

  const stmt = fullQ.statement;
  
  // Se tem achado explícito
  if (CLINICAL_FINDINGS_REGEX.test(stmt)) {
    // Verificar se ao remover as frases residuais, o enunciado continua com sentido completo
    let cleaned = stmt;
    let foundResidual = false;
    for (const pat of RESIDUAL_IMG_PATTERNS) {
      if (pat.test(cleaned)) {
        foundResidual = true;
        cleaned = cleaned.replace(pat, '');
      }
    }

    // Limpar espaços duplos e pontuação duplicada
    cleaned = cleaned.replace(/\s{2,}/g, ' ').replace(/\(\s*\)/g, '').replace(/\s+([.,;:])/g, '$1').trim();

    candidatesSelfSufficient.push({
      id: cat.id,
      banca: cat.banca,
      year: cat.year,
      original: stmt,
      cleaned,
      foundResidual
    });
  }
}

console.log(`Questões com potencial de autossuficiência clínica identificadas: ${candidatesSelfSufficient.length}`);
console.log('\nAmostra de 5 questões autossuficientes com higienização de frases residuais:');
for (const c of candidatesSelfSufficient.slice(0, 5)) {
  console.log(`\nID: ${c.id} (${c.banca} ${c.year})`);
  console.log('Original:\n', c.original.slice(0, 160) + '...');
  console.log('Higienizado (Sem frases residuais):\n', c.cleaned.slice(0, 160) + '...');
}

