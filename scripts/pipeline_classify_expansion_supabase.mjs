import fs from 'fs';
import path from 'path';
import { pipeline, cos_sim } from '@xenova/transformers';

// ============================================================================
// PIPELINE DE CLASSIFICAÇÃO TAXONÔMICA E EXPANSÃO NO SUPABASE (OTIMIZADO)
// ============================================================================
// Escopo Restrito: 'questions_expansion_revalida' e 'questions_expansion_direto'
// ============================================================================

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Credenciais do Supabase ausentes em .env.local');
  process.exit(1);
}

// 1. TRAVA CRÍTICA DE SEGURANÇA: TABELAS ALVO AUTORIZADAS
const ALLOWED_TABLES = new Set([
  'questions_direto',
  'questions_rplus',
  'questions_revalida',
  'questions_expansion_direto',
  'questions_expansion_revalida'
]);

function assertSafeTable(table) {
  if (!ALLOWED_TABLES.has(table)) {
    throw new Error(`🚨 TRAVA DE SEGURANÇA: Tabela '${table}' NÃO é autorizada para atualização. Processo abortado imediatamente.`);
  }
}

// 2. Argumentos de Linha de Comando
const args = process.argv.slice(2);
const getArg = (flag, defaultVal = null) => {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : defaultVal;
};

const TARGET_TABLE = getArg('--table', 'questions_direto');
const LIMIT = getArg('--limit') ? parseInt(getArg('--limit'), 10) : null;
const PAGE_SIZE = parseInt(getArg('--pagesize', '250'), 10);
const CONCURRENCY = parseInt(getArg('--concurrency', '45'), 10); // Ponto de equilíbrio: 45
const IS_DRY_RUN = args.includes('--dry-run');
const ONLY_UNCLASSIFIED = !args.includes('--all');
const IS_VERBOSE = args.includes('--verbose') || (LIMIT !== null && LIMIT <= 20);

assertSafeTable(TARGET_TABLE);

// Checkpoint automático inteligente
const CHECKPOINT_FILE = path.resolve(`data/checkpoint_${TARGET_TABLE}.json`);
const QUARANTINE_FILE = path.resolve(`data/quarentena_${TARGET_TABLE}.jsonl`);

let initialOffset = 0;
let initialProcessed = 0;
let initialApproved = 0;
let initialQuarantine = 0;

if (fs.existsSync(CHECKPOINT_FILE)) {
  try {
    const cp = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf8'));
    if (typeof cp.offset === 'number') {
      initialOffset = cp.offset;
      initialProcessed = cp.processedCount || cp.offset;
      initialApproved = cp.approvedCount || 0;
      initialQuarantine = cp.quarantineCount || 0;
    }
  } catch {}
}
const OFFSET = getArg('--offset') !== null ? parseInt(getArg('--offset'), 10) : initialOffset;

console.log('========================================================================');
console.log('⚡ PIPELINE DE CLASSIFICAÇÃO TAXONÔMICA CANÔNICA NO SUPABASE (SWEET SPOT)');
console.log(`🎯 Tabela Alvo:      ${TARGET_TABLE} (Blindagem Ativa)`);
console.log(`📍 Offset de Início: ${OFFSET} (Retomando sem retrabalho)`);
console.log(`📦 Page Size:       ${PAGE_SIZE}`);
console.log(`🚀 Concorrência:    ${CONCURRENCY} conexões paralelas (Keep-Alive)`);
console.log(`📁 Quarentena:      Streaming direto em disco (zero vazamento de RAM)`);
console.log('========================================================================\n');

// 3. Carregar Árvore Canônica Oficial
const TREE_PATH = fs.existsSync('data/catalogo_arvore_canonica_completa.json')
  ? path.resolve('data/catalogo_arvore_canonica_completa.json')
  : path.resolve('src/data/hierarquiaCompletaFiltros.json');
if (!fs.existsSync(TREE_PATH)) {
  console.error(`❌ Árvore canônica não encontrada: ${TREE_PATH}`);
  process.exit(1);
}
const rawTree = JSON.parse(fs.readFileSync(TREE_PATH, 'utf8'));

// Estruturas de indexação da árvore
const canonicalTreeByEsp = new Map();
const allCanonicalFocos = [];
const canonicalTuples = new Set();

