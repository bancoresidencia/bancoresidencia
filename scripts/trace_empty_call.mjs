import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('request', req => {
    if (req.url().includes('/api/questions')) {
      const data = req.postDataJSON() || {};
      console.log('>>> API REQUEST:', {
        action: data.action || 'query',
        page: data.page,
        pageSize: data.pageSize,
        filters: {
          modalidades: data.filters?.modalidades,
          especialidades: data.filters?.especialidades,
          instituicoes: data.filters?.instituicoes
        },
        hasQuestionIds: Boolean(data.questionIds && data.questionIds.length > 0),
        questionIdsCount: data.questionIds?.length,
        questionIdsSample: data.questionIds?.slice(0, 3)
      });
    }
  });

  page.on('response', async res => {
    if (res.url().includes('/api/questions')) {
      try {
        const json = await res.json();
        console.log('<<< API RESPONSE:', {
          status: res.status(),
          total: json.total,
          questionsCount: json.questions?.length
        });
      } catch {}
    }
  });

  await page.goto('http://localhost:3000/questoes', { waitUntil: 'networkidle' });

  // Switch to Revalida
  console.log('\n--- 1. Switching to Revalida ---');
  await page.locator('button:has-text("Revalida")').first().click();
  await page.waitForTimeout(1000);

  // Click Cirurgia Geral
  console.log('\n--- 2. Clicking Cirurgia Geral ---');
  await page.locator('span:has-text("Cirurgia Geral")').first().click();
  await page.waitForTimeout(1000);

  // Click Iniciar
  console.log('\n--- 3. Clicking Iniciar (50) ---');
  const btn = page.locator('button:has-text("Iniciar (")').first();
  await btn.click();

  await page.waitForTimeout(4000);
  await browser.close();
})();

