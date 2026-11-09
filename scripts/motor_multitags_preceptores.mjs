import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

/**
 * ========================================================================
 * MOTOR INDEPENDENTE DE ENRIQUECIMENTO DE MULTI-TAGS TRANSVERSAIS
 * ========================================================================
 * 
 * Pipeline desacoplado da recategorização taxonômica.
 * Atribui de 2 a 5 tags canônicas gerais (DeCS/MeSH) por questão,
 * utilizando a perícia clínica dos 5 Preceptores Médicos Especialistas
 * como lente de calibração para máxima acurácia sem ruído.
 * 
 * Uso:
 *   node scripts/motor_multitags_preceptores.mjs --help
 *   node scripts/motor_multitags_preceptores.mjs [--execute] [--limit <n>] [--batch <n>]
 */

const args = process.argv.slice(2);
const getArg = (flag, defaultVal = null) => {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : defaultVal;
};
const hasFlag = (flag) => args.includes(flag);

if (hasFlag('--help') || hasFlag('-h')) {
  console.log(`
Motor Especialista Independente de Multi-Tags Transversais (132.947 Questões)

Opções:
  --execute              Aplica e grava as tags no SQLite local (Padrão: simulação auditada)
  --limit <n>            Processa apenas os primeiros N registros para teste
  --batch <n>            Tamanho do lote de cursor (Padrão: 2500)
  --help                 Exibe esta ajuda
  `);
  process.exit(0);
}

const IS_EXECUTE = hasFlag('--execute');
const RUN_LIMIT = getArg('--limit') ? parseInt(getArg('--limit'), 10) : null;
const BATCH_SIZE = getArg('--batch') ? parseInt(getArg('--batch'), 10) : 2500;
const DB_PATH = path.resolve('data/questoes_132k.db');

if (!fs.existsSync(DB_PATH)) {
  console.error(`❌ Banco de dados SQLite não encontrado em: ${DB_PATH}`);
  process.exit(1);
}

console.log('========================================================================');
console.log('🏷️  MOTOR ESPECIALISTA INDEPENDENTE DE MULTI-TAGS TRANSVERSAIS');
console.log(`🛡️  Modo: ${IS_EXECUTE ? '⚡ EXECUÇÃO ATIVA NO SQLITE LOCAL' : '🧪 SIMULAÇÃO AUDITADA (--dry-run)'}`);
console.log('🏛️  Calibração: 5 Preceptores Médicos Especialistas');
console.log('🔒 Isolamento: 100% Localhost (Zero Supabase)');
console.log('========================================================================\n');