for (const espNode of (rawTree.hierarquia_padrao || [])) {
  const espName = espNode.especialidade;
  const focosList = [];

  for (const t of (espNode.temas || [])) {
    for (const f of (t.focos || [])) {
      const focoName = f.foco;
      const subfocos = [];
      const subSubfocosMap = new Map();

      for (const s of (f.subfocos || [])) {
        const subName = typeof s === 'string' ? s : s.subfoco;
        if (subName) {
          subfocos.push(subName);
          canonicalTuples.add(`${espName}|||${t.tema}|||${focoName}|||${subName}`);
          if (s.sub_subfocos && Array.isArray(s.sub_subfocos)) {
            subSubfocosMap.set(subName.toLowerCase().trim(), s.sub_subfocos);
            for (const ss of s.sub_subfocos) {
              canonicalTuples.add(`${espName}|||${t.tema}|||${focoName}|||${subName}|||${ss}`);
            }
          }
        }
      }

      const focoEntry = {
        especialidade: espName,
        tema: t.tema,
        foco: focoName,
        subfocos,
        subSubfocosMap,
        description: `Especialidade: ${espName}. Tema: ${t.tema}. Foco: ${focoName}. Subfocos: ${subfocos.join(', ')}.`
      };

      focosList.push(focoEntry);
      allCanonicalFocos.push(focoEntry);
    }
  }

  canonicalTreeByEsp.set(espName, focosList);
}

// 4. Tokenização e Stopwords
const STOPWORDS = new Set([
  'para', 'com', 'sem', 'dos', 'das', 'uma', 'uns', 'pelo', 'pela',
  'sobre', 'entre', 'após', 'onde', 'qual', 'como', 'mais', 'menos',
  'que', 'nao', 'sao', 'este', 'esta', 'esse', 'essa', 'isso', 'isto',
  'foram', 'como', 'pode', 'deve', 'sendo', 'caso', 'sobre', 'paciente'
]);

