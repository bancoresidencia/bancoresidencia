import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const SESSION_PATH = path.join(process.cwd(), 'scripts', 'medevo_session.json');

async function main() {
  console.log('===============================================================');
  console.log('🧪 TESTE RÁPIDO DO PLAYWRIGHT NO MEDEVO');
  console.log('===============================================================\n');

  if (!fs.existsSync(SESSION_PATH)) {
    console.error('❌ Arquivo de sessão scripts/medevo_session.json não encontrado.');
    process.exit(1);
  }

  const sessionData = JSON.parse(fs.readFileSync(SESSION_PATH, 'utf8'));
  console.log('🔑 Sessão encontrada para injeção limpa no navegador.');

  const CANDIDATE_CHROME = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Users\\cnath\\AppData\\Local\\ms-playwright\\chromium-1243\\chrome-win64\\chrome.exe'
  ];
  const executablePath = CANDIDATE_CHROME.find(p => fs.existsSync(p));

  const browser = await chromium.launch({
    executablePath,
    headless: false,
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-dev-shm-usage'
    ]
  });

  const context = await browser.newContext({
    viewport: null,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  // Monitora chamadas de rede para inspecionar requisições da API do MedEvo
  const interceptedApi = [];
  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('api.medevo.com.br') || url.includes('supabase.co')) {
      const status = res.status();
      const contentType = res.headers()['content-type'] || '';
      if (contentType.includes('application/json')) {
        try {
          const json = await res.json();
          interceptedApi.push({
            url,
            status,
            keys: typeof json === 'object' && json !== null ? (Array.isArray(json) ? `Array[${json.length}]` : Object.keys(json)) : typeof json
          });
          console.log(`📡 [API Interceptada]: ${url.split('?')[0].split('/').pop()} (HTTP ${status})`);
        } catch {}
      }
    }
  });

  console.log('🌐 [1/4] Acessando MedEvo para injetar sessão autenticada...');
  await page.goto('https://www.medevo.com.br/', { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Injeta a sessão no localStorage
  await page.evaluate(({ key, value }) => {
    localStorage.setItem(key, value);
  }, sessionData);

  console.log('💾 [2/4] Sessão injetada com sucesso! Recarregando página autenticada...');
  await page.reload({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});

  await page.waitForTimeout(3000);

  const currentUrl = page.url();
  const title = await page.title();
  console.log(`\n📌 [3/4] Página Carregada:`);
  console.log(`   URL: ${currentUrl}`);
  console.log(`   Título: ${title}`);

  // Verifica elementos na página
  const pageAnalysis = await page.evaluate(() => {
    const text = document.body.innerText;
    const buttons = Array.from(document.querySelectorAll('button, a')).map(b => b.innerText.trim()).filter(Boolean);
    return {
      hasQuestions: text.includes('Questões') || text.includes('Banco') || text.includes('Cadernos'),
      hasMaterialApoio: text.includes('Material de Apoio') || text.includes('Referências') || text.includes('Diretrizes'),
      buttonsSample: buttons.slice(0, 15),
      bodyLength: text.length
    };
  });

  console.log('\n📊 [4/4] Análise da Interface do Aluno:');
  console.log('   Detectou área de questões:', pageAnalysis.hasQuestions);
  console.log('   Detectou termo material de apoio:', pageAnalysis.hasMaterialApoio);
  console.log('   Botões / Menus encontrados:', pageAnalysis.buttonsSample.join(' | '));

  // Tira print de prova de conceito
  const screenshotPath = path.join(process.cwd(), 'scripts', 'medevo_pilot_screenshot.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`📸 Screenshot salvo em: ${screenshotPath}`);

  fs.writeFileSync('scripts/medevo_pilot_result.json', JSON.stringify({
    url: currentUrl,
    title,
    interceptedApi,
    pageAnalysis,
    tested_at: new Date().toISOString()
  }, null, 2), 'utf8');

  console.log('\n===============================================================');
  console.log('🎉 TESTE PILOTO DO PLAYWRIGHT CONCLUÍDO COM SUCESSO!');
  console.log('===============================================================\n');

  // Deixa a janela aberta 6 segundos para visualização
  await page.waitForTimeout(6000);
  await browser.close();
}

main().catch(err => {
  console.error('❌ Falha no teste piloto:', err);
  process.exit(1);
});
