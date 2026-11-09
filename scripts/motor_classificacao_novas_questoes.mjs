import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

/**
 * ========================================================================
 * MOTOR MESTRE DE CLASSIFICAÇÃO TAXONÔMICA PARA NOVAS QUESTÕES
 * Plataforma Banco Residência Médica — Pipeline Canônico Universal
 * ========================================================================
 * 
 * Funcionalidade:
 *   Recebe questões brutas ou não categorizadas (com apenas Especialidade)
 *   e realiza a classificação top-down completa, determinística e auditável:
 *   Especialidade -> Tema -> Foco -> Subfoco -> Sub-subfoco.
 * 
 * Uso:
 *   node scripts/motor_classificacao_novas_questoes.mjs --help
 *   node scripts/motor_classificacao_novas_questoes.mjs [--especialidade <nome>] [--execute] [--limit <n>]
 */

// 1. Parsing de Argumentos da Linha de Comando (CLI)
const args = process.argv.slice(2);
const getArg = (flag, defaultVal = null) => {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : defaultVal;
};
const hasFlag = (flag) => args.includes(flag);

if (hasFlag('--help') || hasFlag('-h')) {
  console.log(`
Motor Mestre de Classificação Taxonômica para Novas Questões

Opções:
  --tree <caminho>          Caminho para o JSON da árvore canônica oficial (Padrão: data/catalogo_arvore_canonica_completa.json)
  --db <caminho>            Caminho para o banco SQLite (Padrão: data/questoes_132k.db)
  --especialidade <nome>    Filtra estritamente por uma especialidade (Ex: Ginecologia, Pediatria, etc.)
  --mode <modo>             Modo de seleção de questões:
                              - 'unclassified' (Padrão: novo_foco nulo ou fora da árvore canônica)
                              - 'quarantine'   (Questões com status QUARENTENA_ANALISE_HUMANA)
                              - 'all'          (Todas as questões do filtro)
  --execute                 Grava as decisões no SQLite local (Padrão: simulação auditada --dry-run)
  --limit <n>               Processa no máximo N questões
  --batch <n>               Tamanho do lote de commit transacional (Padrão: 500)
  --help                    Exibe esta ajuda
  `);
  process.exit(0);
}

const TREE_PATH            = getArg('--tree', 'data/catalogo_arvore_canonica_completa.json');
const DB_PATH              = path.resolve(getArg('--db', 'data/questoes_132k.db'));
const ESPECIALIDADE_FILTER = getArg('--especialidade', null);
const SELECT_MODE          = getArg('--mode', 'unclassified');
const IS_EXECUTE           = hasFlag('--execute');
const RUN_LIMIT            = getArg('--limit') ? parseInt(getArg('--limit'), 10) : null;
const BATCH_SIZE           = getArg('--batch') ? parseInt(getArg('--batch'), 10) : 500;

if (!fs.existsSync(DB_PATH)) {
  console.error(`❌ Banco de dados SQLite não encontrado: ${DB_PATH}`);
  process.exit(1);
}
if (!fs.existsSync(TREE_PATH)) {
  console.error(`❌ Árvore canônica não encontrada: ${TREE_PATH}`);
  process.exit(1);
}

// 2. Mapeamento de Aliases e Carregamento da Árvore
const ESPECIALIDADE_ALIASES = {
  'Cirurgia': 'Cirurgia Geral',
  'Cirurgia Geral': 'Cirurgia Geral',
  'Medicina Preventiva': 'Medicina Preventiva e Social',
  'Medicina Preventiva e Social': 'Medicina Preventiva e Social',
  'Ginecologia': 'Ginecologia',
  'Obstetrícia': 'Obstetrícia',
  'Clínica Médica': 'Clínica Médica',
  'Pediatria': 'Pediatria'
};

const rawTree = JSON.parse(fs.readFileSync(TREE_PATH, 'utf8'));
const canonicalTreeByEsp = new Map();
const canonicalFocoNamesSet = new Set();
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
        subSubfocosMap
      };

      focosList.push(focoEntry);
      canonicalFocoNamesSet.add(`${espName.toLowerCase().trim()}|||${focoName.toLowerCase().trim()}`);
      canonicalFocoNamesSet.add(focoName.toLowerCase().trim());
    }
  }

  canonicalTreeByEsp.set(espName, focosList);
}

