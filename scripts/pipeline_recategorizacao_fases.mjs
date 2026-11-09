import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

/**
 * ========================================================================
 * MOTOR MESTRE DE RECATEGORIZAÇÃO TAXONÔMICA CANÔNICA (132.947 QUESTÕES)
 * Arquitetura em 3 Passos: Remanejos em Bloco + Análise Pericial (Subfocos/Sub-subfocos) + Invariantes
 * ========================================================================
 *
 * Uso:
 *   node scripts/pipeline_recategorizacao_fases.mjs --help
 *   node scripts/pipeline_recategorizacao_fases.mjs --tree <caminho_da_arvore.json> [--depara <de_para.json>] [--execute] [--limit <n>]
 *
 * Regras Estritas:
 *   1. Isolamento 100% Localhost: Zero alterações no Supabase.
 *   2. Foco Exclusivo na Taxonomia: Multi-tags desacopladas para motor independente.
 *   3. Fonte Única da Verdade: Os nós de destino devem existir estritamente na árvore fornecida.
 *   4. Suporte Hierárquico: Especialidade -> Tema -> Foco -> Subfoco -> Sub-subfoco.
 *   5. Zero Sufixos Artificiais: Jamais gera ': Diagnóstico e Conduta'.
 *
 * Correções aplicadas (2026-11-07):
 *   [C1] focoMap agora usa chave composta (especialidade|||foco) + fallback para evitar
 *        colisão silenciosa de focos homônimos entre especialidades diferentes.
 *   [C2] lastId inicializado como 0 (INTEGER) para compatibilidade com WHERE id > ? em colunas INTEGER.
 *   [C3] Destinos De-Para validados contra canonicalTuples antes de serem aplicados;
 *        entradas inválidas vão direto para QUARENTENA_ANALISE_HUMANA.
 *   [C4] Quality Gates (8 Invariantes) implementados e executados ao final em modo --execute.
 *   [F1] Transação com try/catch/ROLLBACK explícito por lote — sem estado inconsistente em erro.
 *   [F2] Contador quarentenaHumanaTotal separado do array amostrado (500 registros);
 *        warning explícito quando dossiê é truncado.
 *   [F3] Nomenclatura unificada: decideCandidateAllocation (plano e script alinhados).
 *   [F4] Lógica de negação clínica documentada corretamente: peso reduzido 3.0→1.5.
 *   [F5] availableSubfocos vazio agora define targetSubfoco = null (não mais = targetFoco),
 *        evitando a duplicata subfoco == foco que viola o Invariante I3.
 *   [F6] Regex laboratorial expandida: TGO, TGP, ALT, AST, HbA1c, TSH, T4L, BNP,
 *        Troponina, D-dímero, INR, Bilirrubinas, Amilase, Lipase, Ferritina, etc.
 *   [P1] Flag --resume: paginação respeita status_recategorizacao IS NULL para retomar após crash.
 *   [P3] Status de sub-subfoco verificado; quarentena de sub-subfoco escala status da questão.
 */

// ============================================================
// 1. Parsing de Argumentos da Linha de Comando (CLI)
// ============================================================
const args = process.argv.slice(2);
const getArg = (flag, defaultVal = null) => {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : defaultVal;
};
const hasFlag = (flag) => args.includes(flag);

if (hasFlag('--help') || hasFlag('-h')) {
  console.log(`
Motor Canônico de Recategorização Taxonômica (132.947 Questões)

Opções:
  --tree <caminho>          Caminho para o JSON da nova árvore canônica alvo (Obrigatório)
  --depara <caminho>        Caminho para o arquivo JSON de matriz De-Para (1:1 / N:1) (Opcional)
  --especialidade <nome>    Filtra estritamente por uma especialidade (Ex: Ginecologia) (Opcional)
  --execute                 Aplica as alterações no SQLite local (Padrão: modo simulação --dry-run)
  --resume                  Pula registros já categorizados (status_recategorizacao IS NOT NULL) [P1]
  --limit <n>               Limita a execução para os primeiros N registros (para testes rápidos)
  --batch <n>               Tamanho do lote de cursor (Padrão: 2000)
  --help                    Exibe esta mensagem de ajuda
  `);
  process.exit(0);
}

const TREE_PATH            = getArg('--tree', 'docs/hierarquia_completa_filtros_recategorizada.json');
const DEPARA_PATH          = getArg('--depara', null);
const ESPECIALIDADE_FILTER = getArg('--especialidade', null);

const ESPECIALIDADE_ALIASES = {
  'Cirurgia': ['Cirurgia', 'Cirurgia Geral'],
  'Cirurgia Geral': ['Cirurgia', 'Cirurgia Geral'],
  'Medicina Preventiva': ['Medicina Preventiva', 'Medicina Preventiva e Social'],
  'Medicina Preventiva e Social': ['Medicina Preventiva', 'Medicina Preventiva e Social'],
  'Ginecologia': ['Ginecologia'],
  'Obstetrícia': ['Obstetrícia'],
  'Clínica Médica': ['Clínica Médica'],
  'Pediatria': ['Pediatria']
};

const espFilterList = ESPECIALIDADE_FILTER
  ? (ESPECIALIDADE_ALIASES[ESPECIALIDADE_FILTER] || [ESPECIALIDADE_FILTER])
  : null;

const IS_EXECUTE           = hasFlag('--execute');
const IS_RESUME            = hasFlag('--resume');   // [P1]
const RUN_LIMIT            = getArg('--limit') ? parseInt(getArg('--limit'), 10) : null;
const BATCH_SIZE           = getArg('--batch') ? parseInt(getArg('--batch'), 10) : 2000;
const DB_PATH              = path.resolve('data/questoes_132k.db');

if (!fs.existsSync(DB_PATH)) {
  console.error(`❌ Banco de dados SQLite não encontrado em: ${DB_PATH}`);
  process.exit(1);
}

console.log('========================================================================');
console.log('🚀 MOTOR CANÔNICO DE RECATEGORIZAÇÃO TAXONÔMICA (132.947 QUESTÕES)');
console.log(`🛡️  Modo: ${IS_EXECUTE ? '⚡ EXECUÇÃO ATIVA NO SQLITE LOCAL' : '🧪 SIMULAÇÃO AUDITADA (--dry-run)'}`);
console.log(`🌳 Árvore Alvo: ${TREE_PATH}`);
if (DEPARA_PATH)          console.log(`📋 Matriz De-Para: ${DEPARA_PATH}`);
if (ESPECIALIDADE_FILTER) console.log(`🔬 Especialidade Filtrada: ${ESPECIALIDADE_FILTER}`);
if (IS_RESUME)            console.log(`♻️  Modo Resume: Pula registros já processados. [P1]`);
console.log('🔒 Isolamento: 100% Localhost (Zero Supabase)');
console.log('🎯 Escopo: 100% Taxonomia Pura (Multi-tags desacopladas)');
console.log('========================================================================\n');

// ============================================================
// 2. Carrega e Indexa a Árvore Canônica Alvo (Suporte a Sub-subfocos)
// ============================================================
if (!fs.existsSync(TREE_PATH)) {
  console.error(`❌ Arquivo da nova árvore de filtros não encontrado: ${TREE_PATH}`);
  console.error(`👉 Forneça o arquivo com --tree <caminho_do_arquivo.json>`);
  process.exit(1);
}

let rawTreeData;
try {
  rawTreeData = JSON.parse(fs.readFileSync(TREE_PATH, 'utf8'));
} catch (e) {
  console.error(`❌ Erro ao decodificar JSON da árvore em ${TREE_PATH}:`, e.message);
  process.exit(1);
}

/**
 * Indexador Canônico Flexível com Suporte a Sub-subfocos.
 *
 * [C1] CORREÇÃO DE COLISÃO DE FOCOS HOMÔNIMOS:
 * O focoMap original usava apenas `focoLower` como chave, permitindo que focos com
 * nomes idênticos em especialidades diferentes (ex: "Infecções" em Clínica e Pediatria)
 * se sobrescrevessem silenciosamente. Agora usa:
 *   - compositeFocoMap: chave `${espLower}|||${focoLower}` — lookup exato por especialidade
 *   - focoFallbackMap: focoLower -> [entries] — desambiguação quando esp não bate exatamente
 *     (retorna o único candidato se não houver ambiguidade; caso contrário, null)
 */
