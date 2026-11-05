import fs from 'fs';
import path from 'path';

console.log('\n================================================================');
console.log('🧪 TESTE AUTOMATIZADO DA FASE 4: CODE-SPLITTING & DESACOPLAMENTO');
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

// 1. Verificar isolamento do AppShell (OnboardingModal, KeyboardShortcutsModal, SubscriptionModal)
const appShellPath = path.resolve('src/components/layout/AppShell.tsx');
const appShellContent = fs.readFileSync(appShellPath, 'utf8');

const hasStaticOnboarding = /import\s+{[^}]*OnboardingModal[^}]*}\s+from/.test(appShellContent);
const hasDynamicOnboarding = /const\s+OnboardingModal\s*=\s*dynamic\(/.test(appShellContent);
const hasConditionalRender = /\{isOnboardingOpen\s*&&\s*\(/.test(appShellContent);

report(
  '1. Desacoplamento de Modais do AppShell (Remoção de 1.02 MB de officialExamsData.json)',
  !hasStaticOnboarding && hasDynamicOnboarding && hasConditionalRender,
  {
    info: 'OnboardingModal carregado sob demanda via next/dynamic com renderização condicional estrita'
  }
);

// 2. Verificar isolamento do Mermaid na leitura de materiais
const readerPath = path.resolve('src/components/StudyMaterialReader.tsx');
const readerContent = fs.readFileSync(readerPath, 'utf8');

const hasStaticMermaid = /import\s+{[^}]*MermaidDiagram[^}]*}\s+from\s+['"]\.\/study-material\/MermaidDiagram['"]/.test(readerContent);
const hasDynamicMermaid = /const\s+MermaidDiagram\s*=\s*dynamic\(/.test(readerContent);

report(
  '2. Isolamento sob Demanda do Mermaid (1.48 MB desacoplado do bundle inicial)',
  !hasStaticMermaid && hasDynamicMermaid,
  {
    info: 'MermaidDiagram isolado em chunk assíncrono com fallback de carregamento nativo'
  }
);

// 3. Verificar Code-Splitting da rota /dashboard (StudentHomeDashboard - 7.600 linhas)
const dashPagePath = path.resolve('src/app/(platform)/dashboard/page.tsx');
const dashContent = fs.readFileSync(dashPagePath, 'utf8');

const hasStaticDash = /import\s+{[^}]*StudentHomeDashboard[^}]*}\s+from/.test(dashContent);
const hasDynamicDash = /const\s+StudentHomeDashboard\s*=\s*dynamic\(/.test(dashContent);

report(
  '3. Code-Splitting do Dashboard do Aluno (/dashboard)',
  !hasStaticDash && hasDynamicDash,
  {
    info: 'StudentHomeDashboard encapsulado em chunk próprio, não baixado em /questoes ou /resumos'
  }
);

// 4. Verificar Code-Splitting da rota /desempenho (StatsDashboard & Recharts - 3.000 linhas)
const statsPagePath = path.resolve('src/app/(platform)/desempenho/page.tsx');
const statsContent = fs.readFileSync(statsPagePath, 'utf8');

const hasStaticStats = /import\s+{[^}]*StatsDashboard[^}]*}\s+from/.test(statsContent);
const hasDynamicStats = /const\s+StatsDashboard\s*=\s*dynamic\(/.test(statsContent);

report(
  '4. Code-Splitting das Métricas Psicométricas (/desempenho)',
  !hasStaticStats && hasDynamicStats,
  {
    info: 'StatsDashboard e Recharts desacoplados em chunk exclusivo'
  }
);

// --------------------------------------------------------------------------
// RESULTADO FINAL
// --------------------------------------------------------------------------
console.log('\n----------------------------------------------------------------');
console.log('📊 RESULTADO FINAL DA BATERIA DA FASE 4:');
console.log(`   ✅ Aprovados: ${passed}/4`);
console.log(`   ❌ Falhas:    ${failed}/4`);
console.log('----------------------------------------------------------------\n');

if (failed > 0) process.exit(1);