console.log('========================================================================');
console.log('⚡ MOTOR MESTRE DE CLASSIFICAÇÃO TAXONÔMICA PARA NOVAS QUESTÕES');
console.log(`🛡️  Modo:        ${IS_EXECUTE ? '⚡ EXECUÇÃO ATIVA NO SQLITE' : '🧪 SIMULAÇÃO AUDITADA (--dry-run)'}`);
console.log(`🌲 Árvore:      ${TREE_PATH} (${canonicalTreeByEsp.size} especialidades, ${canonicalTuples.size} tuplas)`);
console.log(`🎯 Seleção:     ${SELECT_MODE} ${ESPECIALIDADE_FILTER ? `| Especialidade: ${ESPECIALIDADE_FILTER}` : '| Todas as Especialidades'}`);
console.log(`📁 Banco:       ${DB_PATH}`);
console.log('========================================================================\n');

// 3. Tokenização e Vocabulário Clínico Especializado
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

// Pré-computa perfis léxicos de todos os focos
for (const [esp, focos] of canonicalTreeByEsp.entries()) {
  for (const f of focos) {
    const baseTokens = tokenize(`${f.tema} ${f.foco}`);
    const subTokens = f.subfocos.flatMap(s => tokenize(s));
    const subSubTokens = Array.from(f.subSubfocosMap.values()).flat().flatMap(ss => tokenize(ss));
    f.tokens = Array.from(new Set([...baseTokens, ...subTokens, ...subSubTokens]));
  }
}

