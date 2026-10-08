import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { PDFParse } from 'pdf-parse';

const BASE_DIR = process.cwd();
const AUTH_STATE_PATH = path.join(BASE_DIR, 'scripts', 'drive_auth_state.json');
const KNOWLEDGE_DIR = path.join(BASE_DIR, 'data', 'knowledge');
const STATUS_PATH = path.join(BASE_DIR, 'data', 'extraction_status.json');
const TEMP_PDF_PATH = path.join(KNOWLEDGE_DIR, 'temp_book.pdf');

if (!fs.existsSync(KNOWLEDGE_DIR)) {
  fs.mkdirSync(KNOWLEDGE_DIR, { recursive: true });
}

// 21 Especialidades mapeadas da pasta principal
const SPECIALTIES = [
  { name: 'Psiquiatria', id: '11NVlRfXDbJUOy_Gcc9bHDQG7lhOa3fQ8' },
  { name: 'Cardiologia', id: '1eYzOcNfKZuZutwYn8xKW7iKBurX6WULz' },
  { name: 'Cirurgia', id: '1bVbQEaYV2L5lI47Ewd1w5Vd3rZeN6RDG' },
  { name: 'Pediatria', id: '1ywwBBCiRK9IO5SNVWWTTlOY-Bp9m2Zle' },
  { name: 'Ginecologia', id: '10DfcfoTuYUeb4GXLkkBkXmz40jhhqjLo' },
  { name: 'Obstetrícia', id: '1_JKB42seqMnepKKb6cTUzv8zN-9d6xj7' },
  { name: 'Medicina Preventiva', id: '1gOyaQKKxuGwVzOOsz0EkGsiSgPgrk39Y' },
  { name: 'Infectologia', id: '1_4Zb1Pm1C48jABJMa5cG6ZaCUv2N_KQg' },
  { name: 'Gastroenterologia', id: '1RUInU1gru0VfPiZGBW4ZAJI_dTAzkZgz' },
  { name: 'Endocrinologia', id: '1b7CLQJNnaysMXOgSK2zsDieDVEmcUnsZ' },
  { name: 'Nefrologia', id: '1-5LI4ZD6ukMcMV4iTDeXE9dP7kDZgt2O' },
  { name: 'Neurologia', id: '1bBrdU_gpeYIhpCRBVC07RYot_b-3jjCH' },
  { name: 'Pneumologia', id: '1fe7eHLBJXaUdVqQTCRK__J8W218MvF1O' },
  { name: 'Hematologia', id: '11Dp1Z2RYYBN9xEunEk92wCiUyRhiNcq1' },
  { name: 'Reumatologia', id: '1N8ZZEKe-gg3NlJ_HPvN6IFQ8H6kTAGrc' },
  { name: 'Dermatologia', id: '19JnAtSI-DJ2OFQBzb3qbr6kI8_nmxJ6T' },
  { name: 'Ortopedia', id: '1GO9mFEkz8TSmwfbQhv4rrP5X_0MSpVb2' },
  { name: 'Otorrinolaringologia', id: '1DvT5hKAJPxwzH7gJupsmlf2MYYFMfOGi' },
  { name: 'Oftalmologia', id: '1DJ3HRvTymog94uj6OP_uYF2AuK-KQseb' },
  { name: 'Hepatologia', id: '1j-m3D5yn8S15aA1v-BJBEunTpGlDqSXe' },
  { name: 'Radiologia', id: '1um-VqeCSm4PKdQE5jIO490G-PPmBv1Gl' }
];

function sanitize(name) {
  return name.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, ' ').trim();
}

