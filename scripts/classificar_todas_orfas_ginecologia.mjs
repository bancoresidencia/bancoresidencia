import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

/**
 * MOTOR DE CLASSIFICAÇÃO PERICIAL DAS 192 QUESTÕES ÓRFÃS DE GINECOLOGIA
 * Ancorado na Árvore Canônica Oficial Fechada (13 Temas, 45 Focos, 90 Subfocos)
 */

const DB_PATH = path.resolve('data/questoes_132k.db');
const TREE_PATH = path.resolve('data/catalogo_arvore_canonica_completa.json');

const args = process.argv.slice(2);
const IS_EXECUTE = args.includes('--execute');
const LIMIT = args.find((a, i) => args[i - 1] === '--limit') ? parseInt(args[args.indexOf('--limit') + 1], 10) : null;

const db = new DatabaseSync(DB_PATH);
const tree = JSON.parse(fs.readFileSync(TREE_PATH, 'utf8'));
const ginTree = (tree.hierarquia_padrao || []).find(e => e.especialidade === 'Ginecologia');

if (!ginTree) {
  console.error('❌ Especialidade Ginecologia não encontrada na árvore canônica.');
  process.exit(1);
}

// 1. Indexação Canônica de Ginecologia
const canonicalFocosList = [];
const canonicalTuples = new Set();

for (const t of ginTree.temas) {
  for (const f of t.focos) {
    const focoName = f.foco;
    const subfocos = [];
    const subSubfocosMap = new Map();

    for (const s of (f.subfocos || [])) {
      const subName = typeof s === 'string' ? s : s.subfoco;
      if (subName) {
        subfocos.push(subName);
        canonicalTuples.add(`Ginecologia|||${t.tema}|||${focoName}|||${subName}`);
        if (s.sub_subfocos && Array.isArray(s.sub_subfocos)) {
          subSubfocosMap.set(subName.toLowerCase().trim(), s.sub_subfocos);
          for (const ss of s.sub_subfocos) {
            canonicalTuples.add(`Ginecologia|||${t.tema}|||${focoName}|||${subName}|||${ss}`);
          }
        }
      }
    }

    canonicalFocosList.push({
      tema: t.tema,
      foco: focoName,
      subfocos,
      subSubfocosMap
    });
  }
}

console.log(`✅ Árvore Canônica de Ginecologia Carregada:`);
console.log(`   • ${ginTree.temas.length} Temas`);
console.log(`   • ${canonicalFocosList.length} Focos`);
console.log(`   • ${canonicalTuples.size} Tuplas Canônicas Validadas\n`);

// 2. Tokenização e Vocabulário Clínico
const STOPWORDS = new Set([
  'para', 'com', 'sem', 'dos', 'das', 'uma', 'uns', 'pelo', 'pela',
  'sobre', 'entre', 'após', 'onde', 'qual', 'como', 'mais', 'menos',
  'que', 'nao', 'sao', 'este', 'esta', 'esse', 'essa', 'isso', 'isto'
]);