// 4. Dicionário de Âncoras Nosológicas Universais (Cross-Especialidades)
const NOSOLOGICAL_ANCHORS = [
  // --- GINECOLOGIA ---
  { esp: 'Ginecologia', terms: ['chlamydia', 'clamidia', 'gonococo', 'gonorrhoeae', 'cervicite', 'uretrite'], foco: 'Cervicites (Clamídia e Gonococo)' },
  { esp: 'Ginecologia', terms: ['gardnerella', 'amsel', 'clue cell', 'whiff', 'vaginose'], foco: 'Vaginose Bacteriana' },
  { esp: 'Ginecologia', terms: ['candida', 'candidíase', 'hifas', 'pseudo-hifas', 'leite coalhado'], foco: 'Candidíase Vulvovaginal' },
  { esp: 'Ginecologia', terms: ['trichomonas', 'tricomoniase', 'colo em framboesa', 'protozoario flagelado'], foco: 'Tricomoníase Vaginal' },
  { esp: 'Ginecologia', terms: ['dip', 'doenca inflamatoria pelvica', 'monif', 'salpingite', 'dor a mobilizacao do colo'], foco: 'Doença Inflamatória Pélvica (DIP: Critérios Diagnósticos, Estágios e Tratamento)' },
  { esp: 'Ginecologia', terms: ['linfogranuloma', 'cancro mole', 'donovanose', 'sifilis', 'treponema', 'ulceras genitais', 'herpes genital', 'proctite'], foco: 'Úlceras Genitais (Sífilis Primária, Cancro Mole, Herpes Genital, Linfogranuloma, Donovanose)' },
  { esp: 'Ginecologia', terms: ['palm-coein', 'palm coein', 'polipo endometrial', 'mioma submucoso'], foco: 'Sangramento Uterino Anormal (Classificação PALM-COEIN)' },
  { esp: 'Ginecologia', terms: ['video-histeroscopia', 'histeroscopia cirurgica', 'ablacao endometrial', 'tamponamento com foley'], foco: 'Manejo Farmacológico e Cirúrgico do SUA' },
  { esp: 'Ginecologia', terms: ['mioma', 'leiomioma', 'leiomiomatose', 'miomectomia'], foco: 'Leiomiomatose Uterina (Miomas: Sintomas, Classificação FIGO e Conduta)' },
  { esp: 'Ginecologia', terms: ['adenomiose', 'zona juncional', 'utero globular'], foco: 'Adenomiose Uterina' },
  { esp: 'Ginecologia', terms: ['polipo endometrial', 'polipo cervical', 'polipectomia'], foco: 'Pólipos Endometriais e Cervicais' },
  { esp: 'Ginecologia', terms: ['endometriose', 'endometrioma', 'dispareunia de profundidade'], foco: 'Endometriose Pélvica e Ovariana (Endometrioma)' },
  { esp: 'Ginecologia', terms: ['dismenorreia', 'dor pelvica cronica', 'sindrome pre-menstrual', 'spm', 'tdpm'], foco: 'Dor Pélvica Crônica e Dismenorreia' },
  { esp: 'Ginecologia', terms: ['antimulleriano', 'foliculos antrais', 'reserva ovariana', 'espermograma', 'histerossalpingografia', 'prova de cotte'], foco: 'Fator Masculino, Ovariano, Tuboperitoneal e Uterino' },
  { esp: 'Ginecologia', terms: ['inseminacao intrauterina', 'fertilizacao in vitro', 'icsi'], foco: 'Técnicas de Reprodução Assistida' },
  { esp: 'Ginecologia', terms: ['diu de cobre', 'siu de levonorgestrel', 'mirena', 'kyleena'], foco: 'Dispositivos Intrauterinos (DIU de Cobre e SIU de Levonorgestrel)' },
  { esp: 'Ginecologia', terms: ['implante de etonogestrel', 'implanon'], foco: 'Implante Subdérmico de Etonogestrel' },
  { esp: 'Ginecologia', terms: ['criterios de elegibilidade', 'categoria 1', 'categoria 2', 'categoria 3', 'categoria 4'], foco: 'Critérios Médicos de Elegibilidade da OMS' },
  { esp: 'Ginecologia', terms: ['bi-rads', 'mamografia', 'microcalcificacoes pleomorficas', 'nodulo espiculado'], foco: 'Rastreamento do Câncer de Mama e Classificação BI-RADS' },
  { esp: 'Ginecologia', terms: ['citologia oncótica', 'papanicolau', 'colposcopia', 'teste de schiller', 'hpv oncogenico'], foco: 'Rastreamento e Prevenção do Câncer de Colo Uterino (Citologia, HPV e Colposcopia)' },
  { esp: 'Ginecologia', terms: ['prolapso', 'pop-q', 'cistocele', 'retocele', 'histerocele', 'pessario'], foco: 'Prolapso de Órgãos Pélvicos (Classificação POP-Q)' },
  { esp: 'Ginecologia', terms: ['incontinencia de esforco', 'valsalva', 'sling'], foco: 'Incontinência Urinária de Esforço (IUE)' },

  // --- OBSTETRÍCIA ---
  { esp: 'Obstetrícia', terms: ['pre-natal', 'idade gestacional', 'regra de nagele', 'suplementacao de acido folico'], foco: 'Assistência Pré-Natal de Risco Habitual' },
  { esp: 'Obstetrícia', terms: ['descolamento prematuro', 'dpp', 'hipertonia uterina', 'sangramento escuro', 'sofrimento fetal agudo'], foco: 'Descolamento Prematuro de Placenta (DPP)' },
  { esp: 'Obstetrícia', terms: ['placenta previa', 'sangramento indolor', 'sangramento vermelho vivo', 'placenta de insercao baixa'], foco: 'Placenta Prévia e Espectro do Acretismo Placentário' },
  { esp: 'Obstetrícia', terms: ['pre-eclampsia', 'eclampsia', 'hellp', 'sulfato de magnesio', 'proteinuria macica'], foco: 'Síndromes Hipertensivas na Gestação e Pré-Eclâmpsia' },
  { esp: 'Obstetrícia', terms: ['partograma', 'fase ativa', 'dilatacao cervical', 'descida da apresentacao'], foco: 'Mecanismo de Parto e Partograma' },
  { esp: 'Obstetrícia', terms: ['hemorragia pos-parto', 'hpp', 'atonia uterina', 'manobra de hamilton', 'balao de bakri'], foco: 'Hemorragia Pós-Parto (HPP: 4 Ts)' },
  { esp: 'Obstetrícia', terms: ['gemelaridade', 'monocorionica', 'dicorionica', 'sindrome de transfusao feto-fetal', 'stff'], foco: 'Gestações Múltiplas e Gemelaridade' },

  // --- PEDIATRIA ---
  { esp: 'Pediatria', terms: ['teste do pezinho', 'triagem neonatal', 'fenilcetonuria', 'fibrose cistica', 'anemia falciforme'], foco: 'Triagem Neonatal e Testes de Rastreamento (Pezinho, Olhinho, Coraçãozinho, Orelhinha)' },
  { esp: 'Pediatria', terms: ['reanimacao neonatal', 'apgar', 'passos iniciais', 'clampeamento oportuno'], foco: 'Reanimação Neonatal em Sala de Parto (Diretrizes SBP)' },
  { esp: 'Pediatria', terms: ['curvas da oms', 'escore z', 'desnutricao infantil', 'ganho ponderal'], foco: 'Avaliação Nutricional e Curvas de Crescimento da OMS' },
  { esp: 'Pediatria', terms: ['calendario vacinal', 'pni', 'vacina pentavalente', 'vacina pneumococica', 'triplice viral'], foco: 'Calendário Nacional de Vacinação do PNI e Vacinas Especiais (CRIE)' },
  { esp: 'Pediatria', terms: ['bronquiolite', 'vsr', 'virus sincicial respiratorio', 'sibilancia no lactente'], foco: 'Bronquiolite Viral Aguda (VSR: Diagnóstico e Manejo)' },
  { esp: 'Pediatria', terms: ['febre sem foco', 'febre sem sinal localizatorio', 'lactente febril'], foco: 'Febre sem Foco em Lactentes e Crianças Pequenas' },
  { esp: 'Pediatria', terms: ['tro (terapia de reidratacao oral)', 'plano a', 'plano b', 'plano c', 'gastroenterite'], foco: 'Doença Diarreica Aguda e Planos de Reidratação da OMS/MS (A, B e C)' },

  // --- CIRURGIA GERAL ---
  { esp: 'Cirurgia Geral', terms: ['atls', 'trauma abdominal', 'fast', 'e-fast', 'laparotomia exploradora'], foco: 'Atendimento Inicial ao Politraumatizado e Protocolo ABCDE' },
  { esp: 'Cirurgia Geral', terms: ['pneumotorax hipertensivo', 'toracocentese', 'drenagem toracica', 'hemotorax macico'], foco: 'Trauma Torácico e Lesões com Risco Iminente de Morte' },
  { esp: 'Cirurgia Geral', terms: ['apendicite aguda', 'apendicectomia', 'escore de alvarado', 'sinal de blumberg'], foco: 'Apendicite Aguda: Diagnóstico, Escores e Abordagem Cirúrgica' },
  { esp: 'Cirurgia Geral', terms: ['colecistite aguda', 'sinal de murphy', 'colecistectomia', 'coledocolitíase'], foco: 'Colelitíase, Coledocolitíase e Colecistite Aguda (Critérios de Tokyo)' },
  { esp: 'Cirurgia Geral', terms: ['obstrucao intestinal', 'niveis hidroaereos', 'aderencias', 'volvo de sigmoide'], foco: 'Abdome Agudo Obstrutivo e Síndrome de Ogilvie' },
  { esp: 'Cirurgia Geral', terms: ['hernia inguinal', 'hernia femoral', 'classificacao de nyhus', 'telas cirurgicas'], foco: 'Hérnias da Parede Abdominal (Inguinais, Femorais e Incisionais)' },

  // --- CLÍNICA MÉDICA ---
  { esp: 'Clínica Médica', terms: ['infarto agudo do miocardio', 'iam com supra', 'iam sem supra', 'troponina', 'angioplastia'], foco: 'Síndromes Coronarianas Agudas (IAM com e sem Supra de ST)' },
  { esp: 'Clínica Médica', terms: ['insuficiencia cardiaca', 'fracao de ejecao', 'icfer', 'icfep', 'antagonista de aldosterona'], foco: 'Insuficiência Cardíaca Crônica e Aguda (Diretrizes SBC/ESC)' },
  { esp: 'Clínica Médica', terms: ['avc isquemico', 'trombolise', 'alteplase', 'janela terapeutica 4,5h'], foco: 'Acidente Vascular Cerebral Isquêmico e Hemorrágico' },
  { esp: 'Clínica Médica', terms: ['curb-65', 'pneumonia adquirida na comunidade', 'escore de fine'], foco: 'Pneumonia Adquirida na Comunidade (PAC: Estratificação CURB-65 e Tratamento)' },
  { esp: 'Clínica Médica', terms: ['cetoacidose diabetica', 'estado hiperosmolar', 'insulinoterapia', 'glicemia de jejum'], foco: 'Complicações Agudas e Crônicas do Diabetes Mellitus' },
  { esp: 'Clínica Médica', terms: ['sepse', 'choque septico', 'qsofa', 'surviving sepsis', 'noradrenalina'], foco: 'Sepse e Choque Séptico (Protocolo Surviving Sepsis Campaign)' },

  // --- MEDICINA PREVENTIVA E SOCIAL ---
  { esp: 'Medicina Preventiva e Social', terms: ['lei 8.080', 'lei 8.142', 'principios do sus', 'universalidade', 'integralidade'], foco: 'Sistema Único de Saúde (SUS): Princípios, Diretrizes e Leis Orgânicas (8.080 e 8.142)' },
  { esp: 'Medicina Preventiva e Social', terms: ['notificacao compulsoria', 'portaria gm/ms', 'sinan', 'prazo de 24 horas'], foco: 'Vigilância em Saúde e Notificação Compulsória de Doenças e Agravos' },
  { esp: 'Medicina Preventiva e Social', terms: ['estudo de coorte', 'caso-controle', 'ensaio clinico randomizado', 'estudo transversal'], foco: 'Delineamentos de Estudos Epidemiológicos (Descritivos e Analíticos)' },
  { esp: 'Medicina Preventiva e Social', terms: ['risco relativo', 'odds ratio', 'razao de chances', 'fracao atribuivel'], foco: 'Medidas de Associação e Impacto Potencial em Epidemiologia' },
  { esp: 'Medicina Preventiva e Social', terms: ['sensibilidade', 'especificidade', 'valor preditivo positivo', 'vpp', 'vpn'], foco: 'Testes Diagnósticos: Sensibilidade, Especificidade e Valores Preditivos' }
];