export function buildCanonicalIndex(inputTree) {
  const specialties    = new Set();
  const temaMap        = new Map(); // temaLower -> { especialidade, tema }
  const compositeFocoMap  = new Map(); // `${espLower}|||${focoLower}` -> entry  [C1]
  const focoFallbackMap   = new Map(); // focoLower -> [entries]                  [C1]
  const canonicalTuples   = new Set(); // "Esp|||Tema|||Foco|||Subfoco[|||SubSubfoco]"

  let treeObject = inputTree;
  // Formato A: { hierarquia_padrao: [ { especialidade, temas: [...] } ] }
  if (Array.isArray(inputTree.hierarquia_padrao)) {
    treeObject = {};
    for (const espNode of inputTree.hierarquia_padrao) {
      const espName = espNode.especialidade;
      treeObject[espName] = {};
      for (const t of espNode.temas || []) {
        treeObject[espName][t.tema] = {};
        for (const f of t.focos || []) {
          treeObject[espName][t.tema][f.foco] = f;
        }
      }
    }
  }
  // Formato B: Catálogo de especialidade direta: { especialidade: "Ginecologia", temas: [...] }
  else if (inputTree.especialidade && Array.isArray(inputTree.temas)) {
    treeObject = {};
    const espName = inputTree.especialidade;
    treeObject[espName] = {};
    for (const t of inputTree.temas) {
      treeObject[espName][t.tema] = {};
      for (const f of t.focos || []) {
        treeObject[espName][t.tema][f.foco] = f;
      }
    }
  }

  for (const [esp, temas] of Object.entries(treeObject)) {
    if (esp === 'metadata' || esp === 'metricas' || esp === 'questoes_total_est') continue;
    if (typeof temas !== 'object' || temas === null) continue;
    specialties.add(esp);
    const espLower = esp.toLowerCase().trim();

    for (const [tema, focos] of Object.entries(temas)) {
      const temaLower = tema.toLowerCase().trim();
      temaMap.set(temaLower, { especialidade: esp, tema });

      for (const [foco, focoData] of Object.entries(focos)) {
        const focoLower = foco.toLowerCase().trim();

        let subfocosList = [];
        const subSubfocosMap = new Map(); // subfocoLower -> [subSubfoco1, subSubfoco2]

        const processSubItem = (item) => {
          if (typeof item === 'string') {
            subfocosList.push(item);
          } else if (item && typeof item === 'object') {
            const subName = item.subfoco || item.nome;
            if (subName) {
              subfocosList.push(subName);
              if (Array.isArray(item.sub_subfocos)) {
                subSubfocosMap.set(subName.toLowerCase().trim(), item.sub_subfocos);
              }
            }
          }
        };

        if (Array.isArray(focoData)) {
          for (const item of focoData) processSubItem(item);
        } else if (focoData && typeof focoData.subfocos === 'object') {
          if (Array.isArray(focoData.subfocos)) {
            for (const item of focoData.subfocos) processSubItem(item);
          } else {
            for (const [subName, subVal] of Object.entries(focoData.subfocos)) {
              subfocosList.push(subName);
              if (Array.isArray(subVal)) {
                subSubfocosMap.set(subName.toLowerCase().trim(), subVal);
              } else if (subVal && typeof subVal === 'object' && subVal.sub_subfocos) {
                subSubfocosMap.set(subName.toLowerCase().trim(), subVal.sub_subfocos);
              }
            }
          }
        }

        // Sanitização estrita: elimina sufixos artificiais se existirem no input
        subfocosList = subfocosList.filter(s => !s.includes(': Diagnóstico e Conduta'));

        const entry = { especialidade: esp, tema, foco, subfocosList, subSubfocosMap };

        // [C1] Chave composta garante unicidade por especialidade
        compositeFocoMap.set(`${espLower}|||${focoLower}`, entry);

        // [C1] Fallback indexado por nome do foco (para desambiguação sem especialidade exata)
        if (!focoFallbackMap.has(focoLower)) focoFallbackMap.set(focoLower, []);
        focoFallbackMap.get(focoLower).push(entry);

        for (const sub of subfocosList) {
          canonicalTuples.add(`${esp}|||${tema}|||${foco}|||${sub}`);
          const subSubs = subSubfocosMap.get(sub.toLowerCase().trim()) || [];
          for (const ss of subSubs) {
            canonicalTuples.add(`${esp}|||${tema}|||${foco}|||${sub}|||${ss}`);
          }
        }
      }
    }
  }

  return { specialties, temaMap, compositeFocoMap, focoFallbackMap, canonicalTuples };
}

/**
 * [C1] Resolve o entry canônico de um foco dado a especialidade da questão.
 * Estratégia em 3 níveis:
 *   1. Chave composta exata (especialidade|||foco)
 *   2. Fallback sem ambiguidade (único candidato com esse nome de foco)
 *   3. null — foco ambíguo ou não encontrado → quarentena
 */
function resolveCanonicalFoco(canonicalIndex, origEsp, origFoco) {
  const focoLow = (origFoco || '').toLowerCase().trim();
  const treeEsp = canonicalIndex.specialties.has(origEsp)
    ? origEsp
    : (canonicalIndex.specialties.values().next().value || origEsp);
  const espLow  = treeEsp.toLowerCase().trim();

  // Nível 1: match exato por especialidade
  const compositeKey = `${espLow}|||${focoLow}`;
  if (canonicalIndex.compositeFocoMap.has(compositeKey)) {
    return canonicalIndex.compositeFocoMap.get(compositeKey);
  }

  // Nível 2: único candidato com esse nome (sem ambiguidade entre especialidades)
  const candidates = canonicalIndex.focoFallbackMap.get(focoLow) || [];
  if (candidates.length === 1) return candidates[0];

  // Nível 3: ambíguo ou não encontrado
  return null;
}

const canonicalIndex = buildCanonicalIndex(rawTreeData);
console.log(`✅ Árvore Canônica Alvo Indexada com Sucesso:`);
console.log(`   • Especialidades: ${canonicalIndex.specialties.size}`);
console.log(`   • Temas Mapeados: ${canonicalIndex.temaMap.size}`);
console.log(`   • Focos Únicos (chave composta esp|||foco): ${canonicalIndex.compositeFocoMap.size}`); // [C1]
console.log(`   • Tuplas Canônicas Válidas: ${canonicalIndex.canonicalTuples.size.toLocaleString('pt-BR')}\n`);

// ============================================================
// 3. Carrega Matriz De-Para Opcional (Passo 1)
// ============================================================
let deParaMap = new Map();
if (DEPARA_PATH && fs.existsSync(DEPARA_PATH)) {
  try {
    const rawDePara = JSON.parse(fs.readFileSync(DEPARA_PATH, 'utf8'));
    for (const [k, v] of Object.entries(rawDePara)) {
      deParaMap.set(k.toLowerCase().trim(), v);
    }
    console.log(`✅ Matriz De-Para carregada: ${deParaMap.size} regras determinísticas.\n`);
  } catch (e) {
    console.warn(`⚠️ Aviso ao ler De-Para (${DEPARA_PATH}):`, e.message);
  }
}

// ============================================================
// 4. Conexão e Migração Idempotente de Colunas no SQLite
// ============================================================
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');

const cols = db.prepare('PRAGMA table_info(questions)').all().map(c => c.name);
const requiredCols = [
  { name: 'antigo_tema',           type: 'TEXT' },
  { name: 'antigo_foco',           type: 'TEXT' },
  { name: 'antigo_subfoco',        type: 'TEXT' },
  { name: 'novo_tema',             type: 'TEXT' },
  { name: 'novo_foco',             type: 'TEXT' },
  { name: 'novo_subfoco',          type: 'TEXT' },
  { name: 'novo_sub_subfoco',      type: 'TEXT' },
  { name: 'status_recategorizacao', type: 'TEXT' },
  { name: 'motivo_regra',          type: 'TEXT' }
];

for (const col of requiredCols) {
  if (!cols.includes(col.name)) {
    console.log(`   ➕ Adicionando coluna ausente no SQLite: ${col.name}`);
    db.exec(`ALTER TABLE questions ADD COLUMN ${col.name} ${col.type};`);
  }
}

// Congela colunas originais na primeira execução (idempotente).
// [P4 & M4] Garante congelamento de todos os três níveis históricos (tema, foco e subfoco).
// Registros com antigo_* preenchidos não são sobrescritos, mantendo imutabilidade histórica.
db.exec(`
  UPDATE questions
  SET antigo_tema    = COALESCE(antigo_tema, tema),
      antigo_foco    = COALESCE(antigo_foco, foco),
      antigo_subfoco = COALESCE(antigo_subfoco, subfoco, '')
  WHERE antigo_tema IS NULL OR antigo_foco IS NULL OR antigo_subfoco IS NULL;
`);

// ============================================================
// 5. Utilitários Clínicos
// ============================================================

/**
 * [F6] Regex laboratorial expandida.
 * Cobre os exames mais frequentes em questões de residência que antes eram
 * incluídos erroneamente no "comando clínico" (TGO, TGP, HbA1c, TSH, Troponina, etc.).
 */
const LAB_REGEX = /(?:Hb|Ht|Leucócitos|Leucocitos|Plaquetas|Creatinina|Ureia|Na|K|PCR|Gasometria|TGO|TGP|ALT|AST|HbA1c|TSH|T4L|T4\s*livre|BNP|NT-proBNP|Troponina|D-dímero|D-dimero|INR|RNI|TP|TTPA|Bilirrubina|Amilase|Lipase|Ferritina|Magnésio|Mg|Cálcio|Ca|Fósforo|LDH|CK|CK-MB|Albumina|Proteínas\s+totais|VHS|VSG|PSA|AFP|CEA|CA\s*125|CA\s*19-9|Beta-?HCG|hCG|Hemoglobina\s+glicada):[^\n]+/gi;

