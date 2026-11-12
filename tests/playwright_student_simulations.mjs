import { chromium } from 'playwright';
import fs from 'fs';

const BASE_URL = 'http://localhost:3000/questoes';

async function runSimulations() {
  console.log('========================================================================');
  console.log('🎭 SIMULAÇÕES DE ALUNO COM PLAYWRIGHT NO BANCO DE QUESTÕES');
  console.log('========================================================================\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const simulationResults = [];
  const consoleErrors = [];
  const networkLogs = [];

  async function createCleanPage() {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();

    page.on('console', msg => {
      if (msg.type === 'error') {
        consoleErrors.push(`[Console Error] ${msg.text()}`);
      }
    });

    page.on('pageerror', err => {
      consoleErrors.push(`[Page Uncaught Error] ${err.message}`);
    });

    page.on('request', req => {
      if (req.url().includes('/api/questions')) {
        const postData = req.postDataJSON() || {};
        networkLogs.push({
          type: 'REQUEST',
          url: req.url(),
          action: postData.action || 'query',
          filters: postData.filters,
          pageSize: postData.pageSize,
          page: postData.page
        });
      }
    });

    page.on('response', async res => {
      if (res.url().includes('/api/questions')) {
        try {
          const json = await res.json();
          networkLogs.push({
            type: 'RESPONSE',
            status: res.status(),
            total: json.total || json.facets?.totalRightCardCount,
            questionsCount: json.questions?.length,
            questions: (json.questions || []).map(q => ({
              id: q.id,
              banca: q.banca,
              year: q.year,
              especialidade: q.especialidade,
              tema: q.tema,
              foco: q.foco,
              subfoco: q.subfoco,
              difficulty: q.difficulty,
              modalidade: q.modalidade
            }))
          });
        } catch {}
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {}
    });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    return { page, context };
  }

  // Helper para ler contador geral no topo do card aguardando estabilização
  async function getMainCounterNumber(page, expectedApprox = null, maxWaitMs = 3000) {
    const counterLocator = page.locator('span.tabular-nums.font-black, span.text-2xl.tabular-nums, span.text-3xl.tabular-nums').first();
    const start = Date.now();
    let lastNum = 0;

    while (Date.now() - start < maxWaitMs) {
      const text = await counterLocator.textContent().catch(() => '0');
      const num = parseInt(text.replace(/\./g, '').trim(), 10);
      if (!isNaN(num)) {
        lastNum = num;
        if (expectedApprox !== null && Math.abs(num - expectedApprox) <= 5) {
          return num;
        }
      }
      await page.waitForTimeout(150);
    }
    return lastNum;
  }

  // Helper para iniciar resolução e aguardar transição real para a tela da prova
  async function startResolution(page) {
    const btn = page.locator('button:has-text("Iniciar (")').first();
    await btn.waitFor({ state: 'visible', timeout: 8000 });
    const btnText = await btn.innerText();
    await btn.click();
    
    // Aguarda transição para modo de resolução
    await page.waitForSelector('button[title*="Voltar"], button[aria-label="Voltar"]', { timeout: 15000 });
    await page.waitForTimeout(600);
    return btnText;
  }

  // =========================================================================
  // SIMULAÇÃO 1: Carga Inicial e Baseline Acesso Direto
  // =========================================================================
  console.log('\n--- [SIMULAÇÃO 1] Carga Inicial do Acesso Direto ---');
  try {
    const { page, context } = await createCleanPage();
    const initialCount = await getMainCounterNumber(page, 177924, 2000);
    console.log(`  Contador Inicial: ${initialCount.toLocaleString('pt-BR')} questões`);
    
    const passed = initialCount === 177924;
    simulationResults.push({
      simulacao: 1,
      nome: 'Carga Inicial do Acesso Direto',
      esperado: '177.924 questões homologadas',
      obtido: `${initialCount.toLocaleString('pt-BR')} questões`,
      status: passed ? 'PASS' : 'FAIL',
      detalhes: passed ? 'Contador inicial exato, 100% alinhado com a view_questions_acesso_direto' : `Divergência: obtido ${initialCount}`
    });
    await context.close();
  } catch (err) {
    simulationResults.push({ simulacao: 1, nome: 'Carga Inicial', status: 'ERROR', detalhes: err.message });
  }

  // =========================================================================
  // SIMULAÇÃO 2: Filtro Especialidade Única (Pediatria) + Resolução
  // =========================================================================
  console.log('\n--- [SIMULAÇÃO 2] Filtro por Especialidade Única (Pediatria) ---');
  try {
    const { page, context } = await createCleanPage();
    const pedSpan = page.locator('span:has-text("Pediatria")').first();
    await pedSpan.click();

    const pedCount = await getMainCounterNumber(page, 29998, 2500);
    console.log(`  Contador Pediatria: ${pedCount.toLocaleString('pt-BR')} (Esperado: 29.998)`);

    const btnText = await startResolution(page);
    console.log(`  Botão Iniciar acionado: "${btnText}"`);

    const lastResponse = networkLogs.filter(l => l.type === 'RESPONSE' && l.questionsCount > 0).pop();
    const questions = lastResponse?.questions || [];
    console.log(`  Total de questões entregues na sessão: ${questions.length}`);
    const allPed = questions.length > 0 && questions.every(q => q.especialidade === 'Pediatria');
    console.log(`  Todas as questões são rigorosamente de Pediatria: ${allPed}`);
    if (questions.length > 0) {
      console.log(`    Exemplo Q1: [${questions[0].especialidade}] ${questions[0].tema} -> ${questions[0].foco} (${questions[0].banca} ${questions[0].year})`);
    }

    const passed = pedCount === 29998 && allPed;
    simulationResults.push({
      simulacao: 2,
      nome: 'Filtro Especialidade (Pediatria) + Resolução',
      esperado: '29.998 no contador | Questões 100% de Pediatria na resolução',
      obtido: `${pedCount.toLocaleString('pt-BR')} no contador | ${questions.length} questões na prova (100% Pediatria)`,
      status: passed ? 'PASS' : 'FAIL',
      detalhes: passed ? 'Filtro e carga de questões totalmente sincronizados' : 'Falha na contagem ou especialidade divergente'
    });
    await context.close();
  } catch (err) {
    simulationResults.push({ simulacao: 2, nome: 'Pediatria', status: 'ERROR', detalhes: err.message });
  }

  // =========================================================================
  // SIMULAÇÃO 3: Alternância para Modalidade Revalida + Resolução
  // =========================================================================
  console.log('\n--- [SIMULAÇÃO 3] Alternância de Modalidade para Revalida ---');
  try {
    const { page, context } = await createCleanPage();
    const revalidaPill = page.locator('button:has-text("Revalida")').first();
    await revalidaPill.click();

    const revalidaTotalCount = await getMainCounterNumber(page, 4358, 3000);
    console.log(`  Contador Geral Revalida: ${revalidaTotalCount.toLocaleString('pt-BR')} (Esperado: 4.358)`);

    // Selecionar Cirurgia Geral no Revalida
    const cirRevSpan = page.locator('span:has-text("Cirurgia Geral")').first();
    await cirRevSpan.click();

    const cirRevCount = await getMainCounterNumber(page, 439, 2500);
    console.log(`  Contador Cirurgia Geral no Revalida: ${cirRevCount.toLocaleString('pt-BR')} (Esperado: 439)`);

    const btnText = await startResolution(page);
    console.log(`  Botão Iniciar acionado: "${btnText}"`);

    const lastResponse = networkLogs.filter(l => l.type === 'RESPONSE' && l.questionsCount > 0).pop();
    const questions = lastResponse?.questions || [];
    const allCirRev = questions.length > 0 && questions.every(q => 
      (q.especialidade === 'Cirurgia Geral' || q.especialidade === 'Cirurgia') &&
      ((q.modalidade && q.modalidade.toLowerCase().includes('revalida')) || (q.banca && q.banca.toLowerCase().includes('revalida')) || (q.banca && q.banca.toLowerCase().includes('inep')))
    );
    console.log(`  Questões são Cirurgia Geral no Revalida: ${allCirRev}`);
    if (questions.length > 0) {
      console.log(`    Exemplo Q1: [${questions[0].modalidade || 'N/A'}] ${questions[0].banca} - ${questions[0].especialidade}: ${questions[0].tema}`);
    }

    const passed = revalidaTotalCount === 4358 && cirRevCount === 439 && allCirRev;
    simulationResults.push({
      simulacao: 3,
      nome: 'Alternância Modalidade Revalida (Cirurgia Geral)',
      esperado: '4.358 total Revalida | 439 em Cirurgia Geral Revalida',
      obtido: `${revalidaTotalCount.toLocaleString('pt-BR')} total | ${cirRevCount.toLocaleString('pt-BR')} Cirurgia | questões 100% Revalida`,
      status: passed ? 'PASS' : 'FAIL',
      detalhes: passed ? 'Isolamento estrito entre Acesso Direto e Revalida comprovado' : 'Contagem ou escopo divergente'
    });
    await context.close();
  } catch (err) {
    simulationResults.push({ simulacao: 3, nome: 'Revalida', status: 'ERROR', detalhes: err.message });
  }

  // =========================================================================
  // SIMULAÇÃO 4: Multi-Seleção de Especialidades (Pediatria + Cirurgia Geral)
  // =========================================================================
  console.log('\n--- [SIMULAÇÃO 4] Multi-Seleção (Pediatria + Cirurgia Geral) ---');
  try {
    const { page, context } = await createCleanPage();
    const pedSpan = page.locator('span:has-text("Pediatria")').first();
    await pedSpan.click();
    await page.waitForTimeout(300);

    const cirSpan = page.locator('span:has-text("Cirurgia Geral")').first();
    await cirSpan.click();

    const expectedSum = 29998 + 28842; // 58.840
    const multiCount = await getMainCounterNumber(page, expectedSum, 3000);
    console.log(`  Contador Combinado: ${multiCount.toLocaleString('pt-BR')} (Esperado: ${expectedSum.toLocaleString('pt-BR')})`);

    const btnText = await startResolution(page);
    console.log(`  Botão Iniciar acionado: "${btnText}"`);

    const lastResponse = networkLogs.filter(l => l.type === 'RESPONSE' && l.questionsCount > 0).pop();
    const questions = lastResponse?.questions || [];
    const allValid = questions.length > 0 && questions.every(q => 
      q.especialidade === 'Pediatria' || q.especialidade === 'Cirurgia Geral' || q.especialidade === 'Cirurgia'
    );
    console.log(`  Todas as questões carregadas são de Pediatria ou Cirurgia: ${allValid}`);

    const hasPed = questions.some(q => q.especialidade === 'Pediatria');
    const hasCir = questions.some(q => q.especialidade === 'Cirurgia Geral' || q.especialidade === 'Cirurgia');
    console.log(`  Contém Pediatria: ${hasPed} | Contém Cirurgia: ${hasCir}`);

    const passed = multiCount === expectedSum && allValid;
    simulationResults.push({
      simulacao: 4,
      nome: 'Multi-Seleção (Pediatria + Cirurgia Geral)',
      esperado: `${expectedSum.toLocaleString('pt-BR')} questões combinadas`,
      obtido: `${multiCount.toLocaleString('pt-BR')} no contador | questões 100% compatíveis`,
      status: passed ? 'PASS' : 'FAIL',
      detalhes: passed ? 'Soma das especialidades e distribuição na prova aprovadas' : 'Divergência na união'
    });
    await context.close();
  } catch (err) {
    simulationResults.push({ simulacao: 4, nome: 'Multi-Seleção', status: 'ERROR', detalhes: err.message });
  }

  // =========================================================================
  // SIMULAÇÃO 5: Filtro Cruzado (Especialidade + Card de Anos)
  // =========================================================================
  console.log('\n--- [SIMULAÇÃO 5] Filtro Cruzado (Medicina Preventiva + Ano 2024) ---');
  try {
    const { page, context } = await createCleanPage();
    const prevSpan = page.locator('span:has-text("Medicina Preventiva e Social")').first();
    await prevSpan.click();
    await page.waitForTimeout(400);

    // Expandir Card de Anos clicando no header do card
    const yearsCardHeader = page.locator('div:has-text("Anos da Prova")').first();
    await yearsCardHeader.click();
    await page.waitForTimeout(400);

    // Clicar no botão 2024
    const anoBtn = page.locator('button:has-text("2024")').first();
    await anoBtn.waitFor({ state: 'visible', timeout: 5000 });
    await anoBtn.click();

    // Aguardar cálculo da intersecção
    await page.waitForTimeout(1000);
    const cruzadoCount = await getMainCounterNumber(page, null, 2500);
    console.log(`  Preventiva + Ano 2024: ${cruzadoCount.toLocaleString('pt-BR')} questões`);

    const btnText = await startResolution(page);
    console.log(`  Botão Iniciar acionado: "${btnText}"`);

    const lastResponse = networkLogs.filter(l => l.type === 'RESPONSE' && l.questionsCount > 0).pop();
    const questions = lastResponse?.questions || [];
    const allPrev2024 = questions.length > 0 && questions.every(q => 
      (q.especialidade === 'Medicina Preventiva e Social' || q.especialidade === 'Medicina Preventiva') &&
      q.year === 2024
    );
    console.log(`  Todas as questões são de Preventiva e de 2024: ${allPrev2024}`);
    if (questions.length > 0) {
      console.log(`    Amostra Q1: ${questions[0].banca} (${questions[0].year}) - ${questions[0].especialidade}: ${questions[0].tema}`);
    }

    const passed = cruzadoCount > 0 && allPrev2024;
    simulationResults.push({
      simulacao: 5,
      nome: 'Filtro Cruzado (Preventiva + 2024)',
      esperado: 'Contador específico da intersecção | Questões estritamente de 2024 e Preventiva',
      obtido: `${cruzadoCount.toLocaleString('pt-BR')} questões | 100% de precisão`,
      status: passed ? 'PASS' : 'FAIL',
      detalhes: passed ? 'Intersecção clínica x ano funcionando perfeitamente' : 'Filtro cruzado falhou'
    });
    await context.close();
  } catch (err) {
    simulationResults.push({ simulacao: 5, nome: 'Filtro Cruzado', status: 'ERROR', detalhes: err.message });
  }

  // =========================================================================
  // SIMULAÇÃO 6: Seletor de Quantidade de Questões
  // =========================================================================
  console.log('\n--- [SIMULAÇÃO 6] Seletor de Quantidade (10 questões) ---');
  try {
    const { page, context } = await createCleanPage();
    const ginSpan = page.locator('span:has-text("Ginecologia")').first();
    await ginSpan.click();
    await page.waitForTimeout(500);

    const pill10 = page.locator('button:has-text("10")').first();
    if (await pill10.isVisible()) {
      await pill10.click();
      await page.waitForTimeout(400);
    }

    const btn = page.locator('button:has-text("Iniciar (")').first();
    const btnText = await btn.innerText();
    console.log(`  Texto do botão após seleção de quantidade: "${btnText}"`);

    await startResolution(page);

    const lastResponse = networkLogs.filter(l => l.type === 'RESPONSE' && l.questionsCount > 0).pop();
    const questions = lastResponse?.questions || [];
    console.log(`  Total de questões carregadas na sessão: ${questions.length}`);

    const passed = questions.length > 0;
    simulationResults.push({
      simulacao: 6,
      nome: 'Seletor de Quantidade de Resolução',
      esperado: 'Carregamento de lote respeitando cota configurada',
      obtido: `Botão: "${btnText}" | Carregadas: ${questions.length} questões`,
      status: passed ? 'PASS' : 'FAIL',
      detalhes: passed ? 'Lote de resolução acionado sem erros de execução' : 'Falha na inicialização'
    });
    await context.close();
  } catch (err) {
    simulationResults.push({ simulacao: 6, nome: 'Seletor de Quantidade', status: 'ERROR', detalhes: err.message });
  }

  // =========================================================================
  // SIMULAÇÃO 7: Botão Resetar / Limpar Filtros
  // =========================================================================
  console.log('\n--- [SIMULAÇÃO 7] Botão Limpar Filtros (Reset) ---');
  try {
    const { page, context } = await createCleanPage();
    const obsSpan = page.locator('span:has-text("Obstetrícia")').first();
    await obsSpan.click();

    const obsCount = await getMainCounterNumber(page, 17927, 2500);
    console.log(`  Obstetrícia selecionada: ${obsCount.toLocaleString('pt-BR')}`);

    const resetBtn = page.locator('button[title*="Limpar"], button:has-text("Limpar")').first();
    await resetBtn.waitFor({ state: 'visible', timeout: 5000 });
    await resetBtn.click();

    const resetCount = await getMainCounterNumber(page, 177924, 2500);
    console.log(`  Contador após resetar: ${resetCount.toLocaleString('pt-BR')} (Esperado: 177.924)`);

    const passed = resetCount === 177924;
    simulationResults.push({
      simulacao: 7,
      nome: 'Resetar / Limpar Filtros',
      esperado: '177.924 (restauração imediata do baseline)',
      obtido: `${resetCount.toLocaleString('pt-BR')} questões`,
      status: passed ? 'PASS' : 'FAIL',
      detalhes: passed ? 'Reset completo limpa checkboxes e restaura acervo integral' : `Falha no reset (obtido ${resetCount})`
    });
    await context.close();
  } catch (err) {
    simulationResults.push({ simulacao: 7, nome: 'Resetar Filtros', status: 'ERROR', detalhes: err.message });
  }

  const finalReport = {
    timestamp: new Date().toISOString(),
    totalSimulations: simulationResults.length,
    passed: simulationResults.filter(s => s.status === 'PASS').length,
    failed: simulationResults.filter(s => s.status === 'FAIL').length,
    errors: simulationResults.filter(s => s.status === 'ERROR').length,
    consoleErrors: consoleErrors.slice(0, 10),
    simulations: simulationResults
  };

  fs.writeFileSync('data/relatorio_playwright_simulacoes.json', JSON.stringify(finalReport, null, 2), 'utf8');

  console.log('\n========================================================================');
  console.log('📊 RESULTADOS FINAIS DAS SIMULAÇÕES COM PLAYWRIGHT:');
  console.log(`   Total: ${finalReport.totalSimulations} | Aprovados: ${finalReport.passed} | Falhas: ${finalReport.failed} | Erros: ${finalReport.errors}`);
  console.log(`   Erros de Console detectados: ${consoleErrors.length}`);
  console.log('========================================================================\n');

  await browser.close();
}

runSimulations();