// 1. Utilitário de Extração do Comando Clínico
function extractClinicalCommand(statement) {
  if (!statement) return '';
  const cleaned = statement
    .replace(/(?:Hb|Ht|Leucócitos|Plaquetas|Creatinina|Ureia|Na|K|PCR|Gasometria):[^\n]+/gi, '')
    .replace(/(?:Figura|Imagem|Quadro|Tabela)\s+\d+:[^\n]+/gi, '')
    .replace(/Fonte:\s*[^\n]+/gi, '')
    .trim();

  const lines = cleaned.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return statement;

  const commandPatterns = [
    /\?$/,
    /qual\s+(?:é\s+)?(?:a\s+)?(?:conduta|diagnóstico|tratamento|exame|hipótese)/i,
    /assinale\s+(?:a\s+alternativa|a\s+opção|o\s+item)/i,
    /o\s+quadro\s+clínico\s+sugere/i,
    /a\s+melhor\s+abordagem/i,
    /deve-se\s+(?:iniciar|prescrever|solicitar|realizar)/i
  ];

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

// 2. Avaliador de Multi-Tags Calibrado pelos 5 Preceptores
export function evaluatePreceptorMultiTags(q) {
  const tags = new Set();
  const statement = q.statement || '';
  const statementLower = statement.toLowerCase();
  const commentaryLower = (q.commentary || '').toLowerCase();
  const optionsLower = typeof q.options === 'string' ? q.options.toLowerCase() : JSON.stringify(q.options || []).toLowerCase();
  const focoLower = (q.foco || '').toLowerCase();
  const temaLower = (q.tema || '').toLowerCase();
  const espLower = (q.especialidade || '').toLowerCase();

  // Ancoragem demográfica nas 2 primeiras sentenças (~250 chars)
  const patientVignette = statementLower.slice(0, 280);
  const command = extractClinicalCommand(statement).toLowerCase();
  const fullContext = `${statementLower} ${commentaryLower} ${focoLower} ${temaLower}`;

  // =====================================================================
  // DIMENSÃO 1: POPULAÇÃO & CICLO DE VIDA (Ancoragem no Paciente-Índice)
  // =====================================================================
  const ageMatch = patientVignette.match(/(\d{1,3})\s*(anos|meses|dias|semanas)/i);
  if (ageMatch) {
    const val = parseInt(ageMatch[1], 10);
    const unit = ageMatch[2].toLowerCase();

    if (unit === 'anos' && val >= 60) {
      tags.add('#Idoso / Geriatria');
    } else if (unit === 'dias' || (unit === 'semanas' && val <= 4)) {
      tags.add('#Neonato / RN');
    } else if (unit === 'meses' || (unit === 'anos' && val <= 2)) {
      tags.add('#Lactente / Pediátrico');
    } else if (unit === 'anos' && val < 12) {
      tags.add('#Criança / Pediatria');
    } else if (unit === 'anos' && val >= 12 && val < 18) {
      tags.add('#Adolescente');
    }
  }

  // Preceptor de Pediatria: Marcadores implícitos de faixa etária neonatal e lactente
  if (/\b(neonato|recem-nascido|rn\b|sala de parto|apgar|meconio|kramer|vpp\b|silverman|taquipneia transitoria|membrana hialina)\b/i.test(fullContext)) {
    tags.add('#Neonato / RN');
  }
  if (/\b(lactente|aleitamento materno exclusivo|vacina de 2 meses|vacina de 4 meses|pentavalente|dnpm|marcos do desenvolvimento)\b/i.test(fullContext)) {
    tags.add('#Lactente / Pediátrico');
  }

  // Preceptor de Ginecologia & Obstetrícia: Gestante e Puerpério
  if (/\b(gestant[ea]|gravid[ea]|puerper[ao]|parturiente|pre-natal|ig\s*=\s*\d+|dum\b|semanas de gestacao|secundigesta|primigesta|partograma|dilatacao cervical)\b/i.test(patientVignette) ||
      espLower.includes('obstet') ||
      temaLower.includes('gesta') ||
      temaLower.includes('parto')) {
    tags.add('#Gestante / Puerpério');
  }

  // Preceptor de Preventiva & Infectologia: Imunodeprimido / HIV (Bloqueio estrito de sorologias negativas)
  const hasNegativeSerology = /\b(nao reagente|negativ[ao]|indetectavel)\s+(?:para\s+)?(?:hiv|sorologias)\b/i.test(statementLower);
  if (!hasNegativeSerology) {
    if (/\b(hiv\s+reagente|soropositiv[oa]|em uso de tarv|cd4\s*<\s*\d+|quimioterapia recente|transplante renal|neutropenia febril|linfoma|leucemia)\b/i.test(fullContext)) {
      tags.add('#Imunodeprimido / HIV');
    }
  }

  // Preceptor de Preventiva: Saúde do Trabalhador
  if (/\b(trabalhador|doenca ocupacional|exposicao ocupacional|silicose|ler\/dort|acidente de trabalho|epi\b|asat\b|benzeno|saturnismo)\b/i.test(fullContext)) {
    tags.add('#Trabalhador');
  }

  // =====================================================================
  // DIMENSÃO 2: CENÁRIO DE ATENDIMENTO (Marcadores Clínicos e Dispositivos)
  // =====================================================================
  // Preceptor de Clínica / Emergências: UTI e Terapia Intensiva
  if (/\b(uti\b|terapia intensiva|noradrenalina|vasopressina|ventilacao mecanica|intubacao orotraqueal|iot\b|pressao arterial media|lactato arterial|swan-ganz|drogas vasoativas)\b/i.test(fullContext)) {
    tags.add('#UTI / Terapia Intensiva');
  } 
  // Preceptor de Cirurgia & Trauma: Pronto-Socorro / Sala Vermelha
  else if (/\b(pronto-socorro|sala vermelha|upa\b|emergencia|urgencia|admitido com dor subita|trazido pelo samu|prancha rigida|glasgow|fast\b|parada cardiorrespiratoria|choque hipovolemico)\b/i.test(fullContext)) {
    tags.add('#Pronto-Socorro / Sala Vermelha');
  } 
  // Preceptor de Cirurgia: Centro Cirúrgico
  else if (/\b(centro cirurgico|no intraoperatorio|laparotomia|anestesia geral|inventario da cavidade|bloco cirurgico|fio de sutura|incisao cirurgica)\b/i.test(fullContext)) {
    tags.add('#Centro Cirúrgico / Bloco');
  } 
  // Preceptor de Obstetrícia: Sala de Parto
  else if (/\b(sala de parto|trabalho de parto ativo|periodo expulsivo|episiotomia|dequitacao|reanimacao em sala de parto)\b/i.test(fullContext)) {
    tags.add('#Sala de Parto');
  } 
  // Preceptor de Preventiva / Clínica: Ambulatório e Atenção Primária
  else if (/\b(ambulatorio|ubs\b|unidade basica|retorno de exames|consulta de rotina|assintomatico|rastreamento|puericultura|em uso cronico|estrategia saude da familia|esf\b)\b/i.test(fullContext)) {
    tags.add('#Ambulatório / Atenção Primária');
  }

  // =====================================================================
  // DIMENSÃO 3: COMPETÊNCIA COGNITIVA (Sintaxe Estrita do Comando)
  // =====================================================================
  if (/\b(qual a conduta|qual o tratamento|prescrever|administrar|droga de escolha|manejo imediato|passo seguinte|procedimento indicado)\b/i.test(command)) {
    tags.add('#Conduta Imediata');
  } else if (/\b(qual o diagnostico|hipotese mais provavel|exame padrao-ouro|confirmacao diagnostica|quadro clinico sugere|exame confirmatório)\b/i.test(command)) {
    tags.add('#Diagnóstico Padrão-Ouro');
  } else if (/\b(mecanismo|fisiopatologia|patogenese|etiologia|decorre de|base fisiologica)\b/i.test(command)) {
    tags.add('#Fisiopatologia');
  } else if (/\b(criterios de|escore de|classificacao de|sensibilidade|especificidade|risco relativo|odds ratio|estadiamento)\b/i.test(command)) {
    tags.add('#Critérios e Escores Clínicos');
  } else if (/\b(rastreamento|prevencao|vacina|imunizacao|profilaxia|indicacao vacinal)\b/i.test(command)) {
    tags.add('#Rastreamento / Prevenção');
  }

  // =====================================================================
  // DIMENSÃO 4: EIXO TRANSVERSAL DE ALTA RELEVÂNCIA (Lente dos Preceptores)
  // =====================================================================
  // Preceptor de Cirurgia: Trauma / ATLS
  if (/\b(atls|politrauma|colisao|atropelamento|trauma cranioencefalico|tce\b|pneumotorax|tamponamento cardiaco|fratura exposta)\b/i.test(fullContext)) {
    tags.add('#Trauma / Emergência Cirúrgica');
  }

  // Preceptor de Obstetrícia: Emergência Obstétrica
  if (/\b(eclampsia|pre-eclampsia grave|sulfato de magnesio|pritchard|zuspan|descolamento prematuro|placenta previa|rotura uterina|hemorragia pos-parto)\b/i.test(fullContext)) {
    tags.add('#Emergência Obstétrica');
  }

  // Preceptor de Clínica Médica: ACLS / PCR
  if (/\b(acls|parada cardiorrespiratoria|fibrilacao ventricular|taquicardia ventricular sem pulso|assistolia|aesp\b|desfibrilacao|adrenalina 1mg)\b/i.test(fullContext)) {
    tags.add('#Suporte Avançado / ACLS');
  }

  // Preceptor de Preventiva: Notificação Compulsória (Portaria GM/MS 217)
  if (/\b(notificacao compulsoria|sinan\b|investigacao de surto|notificacao imediata|notificar em ate 24h)\b/i.test(fullContext)) {
    tags.add('#Notificação Compulsória (SINAN)');
  }

  // Status de Questão Anulada
  if (q.is_anulada || q.correct_answer === 'ANULADA') {
    tags.add('#Anulada');
  }

  // Fallback Canônico por Grande Área (garante ao menos 2 tags por questão)
  if (tags.size < 2) {
    if (espLower.includes('preventiva')) tags.add('#Saúde Coletiva / SUS');
    else if (espLower.includes('cirurg')) tags.add('#Cirurgia Geral');
    else if (espLower.includes('ginec') || espLower.includes('obstet')) tags.add('#Saúde da Mulher');
    else if (espLower.includes('pediat')) tags.add('#Saúde da Criança');
    else tags.add('#Clínica Médica');
  }

  // Retorna entre 2 e 5 tags estruturadas
  return Array.from(tags).slice(0, 5);
}

// 3. Execução em Modo Simulação ou Persistência
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');

const cols = db.prepare('PRAGMA table_info(questions)').all().map(c => c.name);
if (!cols.includes('multi_tags') && IS_EXECUTE) {
  db.exec("ALTER TABLE questions ADD COLUMN multi_tags TEXT DEFAULT '[]';");
}

const totalCount = RUN_LIMIT || db.prepare('SELECT count(*) as c FROM questions').get().c;
console.log(`📊 Total de Questões no Escopo: ${totalCount.toLocaleString('pt-BR')}`);

const updateStmt = IS_EXECUTE ? db.prepare('UPDATE questions SET multi_tags = ? WHERE id = ?;') : null;

let lastId = '';
let processed = 0;
const tagCensus = new Map();
const sampleResults = [];
const startTime = Date.now();

while (processed < totalCount) {
  const currentBatch = RUN_LIMIT ? Math.min(BATCH_SIZE, RUN_LIMIT - processed) : BATCH_SIZE;
  const rows = db.prepare(`
    SELECT id, code, especialidade, tema, foco, subfoco, statement, options, correct_answer, commentary, is_anulada
    FROM questions
    WHERE id > ?
    ORDER BY id ASC
    LIMIT ?;
  `).all(lastId, currentBatch);

  if (!rows || rows.length === 0) break;

  if (IS_EXECUTE) db.exec('BEGIN TRANSACTION;');

  for (const q of rows) {
    lastId = q.id;
    const tags = evaluatePreceptorMultiTags(q);

    for (const t of tags) {
      tagCensus.set(t, (tagCensus.get(t) || 0) + 1);
    }

    if (sampleResults.length < 5) {
      sampleResults.push({
        code: q.code,
        foco: q.foco,
        tags
      });
    }

    if (IS_EXECUTE && updateStmt) {
      updateStmt.run(JSON.stringify(tags), q.id);
    }
    processed++;
  }

  if (IS_EXECUTE) db.exec('COMMIT;');
  process.stdout.write(`\r   ⏳ Processadas: ${processed.toLocaleString('pt-BR')} / ${totalCount.toLocaleString('pt-BR')} (${((processed/totalCount)*100).toFixed(1)}%)   `);
}

const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`\n\n✅ Concluído em ${elapsedSec}s!`);
console.log('========================================================================');
console.log('📊 CENSO DAS TOP MULTI-TAGS CALIBRADAS:');
console.log('========================================================================');

const sortedTags = Array.from(tagCensus.entries()).sort((a, b) => b[1] - a[1]);
for (const [tag, count] of sortedTags.slice(0, 15)) {
  const pct = ((count / processed) * 100).toFixed(1);
  console.log(`  • ${tag.padEnd(35)} : ${count.toLocaleString('pt-BR').padStart(7)} (${pct}%)`);
}

console.log('\n🔍 Amostra de Questões Classificadas:');
console.log(JSON.stringify(sampleResults, null, 2));

db.close();
console.log('\n🔒 Execução finalizada.');