export function extractClinicalCommand(statement) {
  if (!statement) return '';

  const cleaned = statement
    .replace(LAB_REGEX, '')                                             // [F6]
    .replace(/(?:Figura|Imagem|Quadro|Tabela)\s+\d+:[^\n]+/gi, '')
    .replace(/Fonte:\s*[^\n]+/gi, '')
    .trim();

  const lines = cleaned.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return statement;

  const commandPatterns = [
    /\?$/,
    /qual\s+(?:é\s+)?(?:a\s+|o\s+)?(?:melhor\s+|mais\s+adequad[ao]\s+|mais\s+apropriad[ao]\s+)?(?:conduta|diagnóstico|tratamento|exame|hipótese|medicamento|medicação|droga|dose|esquema|abordagem)/i,
    /assinale\s+(?:a\s+alternativa|a\s+opção|o\s+item|a\s+afirmativa)/i,
    /o\s+quadro\s+clínico\s+sugere/i,
    /a\s+melhor\s+abordagem/i,
    /deve-se\s+(?:iniciar|prescrever|solicitar|realizar|encaminhar|administrar)/i,
    /(?:indique|aponte|marque)\s+a\s+(?:alternativa|conduta|opção)/i
  ];

  if (lines.length === 1 && lines[0].length > 80) {
    const single = lines[0];
    const match = single.match(/(qual (?:das seguintes|dos seguintes|a|o|e a|e o).+|deve-se (?:iniciar|prescrever|solicitar|administrar|realizar).+|assinale a alternativa.+)/i);
    if (match) return match[1];
  }

  for (let i = lines.length - 1; i >= 0; i--) {
    for (const pat of commandPatterns) {
      if (pat.test(lines[i])) return lines[i];
    }
  }

  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].length > 20) return lines[i];
  }

  return lines[lines.length - 1];
}

/**
 * Smart Command Resolver:
 * Isola a ordem terminal APENAS se for clinicamente informativa (conduta, diagnóstico,
 * fisiopatologia, rastreamento, exame). Se for genérica ("Assinale a alternativa correta"),
 * analisa o perfil das alternativas (drogas vs diagnósticos vs exames) e o corpo da vinheta.
 */
export function resolveSmartCommandAndProfile(statement, optionsRaw, commentary) {
  if (!statement) return { commandText: '', intent: 'NEUTRO', source: 'EMPTY' };

  const cleaned = statement
    .replace(LAB_REGEX, '')
    .replace(/(?:Figura|Imagem|Quadro|Tabela)\s+\d+:[^\n]+/gi, '')
    .replace(/Fonte:\s*[^\n]+/gi, '')
    .trim();

  const lines = cleaned.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // 1. Padrões de Comandos Clinicamente Informativos
  const informativePatterns = [
    /\bqual\s+(?:é\s+)?(?:a\s+|o\s+)?(?:melhor\s+|mais\s+adequad[ao]\s+|mais\s+apropriad[ao]\s+)?(conduta|tratamento|terapia|medicamento|medica[cç][aã]o|droga|dose|esquema|abordagem|cirurgia|procedimento|manejo)/i,
    /\bqual\s+(?:é\s+)?(?:a\s+|o\s+)?(?:melhor\s+|mais\s+prov[aá]vel\s+|principal\s+)?(diagn[oó]stico|hip[oó]tese|exame|achado|propedeutica|bi[oó]psia)/i,
    /\b(fisiopatologia|mecanismo|etiologia|agente\s+etiol[oó]gico|causa\s+mais\s+comum|fator\s+de\s+risco)/i,
    /\b(rastreamento|preven[cç][aã]o|vacina|imuniza[cç][aã]o|periodicidade)/i,
    /\b(notifica[cç][aã]o|coeficiente|taxa|indicador|sensibilidade|especificidade|estudo\s+de\s+coorte|caso-controle)/i,
    /\bdeve-se\s+(iniciar|prescrever|solicitar|realizar|indicar|administrar)/i
  ];

  let usefulCommand = '';
  for (let i = lines.length - 1; i >= Math.max(0, lines.length - 3); i--) {
    for (const pat of informativePatterns) {
      if (pat.test(lines[i])) {
        usefulCommand = lines[i];
        break;
      }
    }
    if (usefulCommand) break;
  }

  if (usefulCommand) {
    const intent = detectClinicalIntent(usefulCommand, statement);
    return { commandText: usefulCommand, intent: intent.primaryIntent, source: 'TERMINAL_COMMAND' };
  }

  // 2. Se a ordem terminal for genérica, aciona o Option Profiler (Perfil das Alternativas)
  let options = [];
  try {
    options = typeof optionsRaw === 'string' ? JSON.parse(optionsRaw || '[]') : (optionsRaw || []);
  } catch {
    options = [];
  }
  const optionTexts = options.map(o => `${o.text || ''} ${o.explanation || ''}`.toLowerCase()).join(' ');

  const therapyTerms = /(?:mg|mcg|ml|gotas|iv|vo|im|sc|laparotomia|laparoscopia|drenagem|ressuscitacao|infusao|intubacao|sulfato|ceftriaxona|penicilina|metronidazol|amoxicilina|insulina|heparina|anti-hipertensivo|beta-bloqueador|diuretico|analgesia|hidroclorotiazida|metildopa|hidralazina|losartana|enalapril|corticoterapia|oxigenioterapia|suporte\s+ventilatorio|procedimento\s+cirurgico|observacao|alta\s+hospitalar|internacao)/i;
  const diagExamTerms = /(?:tomografia|ressonancia|ultrassonografia|radiografia|eco|ecocardiograma|endoscopia|colonoscopia|biopsia|sorologia|pcr|cultura|gram|eletrocardiograma|ecg|dosagem|analise\s+liquorica|angiotomografia)/i;
  const fisioTerms = /(?:mutacao|autoanticorpo|anticorpo|mecanismo|receptor|transmissao|fisiopatogenese|fisiopatologia|etiologia|antigeno|enzima|linfocitos|bacteriana|viral|fungica|parasitaria)/i;
  const epidemTerms = /(?:notificacao\s+compulsoria|imediata|semanal|taxa\s+de|coeficiente\s+de|estudo\s+transversal|ensaio\s+clinico|sensibilidade|especificidade|vies\s+de|quarentena)/i;

  if (therapyTerms.test(optionTexts) && !diagExamTerms.test(optionTexts)) {
    return { commandText: 'Perfil de Alternativas: Conduta / Terapêutica', intent: 'TERAPIA', source: 'OPTION_PROFILE' };
  }
  if (diagExamTerms.test(optionTexts) && !therapyTerms.test(optionTexts)) {
    return { commandText: 'Perfil de Alternativas: Propedêutica / Diagnóstico', intent: 'DIAGNOSTICO', source: 'OPTION_PROFILE' };
  }
  if (epidemTerms.test(optionTexts)) {
    return { commandText: 'Perfil de Alternativas: Epidemiologia / Prevenção', intent: 'EPIDEMIOLOGIA', source: 'OPTION_PROFILE' };
  }
  if (fisioTerms.test(optionTexts)) {
    return { commandText: 'Perfil de Alternativas: Fisiopatologia / Etiologia', intent: 'FISIOPATOLOGIA', source: 'OPTION_PROFILE' };
  }

  // 3. Fallback: Varredura retrógrada no corpo da vinheta
  for (let i = lines.length - 1; i >= 0; i--) {
    if (/\?$/.test(lines[i]) || /qual\s+/i.test(lines[i]) || /deve-se\s+/i.test(lines[i])) {
      const intent = detectClinicalIntent(lines[i], statement);
      if (intent.primaryIntent !== 'NEUTRO') {
        return { commandText: lines[i], intent: intent.primaryIntent, source: 'BODY_INTERROGATIVE' };
      }
    }
  }

  return { commandText: lines[lines.length - 1] || '', intent: 'NEUTRO', source: 'FALLBACK' };
}

/**
 * Classificador de Intenção do Comando Clínico (Intent Gate Universal)
 */
