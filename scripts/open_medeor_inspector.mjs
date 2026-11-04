import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const CONFIG_PATH = path.join(process.cwd(), 'scripts', 'medeor_config.json');
const LOG_PATH = path.join(process.cwd(), 'scripts', 'medeor_network_log.jsonl');
const TARGET_URL = 'https://medeor.com.br/questions/setup';

const CANDIDATE_CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Users\\cnath\\AppData\\Local\\ms-playwright\\chromium-1243\\chrome-win64\\chrome.exe'
];
const executablePath = CANDIDATE_CHROME.find(p => fs.existsSync(p));

async function main() {
  console.log('='.repeat(70));
  console.log('🚀 INICIANDO CHROMIUM VISÍVEL + MONITOR DE BACKEND MEDEOR');
  console.log('🛡️ REGRA ATIVA: NENHUMA EXTRAÇÃO MASSIVA - APENAS INSPEÇÃO E MAPEAMENTO');
  console.log('='.repeat(70));

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

  let capturedConfig = {};
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      capturedConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    } catch {}
  }

  // Intercepta todas as requisições
  page.on('request', async (req) => {
    const url = req.url();
    const method = req.method();
    const headers = req.headers();

    const isSupabase = url.includes('supabase.co');
    const isMedeorApi = url.includes('medeor.com.br/api') || url.includes('/_next/data') || url.includes('/questions');
    
    if (isSupabase || isMedeorApi) {
      const auth = headers['authorization'] || headers['Authorization'];
      const apikey = headers['apikey'] || headers['Apikey'];
      
      if (auth || apikey) {
        let changed = false;
        if (auth && auth !== capturedConfig.authorization) {
          capturedConfig.authorization = auth;
          changed = true;
        }
        if (apikey && apikey !== capturedConfig.apikey) {
          capturedConfig.apikey = apikey;
          changed = true;
        }
        if (isSupabase && !capturedConfig.supabaseUrl) {
          const match = url.match(/https:\/\/[^/]+/);
          if (match) {
            capturedConfig.supabaseUrl = match[0];
            changed = true;
          }
        }
        if (changed) {
          capturedConfig.updatedAt = new Date().toISOString();
          fs.writeFileSync(CONFIG_PATH, JSON.stringify(capturedConfig, null, 2), 'utf8');
          console.log('\n🔑 [CREDENCIAIS CAPTURADAS/ATUALIZADAS] -> Salvo em scripts/medeor_config.json');
        }
      }
    }
  });

  // Intercepta respostas relevantes
  page.on('response', async (res) => {
    const url = res.url();
    const status = res.status();
    const contentType = res.headers()['content-type'] || '';

    if (url.includes('supabase.co') || url.includes('medeor.com.br/api') || url.includes('questions')) {
      const entry = {
        timestamp: new Date().toISOString(),
        url,
        method: res.request().method(),
        status,
        contentType
      };

      if (contentType.includes('application/json') || contentType.includes('text/plain')) {
        try {
          const text = await res.text();
          try {
            const data = JSON.parse(text);
            entry.preview = Array.isArray(data) ? `Array(${data.length} itens)` : Object.keys(data);
            entry.sample = Array.isArray(data) ? data.slice(0, 2) : data;
            
            // Log no terminal se for endpoint relevante
            if (url.includes('/rest/v1/') || url.includes('/questions') || url.includes('/exams') || url.includes('/setup')) {
              console.log(`📡 [API RESPONSE ${status}] ${entry.method} ${url.split('?')[0]}`);
              if (Array.isArray(data)) {
                console.log(`   📦 Retornou ${data.length} registros. Chaves do 1º item:`, Object.keys(data[0] || {}));
              } else if (typeof data === 'object' && data !== null) {
                console.log(`   📦 Chaves recebidas:`, Object.keys(data).slice(0, 10));
              }
            }
          } catch {
            entry.rawSnippet = text.slice(0, 200);
          }
        } catch {}
      }

      fs.appendFileSync(LOG_PATH, JSON.stringify(entry) + '\n', 'utf8');
    }
  });

  console.log(`🌐 Navegando para: ${TARGET_URL}`);
  try {
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
  } catch (err) {
    console.warn('⚠️ Alerta na navegação inicial:', err.message);
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ CHROMIUM ABERTO E VISÍVEL NA SUA ÁREA DE TRABALHO!');
  console.log('👀 A página https://medeor.com.br/questions/setup está carregada.');
  console.log('📡 O monitor está ouvindo requisições de backend em tempo real.');
  console.log('👉 Se o login for solicitado ou se quiser navegar nas abas/filtros, interaja diretamente na janela.');
  console.log('='.repeat(70) + '\n');

  // Mantém ativo enquanto a página ou browser estiver aberto
  await new Promise((resolve) => {
    page.on('close', resolve);
    browser.on('disconnected', resolve);
  });

  console.log('🏁 Janela do Chromium encerrada.');
}

main().catch((err) => {
  console.error('❌ Erro no inspetor:', err.message);
  process.exit(1);
});

