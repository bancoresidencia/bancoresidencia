import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

/**
 * ========================================================================
 * VALIDADOR DE INTEGRIDADE CENSITÁRIA & QUALITY GATE CI/CD
 * Plataforma: Banco Residência
 * Módulo: Plano Mestre Motor Estatístico (Fase 1 / Versão 1.2.0)
 * ========================================================================
 *
 * Objetivo:
 *   1. Audita a fidedignidade censitária comparando registros consolidados
 *      contra a contagem física real na base de questões.
 *   2. Verifica invariantes fundamentais:
 *      - Zero duplicação subfoco == foco
 *      - Zero sufixos artificiais ': Diagnóstico e Conduta'
 *      - Rastreabilidade histórica (antigo_tema, antigo_foco, antigo_subfoco)
 *      - Coerência funcional de eixo clínico
 *   3. Bloqueia o pipeline/build (exit code != 0) se houver qualquer discrepância (|Δ| > 0).
 */

const DB_PATH = path.resolve('data/questoes_132k.db');

if (!fs.existsSync(DB_PATH)) {
  console.error(`❌ Banco de dados de questões não encontrado em: ${DB_PATH}`);
  process.exit(1);
}

const db = new DatabaseSync(DB_PATH);
console.log('========================================================================');
console.log('🛡️  VALIDAÇÃO AUTOMATIZADA DE INTEGRIDADE CENSITÁRIA (QUALITY GATE)');
console.log(`📁 Base Local: ${DB_PATH}`);
console.log('========================================================================\n');

let failedGates = 0;
let passedGates = 0;

function checkGate(name, query, validateFn, failMessage) {
  try {
    const result = db.prepare(query).get();
    const val = Object.values(result)[0];
    const ok = validateFn(val);
    const icon = ok ? '✅' : '❌';
    console.log(`  ${icon} ${name}: ${typeof val === 'number' ? val.toLocaleString('pt-BR') : val}`);
    if (!ok) {
      console.error(`     ↳ REPROVADO: ${failMessage(val)}`);
      failedGates++;
    } else {
      passedGates++;
    }
  } catch (err) {
    console.error(`  ❌ ${name}: ERRO SQL -> ${err.message}`);
    failedGates++;
  }
}

// 1. Censo de Questões
checkGate(
  'Censo Físico de Questões (132.947 total)',
  'SELECT COUNT(*) as c FROM questions;',
  v => v === 132947,
  v => `Esperado 132.947 questões, encontrado ${v}`
);

// 2. Rastreabilidade Histórica nos 3 Níveis
checkGate(
  'Rastreabilidade Histórica (antigo_tema, antigo_foco, antigo_subfoco)',
  'SELECT COUNT(*) as c FROM questions WHERE antigo_tema IS NULL OR antigo_foco IS NULL OR antigo_subfoco IS NULL;',
  v => v === 0,
  v => `${v} registros com dados históricos nulos nos 3 níveis`
);

// 3. Anti-Duplicação Subfoco == Foco
checkGate(
  'Anti-Duplicação (novo_subfoco != novo_foco)',
  'SELECT COUNT(*) as c FROM questions WHERE novo_subfoco IS NOT NULL AND LOWER(TRIM(novo_subfoco)) = LOWER(TRIM(novo_foco));',
  v => v === 0,
  v => `${v} registros onde subfoco duplica o foco`
);

// 4. Zero Sufixos Artificiais
checkGate(
  "Zero Sufixos Artificiais (': Diagnóstico e Conduta')",
  "SELECT COUNT(*) as c FROM questions WHERE novo_subfoco LIKE '%: Diagnóstico e Conduta%' OR novo_foco LIKE '%: Diagnóstico e Conduta%';",
  v => v === 0,
  v => `${v} registros com sufixo artificial legado`
);

// 5. Quarentena Limpa (novo_subfoco IS NULL)
checkGate(
  'Quarentena Limpa (novo_subfoco IS NULL para casos em quarentena)',
  "SELECT COUNT(*) as c FROM questions WHERE status_recategorizacao = 'QUARENTENA_ANALISE_HUMANA' AND novo_subfoco IS NOT NULL;",
  v => v === 0,
  v => `${v} registros em quarentena com novo_subfoco preenchido por default cego`
);

// 6. Anti-Inversão Terapêutica em Subfoco Diagnóstico
checkGate(
  'Coerência de Eixo Funcional (Anti-Inversão Terapêutica)',
  `SELECT COUNT(*) as c FROM questions
   WHERE status_recategorizacao NOT IN ('QUARENTENA_ANALISE_HUMANA', 'SUBFOCO_INTEGRADOR_CANONICO')
     AND (
       (
         (novo_subfoco LIKE '%Diagnóstico%' OR novo_subfoco LIKE '%Propedêutica%')
         AND (statement LIKE '%qual o tratamento%' OR statement LIKE '%qual a conduta cirúrgica%')
         AND novo_subfoco NOT LIKE '%Tratamento%' AND novo_subfoco NOT LIKE '%Conduta%'
       )
       OR motivo_regra LIKE '%Incongruência de eixo%'
     );`,
  v => v === 0,
  v => `${v} registros com inversão grave de conduta terapêutica em nó diagnóstico`
);

console.log('\n========================================================================');
if (failedGates === 0) {
  console.log(`🎉 TODOS OS ${passedGates} GATES DE INTEGRIDADE CENSITÁRIA FORAM APROVADOS!`);
  console.log('   Build e sincronização autorizados.');
  console.log('========================================================================\n');
  db.close();
  process.exit(0);
} else {
  console.error(`🛑 FALHA NO QUALITY GATE: ${failedGates} teste(s) falharam de ${passedGates + failedGates}.`);
  console.error('   Sincronização bloqueada para preservar integridade da plataforma.');
  console.log('========================================================================\n');
  db.close();
  process.exit(1);
}