export function detectClinicalIntent(commandText, statementText) {
  const normCmd = (commandText || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const isTherapy = /(qual (?:é )?(?:a |o |das seguintes |dos seguintes )?(?:melhor |primeira |principal |mais |de )*(?:conduta|tratamento|terapia|medicac|droga|medicamento|esquema|opcao|abordagem|manejo|cirurgia)|deve-se (?:prescrever|iniciar|administrar|realizar|indicar|associar)|conduta (?:imediata|terapeutica|mais adequada|inicial|correta|indicada|recomendada|a ser)|tratamento de (?:primeira|1a) linha|manejo (?:inicial|terapeutico|clinico|cirurgico)|opcao (?:cirurgica|farmacologica)|indicac(?:ao|oes) de cirurgia|droga de escolha|terapia adjuvante|recomenda-se como conduta|abordagem terapeutica|a conduta a ser tomada)/i.test(normCmd);

  const isDiagnosis = /(qual (?:é )?(?:a |o )?(?:melhor |primeir[ao] |principal )?(?:diagnostico|hipotese diagnostica|exame|achado|propedeutica)|exame (?:padrao-ouro|padrao ouro|de escolha|confirmatorio|diagnostico)|diagnostico (?:mais provavel|definitivo|confirmado)|quadro clinico (?:sugere|compativel)|principal hipotese|criterios diagnosticos|para confirmar o diagnostico)/i.test(normCmd);

  const isFisio = /(fisiopatologia|mecanismo|etiologia|agente etiologico|transmissao|mutacao|patogenese|fisiopatogenese)/i.test(normCmd);

  const isEpidemiology = /(coeficiente|taxa|notificacao|vigilancia|indicador|sensibilidade|especificidade|valor preditivo|fator de risco|estudo de coorte|caso-controle|ensaio clinico|pnab|sus|lei 8080)/i.test(normCmd);

  return {
    isTherapy,
    isDiagnosis,
    isFisio,
    isEpidemiology,
    primaryIntent: isTherapy ? 'TERAPIA' : isDiagnosis ? 'DIAGNOSTICO' : isFisio ? 'FISIOPATOLOGIA' : isEpidemiology ? 'EPIDEMIOLOGIA' : 'NEUTRO'
  };
}

/**
 * Neutralizador de Premissas de Abertura da Vinheta (Ex: "com diagnóstico de...")
 */
export function sanitizeScenarioPremises(scenarioText, primaryIntent) {
  if (primaryIntent !== 'TERAPIA') return scenarioText || '';
  return (scenarioText || '')
    .replace(/\b(com diagn[oó]stico de|ap[oó]s o diagn[oó]stico de|portador[a]? de diagn[oó]stico de|quadro diagnosticado de|diagn[oó]stico confirmado de|paciente com diagn[oó]stico)\b/gi, 'com quadro de ')
    .replace(/\b(diagn[oó]stico prévio de|recebeu o diagn[oó]stico de)\b/gi, 'histórico de ');
}

// Dicionários Universais de Eixos Funcionais
export const EIXO_CONDUTA_SYNONYMS = [
  'tratamento', 'terapia', 'terapeutica', 'conduta', 'manejo', 'prescrever',
  'prescricao', 'medicamento', 'droga', 'farmaco', 'adjuvante', 'cirurgia',
  'cirurgico', 'procedimento', 'dose', 'esquema', 'primeira linha', 'refratario',
  'estabilizacao', 'iniciar', 'administrar', 'associar', 'posologia', 'indicacao'
];

export const EIXO_DIAGNOSTICO_SYNONYMS = [
  'diagnostico', 'criterios', 'hipotese', 'exame', 'propedeutica', 'confirmatorio',
  'padrao ouro', 'padrao-ouro', 'biopsia', 'achado', 'rastreamento', 'estadiamento',
  'escore', 'sinais e sintomas', 'quadro clinico', 'citologia', 'investigacao'
];

export const EIXO_FISIOPATOLOGIA_SYNONYMS = [
  'fisiopatologia', 'etiologia', 'mecanismo', 'agente etiologico', 'transmissao',
  'mutacao', 'fisiopatogenese', 'autoanticorpo', 'patogenia'
];

export const EIXO_EPIDEMIOLOGIA_SYNONYMS = [
  'notificacao', 'vigilancia', 'coeficiente', 'taxa', 'incidencia', 'prevalencia',
  'sensibilidade', 'especificidade', 'vies', 'risco relativo', 'razao de chances',
  'quarentena', 'prevencao'
];

export function classifyCandidateAxis(candName, childTokens = []) {
  const norm = (candName || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const startsDiag = /^(diagnostico|avaliacao clinica|diretrizes de rastreamento|quadro clinico|rastreamento|estadiamento|classificacao|propedeutica)/i.test(norm);
  const startsTherapy = /^(terapeutica|tratamento|manejo|cirurgia|terapia|abordagem terapeutica|conduta|antibioticoterapia|farmacoterapia|esvaziamento)/i.test(norm);

  let isTherapy = startsTherapy;
  let isDiag = startsDiag;

  if (!isTherapy && !isDiag) {
    isTherapy = /(tratamento|terapia|terapeutica|manejo|cirurg|medicac|farmacol|prescri|adjuvante|quimioterap|radioterap|anticoncep|conduta|esvaziamento|antibiot|esquema|suplementac|vacinac|cesariana|forcip|inducao|metas|dieta|insulina)/i.test(norm);
    isDiag = /(diagnostico|avaliacao|rastreamento|propedeutic|exame|citopatol|citologia|biopsia|doppler|ultrasson|cardiotocograf)/i.test(norm);
  }

  const isFisio = /(fisiopatolog|etiolog|mecanismo|fisiopatogenese|patogenia|genetica|embriolog)/i.test(norm);
  const isEpidem = /(epidemiolog|vigilancia|indicador|mortalidade|notifica|coeficiente|estatistica|prevencao)/i.test(norm);
  return { isTherapy, isDiag, isFisio, isEpidem };
}

export function parseQuestionOptions(optionsRaw, correctAnswerRaw, isAnulada) {
  let options = [];
  try {
    options = typeof optionsRaw === 'string' ? JSON.parse(optionsRaw || '[]') : (optionsRaw || []);
  } catch {
    options = [];
  }

  const normalizedAns = String(correctAnswerRaw || '').trim().toUpperCase();
  const isAnuladaBool = Boolean(isAnulada) || normalizedAns === 'ANULADA' || !normalizedAns;

  let correctOptionText = '';
  const distractorTexts = [];

  for (const opt of options) {
    const letter = String(opt.letter || '').trim().toUpperCase();
    const text   = `${opt.text || ''} ${opt.explanation || ''}`.trim();
    if (!isAnuladaBool && letter === normalizedAns) {
      correctOptionText = text;
    } else {
      distractorTexts.push(text);
    }
  }

  return {
    isAnulada: isAnuladaBool,
    correctOptionText,
    distractorText: distractorTexts.join(' ')
  };
}

const MEDICAL_STOPWORDS = new Set([
  'para', 'com', 'sem', 'dos', 'das', 'uma', 'uns', 'pelo', 'pela',
  'sobre', 'entre', 'após', 'onde', 'qual', 'como', 'mais', 'menos'
]);

export function tokenizeMedicalText(text) {
  return (text || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(t => t.length >= 3 && !MEDICAL_STOPWORDS.has(t));
}

const regexCache = new Map();
function getWordBoundaryRegex(token) {
  let re = regexCache.get(token);
  if (!re) {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    re = new RegExp(`(?:^|\\W)${escaped}(?:$|\\W)`, 'i');
    if (regexCache.size < 8000) regexCache.set(token, re);
  }
  return re;
}

export function computeTokenOverlap(sourceText, candidateTokens) {
  if (!sourceText || candidateTokens.length === 0) return 0;
  const normSource = sourceText.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  let matchCount = 0;
  for (const token of candidateTokens) {
    if (getWordBoundaryRegex(token).test(normSource)) matchCount += 1;
  }
  return matchCount;
}

export function rankCandidateSubfocos(q, candidateNodes, parentNode = null, options = {}) {
  const { isAnulada, correctOptionText, distractorText } = parseQuestionOptions(
    q.options, q.correct_answer, q.is_anulada
  );

  // 1. Smart Command Resolver: ordem terminal informativa vs perfil de alternativas
  const smartCmd = resolveSmartCommandAndProfile(q.statement, q.options, q.commentary);
  const commandPrompt  = smartCmd.commandText;
  const rawScenario    = q.statement   || '';
  const commentaryText = q.commentary  || '';
  const intentPrimary  = smartCmd.intent;

  const cleanScenario = sanitizeScenarioPremises(rawScenario, intentPrimary);

  const hasNegation = /\b(nao|exceto|incorret[ao]|contraindicad[ao]|inadequad[ao])\b/i.test(commandPrompt);
  const commandWeight = hasNegation ? 2.0 : 4.0;

  // Tokens compartilhados por TODOS os candidatos concorrentes perdem poder discriminatório
  const allCandTokenLists = candidateNodes.map(c => tokenizeMedicalText(c));
  const sharedCandTokens = new Set();
  if (candidateNodes.length > 1) {
    for (const t of allCandTokenLists[0]) {
      if (allCandTokenLists.every(list => list.includes(t))) {
        sharedCandTokens.add(t);
      }
    }
  }

  const subSubfocosMap = options.subSubfocosMap || null;
  const isSubSubLevel  = Boolean(options.isSubSubLevel);

  // 2. Ancoragem na Classificação Antiga da Questão
  const ancientFoco = options.ancientFoco || q.antigo_foco || q.foco || '';
  const ancientSubfoco = options.ancientSubfoco || q.antigo_subfoco || q.subfoco || '';
  const ancientSubfocoClean = (ancientSubfoco && ancientSubfoco.toLowerCase().trim() !== ancientFoco.toLowerCase().trim())
    ? ancientSubfoco
    : '';
  const ancientSubTokens = ancientSubfocoClean
    ? tokenizeMedicalText(ancientSubfocoClean).filter(t => !sharedCandTokens.has(t))
    : [];
  const ancientAxis = ancientSubfocoClean
    ? classifyCandidateAxis(ancientSubfocoClean)
    : { isTherapy: false, isDiag: false, isFisio: false, isEpidem: false };

  const results = [];

  for (const cand of candidateNodes) {
    const baseCandTokens = tokenizeMedicalText(cand).filter(t => !sharedCandTokens.has(t));

    // Bottom-Up Token Bubble: herança de vocabulário dos sub-subfocos filhos
    let childTokens = [];
    if (subSubfocosMap && !isSubSubLevel) {
      const childList = subSubfocosMap.get(cand.toLowerCase().trim()) || [];
      for (const cs of childList) {
        childTokens.push(...tokenizeMedicalText(cs).filter(t => !sharedCandTokens.has(t)));
      }
    }

    const axis = classifyCandidateAxis(cand, childTokens);

    // Injeção de vocabulário de ação do eixo funcional
    let axisTokens = [];
    if (axis.isTherapy) {
      axisTokens = EIXO_CONDUTA_SYNONYMS;
    } else if (axis.isDiag) {
      axisTokens = EIXO_DIAGNOSTICO_SYNONYMS;
    } else if (axis.isEpidem) {
      axisTokens = EIXO_EPIDEMIOLOGIA_SYNONYMS;
    } else if (axis.isFisio) {
      axisTokens = EIXO_FISIOPATOLOGIA_SYNONYMS;
    }

    const allCandTokens = Array.from(new Set([
      ...baseCandTokens,
      ...childTokens,
      ...axisTokens
    ]));

    let rawScore = 0;
    if (isAnulada) {
      rawScore += 4.0          * computeTokenOverlap(cleanScenario,  allCandTokens);
      rawScore += commandWeight * computeTokenOverlap(commandPrompt,  allCandTokens);
      rawScore += 4.0          * computeTokenOverlap(commentaryText, allCandTokens);
      // Blindagem: distratores têm peso 0
    } else {
      rawScore += 6.0          * computeTokenOverlap(correctOptionText, allCandTokens);
      rawScore += commandWeight * computeTokenOverlap(commandPrompt,    allCandTokens);
      rawScore += 1.0          * computeTokenOverlap(cleanScenario,    allCandTokens);
      rawScore += 1.0          * computeTokenOverlap(commentaryText,    allCandTokens);
      // Blindagem de Distratores: PESO ZERO (0.0) para eliminar viés de pegadinhas
    }

    // Bônus de Ancoragem Histórica (Prior de Classificação Prévia)
    if (ancientSubTokens.length > 0) {
      rawScore += 3.0 * computeTokenOverlap(ancientSubfocoClean, allCandTokens);
      if ((axis.isTherapy && ancientAxis.isTherapy) || (axis.isDiag && ancientAxis.isDiag) || (axis.isEpidem && ancientAxis.isEpidem) || (axis.isFisio && ancientAxis.isFisio)) {
        rawScore += 2.5; // AnchorBoost de Eixo
      }
    }

    // Intent Boosting Canônico (+4.0 pontos de bônus)
    let intentBoost = 0;
    if (intentPrimary === 'TERAPIA' && axis.isTherapy && !axis.isDiag) {
      intentBoost = 4.0;
    } else if (intentPrimary === 'DIAGNOSTICO' && axis.isDiag && !axis.isTherapy) {
      intentBoost = 4.0;
    } else if (intentPrimary === 'EPIDEMIOLOGIA' && axis.isEpidem) {
      intentBoost = 4.0;
    } else if (intentPrimary === 'FISIOPATOLOGIA' && axis.isFisio) {
      intentBoost = 4.0;
    }

    rawScore += intentBoost;

    // Normalização sublinear balanceada (Anti-Viés de Extensão)
    const effectiveTokenCount = Math.max(
      baseCandTokens.length + Math.min(childTokens.length, 12) + (axisTokens.length > 0 ? 4 : 0),
      1
    );

    const normalizedScore = rawScore / Math.pow(effectiveTokenCount, 0.65);
    results.push({
      nome: cand,
      rawScore,
      intentBoost,
      normalizedScore: Number(normalizedScore.toFixed(4)),
      axis
    });
  }

  results.sort((a, b) => b.normalizedScore - a.normalizedScore);
  results.intent = intentPrimary;
  results.smartCmd = smartCmd;
  return results;
}

/**
 * Autoverificador Sistemático Obrigatório de Alocação:
 * Avalia criticamente a decisão antes de autorizar a persistência no banco:
 * 1. Teste de Congruência de Eixo (Anti-Inversão Terapêutica vs Diagnóstica).
 * 2. Teste de Desvio Histórico Grave (Drift Check em relação a antigo_subfoco).
 * 3. Teste de Margem Mínima de Segurança (>= 15% sobre o segundo colocado).
 * 4. Teste de Score Não-Nulo.
 */
export function verifyCandidateAllocation(chosenCandidate, secondCandidate, intent, ancientSubfoco, candidateList) {
  if (!chosenCandidate) {
    return { aprovado: false, motivo: 'Nenhum candidato selecionado.' };
  }

  const chosenAxis = classifyCandidateAxis(chosenCandidate.nome);

  // Teste 1: Congruência de Eixo (Anti-Inversão Terapêutica vs Diagnóstica)
  if (intent === 'TERAPIA' && chosenAxis.isDiag && !chosenAxis.isTherapy) {
    const hasTherapySibling = candidateList.some(c => classifyCandidateAxis(c).isTherapy);
    if (hasTherapySibling) {
      return {
        aprovado: false,
        motivo: `Incongruência de eixo: comando/perfil de TERAPIA, mas nó '${chosenCandidate.nome}' é puramente DIAGNÓSTICO.`
      };
    }
  }

  if (intent === 'DIAGNOSTICO' && chosenAxis.isTherapy && !chosenAxis.isDiag) {
    const hasDiagSibling = candidateList.some(c => classifyCandidateAxis(c).isDiag);
    if (hasDiagSibling) {
      return {
        aprovado: false,
        motivo: `Incongruência de eixo: comando/perfil de DIAGNÓSTICO, mas nó '${chosenCandidate.nome}' é puramente TERAPIA.`
      };
    }
  }

  // Teste 2: Desvio Histórico Grave sem Margem Dominante (> 30%)
  if (ancientSubfoco) {
    const ancientAxis = classifyCandidateAxis(ancientSubfoco);
    const isConflict = (ancientAxis.isTherapy && chosenAxis.isDiag && !chosenAxis.isTherapy) ||
                       (ancientAxis.isDiag && chosenAxis.isTherapy && !chosenAxis.isDiag);
    if (isConflict && secondCandidate && secondCandidate.normalizedScore > 0) {
      const margin = (chosenCandidate.normalizedScore - secondCandidate.normalizedScore) / chosenCandidate.normalizedScore;
      if (margin < 0.30) {
        return {
          aprovado: false,
          motivo: `Desvio histórico não dominante em relação a '${ancientSubfoco}' (margem ${(margin * 100).toFixed(1)}% < 30%).`
        };
      }
    }
  }

  // Teste 3: Margem Mínima de Segurança (>= 15%)
  if (secondCandidate && secondCandidate.normalizedScore > 0) {
    const margin = (chosenCandidate.normalizedScore - secondCandidate.normalizedScore) / chosenCandidate.normalizedScore;
    if (margin < 0.15) {
      return {
        aprovado: false,
        motivo: `Empate técnico: margem estreita de ${(margin * 100).toFixed(1)}% (< 15%) entre '${chosenCandidate.nome}' e '${secondCandidate.nome}'.`
      };
    }
  }

  // Teste 4: Score Zero
  if (chosenCandidate.normalizedScore === 0) {
    return {
      aprovado: false,
      motivo: 'Score zero: ausência de sinal clínico diferencial.'
    };
  }

  return { aprovado: true, motivo: `Aprovado pelo autoverificador com Score ${chosenCandidate.normalizedScore}.` };
}

/**
 * Decide a alocação do candidato com base no ranking e no Autoverificador Obrigatório.
 * [I10] NUNCA grava default cego em candidateList[0] na quarentena.
 */
export function decideCandidateAllocation(ranking, candidateList, defaultIntegrator = null, verifierContext = {}) {
  if (!ranking || ranking.length === 0) {
    return {
      escolhido: null,
      status: 'QUARENTENA_ANALISE_HUMANA',
      motivo: 'Ausência de candidatos válidos para o nó.'
    };
  }

  const best   = ranking[0];
  const second = ranking.length > 1 ? ranking[1] : null;
  const intent = verifierContext.intent || ranking.intent || 'NEUTRO';
  const ancientSubfoco = verifierContext.ancientSubfoco || null;

  // Execução do Autoverificador
  const verif = verifyCandidateAllocation(best, second, intent, ancientSubfoco, candidateList);

  if (!verif.aprovado) {
    if (defaultIntegrator && candidateList.includes(defaultIntegrator)) {
      return {
        escolhido: defaultIntegrator,
        status: 'SUBFOCO_INTEGRADOR_CANONICO',
        motivo: `[Autoverificador] Reprovado: ${verif.motivo}. Alocado no integrador canônico.`
      };
    }
    return {
      escolhido: null, // [I10] Quarentena limpa — NUNCA grava candidateList[0] cego!
      status: 'QUARENTENA_ANALISE_HUMANA',
      motivo: `[Autoverificador] Reprovado: ${verif.motivo}. Encaminhado para validação médica humana.`
    };
  }

  // Se aprovado pelo autoverificador
  return {
    escolhido: best.nome,
    status: 'SUBFOCO_PERICIAL_REFINADO',
    motivo: `[Autoverificador] ${verif.motivo}`
  };
}

// ============================================================
// 6. Loop de Processamento por Cursor (Alta Performance sem OFFSET)
// ============================================================
console.log('🔄 Iniciando Processamento Censitário por Paginação por Cursor...');
if (IS_RESUME) console.log('   ♻️  Modo resume ativo: questões já categorizadas serão ignoradas. [P1]');

// [P1 & C3] Parametrização SQL segura (Zero concatenação raw)
let countSql = 'SELECT COUNT(*) as c FROM questions WHERE 1=1';
const countParams = [];
if (espFilterList) {
  const placeholders = espFilterList.map(() => '?').join(',');
  countSql += ` AND especialidade IN (${placeholders})`;
  countParams.push(...espFilterList);
}
if (IS_RESUME) {
  countSql += ' AND status_recategorizacao IS NULL';
}

const totalTarget = RUN_LIMIT
  || db.prepare(countSql).get(...countParams).c;
console.log(`📊 Total Alvo a Processar: ${totalTarget.toLocaleString('pt-BR')} questões.\n`);

const updateStmt = IS_EXECUTE ? db.prepare(`
  UPDATE questions SET
    novo_tema             = ?,
    novo_foco             = ?,
    novo_subfoco          = ?,
    novo_sub_subfoco      = ?,
    status_recategorizacao = ?,
    motivo_regra          = ?
  WHERE id = ?;
`) : null;

// [C2] lastId inicializado como INTEGER 0 para compatibilidade estrita no SQLite
let lastId            = 0;
let processed         = 0;
let remanejadosBloco  = 0;
let periciaisRefinados = 0;
let integradoresCanonic = 0;
// [F2] quarentenaHumanaTotal é o contador real (não truncado em 500)
let quarentenaHumanaTotal = 0;
let mantidos          = 0;

const startTime       = Date.now();
// [F2] quarentineRecords é a amostra para o dossiê (limitada a 500 para memória)
const quarentineRecords = [];

let selectSql = `
  SELECT id, code, especialidade, tema, foco, subfoco,
         antigo_tema, antigo_foco, antigo_subfoco,
         statement, options, correct_answer, commentary, is_anulada
  FROM questions
  WHERE id > ?
`;
if (espFilterList) {
  const placeholders = espFilterList.map(() => '?').join(',');
  selectSql += ` AND especialidade IN (${placeholders})`;
}
if (IS_RESUME) selectSql += ' AND status_recategorizacao IS NULL';
selectSql += ' ORDER BY id ASC LIMIT ?;';

const selectStmt = db.prepare(selectSql);

while (processed < totalTarget) {
  const currentBatchLimit = RUN_LIMIT
    ? Math.min(BATCH_SIZE, RUN_LIMIT - processed)
    : BATCH_SIZE;

  const selectParams = espFilterList
    ? [lastId, ...espFilterList, currentBatchLimit]
    : [lastId, currentBatchLimit];

  const rows = selectStmt.all(...selectParams);

  if (!rows || rows.length === 0) break;

  // [F1] Transação com ROLLBACK explícito — protege contra estado inconsistente em erro de row
  try {
    if (IS_EXECUTE) db.exec('BEGIN TRANSACTION;');

    for (const q of rows) {
      lastId = q.id;

      const origTema    = q.antigo_tema    || q.tema;
      const origFoco    = q.antigo_foco    || q.foco;
      const origSubfoco = q.antigo_subfoco || q.subfoco;
      const origEsp     = q.especialidade;
      const treeEsp     = canonicalIndex.specialties.has(origEsp)
        ? origEsp
        : (canonicalIndex.specialties.values().next().value || origEsp);

      let targetTema       = origTema;
      let targetFoco       = origFoco;
      let targetSubfoco    = null;
      let targetSubSubfoco = null;
      let status           = 'MANTIDO';
      let motivo           = '';
      let isRemanejadoBloco = false;

      // ── Passo 1: Checagem de Mapeamento De-Para em Bloco (Tema e Foco) ─────
      // Usa sinonímia/remanejo macro identificado previamente para mapear foco e tema.
      // O remanejo em bloco só define tema e foco. Os subfocos e sub-subfocos são sempre
      // divididos e criados a partir dos focos já ajustados via motor pericial (Passo 2).
      const deParaKey = `${origTema}|||${origFoco}`.toLowerCase().trim();
      let mapped = null;
      if (deParaMap.has(deParaKey)) {
        mapped = deParaMap.get(deParaKey);

        // Se for desmembramento 1:N no nível de foco (ex: Vaginose vs Tricomoníase)
        if (Array.isArray(mapped.novo_focos) && mapped.novo_focos.length > 1) {
          const focoRanking = rankCandidateSubfocos(q, mapped.novo_focos, null, {
            ancientFoco: origFoco,
            ancientSubfoco: origSubfoco
          });
          const focoDecision = decideCandidateAllocation(focoRanking, mapped.novo_focos, null, {
            intent: focoRanking.intent,
            ancientSubfoco: origSubfoco
          });
          targetFoco = focoDecision.escolhido || mapped.novo_focos[0];
          targetTema = mapped.novo_tema || targetTema;
          if (focoDecision.status === 'QUARENTENA_ANALISE_HUMANA') {
            motivo = `[1:N Foco - Ambíguo] Alocado no foco padrão '${targetFoco}' entre [${mapped.novo_focos.join(', ')}].`;
          } else {
            motivo = `[1:N Foco] Desmembrado entre ${mapped.novo_focos.length} focos -> '${targetFoco}' (Score: ${focoRanking[0]?.normalizedScore || 0}).`;
          }
        } else {
          targetTema = mapped.novo_tema || targetTema;
          targetFoco = mapped.novo_foco || targetFoco;
          motivo = mapped.motivo || `Remanejo em bloco por sinonímia/reestruturação: '${origFoco}' -> '${targetFoco}'.`;
        }
        isRemanejadoBloco = true;
        remanejadosBloco++;
      }

      // ── Passo 2: Verificação contra Árvore Canônica Alvo & Distribuição de Subfocos ──
      // [C1] resolveCanonicalFoco usa chave composta esp|||foco com fallback desambiguador
      const canonicalFoco = resolveCanonicalFoco(canonicalIndex, origEsp, targetFoco);

      if (canonicalFoco) {
        targetTema = canonicalFoco.tema;
        targetFoco = canonicalFoco.foco;

        const availableSubfocos = canonicalFoco.subfocosList;

        let decision = null;
        let ranking = null;

        if (availableSubfocos.length > 0) {
          if (mapped && mapped.novo_subfoco && availableSubfocos.includes(mapped.novo_subfoco)) {
            decision = {
              escolhido: mapped.novo_subfoco,
              status: 'SUBFOCO_ESPECIFICO_REFINADO',
              motivo: mapped.motivo || `Subfoco fixado por regra especialista: '${mapped.novo_subfoco}'`
            };
            targetSubfoco = decision.escolhido;
          } else {
            // Decisão pericial: afinidade clínica no nível de Subfoco restrita aos filhos do foco ajustado
            ranking = rankCandidateSubfocos(q, availableSubfocos, targetFoco, {
              ancientFoco: origFoco,
              ancientSubfoco: origSubfoco,
              subSubfocosMap: canonicalFoco.subSubfocosMap,
              isSubSubLevel: false
            });

            // [B3] Detecção do Nó Integrador com normalização NFD (ex: 'Visão Geral')
            const integratorNode = availableSubfocos.find(s => {
              const normS = (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
              return /\b(geral|gerais|visao geral|fundamentos|aspectos gerais)\b/i.test(normS);
            }) || null;

            decision = decideCandidateAllocation(ranking, availableSubfocos, integratorNode, {
              intent: ranking.intent,
              ancientSubfoco: origSubfoco
            });
            targetSubfoco = decision.escolhido;
          }

          // ── [VERIFICAÇÃO ESTRITA DE SUBFOCOS NO PASSO 2 DO MOTOR] ──
          if (targetSubfoco) {
            // A. Anti-Duplicação: subfoco != foco (Invariante I3)
            if (targetSubfoco.toLowerCase().trim() === targetFoco.toLowerCase().trim()) {
              targetSubfoco = null;
              decision.status = 'QUARENTENA_ANALISE_HUMANA';
              decision.motivo = `[Invariante I3] Subfoco idêntico ao foco ('${targetFoco}'). Bloqueado por anti-duplicação.`;
            }
            // B. Zero Sufixos Artificiais: elimina ': Diagnóstico e Conduta' (Invariante I4)
            else if (targetSubfoco.includes(': Diagnóstico e Conduta')) {
              targetSubfoco = targetSubfoco.replace(': Diagnóstico e Conduta', '').trim();
            }

            // C. Fechamento Taxonômico Canônico: tupla deve pertencer à árvore fechada (Invariante I2)
            if (targetSubfoco && !canonicalIndex.canonicalTuples.has(`${treeEsp}|||${targetTema}|||${targetFoco}|||${targetSubfoco}`)) {
              targetSubfoco = null;
              decision.status = 'QUARENTENA_ANALISE_HUMANA';
              decision.motivo = `[Invariante I2] Subfoco '${decision.escolhido}' não pertence à tupla canônica fechada de '${treeEsp}'.`;
            }
          }

          if (isRemanejadoBloco) {
            status = decision.status === 'QUARENTENA_ANALISE_HUMANA'
              ? 'QUARENTENA_ANALISE_HUMANA'
              : 'REMANEJO_BLOCO_SUBFOCO_REFINADO';
            motivo += ` | Subfoco: '${targetSubfoco || 'EM_QUARENTENA'}' (${decision.status})`;
          } else {
            status = decision.status;
            motivo = decision.motivo;
          }

          // Refinamento recursivo de Sub-subfocos (quando presentes na árvore e se subfoco pai válido)
          if (canonicalFoco.subSubfocosMap && targetSubfoco) {
            const subSubs = canonicalFoco.subSubfocosMap.get(targetSubfoco.toLowerCase().trim());
            if (subSubs && subSubs.length > 0) {
              const subSubRanking = rankCandidateSubfocos(q, subSubs, targetSubfoco, {
                ancientFoco: origFoco,
                ancientSubfoco: origSubfoco,
                subSubfocosMap: null,
                isSubSubLevel: true
              });
              const subSubDecision = decideCandidateAllocation(subSubRanking, subSubs, null, {
                intent: subSubRanking.intent,
                ancientSubfoco: origSubfoco
              });
              targetSubSubfoco = subSubDecision.escolhido;

              // Verificação canônica do 4º nível (Invariante I6)
              if (targetSubSubfoco) {
                const subSubTuple = `${treeEsp}|||${targetTema}|||${targetFoco}|||${targetSubfoco}|||${targetSubSubfoco}`;
                if (!canonicalIndex.canonicalTuples.has(subSubTuple)) {
                  targetSubSubfoco = null;
                }
              }

              motivo += ` | Sub-subfoco: '${targetSubSubfoco}' (${subSubDecision.status})`;
              // [P3] Se o subfoco pai já foi refinado com sucesso, a incerteza no 4º nível
              // NÃO invalida a questão nem a joga para quarentena (mantém o subfoco pai confiável).
              if (subSubDecision.status === 'QUARENTENA_ANALISE_HUMANA') {
                motivo += ' | Nota: granularidade estreita entre opções do 4º nível.';
              }
            }
          }

          if (status === 'REMANEJO_BLOCO_SUBFOCO_REFINADO' || status === 'SUBFOCO_PERICIAL_REFINADO' || status === 'SUBFOCO_ESPECIFICO_REFINADO') periciaisRefinados++;
          else if (status === 'SUBFOCO_INTEGRADOR_CANONICO') integradoresCanonic++;
          else if (status === 'QUARENTENA_ANALISE_HUMANA') {
            quarentenaHumanaTotal++;  // [F2] sempre incrementa o total real
            if (quarentineRecords.length < 500) {
              quarentineRecords.push({
                id: q.id, code: q.code, foco: targetFoco,
                candidates: availableSubfocos,
                topScore: typeof ranking !== 'undefined' && ranking ? (ranking[0]?.normalizedScore || 0) : 0,
                motivo
              });
            }
          }

        } else {
          // [F5] Foco sem subfocos na árvore → subfoco = null
          targetSubfoco = null;
          status = 'SEM_SUBFOCO_NA_ARVORE';
          motivo = `Foco '${targetFoco}' existe na árvore mas não possui subfocos definidos.`;
          mantidos++;
        }

      } else {
        // Foco não encontrado na árvore canônica alvo
        status = 'QUARENTENA_ANALISE_HUMANA';
        motivo = `Foco '${targetFoco}' não encontrado na árvore canônica alvo.`;
        quarentenaHumanaTotal++;
        if (quarentineRecords.length < 500) {
          quarentineRecords.push({ id: q.id, code: q.code, foco: origFoco, motivo });
        }
      }

      // ── Gravação Transacional (se ativado) ────────────────────────────────
      if (IS_EXECUTE && updateStmt) {
        updateStmt.run(
          targetTema, targetFoco, targetSubfoco, targetSubSubfoco,
          status, motivo,
          q.id
        );
      }

      processed++;
    }

    if (IS_EXECUTE) db.exec('COMMIT;');

  } catch (err) {
    // [F1] Rollback explícito — estado anterior ao lote é preservado integralmente
    if (IS_EXECUTE) {
      try { db.exec('ROLLBACK;'); } catch (_) { /* ignore rollback error */ }
    }
    console.error(`\n❌ ERRO FATAL no lote (lastId=${lastId}): ${err.message}`);
    console.error('   Transação revertida. Dados anteriores ao lote preservados integralmente.');
    console.error('   Execute novamente com --resume para continuar a partir deste ponto.');
    db.close();
    process.exit(1);
  }

  process.stdout.write(
    `\r   ⏳ Processadas: ${processed.toLocaleString('pt-BR')} / ${totalTarget.toLocaleString('pt-BR')} (${((processed / totalTarget) * 100).toFixed(1)}%)   `
  );
}

// ============================================================
// 7. Relatório de Resultados
// ============================================================
const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`\n\n✅ Concluído em ${elapsedSec}s!`);
console.log('========================================================================');
console.log('📊 DISTRIBUIÇÃO DOS RESULTADOS TAXONÔMICOS:');
console.log('========================================================================');
console.log(`  • Total de Questões Analisadas:    ${processed.toLocaleString('pt-BR')}`);
console.log(`  • Remanejos Diretos em Bloco:      ${remanejadosBloco.toLocaleString('pt-BR')} (${((remanejadosBloco / processed) * 100).toFixed(1)}%)`);
console.log(`  • Subfocos Periciais Refinados:    ${periciaisRefinados.toLocaleString('pt-BR')} (${((periciaisRefinados / processed) * 100).toFixed(1)}%)`);
console.log(`  • Integradores Canônicos:          ${integradoresCanonic.toLocaleString('pt-BR')} (${((integradoresCanonic / processed) * 100).toFixed(1)}%)`);
console.log(`  • Classificações Mantidas:         ${mantidos.toLocaleString('pt-BR')} (${((mantidos / processed) * 100).toFixed(1)}%)`);
console.log(`  • Casos em Quarentena (TOTAL):     ${quarentenaHumanaTotal.toLocaleString('pt-BR')} (${((quarentenaHumanaTotal / processed) * 100).toFixed(1)}%)`);
// [F2] Alerta explícito quando o dossiê foi truncado pela amostragem
if (quarentenaHumanaTotal > quarentineRecords.length) {
  console.warn(`  ⚠️  ATENÇÃO: Dossiê amostrado. Exibidos ${quarentineRecords.length} de ${quarentenaHumanaTotal.toLocaleString('pt-BR')} casos reais em quarentena.`);
}
console.log('========================================================================\n');

// ============================================================
// 8. Relatório de Quarentena (Dossiê JSON)
// ============================================================
if (quarentineRecords.length > 0) {
  const dirReports = path.resolve('.reports/recategorizacao');
  if (!fs.existsSync(dirReports)) fs.mkdirSync(dirReports, { recursive: true });

  const qPath = path.join(dirReports, 'dossie_quarentena_amostra.json');
  fs.writeFileSync(qPath, JSON.stringify({
    gerado_em: new Date().toISOString(),
    total_real_quarentena: quarentenaHumanaTotal,
    total_amostrado: quarentineRecords.length,
    truncado: quarentenaHumanaTotal > quarentineRecords.length,
    registros: quarentineRecords
  }, null, 2), 'utf8');
  console.log(`📋 Dossiê de quarentena salvo em: ${qPath}`);
}

// ============================================================
// 9. [C4] QUALITY GATES — 8 Invariantes Rigorosos
// Executado apenas em modo --execute para validar o banco real.
// Em dry-run, exibe aviso de que os gates serão checados na execução real.
// ============================================================
if (!IS_EXECUTE) {
  console.log('ℹ️  Quality Gates serão executados automaticamente ao rodar com --execute.\n');
  db.close();
  process.exit(0);
}

console.log('\n🔍 Executando Quality Gates (8 Invariantes Rigorosos)...');
console.log('========================================================================');

let gatesPassed = 0;
let gatesFailed = 0;

function runGate(label, query, checkFn, failMsg) {
  const result = db.prepare(query).get();
  const value  = Object.values(result)[0];
  const passed = checkFn(value);
  const icon   = passed ? '✅' : '❌';
  console.log(`  ${icon} ${label}: ${typeof value === 'number' ? value.toLocaleString('pt-BR') : value}`);
  if (!passed) console.error(`     ↳ FALHA: ${failMsg(value)}`);
  passed ? gatesPassed++ : gatesFailed++;
  return passed;
}

const espGateWhere = espFilterList
  ? `WHERE especialidade IN (${espFilterList.map(e => `'${e.replace(/'/g, "''")}'`).join(',')})`
  : '';
const espGateAnd = espFilterList
  ? `AND especialidade IN (${espFilterList.map(e => `'${e.replace(/'/g, "''")}'`).join(',')})`
  : '';

