/**
 * MASTER RUNNER — BATERIA EXTREMA DE TESTES DA ABA INÍCIO
 * 
 * Executa todas as 6 camadas (A, B, C, D, E, F) de forma orquestrada,
 * consolida os resultados e emite o relatório final detalhado.
 */

import { runLayerAUnitTests } from './layerA_unit.test';
import { runLayerBPropertyTests } from './layerB_property.test';
import { runLayerCCombinatorialTests } from './layerC_combinatorial';
import { runLayerDIntegrationTests } from './layerD_integration.test';
import { runLayerEE2ETests } from './layerE_e2e_playwright';
import { runLayerFStressAndResponsiveness } from './layerF_stress_and_responsiveness';

export async function runCompleteDashboardAudit() {
  console.log('================================================================');
  console.log('🚀 INICIANDO AUDITORIA EXTREMA DA ABA INÍCIO (DASHBOARD)');
  console.log('   Plataforma Banco Residência Médica');
  console.log('================================================================\n');

  const overallStartTime = Date.now();

  // CAMADA A: Testes Unitários
  const reportA = runLayerAUnitTests();

  // CAMADA B: Property-based testing (10.000 iterações estocásticas)
  const reportB = runLayerBPropertyTests(10000, 133742);

  // CAMADA C: Motor Combinatório (1.000.000 de cenários lógicos)
  const reportC = runLayerCCombinatorialTests(1000000, 987654321);

  // CAMADA D: Testes de Integração
  const reportD = runLayerDIntegrationTests();

  // CAMADA E: Testes E2E reais no navegador (Playwright)
  const reportE = await runLayerEE2ETests('http://localhost:3000');

  // CAMADA F: Stress, Responsividade (16 resoluções) e Performance
  const reportF = await runLayerFStressAndResponsiveness('http://localhost:3000');

  const overallElapsedMs = Date.now() - overallStartTime;

  // Consolidação de métricas
  const totalGenerated = reportC.scenariosGenerated + reportB.iterations + reportA.results.length + reportD.results.length + reportE.totalSteps + reportF.resolutionsTested;
  const totalSimulated = reportC.scenariosSimulated + reportB.iterations + reportA.results.length + reportD.results.length;
  const totalBrowserExecuted = reportE.totalSteps + reportF.resolutionsTested + reportF.stressOperationsCount;
  
  const totalPassed = reportA.passed + (reportB.passed ? reportB.iterations : 0) + reportC.scenariosApproved + reportD.passed + reportE.passedSteps + reportF.resolutionsPassed + (reportF.stressPassed ? reportF.stressOperationsCount : 0);
  const totalFailed = reportA.failed + reportB.violations.length + reportC.scenariosFailed + reportD.failed + reportE.failedSteps + (reportF.resolutionsTested - reportF.resolutionsPassed) + (reportF.stressPassed ? 0 : reportF.stressOperationsCount);
  
  const approvalRate = ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(4);

  console.log('\n================================================================');
  console.log('📊 CONSOLIDAÇÃO DOS RESULTADOS — ABA INÍCIO');
  console.log('================================================================');
  console.log(`- Cenários Gerados:            ${totalGenerated.toLocaleString()}`);
  console.log(`- Cenários Simulados:          ${totalSimulated.toLocaleString()}`);
  console.log(`- Cenários Executados no Browser: ${totalBrowserExecuted.toLocaleString()}`);
  console.log(`- Cenários Aprovados:          ${totalPassed.toLocaleString()}`);
  console.log(`- Cenários Reprovados:         ${totalFailed.toLocaleString()}`);
  console.log(`- Taxa de Aprovação:           ${approvalRate}%`);
  console.log(`- Tempo Total de Execução:     ${(overallElapsedMs / 1000).toFixed(2)}s`);
  console.log('================================================================\n');

  return {
    reportA,
    reportB,
    reportC,
    reportD,
    reportE,
    reportF,
    summary: {
      totalGenerated,
      totalSimulated,
      totalBrowserExecuted,
      totalPassed,
      totalFailed,
      approvalRate,
      overallElapsedMs
    }
  };
}

if (process.argv[1]?.endsWith('run_all_dashboard_tests.ts')) {
  runCompleteDashboardAudit().then((res) => {
    process.exit(res.summary.totalFailed > 0 ? 1 : 0);
  });
}

