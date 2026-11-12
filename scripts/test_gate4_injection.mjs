import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const db = new DatabaseSync(DB_PATH);

console.log('='.repeat(80));
console.log('🧪 SIMULAÇÃO / TESTE DE REGRAS DO GATE 4 (INJEÇÃO DETERMINÍSTICA)');
console.log('='.repeat(80));

const rows = db.prepare(`
  SELECT id, statement, images
  FROM questions_curated_staging
  WHERE images IS NOT NULL AND images != '[]' AND images != ''
`).all();

console.log(`Total de questões com imagens para o Gate 4: ${rows.length}`);

// Patterns for legacy tags
const LEGACY_TAG_PATTERNS = [
  /\[IMG:\s*[^\]]+\]/gi,
  /<img\s+[^>]*>/gi,
  /!\[[^\]]*\]\([^)]+\)/gi
];

// Patterns for explicit image sentences in statement
const EXPLICIT_IMAGE_SENTENCE_REGEX = /(?:(?:o|a|os|as|seu|sua)\s+)?(?:eletrocardiograma|ecg|radiografia|raio[\s-]x|rx|tomografia|tc|resson[âa]ncia|rm|ultrassom|usg|imagem|figura|foto|esquema|gr[áa]fico|partograma|tra[çc]ado|les[ãa]o|exame)\s+(?:est[áa]\s+)?(?:demonstrad[ao]|ilustrad[ao]|apresentad[ao]|mostrad[ao]|reproduzid[ao]|anex[ao]|abaixo|a\s+seguir)[^.!?\n]*[.!?:]?/i;

const IMPERATIVE_IMAGE_SENTENCE_REGEX = /(?:observe|veja|analise|considere|conforme|de\s+acordo\s+com|basead[ao]\s+n[ao]|tendo\s+em\s+vista)\s+(?:a\s+|o\s+)?(?:imagem|figura|foto|radiografia|tomografia|ilustra[çc][ãa]o|tra[çc]ado|eletrocardiograma|ecg|exame)[^.!?\n]*[.!?:]?/i;

const ANEXAS_REGEX = /(?:imagens|figuras|fotos|exames)\s+anex[ao]s?:?/i;

// Question command prompt markers (last sentence/command)
const QUESTION_PROMPT_REGEX = /(?:(?:\r?\n)+|\.\s+)(?=(?:com\s+base\s+n[ao]|diante\s+d[oe]|considerando|a\s+conduta|o\s+diagn[óo]stico|assinale|qual\s+(?:[eé]|a|o)|em\s+rela[çc][ãa]o|sobre\s+o\s+caso|quanto\s+[aà]|a\s+hip[óo]tese|o\s+tratamento|o\s+achado|podemos\s+afirmar|marqu?e)\b)/i;