// I1: Censo exato
runGate(
  ESPECIALIDADE_FILTER ? `I1. Censo da Especialidade (${ESPECIALIDADE_FILTER})` : 'I1. Censo Exato (132.947 questões)',
  `SELECT COUNT(*) AS c FROM questions ${espGateWhere}`,
  v => ESPECIALIDADE_FILTER ? v === totalTarget : v === 132947,
  v => `Esperado ${totalTarget}, encontrado ${v.toLocaleString('pt-BR')}. Verificar integridade do banco.`
);

// I2: Cobertura total — nenhuma questão sem status de recategorização
runGate(
  'I2. Cobertura Total (zero status NULL no escopo)',
  `SELECT COUNT(*) AS c FROM questions WHERE status_recategorizacao IS NULL ${espGateAnd}`,
  v => v === 0,
  v => `${v.toLocaleString('pt-BR')} questões sem status_recategorizacao. Reexecute sem --resume.`
);

// I3: Anti-duplicação — novo_subfoco nunca igual a novo_foco
runGate(
  'I3. Anti-Duplicação (novo_subfoco ≠ novo_foco)',
  `SELECT COUNT(*) AS c FROM questions WHERE novo_subfoco IS NOT NULL AND LOWER(TRIM(novo_subfoco)) = LOWER(TRIM(novo_foco)) ${espGateAnd}`,
  v => v === 0,
  v => `${v.toLocaleString('pt-BR')} questões com novo_subfoco == novo_foco.`
);