function tokenize(text) {
  return (text || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(t => t.length >= 3 && !STOPWORDS.has(t));
}

// Dicionário de Âncoras Nosológicas Padrão-Ouro (Termos Clínicos Específicos de Ginecologia)
const NOSOLOGICAL_ANCHORS = [
  // ISTs e Infecções
  { terms: ['chlamydia', 'clamidia', 'gonococo', 'gonorrhoeae', 'cervicite', 'uretrite'], foco: 'Cervicites (Clamídia e Gonococo)' },
  { terms: ['gardnerella', 'amsel', 'clue cell', 'whiff', 'vaginose'], foco: 'Vaginose Bacteriana' },
  { terms: ['candida', 'candidíase', 'hifas', 'pseudo-hifas', 'leite coalhado', 'fluconazol'], foco: 'Candidíase Vulvovaginal' },
  { terms: ['trichomonas', 'tricomoniase', 'colo em framboesa', 'protozoario flagelado'], foco: 'Tricomoníase Vaginal' },
  { terms: ['dip', 'doenca inflamatoria pelvica', 'monif', 'salpingite', 'dor a mobilizacao do colo'], foco: 'Doença Inflamatória Pélvica (DIP: Critérios Diagnósticos, Estágios e Tratamento)' },
  { terms: ['linfogranuloma', 'cancro mole', 'donovanose', 'sifilis', 'treponema', 'ulceras genitais', 'herpes genital', 'proctite', 'papilite'], foco: 'Úlceras Genitais (Sífilis Primária, Cancro Mole, Herpes Genital, Linfogranuloma, Donovanose)' },
  
  // Sangramento e Fisiologia
  { terms: ['palm-coein', 'palm coein', 'polipo endometrial', 'mioma submucoso', 'coagulopatia'], foco: 'Sangramento Uterino Anormal (Classificação PALM-COEIN)' },
  { terms: ['acido tranexamico', 'histeroscopia cirurgica', 'video-histeroscopia', 'histeroscopia', 'ablacao endometrial', 'tamponamento com foley'], foco: 'Manejo Farmacológico e Cirúrgico do SUA' },
  { terms: ['fase folicular', 'fase lutea', 'estradiol', 'progesterona', 'pico de lh', 'ovulacao', 'gnrh pulsatil'], foco: 'Ciclo Menstrual e Eixo Hipotálamo-Hipófise-Ovário' },
  
  // Miomas, Adenomiose e Pólipos
  { terms: ['mioma', 'leiomioma', 'leiomiomatose', 'miomectomia', 'subseroso', 'intramural'], foco: 'Leiomiomatose Uterina (Miomas: Sintomas, Classificação FIGO e Conduta)' },
  { terms: ['adenomiose', 'zona juncional', 'utero globular', 'miometrio heterogeneo'], foco: 'Adenomiose Uterina' },
  { terms: ['polipo endometrial', 'polipo cervical', 'polipectomia'], foco: 'Pólipos Endometriais e Cervicais' },

  // Endometriose e Dor
  { terms: ['endometriose', 'endometrioma', 'dispareunia de profundidade', 'preparo intestinal endometriose', 'ultrassonografia endovaginal'], foco: 'Endometriose Pélvica e Ovariana (Endometrioma)' },
  { terms: ['dismenorreia', 'dor pelvica cronica', 'sindrome pre-menstrual', 'spm', 'tdpm', 'disforico'], foco: 'Dor Pélvica Crônica e Dismenorreia' },

  // Infertilidade
  { terms: ['antimulleriano', 'foliculos antrais', 'reserva ovariana', 'espermograma', 'histerossalpingografia', 'prova de cotte', 'fator tuboperitoneal'], foco: 'Fator Masculino, Ovariano, Tuboperitoneal e Uterino' },
  { terms: ['inseminacao intrauterina', 'fertilizacao in vitro', 'icsi', 'inducao da ovulacao'], foco: 'Técnicas de Reprodução Assistida' },

  // Planejamento Familiar
  { terms: ['diu de cobre', 'siu de levonorgestrel', 'mirena', 'kyleena'], foco: 'Dispositivos Intrauterinos (DIU de Cobre e SIU de Levonorgestrel)' },
  { terms: ['implante de etonogestrel', 'implanon'], foco: 'Implante Subdérmico de Etonogestrel' },
  { terms: ['criterios de elegibilidade', 'categoria 1', 'categoria 2', 'categoria 3', 'categoria 4'], foco: 'Critérios Médicos de Elegibilidade da OMS' },
  { terms: ['anticoncepcional oral', 'anticoncepcional combinado', 'injecao mensal'], foco: 'Contraceptivos Orais Combinados e Injetáveis' },
  { terms: ['minipilula', 'desogestrel', 'injetavel trimestral', 'medroxiprogesterona'], foco: 'Métodos Contraceptivos Progestagênicos Exclusivos' },

  // Colo, Mama e Oncologia
  { terms: ['bi-rads', 'mamografia', 'microcalcificacoes pleomorficas', 'nodulo espiculado'], foco: 'Rastreamento do Câncer de Mama e Classificação BI-RADS' },
  { terms: ['citologia oncótica', 'papanicolau', 'colposcopia', 'teste de schiller', 'hpv oncogenico', 'zona de transformacao'], foco: 'Rastreamento e Prevenção do Câncer de Colo Uterino (Citologia, HPV e Colposcopia)' },
  { terms: ['nic 1', 'nic 2', 'nic 3', 'lesao intraepitelial', 'hsil', 'lsil', 'caf', 'conizacao'], foco: 'Neoplasias Intraepiteliais Cervicais (NIC) e Lesões Precursoras' },
  { terms: ['cancer de endometrio', 'hiperplasia com atipia', 'espessamento endometrial na pos-menopausa'], foco: 'Câncer de Endométrio e Hiperplasia Endometrial' },
  { terms: ['prolapso', 'pop-q', 'cistocele', 'retocele', 'histerocele', 'pessario'], foco: 'Prolapso de Órgãos Pélvicos (Classificação POP-Q)' },
  { terms: ['incontinencia de esforco', 'perda aos esforcos', 'valsalva', 'sling'], foco: 'Incontinência Urinária de Esforço (IUE)' },
  { terms: ['bexiga hiperativa', 'incontinencia de urgencia', 'detrusor', 'antimuscarinico'], foco: 'Bexiga Hiperativa e Incontinência de Urgência' }
];

// Constrói perfis léxicos dos Focos
for (const f of canonicalFocosList) {
  const baseTokens = tokenize(`${f.tema} ${f.foco}`);
  const subTokens = f.subfocos.flatMap(s => tokenize(s));
  const subSubTokens = Array.from(f.subSubfocosMap.values()).flat().flatMap(ss => tokenize(ss));
  
  f.tokens = Array.from(new Set([...baseTokens, ...subTokens, ...subSubTokens]));
}

// 3. Busca das 192 Questões Órfãs de Ginecologia na Quarentena
const canonicalFocoNamesSet = new Set(canonicalFocosList.map(f => f.foco.toLowerCase().trim()));

const allQuarantine = db.prepare(`
  SELECT id, code, especialidade, tema, foco, subfoco, novo_foco, statement, options, correct_answer, commentary, is_anulada
  FROM questions 
  WHERE status_recategorizacao = 'QUARENTENA_ANALISE_HUMANA'
    AND especialidade = 'Ginecologia'
  ORDER BY id ASC
`).all();

const orphanRows = allQuarantine.filter(q => {
  const f = (q.novo_foco || q.foco || '').toLowerCase().trim();
  return !canonicalFocoNamesSet.has(f);
});

console.log(`📋 Total de Questões Órfãs de Ginecologia Identificadas: ${orphanRows.length}`);
const targetRows = LIMIT ? orphanRows.slice(0, LIMIT) : orphanRows;
console.log(`📦 Processando: ${targetRows.length} questões (${IS_EXECUTE ? '⚡ MODO EXECUÇÃO REAL NO SQLITE' : '🧪 SIMULAÇÃO AUDITADA (--dry-run)'})\n`);

// 4. Mecanismo de Alocação Pericial
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
    if (re.test(normStmt))    score += 1.0; // Enunciado clínico
    if (re.test(normComm))    score += 1.5; // Comentário oficial
  }

  return score / Math.pow(Math.max(candidateTokens.length, 1), 0.65);
}

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
let countReview = 0;
const resultsAudit = [];

