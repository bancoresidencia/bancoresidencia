import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const LOCAL_CHROMIUM = 'C:\\Users\\cnath\\AppData\\Local\\ms-playwright\\chromium-1243\\chrome-win64\\chrome.exe';
const AUTH_STATE_PATH = path.join(process.cwd(), 'scripts', 'drive_auth_state.json');
const ROOT_URL = 'https://drive.google.com/drive/u/1/folders/1of5LXk6356MWq-85JPxGOsMqttbwfudy';
const OUTPUT_MANIFEST = path.join(process.cwd(), 'data', 'knowledge', 'livros_oficiais_biblioteca_manifest.json');
const STATUS_PATH = path.join(process.cwd(), 'data', 'knowledge', 'biblioteca_crawl_live_status.json');

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('===============================================================');
  console.log('📚 INICIANDO MAPEAMENTO DA #BIBLIOTECA NO GOOGLE DRIVE');
  console.log('🏛️ ESCOPO: 14 PASTAS MÉDICAS OFICIAIS & TRATADOS CLÁSSICOS');
  console.log('===============================================================\n');

  const browser = await chromium.launch({
    executablePath: fs.existsSync(LOCAL_CHROMIUM) ? LOCAL_CHROMIUM : undefined,
    headless: true
  });

  const context = await browser.newContext({
    storageState: fs.existsSync(AUTH_STATE_PATH) ? AUTH_STATE_PATH : undefined
  });

  const page = await context.newPage();
  console.log('🔗 Conectando à pasta raiz #Biblioteca...');
  await page.goto(ROOT_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  // 1. Extrai as 14 pastas principais
  const rootFolders = await page.evaluate(() => {
    const list = [];
    const seen = new Set();
    const rows = Array.from(document.querySelectorAll('[data-id]'));
    for (const r of rows) {
      const id = r.getAttribute('data-id');
      const text = (r.innerText || '').split('\n').map(s => s.trim()).filter(s => s.length > 1);
      const name = text[0];
      if (id && name && /^\d{2}\s*-\s*/.test(name) && !seen.has(name)) {
        seen.add(name);
        list.push({ id, name });
      }
    }
    return list;
  });

  console.log(`✅ ${rootFolders.length} pastas principais identificadas na raiz:`);
  rootFolders.forEach(f => console.log(`   📁 ${f.name} (ID: ${f.id})`));

  const manifest = {
    rootFolder: '#Biblioteca',
    url: ROOT_URL,
    totalPastas: rootFolders.length,
    pastas: [],
    totalLivrosEncontrados: 0,
    livros: [],
    atualizadoEm: new Date().toISOString()
  };

  const startTime = Date.now();

  // 2. Para cada pasta, entra e lista os livros/arquivos e subpastas
  for (let i = 0; i < rootFolders.length; i++) {
    const folder = rootFolders[i];
    console.log(`\n📂 [${i + 1}/${rootFolders.length}] Mapeando acervo em: ${folder.name}...`);

    try {
      await page.goto(`https://drive.google.com/drive/u/1/folders/${folder.id}`, {
        waitUntil: 'domcontentloaded',
        timeout: 35000
      });
      await page.waitForTimeout(4000);

      const itemsInFolder = await page.evaluate((folderName) => {
        const items = [];
        const seen = new Set();
        const rows = Array.from(document.querySelectorAll('[data-id]'));
        for (const r of rows) {
          const id = r.getAttribute('data-id');
          const text = (r.innerText || '').split('\n').map(s => s.trim()).filter(s => s.length > 0);
          const title = text[0] || '';
          if (id && title && title.length > 2 && !seen.has(id) && title !== folderName) {
            seen.add(id);
            const isFolder = !title.toLowerCase().includes('.pdf') && !title.toLowerCase().includes('.epub') && !text.some(t => t.includes('KB') || t.includes('MB') || t.includes('GB'));
            items.push({
              id,
              titulo: title,
              tipo: isFolder ? 'subpasta' : 'livro_pdf',
              detalhes: text.join(' | ')
            });
          }
        }
        return items;
      }, folder.name);

      console.log(`   📄 Encontrados: ${itemsInFolder.length} itens em ${folder.name}`);

      const folderEntry = {
        id: folder.id,
        nome: folder.name,
        totalItens: itemsInFolder.length,
        itens: itemsInFolder
      };

      manifest.pastas.push(folderEntry);

      itemsInFolder.forEach(it => {
        if (it.tipo === 'livro_pdf' || it.titulo.toLowerCase().endsWith('.pdf') || it.titulo.toLowerCase().endsWith('.epub')) {
          manifest.livros.push({
            id: it.id,
            titulo: it.titulo,
            pastaPai: folder.name,
            pastaId: folder.id,
            url: `https://drive.google.com/file/d/${it.id}/view`
          });
        }
      });

      manifest.totalLivrosEncontrados = manifest.livros.length;

      // Atualiza status ao vivo
      const elapsedSec = Math.round((Date.now() - startTime) / 1000);
      const liveStatus = {
        status: 'MAPEANDO_DRIVE',
        pasta_atual: folder.name,
        pastas_concluidas: i + 1,
        total_pastas: rootFolders.length,
        livros_identificados: manifest.totalLivrosEncontrados,
        tempo_decorrido_seg: elapsedSec,
        atualizado_em: new Date().toISOString()
      };
      fs.writeFileSync(STATUS_PATH, JSON.stringify(liveStatus, null, 2), 'utf8');
      fs.writeFileSync(OUTPUT_MANIFEST, JSON.stringify(manifest, null, 2), 'utf8');

      await sleep(1500);

    } catch (err) {
      console.warn(`   ⚠️ Erro ao acessar pasta ${folder.name}:`, err.message);
    }
  }

  await browser.close();

  console.log('\n===============================================================');
  console.log('🎉 MAPEAMENTO DA #BIBLIOTECA CONCLUÍDO COM SUCESSO!');
  console.log(`Total de Livros e Tratados Identificados: ${manifest.totalLivrosEncontrados}`);
  console.log(`Manifesto salvo em: ${OUTPUT_MANIFEST}`);
  console.log('===============================================================\n');
}

main().catch(err => {
  console.error('❌ Erro no mapeador:', err);
  process.exit(1);
});