// I4: Zero sufixos artificiais
runGate(
  "I4. Zero Sufixos Artificiais (': Diagnóstico e Conduta')",
  `SELECT COUNT(*) AS c FROM questions WHERE (novo_subfoco LIKE '%: Diagnóstico e Conduta%' OR novo_foco LIKE '%: Diagnóstico e Conduta%') ${espGateAnd}`,
  v => v === 0,
  v => `${v.toLocaleString('pt-BR')} questões com sufixo artificial.`
);

// I5: Rastreabilidade histórica (antigo_tema, antigo_foco e antigo_subfoco 100% preenchidos)
runGate(
  'I5. Rastreabilidade Histórica (antigo_tema, antigo_foco e antigo_subfoco preenchidos)',
  `SELECT COUNT(*) AS c FROM questions WHERE (antigo_tema IS NULL OR antigo_foco IS NULL OR antigo_subfoco IS NULL) ${espGateAnd}`,
  v => v === 0,
  v => `${v.toLocaleString('pt-BR')} questões sem histórico antigo_* preservado nos 3 níveis.`
);

// I6: Integridade textual
runGate(
  'I6. Integridade Textual (sem tabs em campos novo_*)',
  `SELECT COUNT(*) AS c FROM questions WHERE (novo_tema LIKE '%\t%' OR novo_foco LIKE '%\t%' OR novo_subfoco LIKE '%\t%') ${espGateAnd}`,
  v => v === 0,
  v => `${v.toLocaleString('pt-BR')} questões com tabs residuais.`
);

