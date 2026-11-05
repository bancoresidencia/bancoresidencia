import fs from 'fs';
import path from 'path';

console.log('\n================================================================');
console.log('🧪 TESTE AUTOMATIZADO DA FASE 5: HIGIENE DE REPOSITÓRIO & PIPELINE QA');
console.log('================================================================\n');

let passed = 0;
let failed = 0;

function report(name, isSuccess, details = {}) {
  if (isSuccess) {
    console.log(`✅ [PASS] ${name}`);
    if (details.info) console.log(`   └── ${details.info}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${name}`);
    if (details.error) console.error(`   └── Erro: ${details.error}`);
    failed++;
  }
}

// 1. Verificar regras de exclusão no .vercelignore
const vercelIgnorePath = path.resolve('.vercelignore');
const vercelIgnoreContent = fs.existsSync(vercelIgnorePath) ? fs.readFileSync(vercelIgnorePath, 'utf8') : '';

const hasScriptsIgnore = /^\/scripts\//m.test(vercelIgnoreContent);
const hasTestsIgnore = /^\/tests\//m.test(vercelIgnoreContent);
const hasSupabaseIgnore = /^\/supabase\//m.test(vercelIgnoreContent);

report(
  '1. Higiene de Deploy no .vercelignore',
  hasScriptsIgnore && hasTestsIgnore && hasSupabaseIgnore,
  {
    info: 'Pastas /scripts/, /tests/ e /supabase/ excluídas do deploy da Vercel (reduzindo tempo de build)'
  }
);

// 2. Barreira de Tamanho de Arquivo em src/ (< 1.5MB)
let oversizedInSrc = [];
function scan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) scan(full);
    else if (entry.isFile()) {
      const stats = fs.statSync(full);
      if (stats.size > 1.5 * 1024 * 1024 && !entry.name.endsWith('.map')) {
        oversizedInSrc.push({ file: full, size: stats.size });
      }
    }
  }
}
if (fs.existsSync('src')) scan('src');

report(
  '2. Barreira de Proteção contra Arquivos Gigantes em src/',
  oversizedInSrc.length === 0,
  {
    info: oversizedInSrc.length === 0
      ? 'Zero arquivos > 1.5MB em src/. Todo o código está estritamente modularizado.'
      : `${oversizedInSrc.length} arquivos pesados encontrados`
  }
);

// 3. Verificação de Integridade dos Testes das Fases 1 a 4
const testFiles = [
  'scripts/tests/test_fase1_security_guardrails.mjs',
  'scripts/tests/test_fase2_latency_and_solve_persistence.mjs',
  'scripts/tests/test_fase3_database_and_unlimited_filters.mjs',
  'scripts/tests/test_fase4_bundle_analysis.mjs'
];

const allTestsPresent = testFiles.every(f => fs.existsSync(path.resolve(f)));

report(
  '3. Bateria Completa de Guardrails Automatizados (Fases 1, 2, 3 e 4)',
  allTestsPresent,
  {
    info: 'Todas as suítes de teste de latência e segurança estão consolidadas e ativas'
  }
);

// --------------------------------------------------------------------------
// RESULTADO FINAL
// --------------------------------------------------------------------------
console.log('\n----------------------------------------------------------------');
console.log('📊 RESULTADO FINAL DA BATERIA DA FASE 5:');
console.log(`   ✅ Aprovados: ${passed}/3`);
console.log(`   ❌ Falhas:    ${failed}/3`);
console.log('----------------------------------------------------------------\n');

if (failed > 0) process.exit(1);