// 5. Conexão ao SQLite e Montagem da Fila
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');

let query = `
  SELECT id, code, especialidade, tema, foco, subfoco,
         antigo_tema, antigo_foco, antigo_subfoco,
         novo_tema, novo_foco, novo_subfoco, novo_sub_subfoco,
         statement, options, correct_answer, commentary, is_anulada
  FROM questions
  WHERE 1=1
`;
const queryParams = [];

if (ESPECIALIDADE_FILTER) {
  const normEsp = ESPECIALIDADE_ALIASES[ESPECIALIDADE_FILTER] || ESPECIALIDADE_FILTER;
  query += ` AND (especialidade = ? OR especialidade = ?)`;
  queryParams.push(ESPECIALIDADE_FILTER, normEsp);
}

if (SELECT_MODE === 'quarantine') {
  query += ` AND status_recategorizacao = 'QUARENTENA_ANALISE_HUMANA'`;
}

query += ` ORDER BY id ASC`;

const rawRows = db.prepare(query).all(...queryParams);

// Filtra registros que precisam de classificação
const targetRows = rawRows.filter(q => {
  if (SELECT_MODE === 'all') return true;
  if (SELECT_MODE === 'quarantine') return true;

  // Modo unclassified: novo_foco nulo, vazio ou fora da árvore canônica
  if (!q.novo_foco || q.novo_foco.trim() === '') return true;
  const canonicalEsp = ESPECIALIDADE_ALIASES[q.especialidade] || q.especialidade;
  const key = `${canonicalEsp.toLowerCase().trim()}|||${q.novo_foco.toLowerCase().trim()}`;
  return !canonicalFocoNamesSet.has(key);
});