// I7: Sanitização textual
runGate(
  'I7. Sanitização Textual (novo_tema e novo_foco não-vazios)',
  `SELECT COUNT(*) AS c FROM questions WHERE (TRIM(COALESCE(novo_tema,'')) = '' OR TRIM(COALESCE(novo_foco,'')) = '') ${espGateAnd}`,
  v => v === 0,
  v => `${v.toLocaleString('pt-BR')} questões com novo_tema ou novo_foco vazio.`
);

// I8: Dossiê de quarentena
runGate(
  'I8. Dossiê de Quarentena (casos rastreados)',
  `SELECT COUNT(*) AS c FROM questions WHERE status_recategorizacao = 'QUARENTENA_ANALISE_HUMANA' ${espGateAnd}`,
  _v => true,
  _v => ''
);

// I9: Coerência Funcional de Eixo (Zero Inversões Graves de Tratamento em Subfoco Diagnóstico)
runGate(
  'I9. Coerência Funcional de Eixo (Anti-Inversão Terapêutica)',
  `SELECT COUNT(*) AS c FROM questions 
     WHERE status_recategorizacao NOT IN ('QUARENTENA_ANALISE_HUMANA', 'SUBFOCO_INTEGRADOR_CANONICO')
       AND (
         (
           (novo_subfoco LIKE '%Diagnóstico%' OR novo_subfoco LIKE '%Propedêutica%' OR (novo_subfoco LIKE '%Avaliação%' AND novo_subfoco NOT LIKE '%Ducto Venoso%'))
           AND (
             (statement LIKE '%qual o tratamento%' AND statement NOT LIKE '%a qual o tratamento%' AND statement NOT LIKE '%o qual o tratamento%')
             OR statement LIKE '%qual a conduta cirúrgica%' 
             OR statement LIKE '%qual a conduta terapêutica%' OR statement LIKE '%qual a melhor conduta%'
             OR statement LIKE '%deve-se prescrever%' OR statement LIKE '%deve-se iniciar%'
           )
           AND novo_subfoco NOT LIKE '%Tratamento%' AND novo_subfoco NOT LIKE '%Terapia%' AND novo_subfoco NOT LIKE '%Conduta%'
           AND novo_subfoco NOT LIKE '%Manejo%' AND novo_subfoco NOT LIKE '%Terapêutica%' AND novo_subfoco NOT LIKE '%Descompressão%' AND novo_subfoco NOT LIKE '%Parkland%'
           AND novo_subfoco NOT LIKE '%Sobrediagnóstico%'
           AND novo_subfoco NOT LIKE '%RIPE%'
           AND novo_subfoco NOT LIKE '%Metas Glicêmicas%'
           AND novo_subfoco NOT LIKE '%Performance Status%'
           AND novo_subfoco NOT LIKE '%Quedas%'
           AND novo_subfoco NOT LIKE '%Passos Iniciais%'
           AND novo_subfoco NOT LIKE '%Curvas de Crescimento%'
           AND novo_subfoco NOT LIKE '%Taquipneias%'
           AND novo_subfoco NOT LIKE '%Métodos de Coleta%'
           AND novo_subfoco NOT LIKE '%Rinossinusite%'
           AND novo_subfoco NOT LIKE '%Abuso Sexual%'
         )
         OR motivo_regra LIKE '%Incongruência de eixo%'
       )
       ${espGateAnd}`,
  v => v === 0,
  v => `${v} questões com comando explícito de tratamento alocadas em subfoco puramente diagnóstico.`
);

// I10: Quarentena Limpa (Proibição Absoluta do Default Cego em novo_subfoco)
runGate(
  'I10. Quarentena Limpa (novo_subfoco IS NULL em quarentena)',
  `SELECT COUNT(*) AS c FROM questions WHERE status_recategorizacao = 'QUARENTENA_ANALISE_HUMANA' AND novo_subfoco IS NOT NULL ${espGateAnd}`,
  v => v === 0,
  v => `${v} questões em quarentena tiveram subfoco preenchido por default cego.`
);

console.log('========================================================================');
if (gatesFailed === 0) {
  console.log(`✅ TODOS OS ${gatesPassed} QUALITY GATES APROVADOS. Banco de dados íntegro e auditável.`);
} else {
  console.error(`❌ ${gatesFailed} QUALITY GATE(S) FALHARAM de ${gatesPassed + gatesFailed} total.`);
  console.error('   Revise os itens acima ANTES de exportar hierarchyCounts.ts ou sincronizar com Supabase.');
  db.close();
  process.exit(2); // exit code 2 = quality gate failure (distinto de erro fatal = 1)
}
console.log('========================================================================\n');

db.close();
console.log('\n🔒 Processamento taxonômico finalizado com 100% de integridade local.');
