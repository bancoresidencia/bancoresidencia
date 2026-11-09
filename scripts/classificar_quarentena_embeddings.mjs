/**
 * CLASSIFICADOR PERICIAL DE QUARENTENA VIA EMBEDDINGS LOCAIS (TRANSFORMERS.JS)
 * 
 * Executa classificação semântica vetorial 100% local (offline, zero cota de API, zero custo)
 * utilizando o modelo multilíngue Sentence-Transformers via ONNX Runtime.
 * 
 * Uso:
 *   node scripts/classificar_quarentena_embeddings.mjs               # Simulação auditada (dry-run)
 *   node scripts/classificar_quarentena_embeddings.mjs --limit 10    # Testa 10 questões
 *   node scripts/classificar_quarentena_embeddings.mjs --execute     # Aplica gravações no SQLite
 */

import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { pipeline, cos_sim } from '@xenova/transformers';

const startTime = Date.now();

// 1. Argumentos CLI
const args = process.argv.slice(2);
const getArg = (flag, defaultVal = null) => {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : defaultVal;
};
const hasFlag = (flag) => args.includes(flag);

const IS_EXECUTE           = hasFlag('--execute');
const RUN_LIMIT            = getArg('--limit') ? parseInt(getArg('--limit'), 10) : null;
const THRESHOLD            = getArg('--threshold') ? parseFloat(getArg('--threshold')) : 0.38;
const MARGIN_THRESHOLD     = getArg('--margin') ? parseFloat(getArg('--margin')) : 0.03;
const ONLY_SO_SUBFOCO      = hasFlag('--apenas-so-subfoco');
const ONLY_COM_SUBSUB      = hasFlag('--apenas-com-subsub');
const ESPECIALIDADE_FILTER = getArg('--especialidade', null);
const MODEL_NAME           = getArg('--model', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');
const DB_PATH              = path.resolve('data/questoes_132k.db');
const TREE_PATH            = path.resolve('data/catalogo_arvore_canonica_completa.json');

console.log('========================================================================');
console.log('🧠 CLASSIFICADOR SEMÂNTICO LOCAL POR EMBEDDINGS (ZERO CUSTO / OFFLINE)');
console.log(`🛡️  Modo:        ${IS_EXECUTE ? '⚡ EXECUÇÃO ATIVA NO SQLITE' : '🧪 SIMULAÇÃO AUDITADA (--dry-run)'}`);
console.log(`🧠 Modelo:      ${MODEL_NAME} (HuggingFace ONNX Local)`);
console.log(`🎯 Limiar:      Score mínimo >= ${THRESHOLD} | Margem >= ${MARGIN_THRESHOLD}`);
console.log(`📁 Banco:       ${DB_PATH}`);
console.log('========================================================================\n');

if (!fs.existsSync(DB_PATH)) {
  console.error(`❌ Banco de dados SQLite não encontrado: ${DB_PATH}`);
  process.exit(1);
}
if (!fs.existsSync(TREE_PATH)) {
  console.error(`❌ Árvore canônica não encontrada: ${TREE_PATH}`);
  process.exit(1);
}

// 2. Conectar ao SQLite
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');
db.exec('PRAGMA busy_timeout = 30000;');

// 3. Carregar Árvore Canônica
const rawTreeData = JSON.parse(fs.readFileSync(TREE_PATH, 'utf8'));

function buildCanonicalFocoIndex(catalogData) {
  const compositeFocoMap = new Map();
  const focoFallbackMap = new Map();
  const canonicalTuples = new Set();
  const allSubfocos = [];

  const rawList = Array.isArray(catalogData) ? catalogData : (catalogData.hierarquia_padrao || []);

  for (const espNode of rawList) {
    const esp = espNode.especialidade;
    const espLower = (esp || '').toLowerCase().trim();

    for (const temaNode of (espNode.temas || [])) {
      const tema = temaNode.tema;

      for (const focoNode of (temaNode.focos || [])) {
        const foco = focoNode.foco;
        const focoLower = (foco || '').toLowerCase().trim();

        let subfocosList = [];
        const subSubfocosMap = new Map();

        const processSubItem = (item) => {
          if (typeof item === 'string') {
            subfocosList.push(item);
          } else if (item && typeof item === 'object') {
            const name = item.subfoco || item.nome;
            if (name) {
              subfocosList.push(name);
              if (Array.isArray(item.sub_subfocos)) {
                subSubfocosMap.set(name.toLowerCase().trim(), item.sub_subfocos);
              }
            }
          }
        };

        if (Array.isArray(focoNode.subfocos)) {
          for (const s of focoNode.subfocos) processSubItem(s);
        }

        subfocosList = subfocosList.filter(s => !s.includes(': Diagnóstico e Conduta'));

        const entry = { especialidade: esp, tema, foco, subfocosList, subSubfocosMap };
        compositeFocoMap.set(`${espLower}|||${focoLower}`, entry);

        if (!focoFallbackMap.has(focoLower)) focoFallbackMap.set(focoLower, []);
        focoFallbackMap.get(focoLower).push(entry);

        for (const sub of subfocosList) {
          allSubfocos.push({ especialidade: esp, tema, foco, subfoco: sub });
          canonicalTuples.add(`${esp}|||${tema}|||${foco}|||${sub}`);
          const subSubs = subSubfocosMap.get(sub.toLowerCase().trim()) || [];
          for (const ss of subSubs) {
            canonicalTuples.add(`${esp}|||${tema}|||${foco}|||${sub}|||${ss}`);
          }
        }
      }
    }
  }

  return { compositeFocoMap, focoFallbackMap, canonicalTuples, allSubfocos };
}

const canonicalIndex = buildCanonicalFocoIndex(rawTreeData);

const ESPECIALIDADE_ALIASES = {
  'Cirurgia': ['Cirurgia Geral', 'Cirurgia'],
  'Cirurgia Geral': ['Cirurgia Geral', 'Cirurgia'],
  'Medicina Preventiva': ['Medicina Preventiva e Social', 'Medicina Preventiva'],
  'Medicina Preventiva e Social': ['Medicina Preventiva e Social', 'Medicina Preventiva'],
  'Ginecologia': ['Ginecologia', 'Ginecologia e Obstetrícia'],
  'Obstetrícia': ['Obstetrícia', 'Ginecologia e Obstetrícia'],
  'Clínica Médica': ['Clínica Médica'],
  'Pediatria': ['Pediatria']
};

function resolveCanonicalFoco(origEsp, origFoco) {
  const focoLow = (origFoco || '').toLowerCase().trim();
  const aliases = ESPECIALIDADE_ALIASES[origEsp] || [origEsp];
  for (const alias of aliases) {
    const compositeKey = `${alias.toLowerCase().trim()}|||${focoLow}`;
    if (canonicalIndex.compositeFocoMap.has(compositeKey)) {
      return canonicalIndex.compositeFocoMap.get(compositeKey);
    }
  }

  const candidates = canonicalIndex.focoFallbackMap.get(focoLow) || [];
  if (candidates.length === 1) return candidates[0];
  if (candidates.length > 1) {
    const aliasLowers = aliases.map(a => a.toLowerCase().trim());
    const matched = candidates.filter(c => aliasLowers.includes(c.especialidade.toLowerCase().trim()));
    if (matched.length === 1) return matched[0];
  }
  return null;
}

// 4. Carregar Extrator de Embeddings
console.log(`⏳ Carregando pipeline de embeddings local (${MODEL_NAME})...`);
const extractor = await pipeline('feature-extraction', MODEL_NAME);
console.log('✅ Modelo de Embeddings carregado e pronto para inferência local!\n');

// 5. Construir Cache de Embeddings dos Subfocos Canônicos
console.log('🧪 Pré-computando vetores dos Subfocos do Catálogo Canônico...');
const subfocoVectorCache = new Map();

async function getSubfocoVector(esp, tema, foco, subfoco, subSubfocosMap = null) {
  const cacheKey = `${esp}|||${foco}|||${subfoco}`.toLowerCase().trim();
  if (subfocoVectorCache.has(cacheKey)) {
    return subfocoVectorCache.get(cacheKey);
  }

  const subSubs = subSubfocosMap ? (subSubfocosMap.get(subfoco.toLowerCase().trim()) || []) : [];
  const subSubsText = subSubs.length > 0 ? ` Aspectos e temas abordados: ${subSubs.join(', ')}.` : '';

  // Texto rico representativo do subfoco com descritores canônicos
  const textProfile = `Especialidade: ${esp}. Foco: ${foco}. Subfoco: ${subfoco}.${subSubsText} Conceitos clínicos, diagnóstico e conduta médica de ${subfoco}.`;
  const output = await extractor(textProfile, { pooling: 'mean', normalize: true });
  const vector = Array.from(output.data);
  subfocoVectorCache.set(cacheKey, vector);
  return vector;
}

// 6. Buscar Questões em Quarentena
let query = `
  SELECT id, code, especialidade, tema, foco, subfoco,
         antigo_tema, antigo_foco, antigo_subfoco,
         novo_tema, novo_foco,
         statement, options, correct_answer, commentary, motivo_regra
  FROM questions
  WHERE status_recategorizacao = 'QUARENTENA_ANALISE_HUMANA'
`;
const queryParams = [];

if (ESPECIALIDADE_FILTER) {
  query += ' AND especialidade = ?';
  queryParams.push(ESPECIALIDADE_FILTER);
}
query += ' ORDER BY id ASC';

const rawQuarantineRows = db.prepare(query).all(...queryParams);
console.log(`📋 Total de Questões na Quarentena: ${rawQuarantineRows.length.toLocaleString('pt-BR')}`);

if (rawQuarantineRows.length === 0) {
  console.log('🎉 Nenhuma questão em quarentena pendente!');
  db.close();
  process.exit(0);
}

// 7. Filtragem e Agrupamento
const eligibleQuestions = [];
let unmappedCount = 0;

for (const q of rawQuarantineRows) {
  const origEsp = q.especialidade;
  let currFoco = q.novo_foco || q.antigo_foco || q.foco;
  let canonicalFoco = resolveCanonicalFoco(origEsp, currFoco);

  if ((!canonicalFoco || !canonicalFoco.subfocosList || canonicalFoco.subfocosList.length === 0) && q.antigo_foco && q.antigo_foco !== currFoco) {
    const fallback = resolveCanonicalFoco(origEsp, q.antigo_foco);
    if (fallback && fallback.subfocosList && fallback.subfocosList.length > 0) canonicalFoco = fallback;
  }
  if ((!canonicalFoco || !canonicalFoco.subfocosList || canonicalFoco.subfocosList.length === 0) && q.foco && q.foco !== currFoco) {
    const fallback = resolveCanonicalFoco(origEsp, q.foco);
    if (fallback && fallback.subfocosList && fallback.subfocosList.length > 0) canonicalFoco = fallback;
  }

  if (!canonicalFoco || !canonicalFoco.subfocosList || canonicalFoco.subfocosList.length === 0) {
    unmappedCount++;
    continue;
  }

  const hasSubSubs = Array.from(canonicalFoco.subSubfocosMap.values()).some(list => Array.isArray(list) && list.length > 0);
  if (ONLY_SO_SUBFOCO && hasSubSubs) continue;
  if (ONLY_COM_SUBSUB && !hasSubSubs) continue;

  eligibleQuestions.push({ question: q, canonicalFoco });
}

const targetQuestions = RUN_LIMIT ? eligibleQuestions.slice(0, RUN_LIMIT) : eligibleQuestions;
console.log(`📦 Fila de Inferência: ${targetQuestions.length.toLocaleString('pt-BR')} questões agendadas (${eligibleQuestions.length.toLocaleString('pt-BR')} elegíveis)\n`);

// 8. Statement de Gravação
const updateStmt = IS_EXECUTE ? db.prepare(`
  UPDATE questions
  SET novo_tema = ?,
      novo_foco = ?,
      novo_subfoco = ?,
      novo_sub_subfoco = ?,
      status_recategorizacao = ?,
      motivo_regra = ?
  WHERE id = ?
`) : null;

// 9. Loop de Inferência e Classificação Vetorial
let resolvedCount = 0;
let lowConfidenceCount = 0;
let subSubResolved = 0;

console.log('🚀 Iniciando classificação vetorial local...\n');

for (let i = 0; i < targetQuestions.length; i++) {
  const { question: q, canonicalFoco } = targetQuestions[i];

  // Extrair alternativa correta oficial da banca
  let opts = [];
  try { opts = JSON.parse(q.options || '[]'); } catch(_) {}
  const correctOpt = opts.find(o => o.letter === q.correct_answer);
  const correctOptText = correctOpt ? `Gabarito Oficial (${correctOpt.letter}): ${correctOpt.text}. ` : '';

  // Montar texto rico representativo da questão
  const statementBrief = (q.statement || '').replace(/\s+/g, ' ').slice(0, 350);
  const antigoSubfocoText = q.antigo_subfoco ? `Tema prévio: ${q.antigo_subfoco}. ` : '';
  const questionPayloadText = `${antigoSubfocoText}Foco: ${canonicalFoco.foco}. Caso clínico: ${statementBrief}. ${correctOptText}`;

  // Gerar embedding da questão
  const qOutput = await extractor(questionPayloadText, { pooling: 'mean', normalize: true });
  const qVector = Array.from(qOutput.data);

  // Comparar contra cada subfoco candidato do foco canônico
  const candidatesScores = [];

  for (const sub of canonicalFoco.subfocosList) {
    const sVector = await getSubfocoVector(canonicalFoco.especialidade, canonicalFoco.tema, canonicalFoco.foco, sub, canonicalFoco.subSubfocosMap);
    const score = cos_sim(qVector, sVector);
    candidatesScores.push({ subfoco: sub, score });
  }

  // Ordenar por score decrescente
  candidatesScores.sort((a, b) => b.score - a.score);

  const top1 = candidatesScores[0];
  const top2 = candidatesScores[1] || { subfoco: null, score: 0 };
  const margin = top1.score - top2.score;

  // Critério de Confiança
  const isHighConfidence = top1.score >= THRESHOLD && (canonicalFoco.subfocosList.length === 1 || margin >= MARGIN_THRESHOLD);

  if (!isHighConfidence) {
    lowConfidenceCount++;
    if (!IS_EXECUTE && targetQuestions.length <= 25) {
      console.log(`  ⚠️  [Dúvida] Q#${q.id.slice(0, 8)} | Foco: ${canonicalFoco.foco}`);
      console.log(`      Top 1: '${top1.subfoco}' (Score: ${top1.score.toFixed(4)})`);
      console.log(`      Top 2: '${top2.subfoco}' (Score: ${top2.score.toFixed(4)} | Margem: ${margin.toFixed(4)})\n`);
    }
    continue;
  }

  const matchedSubfoco = top1.subfoco;

  if (!matchedSubfoco || matchedSubfoco.toLowerCase().trim() === canonicalFoco.foco.toLowerCase().trim() || matchedSubfoco.includes(': Diagnóstico e Conduta')) {
    lowConfidenceCount++;
    continue;
  }

  // 5º Nível (Sub-subfoco, se aplicável)
  let matchedSubSubfoco = null;
  const availableSubSubs = canonicalFoco.subSubfocosMap.get(matchedSubfoco.toLowerCase().trim()) || [];

  if (availableSubSubs.length > 0) {
    const subSubScores = [];
    for (const ss of availableSubSubs) {
      const ssProfile = `Especialidade: ${canonicalFoco.especialidade}. Subfoco: ${matchedSubfoco}. Detalhe: ${ss}.`;
      const ssOut = await extractor(ssProfile, { pooling: 'mean', normalize: true });
      const ssScore = cos_sim(qVector, Array.from(ssOut.data));
      subSubScores.push({ ss, score: ssScore });
    }
    subSubScores.sort((a, b) => b.score - a.score);
    if (subSubScores.length > 0 && subSubScores[0].score >= THRESHOLD) {
      matchedSubSubfoco = subSubScores[0].ss;
    }
  }

  const motivoFinal = `[Embedding Local ${MODEL_NAME.split('/')[1]}] Similaridade: ${(top1.score * 100).toFixed(1)}% (Margem: +${(margin * 100).toFixed(1)}%) | Foco: '${canonicalFoco.foco}'`;

  if (IS_EXECUTE && updateStmt) {
    updateStmt.run(
      canonicalFoco.tema,
      canonicalFoco.foco,
      matchedSubfoco,
      matchedSubSubfoco || null,
      'SUBFOCO_RESOLVIDO_EMBEDDING',
      motivoFinal,
      q.id
    );
    resolvedCount++;
    if (matchedSubSubfoco) subSubResolved++;
  } else if (!IS_EXECUTE) {
    resolvedCount++;
    if (matchedSubSubfoco) subSubResolved++;

    if (targetQuestions.length <= 25) {
      console.log(`  ✅ [Match ${((top1.score)*100).toFixed(1)}%] Q#${q.id.slice(0, 8)} | Foco: ${canonicalFoco.foco}`);
      console.log(`      ➔ Subfoco: '${matchedSubfoco}' (Margem: +${(margin*100).toFixed(1)}% vs '${top2.subfoco}')`);
      if (matchedSubSubfoco) console.log(`      ➔ Sub-subfoco: '${matchedSubSubfoco}'`);
      console.log(`      Enunciado: "${statementBrief.slice(0, 100)}..."\n`);
    }
  }

  if ((i + 1) % 5 === 0 || i === targetQuestions.length - 1) {
    const progressPct = (((i + 1) / targetQuestions.length) * 100).toFixed(1);
    process.stdout.write(`\r   🧠 [Embeddings] Processadas: ${(i + 1).toLocaleString('pt-BR')} / ${targetQuestions.length.toLocaleString('pt-BR')} (${progressPct}%) | Resolvidas: ${resolvedCount.toLocaleString('pt-BR')} | Dúvidas: ${lowConfidenceCount.toLocaleString('pt-BR')} `);
  }
}

const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);