console.log(`📋 Total de Questões na Fila de Classificação: ${targetRows.length.toLocaleString('pt-BR')}`);
if (targetRows.length === 0) {
  console.log('🎉 Nenhuma questão pendente de classificação para os critérios informados!');
  db.close();
  process.exit(0);
}

const executionBatch = RUN_LIMIT ? targetRows.slice(0, RUN_LIMIT) : targetRows;
console.log(`📦 Processando Lote: ${executionBatch.length.toLocaleString('pt-BR')} questões.\n`);

// 6. Função de Pontuação Ponderada
function scoreNode(q, candidateTokens, correctOptText, commandPrompt) {
  const normStmt = (q.statement || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const normComm = (q.commentary || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const normCorrect = (correctOptText || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const normCmd = (commandPrompt || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  let score = 0;
  for (const token of candidateTokens) {
    const re = new RegExp(`(?:^|\\W)${token}(?:$|\\W)`, 'i');
    if (re.test(normCorrect)) score += 6.0; // Gabarito com peso máximo
    if (re.test(normCmd))     score += 4.0; // Comando terminal
    if (re.test(normComm))    score += 1.5; // Comentário oficial
    if (re.test(normStmt))    score += 1.0; // Vinheta clínica
  }

  return score / Math.pow(Math.max(candidateTokens.length, 1), 0.65);
}

// 7. Statement de Atualização e Loop Principal
const updateStmt = IS_EXECUTE ? db.prepare(`
  UPDATE questions SET
    novo_tema = ?,
    novo_foco = ?,
    novo_subfoco = ?,
    novo_sub_subfoco = ?,
    status_recategorizacao = ?,
    motivo_regra = ?
  WHERE id = ?
`) : null;

let countSuccess = 0;
let countQuarantine = 0;
const resultsAudit = [];

if (IS_EXECUTE) db.exec('BEGIN TRANSACTION;');

try {
  for (let idx = 0; idx < executionBatch.length; idx++) {
    const q = executionBatch[idx];
    const canonicalEsp = ESPECIALIDADE_ALIASES[q.especialidade] || q.especialidade;
    const availableFocos = canonicalTreeByEsp.get(canonicalEsp) || [];

    if (availableFocos.length === 0) {
      console.warn(`⚠️ Especialidade '${q.especialidade}' sem nós canônicos cadastrados.`);
      continue;
    }

    let opts = [];
    try { opts = JSON.parse(q.options || '[]'); } catch { opts = []; }
    const correctOpt = opts.find(o => o.letter === q.correct_answer)?.text || '';

    const lines = (q.statement || '').split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const commandPrompt = lines[lines.length - 1] || '';
    const fullTextNorm = `${q.statement} ${correctOpt} ${q.commentary || ''}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    // 1. Ranqueia todos os Focos da Especialidade
    const focoScores = availableFocos.map(f => {
      let baseScore = scoreNode(q, f.tokens, correctOpt, commandPrompt);

      // Bônus Nosológico Padrão-Ouro
      for (const anchor of NOSOLOGICAL_ANCHORS) {
        if (anchor.esp === canonicalEsp && anchor.foco.toLowerCase().trim() === f.foco.toLowerCase().trim()) {
          for (const term of anchor.terms) {
            const re = new RegExp(`(?:^|\\W)${term}(?:$|\\W)`, 'i');
            if (re.test(fullTextNorm)) {
              baseScore += 6.5;
            }
          }
        }
      }

      return { focoEntry: f, score: baseScore };
    });

    focoScores.sort((a, b) => b.score - a.score);
    const bestFoco = focoScores[0];
    const secondFoco = focoScores[1] || { score: 0 };

    const targetTema = bestFoco.focoEntry.tema;
    const targetFoco = bestFoco.focoEntry.foco;

    // 2. Ranqueia os Subfocos do Foco Vencedor
    const subScores = bestFoco.focoEntry.subfocos.map(s => {
      const sTokens = tokenize(s);
      const ssList = bestFoco.focoEntry.subSubfocosMap.get(s.toLowerCase().trim()) || [];
      const ssTokens = ssList.flatMap(ss => tokenize(ss));
      const allTokens = Array.from(new Set([...sTokens, ...ssTokens]));
      return {
        subfoco: s,
        score: scoreNode(q, allTokens, correctOpt, commandPrompt)
      };
    });

    subScores.sort((a, b) => b.score - a.score);
    const targetSubfoco = subScores[0]?.subfoco || null;

    // 3. Ranqueia Sub-subfocos se presentes
    let targetSubSub = null;
    if (targetSubfoco) {
      const subSubs = bestFoco.focoEntry.subSubfocosMap.get(targetSubfoco.toLowerCase().trim()) || [];
      if (subSubs.length > 0) {
        const ssScores = subSubs.map(ss => ({
          ss,
          score: scoreNode(q, tokenize(ss), correctOpt, commandPrompt)
        }));
        ssScores.sort((a, b) => b.score - a.score);
        if (ssScores[0]?.score > 0) targetSubSub = ssScores[0].ss;
      }
    }

    // 4. Autoverificador Sistemático & Margem de Segurança
    const margin = secondFoco.score > 0 ? (bestFoco.score - secondFoco.score) / bestFoco.score : 1.0;
    const isHighConfidence = bestFoco.score > 1.2 && margin >= 0.10;

    const status = isHighConfidence ? 'SUBFOCO_RESOLVIDO_MOTOR_PERICIAL' : 'QUARENTENA_ANALISE_HUMANA';
    const motivo = `[Motor Pericial Novas Questões] Alocado em '${targetFoco}' (Score: ${bestFoco.score.toFixed(2)}, Margem: ${(margin * 100).toFixed(1)}%). Subfoco: '${targetSubfoco}'.`;

    if (isHighConfidence) countSuccess++;
    else countQuarantine++;

    resultsAudit.push({
      id: q.id,
      code: q.code,
      especialidade: canonicalEsp,
      legado: q.foco || '(Sem Foco)',
      tema: targetTema,
      foco: targetFoco,
      subfoco: targetSubfoco,
      sub_subfoco: targetSubSub,
      score: bestFoco.score.toFixed(2),
      margin: (margin * 100).toFixed(1) + '%',
      status
    });

    if (IS_EXECUTE && updateStmt) {
      updateStmt.run(
        targetTema,
        targetFoco,
        targetSubfoco,
        targetSubSub,
        status,
        motivo,
        q.id
      );
    }

    if (IS_EXECUTE && (idx + 1) % BATCH_SIZE === 0) {
      db.exec('COMMIT;');
      db.exec('BEGIN TRANSACTION;');
    }
  }

  if (IS_EXECUTE) db.exec('COMMIT;');

} catch (err) {
  if (IS_EXECUTE) db.exec('ROLLBACK;');
  console.error(`❌ Erro durante o processamento em lote: ${err.message}`);
  process.exit(1);
}

// 8. Relatório Final de Homologação
console.log('========================================================================');
console.log('📊 RELATÓRIO DO MOTOR DE CLASSIFICAÇÃO PARA NOVAS QUESTÕES:');
console.log(`   • Total Processado:                     ${executionBatch.length.toLocaleString('pt-BR')}`);
console.log(`   • Classificadas com Alta Confiança:     ${countSuccess.toLocaleString('pt-BR')} (${((countSuccess / executionBatch.length) * 100).toFixed(1)}%)`);
console.log(`   • Retidas na Quarentena (Ambiguidade):  ${countQuarantine.toLocaleString('pt-BR')} (${((countQuarantine / executionBatch.length) * 100).toFixed(1)}%)`);
console.log('========================================================================\n');

console.log('🔍 Amostra de Decisões do Motor (Top 10):');
for (const r of resultsAudit.slice(0, 10)) {
  console.log(`- [${r.code} | ${r.especialidade}] De: "${r.legado}"`);
  console.log(`  -> Para: ${r.tema} > ${r.foco} > ${r.subfoco}`);
  if (r.sub_subfoco) console.log(`     ↳ Sub-subfoco: ${r.sub_subfoco}`);
  console.log(`     Score: ${r.score} | Margem: ${r.margin} | Status: ${r.status}`);
}

