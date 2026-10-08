import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { PDFParse } from 'pdf-parse';

const BASE_DIR = process.cwd();
const AUTH_STATE_PATH = path.join(BASE_DIR, 'scripts', 'drive_auth_state.json');
const KNOWLEDGE_DIR = path.join(BASE_DIR, 'data', 'knowledge');
const TEMP_PDF_PATH = path.join(KNOWLEDGE_DIR, 'temp_remaining.pdf');

const REMAINING_SPECIALTIES = [
  { name: 'Ortopedia', id: '1GO9mFEkz8TSmwfbQhv4rrP5X_0MSpVb2' },
  { name: 'Otorrinolaringologia', id: '1DvT5hKAJPxwzH7gJupsmlf2MYYFMfOGi' },
  { name: 'Oftalmologia', id: '1DJ3HRvTymog94uj6OP_uYF2AuK-KQseb' },
  { name: 'Radiologia', id: '1um-VqeCSm4PKdQE5jIO490G-PPmBv1Gl' }
];

function sanitize(name) {
  return name.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, ' ').trim();
}

function cleanBookName(raw) {
  return raw
    .replace(/^Cópia de\s+/i, '')
    .replace(/\.pdf$/i, '')
    .replace(/^\d+[\s.-_]*/, '')
    .trim();
}

function segmentTextIntoChunks(rawText, bookTitle, specialty, theme) {
  const paragraphs = rawText.split(/\n\s*\n+/);
  const chunks = [];
  let currentChunk = [];
  let currentWordCount = 0;
  let chunkIndex = 1;

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed || trimmed.length < 20) continue;
    if (trimmed.includes('Estratégia MED') && trimmed.length < 60) continue;

    const words = trimmed.split(/\s+/).length;
    currentChunk.push(trimmed);
    currentWordCount += words;

    if (currentWordCount >= 350) {
      chunks.push({
        id: `${sanitize(specialty)}_${sanitize(theme)}_${chunkIndex++}`,
        specialty,
        theme,
        source: bookTitle,
        content: currentChunk.join('\n\n')
      });
      currentChunk = [];
      currentWordCount = 0;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push({
      id: `${sanitize(specialty)}_${sanitize(theme)}_${chunkIndex++}`,
      specialty,
      theme,
      source: bookTitle,
      content: currentChunk.join('\n\n')
    });
  }

  return chunks;
}

async function extractPDF(pdfPath, bookTitle, specialty, theme) {
  try {
    const buffer = fs.readFileSync(pdfPath);
    const parser = new PDFParse({ data: buffer });
    await parser.load();
    const result = await parser.getText();
    const rawText = (typeof result === 'string' ? result : (result?.text || '')).trim();
    const chunks = segmentTextIntoChunks(rawText, bookTitle, specialty, theme);

    return {
      success: true,
      characters: rawText.length,
      chunksCount: chunks.length,
      chunks
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function run() {
  console.log('🚀 Iniciando extração dos livros restantes (Ortopedia, Otorrino, Oftalmo, Radiologia)...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: AUTH_STATE_PATH,
    acceptDownloads: true
  });
  const page = await context.newPage();

  let processedCount = 0;

  try {
    for (const spec of REMAINING_SPECIALTIES) {
      const specDir = path.join(KNOWLEDGE_DIR, sanitize(spec.name));
      if (!fs.existsSync(specDir)) fs.mkdirSync(specDir, { recursive: true });

      console.log(`\n📚 [Especialidade] ${spec.name}...`);
      const specUrl = `https://drive.google.com/drive/folders/${spec.id}`;
      await page.goto(specUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(3000);

      // Listar arquivos diretos na pasta
      const files = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('tr[role="row"][data-id]'));
        return rows.map(r => {
          const strong = r.querySelector('strong, span.WQJtxb');
          const fullName = strong ? strong.textContent.trim() : r.innerText.split('\t')[0].trim();
          return {
            id: r.getAttribute('data-id'),
            fullName
          };
        }).filter(f => f.id && f.fullName.endsWith('.pdf'));
      });

      console.log(`   Encontrados ${files.length} livros diretos em ${spec.name}.`);

      for (const file of files) {
        const cleanName = cleanBookName(file.fullName);
        const jsonOutput = path.join(specDir, `${sanitize(cleanName)}.json`);

        if (fs.existsSync(jsonOutput)) {
          console.log(`   ⏭️ Já extraído: ${spec.name} -> ${cleanName}`);
          continue;
        }

        console.log(`   📥 Baixando livro: ${file.fullName}...`);

        try {
          let download = null;

          // Tentativa 1: Export link direto
          try {
            const dlPromise = page.waitForEvent('download', { timeout: 15000 });
            await page.goto(`https://drive.usercontent.google.com/u/0/uc?id=${file.id}&export=download`, {
              timeout: 15000
            }).catch(() => {});
            download = await dlPromise;
          } catch {}

          // Tentativa 2: Visualização e clique
          if (!download) {
            const fileViewUrl = `https://drive.google.com/file/d/${file.id}/view`;
            await page.goto(fileViewUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
            await page.waitForTimeout(2500);

            try {
              const dlPromise = page.waitForEvent('download', { timeout: 20000 });
              const clicked = await page.evaluate(() => {
                const btn = document.querySelector('[aria-label="Baixar"], button[aria-label*="download" i]');
                if (btn) { btn.click(); return true; }
                return false;
              });

              if (clicked) {
                download = await dlPromise;
              } else {
                dlPromise.catch(() => {});
              }
            } catch {}
          }

          if (!download) {
            console.log(`   ⚠️ Falha ao baixar ${file.fullName}`);
            continue;
          }

          await download.saveAs(TEMP_PDF_PATH);
          const result = await extractPDF(TEMP_PDF_PATH, cleanName, spec.name, cleanName);

          if (fs.existsSync(TEMP_PDF_PATH)) {
            try { fs.unlinkSync(TEMP_PDF_PATH); } catch {}
          }

          if (result.success) {
            fs.writeFileSync(jsonOutput, JSON.stringify({
              specialty: spec.name,
              theme: cleanName,
              bookTitle: file.fullName,
              extractedAt: new Date().toISOString(),
              totalChunks: result.chunksCount,
              characters: result.characters,
              chunks: result.chunks
            }, null, 2), 'utf8');

            processedCount++;
            console.log(`   ✅ Sucesso: ${cleanName} (${result.chunksCount} blocos indexados).`);
          } else {
            console.error(`   ❌ Erro ao extrair texto: ${result.error}`);
          }
        } catch (itemErr) {
          console.error(`   ⚠️ Erro em ${file.fullName}: ${itemErr.message}`);
          if (fs.existsSync(TEMP_PDF_PATH)) {
            try { fs.unlinkSync(TEMP_PDF_PATH); } catch {}
          }
        }
      }
    }

    console.log(`\n🎉 EXTRAÇÃO DOS RESTANTES CONCLUÍDA! (${processedCount} livros novos adicionados)`);
  } catch (err) {
    console.error('❌ Erro fatal:', err.message);
  } finally {
    if (fs.existsSync(TEMP_PDF_PATH)) {
      try { fs.unlinkSync(TEMP_PDF_PATH); } catch {}
    }
    await browser.close();
  }
}

run();
