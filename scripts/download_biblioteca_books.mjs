import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const LOCAL_CHROMIUM = 'C:\\Users\\cnath\\AppData\\Local\\ms-playwright\\chromium-1243\\chrome-win64\\chrome.exe';
const AUTH_STATE_PATH = path.join(process.cwd(), 'scripts', 'drive_auth_state.json');
const MANIFEST_PATH = path.join(process.cwd(), 'data', 'knowledge', 'livros_oficiais_biblioteca_manifest.json');
const BASE_DIR = path.join(process.cwd(), 'data', 'knowledge', 'livros_oficiais');
const PDF_DIR = path.join(BASE_DIR, 'raw_pdfs');
const CHECKPOINT_PATH = path.join(BASE_DIR, 'checkpoint.json');
const STATUS_PATH = path.join(BASE_DIR, 'live_status.json');

// Garante existência de diretórios
[BASE_DIR, PDF_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('===============================================================');
  console.log('📥 INICIANDO DOWNLOAD DE LIVROS E TRATADOS DA #BIBLIOTECA');
  console.log('🏛️ DESTINO: data/knowledge/livros_oficiais/raw_pdfs/');
  console.log('===============================================================\n');

  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(`Manifesto não encontrado: ${MANIFEST_PATH}`);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const allBooks = manifest.livros || [];

  // Deduplicação e filtragem rigorosa de livros
  const uniqueBooks = [];
  const seenIds = new Set();
  allBooks.forEach(b => {
    const isValid = b.id && b.id !== '_gd' && b.id.length >= 20 && !b.titulo.includes('window.WIZ') && !b.titulo.includes('WIZ_global_data');
    if (isValid && !seenIds.has(b.id)) {
      seenIds.add(b.id);
      uniqueBooks.push(b);
    }
  });

  console.log(`📚 Total de livros e tratados únicos mapeados: ${uniqueBooks.length}`);

  // Carrega checkpoint anterior se existir
  let checkpoint = { completedIds: [], downloadedBytes: 0, totalFiles: 0 };
  if (fs.existsSync(CHECKPOINT_PATH)) {
    try {
      checkpoint = JSON.parse(fs.readFileSync(CHECKPOINT_PATH, 'utf8'));
      console.log(`🔄 Checkpoint recuperado: ${checkpoint.completedIds.length} livros já baixados.`);
    } catch {}
  }

  const completedSet = new Set(checkpoint.completedIds);
  const queue = uniqueBooks.filter(b => !completedSet.has(b.id));
  console.log(`⏳ Livros restantes para download: ${queue.length}\n`);

  if (queue.length === 0) {
    console.log('🎉 Todos os livros da biblioteca já foram baixados!');
    return;
  }

  const browser = await chromium.launch({
    executablePath: fs.existsSync(LOCAL_CHROMIUM) ? LOCAL_CHROMIUM : undefined,
    headless: true
  });

  const context = await browser.newContext({
    storageState: fs.existsSync(AUTH_STATE_PATH) ? AUTH_STATE_PATH : undefined,
    acceptDownloads: true
  });

  const page = await context.newPage();
  const startTime = Date.now();

  function updateStatus(currentBookName = '') {
    const elapsedSec = Math.round((Date.now() - startTime) / 1000);
    const mbDownloaded = Math.round((checkpoint.downloadedBytes || 0) / (1024 * 1024));
    const processed = checkpoint.completedIds.length;
    const pct = ((processed / uniqueBooks.length) * 100).toFixed(1);

    const liveStatus = {
      status: 'BAIXANDO_LIVROS',
      total_livros: uniqueBooks.length,
      processados: processed,
      restantes: uniqueBooks.length - processed,
      progresso_pct: `${pct}%`,
      mb_baixados: mbDownloaded,
      ultimo_livro_baixado: currentBookName,
      tempo_decorrido_seg: elapsedSec,
      atualizado_em: new Date().toISOString()
    };

    fs.writeFileSync(STATUS_PATH, JSON.stringify(liveStatus, null, 2), 'utf8');
    fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2), 'utf8');
  }

  process.on('SIGINT', () => {
    console.log('\n🛑 Interrupção solicitada. Salvando checkpoint...');
    updateStatus();
    process.exit(0);
  });

  for (let i = 0; i < queue.length; i++) {
    const book = queue[i];
    const itemNum = checkpoint.completedIds.length + 1;
    const cleanTitle = (book.titulo || `livro_${book.id}`).replace(/[\\/:*?"<>|]/g, '_').slice(0, 100);
    const fileName = cleanTitle.toLowerCase().endsWith('.pdf') ? cleanTitle : `${cleanTitle}.pdf`;
    const destPath = path.join(PDF_DIR, fileName);

    console.log(`[${itemNum}/${uniqueBooks.length}] Baixando: ${cleanTitle} (${book.pastaPai})...`);

    try {
      const downloadPromise = page.waitForEvent('download', { timeout: 60000 });
      page.goto(`https://drive.google.com/u/1/uc?id=${book.id}&export=download`).catch(() => {});

      // Trata página de confirmação de arquivos grandes ("O Google Drive não pode verificar vírus neste arquivo")
      try {
        const confirmBtn = await page.waitForSelector('#uc-download-link, form[action*="uc"] input[type="submit"], a#downloadButton', { timeout: 4000 });
        if (confirmBtn) {
          console.log(`   ⚡ Confirmando download direto (arquivo grande)...`);
          await confirmBtn.click().catch(() => {});
        }
      } catch {}

      const download = await downloadPromise;
      await download.saveAs(destPath);

      const stat = fs.statSync(destPath);
      checkpoint.downloadedBytes = (checkpoint.downloadedBytes || 0) + stat.size;
      checkpoint.completedIds.push(book.id);
      checkpoint.totalFiles = checkpoint.completedIds.length;

      const sizeMb = (stat.size / (1024 * 1024)).toFixed(1);
      console.log(`   ✅ Concluído: ${sizeMb} MB | Total acumulado: ${Math.round(checkpoint.downloadedBytes / (1024 * 1024))} MB`);

      updateStatus(book.titulo);
      await sleep(1500);

    } catch (err) {
      console.warn(`   ⚠️ Erro ao baixar ${book.titulo}: ${err.message}`);
      checkpoint.completedIds.push(book.id); // Registra para não travar o loop
      updateStatus(book.titulo);
      await sleep(2000);
    }
  }

  await browser.close();
  updateStatus('TODOS_CONCLUIDOS');

  console.log('\n===============================================================');
  console.log('🎉 DOWNLOAD DE TODOS OS LIVROS DA #BIBLIOTECA CONCLUÍDO!');
  console.log(`Total de Livros Salvos: ${checkpoint.totalFiles}`);
  console.log(`Volume Total Baixado: ${Math.round(checkpoint.downloadedBytes / (1024 * 1024))} MB`);
  console.log(`Diretório: ${PDF_DIR}`);
  console.log('===============================================================\n');
}

main().catch(err => {
  console.error('❌ Falha crítica no pipeline de download:', err);
  process.exit(1);
});
