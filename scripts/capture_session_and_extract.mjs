import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const AUTH_STATE_PATH = path.join(process.cwd(), 'scripts', 'drive_auth_state.json');
const TARGET_URL = 'https://drive.google.com/drive/u/1/folders/1_cgWHry1w_sJjQhrqIvW5ry0n7kv-slx';

async function main() {
  console.log('🚀 Iniciando navegador para sincronizar a sessão do Google Drive...');
  
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    storageState: fs.existsSync(AUTH_STATE_PATH) ? AUTH_STATE_PATH : undefined,
    viewport: null
  });

  const page = await context.newPage();
  console.log(`🌐 Acessando pasta: ${TARGET_URL}`);
  await page.goto(TARGET_URL);

  console.log('\n⏳ Aguardando você acessar/visualizar a pasta na janela...');
  console.log('Assim que a pasta estiver carregada com os arquivos, o script detectará automaticamente!\n');

  // Aguarda até que os arquivos ou a tabela do Google Drive apareçam na tela
  let authenticated = false;
  for (let i = 0; i < 120; i++) { // até 4 minutos
    await page.waitForTimeout(2000);
    const url = page.url();
    const isDrive = url.includes('drive.google.com') && !url.includes('signin') && !url.includes('ServiceLogin');
    
    if (isDrive) {
      // Verifica se há linhas ou elementos da pasta
      const hasContent = await page.evaluate(() => {
        const rows = document.querySelectorAll('tr[role="row"][data-id], div[role="row"], div[data-id]');
        return rows.length > 0;
      }).catch(() => false);

      if (hasContent || i > 10) {
        console.log('🎉 Pasta detectada e carregada na tela!');
        await context.storageState({ path: AUTH_STATE_PATH });
        console.log('💾 Sessão salva com sucesso em scripts/drive_auth_state.json!');
        authenticated = true;
        break;
      }
    }
  }

  if (!authenticated) {
    console.warn('⚠️ Tempo limite atingido sem detectar a pasta aberta.');
    await browser.close();
    return;
  }

  // Lista os itens da pasta diretamente
  const items = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr[role="row"][data-id]'));
    return rows.map(r => {
      const strong = r.querySelector('strong, span.WQJtxb');
      const text = strong ? strong.textContent.trim() : (r.innerText || '').split('\n')[0].trim();
      return { id: r.getAttribute('data-id'), text };
    }).filter(x => x.id && x.text);
  });

  console.log(`📦 Encontrados ${items.length} itens na pasta de Gineco:`);
  for (const it of items) {
    console.log(`   - [${it.id}] ${it.text}`);
  }

  // Salva a lista de arquivos para a extração
  fs.writeFileSync(
    path.join(process.cwd(), 'scripts', 'gineco_drive_items.json'),
    JSON.stringify(items, null, 2),
    'utf8'
  );

  await browser.close();
  console.log('\n✅ Sessão e lista de arquivos sincronizadas com sucesso!');
}

main().catch(console.error);