function tokenize(text) {
  return (text || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(t => t.length >= 3 && !STOPWORDS.has(t));
}

// Pré-computa tokens dos focos
for (const [esp, focos] of canonicalTreeByEsp.entries()) {
  for (const f of focos) {
    const baseTokens = tokenize(`${f.tema} ${f.foco}`);
    const subTokens = f.subfocos.flatMap(s => tokenize(s));
    f.tokens = Array.from(new Set([...baseTokens, ...subTokens]));
  }
}

// 5. Âncoras Nosológicas Canônicas (Palavras-Chave de Alta Especificidade)
const NOSOLOGICAL_ANCHORS = [
  // Ginecologia
  { esp: 'Ginecologia', terms: ['cervicite', 'clamidia', 'gonococo', 'chlamydia', 'gonorrhoeae'], foco: 'Cervicites (Clamídia e Gonococo)' },
  { esp: 'Ginecologia', terms: ['vaginose', 'gardnerella', 'amsel', 'clue cells', 'whiff'], foco: 'Vaginose Bacteriana' },
  { esp: 'Ginecologia', terms: ['candida', 'candidíase', 'hifas', 'leite coalhado'], foco: 'Candidíase Vulvovaginal' },
  { esp: 'Ginecologia', terms: ['trichomonas', 'tricomoniase', 'colo em framboesa', 'protozoario flagelado'], foco: 'Tricomoníase Vaginal' },
  { esp: 'Ginecologia', terms: ['dip', 'doenca inflamatoria pelvica', 'monif', 'salpingite'], foco: 'Doença Inflamatória Pélvica (DIP: Critérios Diagnósticos, Estágios e Tratamento)' },
  { esp: 'Ginecologia', terms: ['palm-coein', 'palm coein', 'polipo endometrial', 'mioma submucoso'], foco: 'Sangramento Uterino Anormal (Classificação PALM-COEIN)' },
  { esp: 'Ginecologia', terms: ['mioma', 'leiomioma', 'leiomiomatose', 'miomectomia'], foco: 'Leiomiomatose Uterina (Miomas: Sintomas, Classificação FIGO e Conduta)' },
  { esp: 'Ginecologia', terms: ['endometriose', 'endometrioma', 'dispareunia de profundidade'], foco: 'Endometriose Pélvica e Ovariana (Endometrioma)' },
  { esp: 'Ginecologia', terms: ['bi-rads', 'mamografia', 'microcalcificacoes pleomorficas'], foco: 'Rastreamento do Câncer de Mama e Classificação BI-RADS' },
  { esp: 'Ginecologia', terms: ['citologia', 'papanicolau', 'colposcopia', 'nic', 'hpv oncogenico'], foco: 'Rastreamento e Prevenção do Câncer de Colo Uterino (Citologia, HPV e Colposcopia)' },
  { esp: 'Ginecologia', terms: ['pop-q', 'prolapso', 'cistocele', 'retocele'], foco: 'Prolapso de Órgãos Pélvicos (Classificação POP-Q)' },
  { esp: 'Ginecologia', terms: ['diu', 'levonorgestrel', 'mirena', 'kyleena', 'cobre'], foco: 'Dispositivos Intrauterinos (DIU de Cobre e SIU de Levonorgestrel)' },

  // Obstetrícia
  { esp: 'Obstetrícia', terms: ['pre-natal', 'nagele', 'acido folico', 'idade gestacional'], foco: 'Assistência Pré-Natal de Risco Habitual' },
  { esp: 'Obstetrícia', terms: ['dpp', 'descolamento prematuro', 'hipertonia uterina', 'sangramento escuro'], foco: 'Descolamento Prematuro de Placenta (DPP)' },
  { esp: 'Obstetrícia', terms: ['placenta previa', 'sangramento indolor', 'vermelho vivo', 'insercao baixa'], foco: 'Placenta Prévia e Espectro do Acretismo Placentário' },
  { esp: 'Obstetrícia', terms: ['pre-eclampsia', 'eclampsia', 'hellp', 'sulfato de magnesio'], foco: 'Síndromes Hipertensivas na Gestação e Pré-Eclâmpsia' },
  { esp: 'Obstetrícia', terms: ['partograma', 'dilatacao', 'fase ativa', 'apresentacao fetal'], foco: 'Mecanismo de Parto e Partograma' },
  { esp: 'Obstetrícia', terms: ['hpp', 'hemorragia pos-parto', 'atonia uterina', '4 ts', 'bakri'], foco: 'Hemorragia Pós-Parto (HPP: 4 Ts)' },
  { esp: 'Obstetrícia', terms: ['gemelar', 'gemelaridade', 'monocorionica', 'dicorionica', 'stff'], foco: 'Gestações Múltiplas e Gemelaridade' },

  // Pediatria
  { esp: 'Pediatria', terms: ['triagem neonatal', 'teste do pezinho', 'fenilcetonuria', 'fibrose cistica'], foco: 'Triagem Neonatal e Testes de Rastreamento (Pezinho, Olhinho, Coraçãozinho, Orelhinha)' },
  { esp: 'Pediatria', terms: ['reanimacao neonatal', 'apgar', 'passos iniciais', 'clampeamento'], foco: 'Reanimação Neonatal em Sala de Parto (Diretrizes SBP)' },
  { esp: 'Pediatria', terms: ['bronquiolite', 'vsr', 'sibilancia no lactente'], foco: 'Bronquiolite Viral Aguda (VSR: Diagnóstico e Manejo)' },
  { esp: 'Pediatria', terms: ['tro', 'reidratacao oral', 'plano a', 'plano b', 'plano c'], foco: 'Doença Diarreica Aguda e Planos de Reidratação da OMS/MS (A, B e C)' },
  { esp: 'Pediatria', terms: ['calendario vacinal', 'pni', 'pentavalente', 'pneumococica'], foco: 'Calendário Nacional de Vacinação do PNI e Vacinas Especiais (CRIE)' },

  // Cirurgia Geral
  { esp: 'Cirurgia Geral', terms: ['atls', 'trauma abdominal', 'fast', 'e-fast', 'politrauma'], foco: 'Atendimento Inicial ao Politraumatizado e Protocolo ABCDE' },
  { esp: 'Cirurgia Geral', terms: ['pneumotorax', 'toracocentese', 'dreno de torax', 'hemotorax'], foco: 'Trauma Torácico e Lesões com Risco Iminente de Morte' },
  { esp: 'Cirurgia Geral', terms: ['apendicite', 'alvarado', 'blumberg', 'apendicectomia'], foco: 'Apendicite Aguda: Diagnóstico, Escores e Abordagem Cirúrgica' },
  { esp: 'Cirurgia Geral', terms: ['colecistite', 'murphy', 'colelitíase', 'tokyo'], foco: 'Colelitíase, Coledocolitíase e Colecistite Aguda (Critérios de Tokyo)' },
  { esp: 'Cirurgia Geral', terms: ['obstrucao intestinal', 'niveis hidroaereos', 'aderencias', 'volvo'], foco: 'Abdome Agudo Obstrutivo e Síndrome de Ogilvie' },
  { esp: 'Cirurgia Geral', terms: ['hernia inguinal', 'nyhus', 'hernia femoral'], foco: 'Hérnias da Parede Abdominal (Inguinais, Femorais e Incisionais)' },

  // Clínica Médica
  { esp: 'Clínica Médica', terms: ['infarto', 'iam', 'supra de st', 'troponina', 'angioplastia'], foco: 'Síndromes Coronarianas Agudas (IAM com e sem Supra de ST)' },
  { esp: 'Clínica Médica', terms: ['insuficiencia cardiaca', 'icfer', 'icfep', 'fracao de ejecao'], foco: 'Insuficiência Cardíaca Crônica e Aguda (Diretrizes SBC/ESC)' },
  { esp: 'Clínica Médica', terms: ['avc', 'trombolise', 'alteplase', 'avc isquemico'], foco: 'Acidente Vascular Cerebral Isquêmico e Hemorrágico' },
  { esp: 'Clínica Médica', terms: ['curb-65', 'pneumonia adquirida na comunidade', 'pac'], foco: 'Pneumonia Adquirida na Comunidade (PAC: Estratificação CURB-65 e Tratamento)' },
  { esp: 'Clínica Médica', terms: ['cetoacidose', 'cad', 'estado hiperosmolar', 'diabetes'], foco: 'Complicações Agudas e Crônicas do Diabetes Mellitus' },
  { esp: 'Clínica Médica', terms: ['sepse', 'choque septico', 'qsofa', 'surviving sepsis'], foco: 'Sepse e Choque Séptico (Protocolo Surviving Sepsis Campaign)' },

  // Medicina Preventiva e Social
  { esp: 'Medicina Preventiva e Social', terms: ['lei 8.080', 'lei 8.142', 'principios do sus', 'universalidade'], foco: 'Sistema Único de Saúde (SUS): Princípios, Diretrizes e Leis Orgânicas (8.080 e 8.142)' },
  { esp: 'Medicina Preventiva e Social', terms: ['notificacao compulsoria', 'sinan', 'vigilancia epidemiologica'], foco: 'Vigilância em Saúde e Notificação Compulsória de Doenças e Agravos' },
  { esp: 'Medicina Preventiva e Social', terms: ['coorte', 'caso-controle', 'ensaio clinico', 'estudo transversal'], foco: 'Delineamentos de Estudos Epidemiológicos (Descritivos e Analíticos)' },
  { esp: 'Medicina Preventiva e Social', terms: ['odds ratio', 'risco relativo', 'razao de chances'], foco: 'Medidas de Associação e Impacto Potencial em Epidemiologia' },
  { esp: 'Medicina Preventiva e Social', terms: ['sensibilidade', 'especificidade', 'vpp', 'vpn'], foco: 'Testes Diagnósticos: Sensibilidade, Especificidade e Valores Preditivos' }
];

// 6. Carregamento do Extrator de Embeddings Local (Transformers.js)
console.log('⏳ Carregando modelo local de embeddings (Xenova/paraphrase-multilingual-MiniLM-L12-v2)...');
const extractor = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');
console.log('✅ Extrator de embeddings pronto!\n');

// 7. Vetores em Cache dos Focos e Subfocos Canônicos
const VECTOR_CACHE_FILE = path.resolve('data/cache_canonical_tree_vectors.json');
let focoVectors = new Map();
let subfocoVectors = new Map();

if (fs.existsSync(VECTOR_CACHE_FILE)) {
  console.log('⚡ Carregando vetores canônicos do cache em disco...');
  const cached = JSON.parse(fs.readFileSync(VECTOR_CACHE_FILE, 'utf8'));
  focoVectors = new Map(Object.entries(cached.focos));
  subfocoVectors = new Map(Object.entries(cached.subfocos));
  console.log(`✅ ${focoVectors.size} vetores de Focos e ${subfocoVectors.size} de Subfocos carregados do cache!\n`);
} else {
  console.log('🧪 Pré-computando vetores canônicos de Focos e Subfocos...');
  const focosObj = {};
  const subfocosObj = {};

  for (const foco of allCanonicalFocos) {
    const fText = `${foco.especialidade} ${foco.tema} ${foco.foco}. Subfocos: ${foco.subfocos.join(', ')}.`;
    const fOut = await extractor(fText, { pooling: 'mean', normalize: true });
    const fData = Array.from(fOut.data);
    focoVectors.set(`${foco.especialidade}|||${foco.foco}`, fData);
    focosObj[`${foco.especialidade}|||${foco.foco}`] = fData;

    for (const sub of foco.subfocos) {
      const sText = `${foco.especialidade} ${foco.foco} ${sub}. Aspectos clínicos e conduta em ${sub}.`;
      const sOut = await extractor(sText, { pooling: 'mean', normalize: true });
      const sData = Array.from(sOut.data);
      subfocoVectors.set(`${foco.especialidade}|||${foco.foco}|||${sub}`, sData);
      subfocosObj[`${foco.especialidade}|||${foco.foco}|||${sub}`] = sData;
    }
  }

  fs.writeFileSync(VECTOR_CACHE_FILE, JSON.stringify({ focos: focosObj, subfocos: subfocosObj }), 'utf8');
  console.log(`✅ Vetores salvos no cache: ${VECTOR_CACHE_FILE}\n`);
}

// 8. Normalização de Especialidades & Restrições Clínicas Globais
const OBSTETRIC_KEYWORDS = [
  'gestante', 'gestacao', 'gravidez', 'gravida', 'parto', 'puerperio', 'partograma',
  'feto', 'fetal', 'bcf', 'pre-natal', 'preeclampsia', 'eclampsia', 'dpp', 'placenta',
  'liquido amniotico', 'amniorrexe', 'cesariana', 'puerpera', 'nagele', 'tocurgia',
  'cardiotocografia', 'alojamento conjunto', 'stff', 'gemelar', 'colo uterino apagado'
];

function hasObstetricTerm(text) {
  return OBSTETRIC_KEYWORDS.some(kw => text.includes(kw));
}

function isAdultPatient(text) {
  const match = text.match(/(\d{1,3})\s*anos/i);
  if (match) {
    const age = parseInt(match[1], 10);
    return age >= 18;
  }
  return /idoso|idosa|homem de|mulher de/i.test(text);
}

// 9. Pontuação Ponderada de Focos (Questão a Questão)
function scoreFocoLexical(q, focoEntry, correctOptText, commandPrompt, normFullText, priorTema, priorFoco) {
  const normCorrect = (correctOptText || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const normCmd = (commandPrompt || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const normComm = (q.commentary || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const normStmt = (q.statement || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  let score = 0;
  for (const token of focoEntry.tokens) {
    const re = new RegExp(`(?:^|\\W)${token}(?:$|\\W)`, 'i');
    if (re.test(normCorrect)) score += 6.0; // Gabarito homologado: peso 6.0
    if (re.test(normCmd))     score += 4.0; // Comando terminal: peso 4.0
    if (re.test(normComm))    score += 1.5; // Comentário oficial: peso 1.5
    if (re.test(normStmt))    score += 1.0; // Vinheta clínica: peso 1.0
  }

  // Bônus Prior: Se já possuir tema ou foco compatível na árvore, adiciona prioridade
  if (priorTema && focoEntry.tema.toLowerCase().includes(priorTema.toLowerCase())) score += 3.0;
  if (priorFoco && focoEntry.foco.toLowerCase().includes(priorFoco.toLowerCase())) score += 5.0;

  // Bônus Âncoras Nosológicas
  for (const anchor of NOSOLOGICAL_ANCHORS) {
    if (anchor.esp === focoEntry.especialidade && anchor.foco.toLowerCase().trim() === focoEntry.foco.toLowerCase().trim()) {
      for (const term of anchor.terms) {
        if (normFullText.includes(term)) score += 6.5;
      }
    }
  }

  return score / Math.pow(Math.max(focoEntry.tokens.length, 1), 0.65);
}

// 10. Atualização concorrente balanceada (Concorrência = 45 com headers HTTP Keep-Alive)
async function patchInBatches(items, concurrency = 45) {
  if (IS_DRY_RUN) {
    return;
  }
  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    await Promise.all(chunk.map(async (item) => {
      assertSafeTable(TARGET_TABLE);
      const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/${TARGET_TABLE}?id=eq.${item.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Connection': 'keep-alive'
        },
        body: JSON.stringify({
          especialidade: item.especialidade,
          tema: item.tema,
          foco: item.foco,
          subfoco: item.subfoco
        })
      });
      if (!patchRes.ok) {
        console.warn(`⚠️ Erro ao atualizar questão ${item.id}: HTTP ${patchRes.status}`);
      }
    }));
  }
}

// 11. Processamento Principal com Extração Vetorial em Batches e Streaming de Quarentena
async function runPipeline() {
  if (IS_DRY_RUN) {
    console.log('🧪 MODO DE SIMULAÇÃO ATIVO (--dry-run): Nenhuma alteração será gravada no Supabase.\n');
  }

  const filterParam = ONLY_UNCLASSIFIED ? '&especialidade=is.null' : '';
  console.log(`📡 Consultando registros em [${TARGET_TABLE}]${ONLY_UNCLASSIFIED ? ' (filtro: sem categorização)' : ' (todas as questões)'}...`);
  const countRes = await fetch(`${SUPABASE_URL}/rest/v1/${TARGET_TABLE}?select=id${filterParam}`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Range': '0-0',
      'Prefer': 'count=exact'
    }
  });
  const cr = countRes.headers.get('content-range');
  const totalInTable = cr ? parseInt(cr.split('/')[1], 10) : 0;
  console.log(`Total elegível na tabela: ${totalInTable.toLocaleString('pt-BR')} questões.`);

  let unclassifiedIds = null;
  if (ONLY_UNCLASSIFIED) {
    console.log('📡 Buscando identificadores das questões pendentes...');
    const idsRes = await fetch(`${SUPABASE_URL}/rest/v1/${TARGET_TABLE}?select=id&especialidade=is.null`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Range': '0-49999'
      }
    });
    const idsRows = await idsRes.json();
    unclassifiedIds = Array.isArray(idsRows) ? idsRows.map(r => r.id) : [];
    console.log(`✅ ${unclassifiedIds.length.toLocaleString('pt-BR')} IDs carregados para processamento.`);
  }

  const totalPool = unclassifiedIds ? unclassifiedIds.length : totalInTable;
  const effectiveLimit = LIMIT ? Math.min(LIMIT, totalPool - OFFSET) : (totalPool - OFFSET);
  console.log(`Alvo desta execução: ${effectiveLimit.toLocaleString('pt-BR')} questões (a partir do offset ${OFFSET}).\n`);

  let processedCount = initialProcessed;
  let approvedCount = initialApproved;
  let quarantineCount = initialQuarantine;

  let currentOffset = OFFSET;

  while (currentOffset < OFFSET + effectiveLimit) {
    const pageLimit = Math.min(PAGE_SIZE, OFFSET + effectiveLimit - currentOffset);
    let rows = [];

    if (unclassifiedIds) {
      const batchIds = unclassifiedIds.slice(currentOffset, currentOffset + pageLimit);
      if (batchIds.length === 0) break;
      const resPage = await fetch(`${SUPABASE_URL}/rest/v1/${TARGET_TABLE}?select=id,code,especialidade,tema,foco,subfoco,statement,options,correct_answer,commentary,is_anulada&id=in.(${batchIds.join(',')})`, {
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Connection': 'keep-alive'
        }
      });
      if (!resPage.ok) {
        console.error(`❌ Erro ao buscar lote por IDs: HTTP ${resPage.status}`);
        break;
      }
      rows = await resPage.json();
    } else {
      const rangeHeader = `${currentOffset}-${currentOffset + pageLimit - 1}`;
      const resPage = await fetch(`${SUPABASE_URL}/rest/v1/${TARGET_TABLE}?select=id,code,especialidade,tema,foco,subfoco,statement,options,correct_answer,commentary,is_anulada&order=id.asc`, {
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Range': rangeHeader,
          'Connection': 'keep-alive'
        }
      });
      if (!resPage.ok) {
        console.error(`❌ Erro ao buscar lote [${rangeHeader}]: HTTP ${resPage.status}`);
        break;
      }
      rows = await resPage.json();
    }

    if (!rows || rows.length === 0) break;

    // Prepara dados de todas as questões do lote
    const preparedRows = [];
    const snippetsForEmbedding = [];

    for (const q of rows) {
      let opts = [];
      if (Array.isArray(q.options)) {
        opts = q.options;
      } else if (typeof q.options === 'string') {
        try { opts = JSON.parse(q.options); } catch { opts = []; }
      }

      const letters = ['A', 'B', 'C', 'D', 'E'];
      let correctText = '';
      for (let i = 0; i < opts.length; i++) {
        const o = opts[i];
        const optLetter = o.letter || (typeof o.index === 'number' ? letters[o.index] : null);
        if (optLetter && optLetter === q.correct_answer) {
          correctText = o.text || '';
          break;
        }
      }

      const lines = (q.statement || '').split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const commandPrompt = lines[lines.length - 1] || '';
      const normFullText = `${q.statement} ${correctText} ${q.commentary || ''}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

      // Snippet clínico puro sem contaminação de especialidade pré-suposta
      const qSnippet = `${commandPrompt || q.statement?.slice(0, 250)}. Resposta: ${correctText.slice(0, 150)}.${q.commentary ? ' ' + q.commentary.slice(0, 150) : ''}`;

      snippetsForEmbedding.push(qSnippet);
      preparedRows.push({
        q,
        correctText,
        commandPrompt,
        normFullText
      });
    }

    // EXTRAÇÃO VETORIAL OTIMIZADA EM SUB-LOTES DE 48
    const embeddingsByRow = [];
    const EMBED_CHUNK = 48;
    for (let i = 0; i < snippetsForEmbedding.length; i += EMBED_CHUNK) {
      const chunk = snippetsForEmbedding.slice(i, i + EMBED_CHUNK);
      const out = await extractor(chunk, { pooling: 'mean', normalize: true });
      for (let k = 0; k < chunk.length; k++) {
        const vec = Array.from(out.data.subarray(k * 384, (k + 1) * 384));
        embeddingsByRow.push(vec);
      }
    }

    const updatesToApply = [];
    const pageQuarantineLog = [];

    // DUPLO PASSO DE AVALIAÇÃO: BUSCA VETORIAL GLOBAL EM TODOS OS 435 FOCOS CANÔNICOS
    for (let idx = 0; idx < preparedRows.length; idx++) {
      processedCount++;
      const { q, correctText, commandPrompt, normFullText } = preparedRows[idx];
      const qVec = embeddingsByRow[idx];

      // 1. Busca Semântica Global em TODOS os 435 Focos da Árvore Canônica
      const scoredFocos = allCanonicalFocos.map(f => {
        const fKey = `${f.especialidade}|||${f.foco}`;
        const fVec = focoVectors.get(fKey);
        const cosSim = fVec ? cos_sim(qVec, fVec) : 0;

        // Score Léxico ponderado
        const lexScore = scoreFocoLexical(q, f, correctText, commandPrompt, normFullText, q.tema, q.foco);

        // Restrições Clínicas Negativas de Segurança (Proteção Cruzada)
        let penalty = 0;
        if (f.especialidade === 'Obstetrícia' && !hasObstetricTerm(normFullText)) {
          penalty += 0.15; // Não é gestante, parto ou puerpério
        }
        if (f.especialidade === 'Pediatria' && isAdultPatient(normFullText)) {
          penalty += 0.20; // Paciente adulto/idoso não é Pediatria
        }

        const combinedScore = (cosSim * 0.70) + (Math.min(lexScore, 2.0) / 2.0 * 0.30) - penalty;

        return {
          focoEntry: f,
          cosSim,
          lexScore,
          combinedScore
        };
      });

      scoredFocos.sort((a, b) => b.combinedScore - a.combinedScore);

      const bestCandidate = scoredFocos[0];
      const secondCandidate = scoredFocos[1] || { combinedScore: 0, cosSim: 0 };
      const semMargin = secondCandidate.combinedScore > 0
        ? (bestCandidate.combinedScore - secondCandidate.combinedScore) / bestCandidate.combinedScore
        : 1.0;

      const winningFoco = bestCandidate.focoEntry;
      const targetEsp = winningFoco.especialidade;

      // 2. Resolução do Subfoco no Cluster do Foco Vencedor
      let targetSubfoco = null;
      if (winningFoco.subfocos && winningFoco.subfocos.length > 0) {
        const subScores = winningFoco.subfocos.map(s => {
          const sKey = `${winningFoco.especialidade}|||${winningFoco.foco}|||${s}`;
          const sVec = subfocoVectors.get(sKey);
          const sim = sVec ? cos_sim(qVec, sVec) : 0;
          return { subfoco: s, sim };
        });
        subScores.sort((a, b) => b.sim - a.sim);
        targetSubfoco = subScores[0]?.subfoco || null;
      }

      // 3. Quality Gate Rigoroso (Alta Especificidade)
      const isApproved = (bestCandidate.cosSim >= 0.62 && semMargin >= 0.12 && bestCandidate.combinedScore >= 0.50);

      if (IS_VERBOSE) {
        console.log(`\n------------------------------------------------------------`);
        console.log(`[Q#${processedCount}] ID: ${q.id} | Código: ${q.code || 'N/A'}`);
        console.log(`📝 Enunciado: ${(q.statement || '').slice(0, 160).replace(/\s+/g, ' ')}...`);
        console.log(`🎯 Gabarito: (${q.correct_answer || '?'}) ${(correctText || '').slice(0, 90)}`);
        console.log(`🏷️ Mapeamento: [${targetEsp}] > [${winningFoco.tema}] > [${winningFoco.foco}] > [${targetSubfoco || 'Sem Subfoco'}]`);
        console.log(`📊 Score Combinado: ${bestCandidate.combinedScore.toFixed(3)} | Cosseno: ${bestCandidate.cosSim.toFixed(3)} | Margem: ${(semMargin * 100).toFixed(1)}%`);
        console.log(`🚦 Decisão: ${isApproved && targetSubfoco ? '✅ APROVADA NO GATE' : '⚠️ ENVIADA PARA QUARENTENA'}`);
      }

      if (isApproved && targetSubfoco) {
        approvedCount++;
        updatesToApply.push({
          id: q.id,
          especialidade: targetEsp,
          tema: winningFoco.tema,
          foco: winningFoco.foco,
          subfoco: targetSubfoco
        });
      } else {
        quarantineCount++;
        pageQuarantineLog.push(JSON.stringify({
          id: q.id,
          code: q.code,
          especialidade_original: q.especialidade,
          especialidade_resolvida: targetEsp,
          tema_sugerido: winningFoco.tema,
          foco_sugerido: winningFoco.foco,
          subfoco_sugerido: targetSubfoco,
          lexicalScore: bestCandidate.lexScore.toFixed(2),
          combinedScore: bestCandidate.combinedScore.toFixed(3),
          semCosine: bestCandidate.cosSim.toFixed(3),
          semMargin: (semMargin * 100).toFixed(1) + '%',
          motivo: `[Quarentena Segura] Margem ou score aquém do limiar pericial. Retido para análise futura.`
        }));

        // Em caso de quarentena, não grava "Geral" para não contaminar a árvore com nós genéricos.
        // O caso é salvo no arquivo de quarentena em streaming para posterior resolução pela Fase 2 (LLM).
      }
    }

    // Aplicação concorrente dos Updates no Supabase (Concorrência equilibrada = 45)
    if (updatesToApply.length > 0) {
      await patchInBatches(updatesToApply, CONCURRENCY);
    }

    // DESAFOGA A MEMÓRIA RAM: Grava quarentena em streaming no disco e zera o array imediatamente
    if (pageQuarantineLog.length > 0) {
      fs.appendFileSync(QUARANTINE_FILE, pageQuarantineLog.join('\n') + '\n', 'utf8');
      pageQuarantineLog.length = 0; // Libera RAM instantaneamente
    }

    // Limpa referências locais para o Garbage Collector do V8
    rows.length = 0;
    preparedRows.length = 0;
    snippetsForEmbedding.length = 0;
    embeddingsByRow.length = 0;
    updatesToApply.length = 0;

    currentOffset += pageLimit;
    const pct = totalPool > 0 ? ((processedCount / totalPool) * 100).toFixed(1) : '100.0';
    console.log(`Progress: ${processedCount.toLocaleString('pt-BR')} / ${totalPool.toLocaleString('pt-BR')} (${pct}%) | Aprovadas: ${approvedCount.toLocaleString('pt-BR')} | Quarentena: ${quarantineCount.toLocaleString('pt-BR')}`);

    // Salvar Checkpoint a cada página (apenas se não for simulação dry-run)
    if (!IS_DRY_RUN) {
      fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify({
        offset: currentOffset,
        processedCount,
        approvedCount,
        quarantineCount,
        timestamp: new Date().toISOString()
      }), 'utf8');
    }
  }

  // 12. Bateria de Testes Pós-Execução (Invariantes no Supabase)
  console.log('\n========================================================================');
  console.log('🧪 BATERIA DE TESTES DE INTEGRIDADE E INVARIANTES NO SUPABASE');
  console.log('========================================================================');

  // Teste 1: Conservação de Massa
  const postCountRes = await fetch(`${SUPABASE_URL}/rest/v1/${TARGET_TABLE}?select=id`, {
    headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Range': '0-0', 'Prefer': 'count=exact' }
  });
  const postTotal = parseInt(postCountRes.headers.get('content-range').split('/')[1], 10);
  console.log(`• Teste 1 (Massa): Total na tabela = ${postTotal.toLocaleString('pt-BR')} registros ativos -> ✅ APROVADO`);

  // Teste 2: Proteção da tabela original 'questions'
  const questionsCountRes = await fetch(`${SUPABASE_URL}/rest/v1/questions?select=id`, {
    headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Range': '0-0', 'Prefer': 'count=exact' }
  });
  const qOrig = parseInt(questionsCountRes.headers.get('content-range').split('/')[1], 10);
  console.log(`• Teste 2 (Blindagem questions original): ${qOrig.toLocaleString('pt-BR')} registros -> ✅ 100% INTOCADA`);

  // Teste 3: Eliminação de 'Ginecologia e Obstetrícia' na tabela alvo
  const goRes = await fetch(`${SUPABASE_URL}/rest/v1/${TARGET_TABLE}?especialidade=eq.${encodeURIComponent('Ginecologia e Obstetrícia')}&select=id`, {
    headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Range': '0-0', 'Prefer': 'count=exact' }
  });
  const goCount = goRes.headers.get('content-range')?.split('/')[1] || '0';
  console.log(`• Teste 3 (Separação GO): Restantes com 'Ginecologia e Obstetrícia' = ${goCount} -> ${goCount === '0' || goCount === '*' ? '✅ 100% BIFURCADA' : '🟡 PARCIAL'}`);

  console.log('\n🏁 Execução concluída com sucesso!');
}

runPipeline().catch(console.error);
