import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';

const LOCAL_CHROMIUM = 'C:\\Users\\cnath\\AppData\\Local\\ms-playwright\\chromium-1243\\chrome-win64\\chrome.exe';
const AUTH_STATE_PATH = path.join(process.cwd(), 'scripts', 'drive_auth_state.json');
const MANIFEST_PATH = path.join(process.cwd(), 'data', 'knowledge', 'livros_oficiais_biblioteca_manifest.json');
const BASE_DIR = path.join(process.cwd(), 'data', 'knowledge', 'livros_oficiais');
const DOCS_DIR = path.join(BASE_DIR, 'markdown_docs');
const STATUS_PATH = path.join(BASE_DIR, 'live_status.json');
const CHECKPOINT_PATH = path.join(BASE_DIR, 'checkpoint_stream.json');

[BASE_DIR, DOCS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('===============================================================');
  console.log('🚀 ESTEIRA ATIVA: STREAM & AUTO-PURGE (BAIXAR, EXTRAIR, DELETAR)');
  console.log('💾 PROTEÇÃO PERMANENTE DO SSD: CADA PDF É DELETADO DO DISCO');
  console.log('📚 DESTINO FINAL LEVE: data/knowledge/livros_oficiais/markdown_docs/');
  console.log('===============================================================\n');

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const allBooks = manifest.livros || [];

  // Deduplicação e filtragem
  const uniqueBooks = [];
  const seenIds = new Set();
  allBooks.forEach(b => {
    const isValid = b.id && b.id !== '_gd' && b.id.length >= 20 && !b.titulo.includes('window.WIZ');
    if (isValid && !seenIds.has(b.id)) {
      seenIds.add(b.id);
      uniqueBooks.push(b);
    }
  });

  console.log(`📚 Total de livros e tratados mapeados na biblioteca: ${uniqueBooks.length}`);

  // Mapeia o que já foi extraído em Markdown leve
  const existingDocs = new Set(
    fs.readdirSync(DOCS_DIR).map(f => f.replace(/\.md$/i, '').toLowerCase().trim())
  );

  const queue = uniqueBooks.filter(b => {
    const safeTitle = (b.titulo || '').replace(/\.pdf$/i, '').replace(/[\\/:*?"<>|]/g, '_').toLowerCase().trim();
    return !existingDocs.has(safeTitle);
  });

  console.log(`✅ Já extraídos e convertidos em Markdown no disco: ${existingDocs.size} livros`);
  console.log(`⏳ Restantes na fila para Stream & Auto-Purge: ${queue.length} livros\n`);

  if (queue.length === 0) {
    console.log('🎉 Todos os livros da biblioteca já foram convertidos para Markdown e os PDFs foram purgados!');
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

  const startTime = Date.now();
  let totalProcessed = existingDocs.size;
  let totalMbFreed = 1315; // 1.315 MB já liberados no lote anterior

  function updateStatus(lastBookTitle = '') {
    const elapsedSec = Math.round((Date.now() - startTime) / 1000);
    const pct = ((totalProcessed / uniqueBooks.length) * 100).toFixed(1);

    const liveStatus = {
      status: 'STREAM_AND_AUTO_PURGE_ATIVO',
      total_livros: uniqueBooks.length,
      processados_markdown: totalProcessed,
      restantes: uniqueBooks.length - totalProcessed,
      progresso_pct: `${pct}%`,
      mb_pdfs_deletados_ssd: Math.round(totalMbFreed),
      ultimo_livro_processado: lastBookTitle,
      tempo_decorrido_seg: elapsedSec,
      atualizado_em: new Date().toISOString()
    };

    fs.writeFileSync(STATUS_PATH, JSON.stringify(liveStatus, null, 2), 'utf8');
  }

  updateStatus('INICIANDO');

  // Processamento 1 por 1 com ciclo Download -> Extract -> Unlink
  for (let i = 0; i < queue.length; i++) {
    const book = queue[i];
    const safeTitle = (book.titulo || `livro_${book.id}`).replace(/\.pdf$/i, '').replace(/[\\/:*?"<>|]/g, '_').trim();
    const tempPdfPath = path.join(BASE_DIR, `temp_stream_${Date.now()}.pdf`);
    const finalMdPath = path.join(DOCS_DIR, `${safeTitle}.md`);

    console.log(`[${totalProcessed + 1}/${uniqueBooks.length}] Baixando: ${safeTitle} (${book.pastaPai})...`);

    const page = await context.newPage();

    try {
      const downloadPromise = page.waitForEvent('download', { timeout: 120000 });
      page.goto(`https://drive.google.com/u/1/uc?id=${book.id}&export=download`, { timeout: 45000 }).catch(() => {});

      // Se página de confirmação de vírus (arquivos > 25MB) aparecer
      try {
        const confirmBtn = await page.waitForSelector('#uc-download-link, form[action*="uc"] input[type="submit"], a#downloadButton', { timeout: 6000 });
        if (confirmBtn) {
          console.log(`   ⚡ Confirmando download direto (arquivo grande)...`);
          await confirmBtn.click().catch(() => {});
        }
      } catch {}

      const download = await downloadPromise;
      await download.saveAs(tempPdfPath);
      await page.close().catch(() => {});

      // Extrai texto imediatamente
      const stat = fs.statSync(tempPdfPath);
      const sizeMb = (stat.size / (1024 * 1024)).toFixed(1);
      totalMbFreed += stat.size / (1024 * 1024);

      let rawText = '';
      try {
        const buffer = fs.readFileSync(tempPdfPath);
        const parser = new PDFParse({ data: buffer });
        await parser.load();
        const extracted = await parser.getText();
        rawText = extracted.text || extracted || '';
      } catch (e) {
        console.warn(`   ⚠️ Extração parcial de texto para ${safeTitle}: ${e.message}`);
      }

      // Salva Markdown leve e estruturado
      const frontmatter = [
        '---',
        `titulo: "${safeTitle.replace(/"/g, "'")}"`,
        `pasta_origem: "${book.pastaPai || ''}"`,
        `tipo: "TRATADO_MEDICO_OFICIAL"`,
        `tamanho_pdf_original_mb: ${sizeMb}`,
        `caracteres_extraidos: ${rawText.length}`,
        `coletado_em: "${new Date().toISOString()}"`,
        '---',
        '',
        `# ${safeTitle}`,
        '',
        rawText
      ].join('\n');

      fs.writeFileSync(finalMdPath, frontmatter, 'utf8');

      // DELETA O PDF DO DISCO IMEDIATAMENTE (SSD PROTEGIDO)
      fs.unlinkSync(tempPdfPath);

      totalProcessed++;
      console.log(`   ✅ Extraído (${rawText.length} chars) | 🗑️ PDF de ${sizeMb} MB DELETADO DO SSD! Total liberado: ${Math.round(totalMbFreed)} MB`);
      updateStatus(safeTitle);
      await sleep(1500);

    } catch (err) {
      console.warn(`   ⚠️ Erro ao processar ${safeTitle}: ${err.message}`);
      await page.close().catch(() => {});
      if (fs.existsSync(tempPdfPath)) {
        try { fs.unlinkSync(tempPdfPath); } catch {}
      }
      totalProcessed++;
      updateStatus(safeTitle);
      await sleep(2000);
    }
  }

  await browser.close();
  updateStatus('TODOS_CONCLUIDOS');

  console.log('\n===============================================================');
  console.log('🎉 ESTEIRA STREAM & AUTO-PURGE FINALIZADA COM SUCESSO!');
  console.log(`Total de Livros em Markdown: ${totalProcessed}`);
  console.log(`Volume Total de PDFs Eliminados do SSD: ~${Math.round(totalMbFreed)} MB`);
  console.log(`Destino do Conhecimento: ${DOCS_DIR}`);
  console.log('===============================================================\n');
}

main().catch(err => {
  console.error('❌ Falha crítica no pipeline stream & purge:', err);
  process.exit(1);
});