function updateStatus(patch) {
  let curr = {};
  if (fs.existsSync(STATUS_PATH)) {
    try { curr = JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8')); } catch {}
  }
  const next = { ...curr, ...patch, updatedAt: new Date().toISOString() };
  fs.writeFileSync(STATUS_PATH, JSON.stringify(next, null, 2), 'utf8');
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
    // Pula rodapés repetitivos
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
  console.log('🚀 Iniciando extrator de Livros Estratégicos em segundo plano...');
  updateStatus({
    status: 'running',
    startedAt: new Date().toISOString(),
    totalSpecialties: SPECIALTIES.length,
    processedBooks: 0,
    totalChunks: 0,
    currentSpecialty: 'Iniciando...',
    lastBook: '',
    errors: []
  });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: AUTH_STATE_PATH,
    acceptDownloads: true
  });
  const page = await context.newPage();

  let totalProcessedBooks = 0;
  let totalIndexedChunks = 0;

  try {
    for (const spec of SPECIALTIES) {
      const specDir = path.join(KNOWLEDGE_DIR, sanitize(spec.name));
      if (!fs.existsSync(specDir)) fs.mkdirSync(specDir, { recursive: true });

      console.log(`\n📚 [Especialidade] ${spec.name}...`);
      updateStatus({ currentSpecialty: spec.name });

      const specUrl = `https://drive.google.com/drive/folders/${spec.id}`;
      await page.goto(specUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
      await page.waitForTimeout(3000);

      // Obter todas as subpastas (temas)
      const themeFolders = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('tr[role="row"][data-id]'));
        return rows.map(r => {
          const strong = r.querySelector('strong, span.WQJtxb');
          return {
            name: strong ? strong.textContent.trim() : r.innerText.split('\t')[0],
            id: r.getAttribute('data-id')
          };
        }).filter(f => f.name && f.id);
      });

      console.log(`   Encontradas ${themeFolders.length} pastas de temas em ${spec.name}.`);

      for (const folder of themeFolders) {
        const themeName = folder.name.replace(/^\d+[\s-_]*/, '').trim();
        const jsonOutput = path.join(specDir, `${sanitize(themeName)}.json`);

        // Se já foi extraído anteriormente, pula para continuar de onde parou
        if (fs.existsSync(jsonOutput)) {
          console.log(`   ⏭️ Já extraído: ${spec.name} -> ${themeName}`);
          continue;
        }

        let navSuccess = false;
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            console.log(`   🔍 Abrindo tema (${attempt}/3): ${folder.name}...`);
            const folderUrl = `https://drive.google.com/drive/folders/${folder.id}`;
            await page.goto(folderUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
            await page.waitForTimeout(2500);
            navSuccess = true;
            break;
          } catch (navErr) {
            console.warn(`   ⚠️ Tentativa ${attempt} falhou ao abrir tema: ${navErr.message}`);
            await page.waitForTimeout(4000);
          }
        }
        if (!navSuccess) {
          console.warn(`   ❌ Não foi possível carregar o tema ${folder.name}. Pulando.`);
          continue;
        }

        // Localizar o Livro Estratégico
        const bookInfo = await page.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('tr[role="row"][data-id]'));
          for (const r of rows) {
            const text = r.innerText || '';
            if (text.includes('Livro Estratégico') || text.includes('Livro Digital') || text.includes('Livro ')) {
              return {
                id: r.getAttribute('data-id'),
                name: (r.querySelector('strong, span.WQJtxb')?.textContent || text).split('\n')[0].trim()
              };
            }
          }
          return null;
        });

        if (!bookInfo) {
          console.log(`   ⚠️ Nenhum Livro Estratégico encontrado em ${folder.name}.`);
          continue;
        }

        console.log(`   📥 Baixando em memória: ${bookInfo.name}...`);
        updateStatus({ lastBook: `${spec.name} - ${bookInfo.name}` });

        try {
          let download = null;

          // Tentativa 1: Download direto via export URL
          try {
            const dlPromise = page.waitForEvent('download', { timeout: 15000 });
            await page.goto(`https://drive.usercontent.google.com/u/0/uc?id=${bookInfo.id}&export=download`, {
              timeout: 15000
            }).catch(() => {});
            download = await dlPromise;
          } catch {
            // Ignora e tenta o Fallback
          }

          // Tentativa 2 (Fallback): Visualização do PDF e clique no botão Baixar
          if (!download) {
            const fileViewUrl = `https://drive.google.com/file/d/${bookInfo.id}/view`;
            await page.goto(fileViewUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
            await page.waitForTimeout(3000);

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
                dlPromise.catch(() => {}); // silencia erro pendente
              }
            } catch (clickErr) {
              // silencia timeout
            }
          }

          if (!download) {
            console.log(`   ⚠️ Não foi possível iniciar download de ${bookInfo.name}`);
            continue;
          }

          await download.saveAs(TEMP_PDF_PATH);

          // Extração de texto e estruturação
          const result = await extractPDF(TEMP_PDF_PATH, bookInfo.name, spec.name, themeName);

          // Apaga imediatamente o PDF do disco local
          if (fs.existsSync(TEMP_PDF_PATH)) {
            try { fs.unlinkSync(TEMP_PDF_PATH); } catch {}
          }

          if (result.success) {
            fs.writeFileSync(jsonOutput, JSON.stringify({
              specialty: spec.name,
              theme: themeName,
              bookTitle: bookInfo.name,
              extractedAt: new Date().toISOString(),
              totalChunks: result.chunksCount,
              characters: result.characters,
              chunks: result.chunks
            }, null, 2), 'utf8');

            totalProcessedBooks++;
            totalIndexedChunks += result.chunksCount;

            console.log(`   ✅ Sucesso: ${bookInfo.name} (${result.chunksCount} blocos de conhecimento indexados).`);
            updateStatus({
              processedBooks: totalProcessedBooks,
              totalChunks: totalIndexedChunks
            });
          } else {
            console.error(`   ❌ Falha ao processar texto: ${result.error}`);
          }
        } catch (downloadErr) {
          console.error(`   ⚠️ Erro durante processamento de ${bookInfo.name}: ${downloadErr.message}`);
          if (fs.existsSync(TEMP_PDF_PATH)) {
            try { fs.unlinkSync(TEMP_PDF_PATH); } catch {}
          }
        }
      }
    }

    console.log('\n🎉 EXTRAÇÃO CONCLUÍDA DE TODAS AS ESPECIALIDADES!');
    updateStatus({
      status: 'completed',
      completedAt: new Date().toISOString(),
      processedBooks: totalProcessedBooks,
      totalChunks: totalIndexedChunks
    });
  } catch (err) {
    console.error('❌ Erro fatal no processo:', err);
    updateStatus({ status: 'error', fatalError: err.message });
  } finally {
    if (fs.existsSync(TEMP_PDF_PATH)) {
      try { fs.unlinkSync(TEMP_PDF_PATH); } catch {}
    }
    await browser.close();
  }
}

run();