for (const q of targetRows) {
  let opts = [];
  try { opts = JSON.parse(q.options || '[]'); } catch { opts = []; }
  const correctOpt = opts.find(o => o.letter === q.correct_answer)?.text || '';
  
  // Extrai comando terminal
  const lines = (q.statement || '').split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const commandPrompt = lines[lines.length - 1] || '';
  const fullTextNorm = `${q.statement} ${correctOpt} ${q.commentary || ''}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  // 1. Ranqueia todos os Focos Canônicos
  const focoScores = canonicalFocosList.map(f => {
    let baseScore = scoreNode(q, f.tokens, correctOpt, commandPrompt);

    // Bônus nosológico de alta especificidade (âncoras diretas)
    for (const anchor of NOSOLOGICAL_ANCHORS) {
      if (anchor.foco.toLowerCase().trim() === f.foco.toLowerCase().trim()) {
        for (const term of anchor.terms) {
          const re = new RegExp(`(?:^|\\W)${term}(?:$|\\W)`, 'i');
          if (re.test(fullTextNorm)) {
            baseScore += 6.5;
          }
        }
      }
    }

    return {
      focoEntry: f,
      score: baseScore
    };
  });

  focoScores.sort((a, b) => b.score - a.score);
  const bestFoco = focoScores[0];
  const secondFoco = focoScores[1];

  const targetTema = bestFoco.focoEntry.tema;
  const targetFoco = bestFoco.focoEntry.foco;

  // 2. Ranqueia os 2 Subfocos do Foco Vencedor
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

  // 3. Ranqueia Sub-subfocos se existirem
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

  // Margem de segurança
  const margin = secondFoco.score > 0 ? (bestFoco.score - secondFoco.score) / bestFoco.score : 1.0;
  const isHighConfidence = bestFoco.score > 1.2 && margin >= 0.10;

  const status = isHighConfidence ? 'SUBFOCO_RESOLVIDO_MOTOR_PERICIAL' : 'QUARENTENA_ANALISE_HUMANA';
  const motivo = `[Motor Pericial Órfãs Ginecologia] Foco legado '${q.foco}' -> Alocado em '${targetFoco}' (Score: ${bestFoco.score.toFixed(2)}, Margem: ${(margin * 100).toFixed(1)}%). Subfoco: '${targetSubfoco}'.`;

  if (isHighConfidence) countSuccess++;
  else countReview++;

  resultsAudit.push({
    id: q.id,
    code: q.code,
    legado: q.foco,
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
}

console.log('========================================================================');
console.log('📊 RESULTADOS DA CLASSIFICAÇÃO DAS QUESTÕES ÓRFÃS:');
console.log(`   • Total Processado: ${targetRows.length}`);
console.log(`   • Classificadas com Alta Confiança: ${countSuccess} (${((countSuccess / targetRows.length) * 100).toFixed(1)}%)`);
console.log(`   • Retidas para Análise/Ambiguidade: ${countReview} (${((countReview / targetRows.length) * 100).toFixed(1)}%)`);
console.log('========================================================================\n');

// Amostra de 10 alocações
console.log('🔍 Amostra de 10 Casos Classificados:');
for (const r of resultsAudit.slice(0, 10)) {
  console.log(`- [${r.code}] De: "${r.legado}"`);
  console.log(`  -> Para: ${r.tema} > ${r.foco} > ${r.subfoco}`);
  if (r.sub_subfoco) console.log(`     ↳ Sub-subfoco: ${r.sub_subfoco}`);
  console.log(`     Score: ${r.score} | Margem: ${r.margin} | Status: ${r.status}`);
}