console.log('\n\n========================================================================');
console.log('📊 RELATÓRIO DE CLASSIFICAÇÃO SEMÂNTICA (EMBEDDINGS LOCAIS):');
console.log('========================================================================');
console.log(`  • Questões Agendadas:           ${targetQuestions.length.toLocaleString('pt-BR')}`);
console.log(`  • Resolvidas com Alta Confiança:${resolvedCount.toLocaleString('pt-BR')} (${((resolvedCount / Math.max(1, targetQuestions.length)) * 100).toFixed(1)}%)`);
console.log(`  • Com Sub-subfoco Atribuído:    ${subSubResolved.toLocaleString('pt-BR')} (5º nível hierárquico)`);
console.log(`  • Questões Retidas (Baixa Marg):${lowConfidenceCount.toLocaleString('pt-BR')} (${((lowConfidenceCount / Math.max(1, targetQuestions.length)) * 100).toFixed(1)}%)`);
if (unmappedCount > 0) {
  console.log(`  • Focos Não Mapeáveis:          ${unmappedCount.toLocaleString('pt-BR')}`);
}
console.log(`  • Tempo Total de Execução:      ${elapsedSec}s`);
console.log(`  • Custo de API / Tokens:        R$ 0,00 (100% Processamento Local)`);
console.log('========================================================================\n');

// Quality Gates
if (IS_EXECUTE && resolvedCount > 0) {
  console.log('🔍 Executando Quality Gates sobre as questões resolvidas...');
  
  const dupCheck = db.prepare(`
    SELECT COUNT(*) as c FROM questions 
    WHERE status_recategorizacao = 'SUBFOCO_RESOLVIDO_EMBEDDING' 
      AND LOWER(TRIM(novo_subfoco)) = LOWER(TRIM(novo_foco))
  `).get().c;
  console.log(`  ${dupCheck === 0 ? '✅' : '❌'} Anti-Duplicação (novo_subfoco != novo_foco): ${dupCheck} inconsistências`);

  const sufixCheck = db.prepare(`
    SELECT COUNT(*) as c FROM questions 
    WHERE status_recategorizacao = 'SUBFOCO_RESOLVIDO_EMBEDDING' 
      AND novo_subfoco LIKE '%: Diagnóstico e Conduta%'
  `).get().c;
  console.log(`  ${sufixCheck === 0 ? '✅' : '❌'} Zero Sufixos Artificiais: ${sufixCheck} inconsistências\n`);
}

db.close();
console.log('🔒 Banco de dados SQLite preservado e fechado com segurança.');