function processStatement(stmt, imgCount) {
  if (!stmt) return { newStmt: '', strategy: 'empty' };

  let text = stmt;

  // 1. Verificar se já existem tags [IMAGEM X]
  const existingTags = text.match(/\[IMAGEM\s+\d+\]/gi) || [];
  if (existingTags.length === imgCount) {
    // Já possui o número exato de tags
    return { newStmt: text, strategy: 'already_tagged' };
  }

  // 2. Tratar tags legadas [IMG: ...], <img>, ![...]
  let hasLegacy = false;
  let legacyIndex = 1;

  for (const pat of LEGACY_TAG_PATTERNS) {
    if (pat.test(text)) {
      hasLegacy = true;
      text = text.replace(pat, () => {
        const tag = `[IMAGEM ${legacyIndex}]`;
        if (legacyIndex < imgCount) legacyIndex++;
        return tag;
      });
    }
  }

  // Se substituiu tags legadas e cobriu todas as imagens
  if (hasLegacy) {
    // Se ainda faltam tags para imagens adicionais
    if (legacyIndex < imgCount) {
      let missingTags = '';
      for (let i = legacyIndex + 1; i <= imgCount; i++) {
        missingTags += `\n\n[IMAGEM ${i}]`;
      }
      text = text + missingTags;
    }
    return { newStmt: text.trim(), strategy: 'legacy_replaced' };
  }

  // 3. Caso SEM nenhuma tag prévia: Injeção Contextual
  // Gerar o bloco de tags para injetar
  const tagsToInject = Array.from({ length: imgCount }, (_, i) => `[IMAGEM ${i + 1}]`).join('\n\n');

  // Tentativa 1: Frase explícita de anexo (ex: "Imagens anexas:")
  const matchAnexas = text.match(ANEXAS_REGEX);
  if (matchAnexas) {
    const splitIdx = matchAnexas.index + matchAnexas[0].length;
    const before = text.slice(0, splitIdx);
    const after = text.slice(splitIdx);
    text = `${before.trim()}\n\n${tagsToInject}\n\n${after.trim()}`;
    return { newStmt: text.trim(), strategy: 'contextual_anexas' };
  }

  // Tentativa 2: Frase descritiva do exame (ex: "Seu eletrocardiograma está demonstrado abaixo.")
  const matchExplicit = text.match(EXPLICIT_IMAGE_SENTENCE_REGEX);
  if (matchExplicit) {
    const splitIdx = matchExplicit.index + matchExplicit[0].length;
    const before = text.slice(0, splitIdx);
    const after = text.slice(splitIdx);
    text = `${before.trim()}\n\n${tagsToInject}\n\n${after.trim()}`;
    return { newStmt: text.trim(), strategy: 'contextual_explicit_sentence' };
  }

  // Tentativa 3: Frase imperativa (ex: "Observe a tomografia a seguir.")
  const matchImperative = text.match(IMPERATIVE_IMAGE_SENTENCE_REGEX);
  if (matchImperative) {
    const splitIdx = matchImperative.index + matchImperative[0].length;
    const before = text.slice(0, splitIdx);
    const after = text.slice(splitIdx);
    text = `${before.trim()}\n\n${tagsToInject}\n\n${after.trim()}`;
    return { newStmt: text.trim(), strategy: 'contextual_imperative_sentence' };
  }

  // Tentativa 4: Transição entre caso clínico e pergunta final
  const matchPrompt = text.match(QUESTION_PROMPT_REGEX);
  if (matchPrompt && matchPrompt.index > 50) {
    const splitIdx = matchPrompt.index;
    const before = text.slice(0, splitIdx);
    const after = text.slice(splitIdx);
    text = `${before.trim()}\n\n${tagsToInject}\n\n${after.trim()}`;
    return { newStmt: text.trim(), strategy: 'transition_before_prompt' };
  }

  // Tentativa 5: Fallback final - anexar ao final do enunciado
  text = `${text.trim()}\n\n${tagsToInject}`;
  return { newStmt: text.trim(), strategy: 'fallback_end_of_statement' };
}

// Rodar simulação em todos os registros
const stats = {
  already_tagged: 0,
  legacy_replaced: 0,
  contextual_anexas: 0,
  contextual_explicit_sentence: 0,
  contextual_imperative_sentence: 0,
  transition_before_prompt: 0,
  fallback_end_of_statement: 0
};

const samplesByStrategy = {};

for (const r of rows) {
  let imgCount = 1;
  try {
    const arr = JSON.parse(r.images);
    if (Array.isArray(arr)) imgCount = arr.length;
  } catch {}

  const res = processStatement(r.statement, imgCount);
  stats[res.strategy] = (stats[res.strategy] || 0) + 1;

  if (!samplesByStrategy[res.strategy]) {
    samplesByStrategy[res.strategy] = {
      id: r.id,
      imgCount,
      original: r.statement.slice(0, 200) + '...',
      result: res.newStmt.slice(0, 300) + '...'
    };
  }
}

console.log('\n--- ESTATÍSTICAS DA SIMULAÇÃO ---');
console.table(stats);

console.log('\n--- AMOSTRAS POR ESTRATÉGIA ---');
for (const [strat, smp] of Object.entries(samplesByStrategy)) {
  console.log(`\n[ESTRATÉGIA: ${strat}] (ID: ${smp.id}, Imgs: ${smp.imgCount})`);
  console.log(`Original: ${smp.original}`);
  console.log(`Resultado: ${smp.result}`);
}

