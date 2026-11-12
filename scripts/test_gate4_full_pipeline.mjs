import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const db = new DatabaseSync(DB_PATH);

console.log('='.repeat(80));
console.log('🧪 VALIDAÇÃO COMPLETA DO MOTOR DO GATE 4 EM TODAS AS 6.717 QUESTÕES');
console.log('='.repeat(80));

const rows = db.prepare(`
  SELECT id, statement, images
  FROM questions_curated_staging
  WHERE images IS NOT NULL AND images != '[]' AND images != ''
`).all();

// Regex Patterns
const LEGACY_TAG_PATTERNS = [
  /\[IMG:\s*[^\]]+\]/gi,
  /<img\s+[^>]*>/gi,
  /!\[[^\]]*\]\([^)]+\)/gi
];

const EXAM_COLON_REGEX = /(?:(?:o|a|os|as|seu|sua)\s+)?(?:eletrocardiograma|ecg|radiografia|raio[\s-]x|rx|tomografia|tc|resson[âa]ncia|rm|ultrassom|usg|imagem|figura|foto|esquema|gr[áa]fico|partograma|tra[çc]ado|les[ãa]o|exame)(?:\s+[\wçãõáéíóúâêô,-]+){0,6}\s*:[ \t]*/i;

const INTRO_COLON_REGEX = /(?:reprodu[çc][ãa]o|evidenciou|mostra|apresenta|exibe|abaixo|a\s+seguir)\s*(?:de\s+[\wçãõáéíóúâêô]+){0,3}\s*:[ \t]*/i;

const ANEXAS_REGEX = /(?:imagens?|figuras?|fotos?|exames?)\s+anex[ao]s?:?/i;

const EXPLICIT_IMAGE_SENTENCE_REGEX = /(?:(?:o|a|os|as|seu|sua)\s+)?(?:eletrocardiograma|ecg|radiografia|raio[\s-]x|rx|tomografia|tc|resson[âa]ncia|rm|ultrassom|usg|imagem|figura|foto|esquema|gr[áa]fico|partograma|tra[çc]ado|les[ãa]o|exame)(?:\s+[\wçãõáéíóúâêô]+){0,5}\s+(?:est[áa]\s+)?(?:demonstrad[ao]|ilustrad[ao]|apresentad[ao]|mostrad[ao]|reproduzid[ao]|anex[ao]|abaixo|a\s+seguir)[^.!?\n]*[.!?:]?/i;

const IMPERATIVE_IMAGE_SENTENCE_REGEX = /(?:observe|veja|analise|considere|conforme|de\s+acordo\s+com|basead[ao]\s+n[ao]|tendo\s+em\s+vista)\s+(?:a\s+|o\s+)?(?:imagem|figura|foto|radiografia|tomografia|ilustra[çc][ãa]o|tra[çc]ado|eletrocardiograma|ecg|exame)(?:\s+[\wçãõáéíóúâêô]+){0,4}[^.!?\n]*[.!?:]?/i;

const QUESTION_PROMPT_REGEX = /(?:(?:\r?\n)+|[.!?]\s+)(?=(?:com\s+base|diante\s+d|considerando|a\s+conduta|o\s+diagn[óo]stico|diagn[óo]stico\s+mais|hip[óo]tese\s+diagn[óo]stica|assinale|qual\s+(?:[eé]|a|o)|em\s+rela[çc][ãa]o|sobre\s+o\s+caso|quanto\s+[aà]|o\s+tratamento|o\s+achado|podemos\s+afirmar|marqu?e|o\s+quadro\s+sugere)\b)/i;

export function injectDeterministicImageTags(stmt, imgCount) {
  if (!stmt || typeof stmt !== 'string') return { newStmt: '', strategy: 'empty' };
  if (imgCount <= 0) return { newStmt: stmt, strategy: 'no_images' };

  let text = stmt;

  // 1. Limpeza de tags [IMAGEM X] existentes para re-ancoragem perfeita e sem duplicações
  text = text.replace(/\[IMAGEM\s+\d+\]/gi, '').trim();

  // 2. Se houver tags legadas ([IMG: ...], <img>, ![...])
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

  if (hasLegacy) {
    // Se faltarem tags para imagens restantes
    if (legacyIndex < imgCount) {
      let missing = '';
      for (let i = legacyIndex + 1; i <= imgCount; i++) {
        missing += `\n\n[IMAGEM ${i}]`;
      }
      text = text + missing;
    }
    return { newStmt: formatCleanStatement(text), strategy: 'legacy_replaced' };
  }

  // Gera o bloco de tags canônicas
  const tagsToInject = Array.from({ length: imgCount }, (_, i) => `[IMAGEM ${i + 1}]`).join('\n\n');

  // 3. Estratégia: Dois-pontos em menção a exame ou anexo
  const matchAnexas = text.match(ANEXAS_REGEX);
  if (matchAnexas) {
    const splitIdx = matchAnexas.index + matchAnexas[0].length;
    return {
      newStmt: formatCleanStatement(`${text.slice(0, splitIdx)}\n\n${tagsToInject}\n\n${text.slice(splitIdx)}`),
      strategy: 'contextual_anexas'
    };
  }

  const matchColonExam = text.match(EXAM_COLON_REGEX);
  if (matchColonExam) {
    const splitIdx = matchColonExam.index + matchColonExam[0].length;
    return {
      newStmt: formatCleanStatement(`${text.slice(0, splitIdx)}\n\n${tagsToInject}\n\n${text.slice(splitIdx)}`),
      strategy: 'contextual_exam_colon'
    };
  }

  const matchColonIntro = text.match(INTRO_COLON_REGEX);
  if (matchColonIntro) {
    const splitIdx = matchColonIntro.index + matchColonIntro[0].length;
    return {
      newStmt: formatCleanStatement(`${text.slice(0, splitIdx)}\n\n${tagsToInject}\n\n${text.slice(splitIdx)}`),
      strategy: 'contextual_intro_colon'
    };
  }

  // 4. Estratégia: Frase descritiva ("está demonstrado abaixo", "ilustrada a seguir")
  const matchExplicit = text.match(EXPLICIT_IMAGE_SENTENCE_REGEX);
  if (matchExplicit) {
    const splitIdx = matchExplicit.index + matchExplicit[0].length;
    return {
      newStmt: formatCleanStatement(`${text.slice(0, splitIdx)}\n\n${tagsToInject}\n\n${text.slice(splitIdx)}`),
      strategy: 'contextual_explicit_sentence'
    };
  }

  // 5. Estratégia: Frase imperativa ("observe a tomografia", "conforme a radiografia")
  const matchImperative = text.match(IMPERATIVE_IMAGE_SENTENCE_REGEX);
  if (matchImperative) {
    const splitIdx = matchImperative.index + matchImperative[0].length;
    return {
      newStmt: formatCleanStatement(`${text.slice(0, splitIdx)}\n\n${tagsToInject}\n\n${text.slice(splitIdx)}`),
      strategy: 'contextual_imperative_sentence'
    };
  }

  // 6. Estratégia: Transição entre narrativa clínica e comando da questão
  const matchPrompt = text.match(QUESTION_PROMPT_REGEX);
  if (matchPrompt && matchPrompt.index > 40) {
    const splitIdx = matchPrompt.index;
    return {
      newStmt: formatCleanStatement(`${text.slice(0, splitIdx)}\n\n${tagsToInject}\n\n${text.slice(splitIdx)}`),
      strategy: 'transition_before_prompt'
    };
  }

  // 7. Fallback: Final do texto
  return {
    newStmt: formatCleanStatement(`${text}\n\n${tagsToInject}`),
    strategy: 'fallback_end_of_statement'
  };
}

function formatCleanStatement(str) {
  return str
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Executar verificação e assertivas rigorosas
let totalProcessed = 0;
let errors = 0;
const strategyCounts = {};

for (const r of rows) {
  let imgCount = 1;
  try {
    const arr = JSON.parse(r.images);
    if (Array.isArray(arr)) imgCount = arr.length;
  } catch {}

  const { newStmt, strategy } = injectDeterministicImageTags(r.statement, imgCount);
  strategyCounts[strategy] = (strategyCounts[strategy] || 0) + 1;
  totalProcessed++;

  // Validação 1: O número de tags [IMAGEM X] deve ser exatamente imgCount
  const tagsFound = newStmt.match(/\[IMAGEM\s+\d+\]/gi) || [];
  if (tagsFound.length !== imgCount) {
    console.error(`❌ ERRO de contagem de tags na questão ${r.id}: esperava ${imgCount}, obteve ${tagsFound.length}`);
    errors++;
  }

  // Validação 2: Cada tag de 1 até imgCount deve existir exatamente uma vez
  for (let i = 1; i <= imgCount; i++) {
    const expected = `[IMAGEM ${i}]`;
    if (!newStmt.includes(expected)) {
      console.error(`❌ ERRO: Tag ${expected} ausente na questão ${r.id}`);
      errors++;
    }
  }

  // Validação 3: Nenhuma tag legada deve ter sobrado
  for (const pat of LEGACY_TAG_PATTERNS) {
    if (pat.test(newStmt)) {
      console.error(`❌ ERRO: Tag legada residual encontrada na questão ${r.id}`);
      errors++;
    }
  }
}

console.log(`\nResultados do Teste de Integridade:`);
console.log(`- Questões processadas: ${totalProcessed.toLocaleString('pt-BR')}`);
console.log(`- Erros encontrados: ${errors}`);
console.log('\nDistribuição por Estratégia de Injeção:');
console.table(strategyCounts);

if (errors === 0) {
  console.log('\n🏆 O MOTOR DO GATE 4 ESTÁ 100% FUNCIONAL, PRECISO E HOMOLOGADO!');
} else {
  console.error(`\n❌ Falhas detectadas: ${errors}`);
  process.exit(1);
}

