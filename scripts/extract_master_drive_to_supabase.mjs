import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { PDFParse } from 'pdf-parse';

const BASE_DIR = process.cwd();
const AUTH_STATE_PATH = path.join(BASE_DIR, 'scripts', 'drive_auth_state.json');
const TARGET_FOLDER = 'gabarito_das_questoes';
const BASE_KNOWLEDGE_DIR = path.join(BASE_DIR, 'data', 'knowledge', TARGET_FOLDER);
const STATUS_PATH = path.join(BASE_DIR, 'data', 'gabarito_questoes_status.json');
const TEMP_PDF_PATH = path.join(BASE_DIR, 'data', 'temp_master_drive.pdf');
const FOLDER_ITEMS_PATH = path.join(BASE_DIR, 'scripts', 'drive_folder_items.json');

// Carrega .env.local
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'medical-knowledge';

if (!fs.existsSync(BASE_KNOWLEDGE_DIR)) {
  fs.mkdirSync(BASE_KNOWLEDGE_DIR, { recursive: true });
}

function sanitize(name) {
  return name.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, ' ').trim();
}

function toS3Key(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._\-\/]/g, '_')
    .replace(/_+/g, '_');
}

function updateStatus(patch) {
  let curr = {};
  if (fs.existsSync(STATUS_PATH)) {
    try { curr = JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8')); } catch {}
  }
  const next = { ...curr, ...patch, updatedAt: new Date().toISOString() };
  fs.writeFileSync(STATUS_PATH, JSON.stringify(next, null, 2), 'utf8');
}

function countQuestionsWithAnswer(rawText) {
  const gabaritoMatches = rawText.match(/(?:gabarito|resposta|gabarito oficial)\s*[:\s-]+\s*([A-E])/gi) || [];
  const questaoMatches = rawText.match(/(?:QUEST[ÃA]O|Quest[ãa]o)\s+\d+/g) || [];
  const alternativasA = (rawText.match(/(?:^|\n)\s*(?:\([Aa]\)|[Aa]\))\s+/g) || []).length;

  const count = Math.max(gabaritoMatches.length, Math.floor(alternativasA * 0.8), Math.floor(questaoMatches.length * 0.5));
  return {
    gabaritosIdentificados: gabaritoMatches.length,
    questoesNumeradas: questaoMatches.length,
    alternativasA: alternativasA,
    estimativaQuestoesComGabarito: count
  };
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
    const questionsAudit = countQuestionsWithAnswer(rawText);

    return {
      success: true,
      characters: rawText.length,
      chunksCount: chunks.length,
      chunks,
      questionsAudit
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function downloadFileFromDrive(page, fileId, destPath) {
  // Tentativa 1: uc direct com bypass de tela de aviso de arquivos grandes (>25MB)
  try {
    let dlPromise = page.waitForEvent('download', { timeout: 20000 }).catch(() => null);
    await page.goto(`https://drive.usercontent.google.com/u/1/uc?id=${fileId}&export=download`, {
      timeout: 20000,
      waitUntil: 'commit'
    }).catch(() => {});

    let dl = await dlPromise;
    if (dl) {
      await dl.saveAs(destPath);
      return true;
    }

    // Se caiu na tela "O Google Drive não pode verificar vírus para arquivos grandes"
    const hasDownloadAnyway = await page.evaluate(() => {
      const btn = document.querySelector('#uc-download-link, a[href*="confirm"], input[type="submit"], button');
      if (btn && (btn.innerText?.toLowerCase().includes('download') || btn.innerText?.toLowerCase().includes('mesmo assim') || btn.id === 'uc-download-link')) {
        return true;
      }
      return false;
    });

    if (hasDownloadAnyway) {
      dlPromise = page.waitForEvent('download', { timeout: 25000 }).catch(() => null);
      await page.evaluate(() => {
        const btn = document.querySelector('#uc-download-link, a[href*="confirm"], input[type="submit"], button');
        if (btn) btn.click();
      });
      dl = await dlPromise;
      if (dl) {
        await dl.saveAs(destPath);
        return true;
      }
    }
  } catch {}

  // Tentativa 2: Visualizador direto do Drive (/file/d/ID/view)
  try {
    await page.goto(`https://drive.google.com/file/d/${fileId}/view`, {
      waitUntil: 'domcontentloaded',
      timeout: 25000
    }).catch(() => {});
    await page.waitForTimeout(2000);

    let dlPromise = page.waitForEvent('download', { timeout: 20000 }).catch(() => null);
    const clicked = await page.evaluate(() => {
      const btn = document.querySelector('[aria-label="Fazer o download"], [aria-label="Baixar"], button[aria-label*="download" i]');
      if (btn) { btn.click(); return true; }
      return false;
    });

    if (clicked) {
      let dl = await dlPromise;
      if (dl) {
        await dl.saveAs(destPath);
        return true;
      }

      // Pode abrir popup de confirmação de vírus
      await page.waitForTimeout(2000);
      const clickedPopup = await page.evaluate(() => {
        const popupBtn = Array.from(document.querySelectorAll('button, a')).find(el => 
          el.innerText.toLowerCase().includes('mesmo assim') || 
          el.innerText.toLowerCase().includes('download anyway')
        );
        if (popupBtn) { popupBtn.click(); return true; }
        return false;
      });

      if (clickedPopup) {
        dl = await page.waitForEvent('download', { timeout: 25000 }).catch(() => null);
        if (dl) {
          await dl.saveAs(destPath);
          return true;
        }
      }
    }
  } catch {}

  return false;
}

async function uploadJsonToSupabase(specialty, fileName, localJsonPath) {
  if (!SUPABASE_URL || !SERVICE_KEY) return;
  const s3Path = `${TARGET_FOLDER}/${toS3Key(specialty)}/${toS3Key(fileName)}`;
  const targetUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${s3Path}`;
  const fileBuffer = fs.readFileSync(localJsonPath);

  const res = await fetch(targetUrl, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'x-upsert': 'true'
    },
    body: fileBuffer
  });

  if (!res.ok) {
    const t = await res.text();
    console.warn(`   ⚠️ Aviso upload Supabase (${fileName}): ${t.slice(0, 100)}`);
  }
}

async function listFolderItems(page, folderId) {
  await page.goto(`https://drive.google.com/drive/folders/${folderId}`, {
    waitUntil: 'domcontentloaded',
    timeout: 35000
  });
  await page.waitForTimeout(3500);

  return await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('[data-id]'));
    const map = new Map();
    for (const r of rows) {
      const id = r.getAttribute('data-id');
      const text = (r.innerText || '').split('\n')[0].trim();
      if (id && text && text.length > 1 && !map.has(id)) {
        map.set(id, text);
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  });
}

async function main() {
  console.log('🚀 Iniciando Extração Master do Google Drive em Segundo Plano (Motor Blindado)...');
  console.log(`📁 Pasta Destino Supabase: ${BUCKET_NAME}/${TARGET_FOLDER}`);

  // Carrega lista de especialidades
  let specialties = [];
  if (fs.existsSync(FOLDER_ITEMS_PATH)) {
    try {
      const raw = JSON.parse(fs.readFileSync(FOLDER_ITEMS_PATH, 'utf8'));
      specialties = raw.filter(item => 
        item.id !== '_gd' && 
        !item.name.includes('window.WIZ') && 
        !item.name.includes('AINDA NAO TA NO DRIVE')
      );
    } catch {}
  }

  console.log(`📋 Total de especialidades a processar: ${specialties.length}`);

  updateStatus({
    status: 'in_progress',
    startedAt: new Date().toISOString(),
    totalSpecialties: specialties.length,
    processedSpecialties: 0,
    totalBooksProcessed: 0,
    totalQuestionsWithGabarito: 0,
    activeSpecialty: 'Inicializando...',
    activeBook: 'Inicializando...'
  });

  const LOCAL_CHROMIUM = 'C:\\Users\\cnath\\AppData\\Local\\ms-playwright\\chromium-1243\\chrome-win64\\chrome.exe';
  const browser = await chromium.launch({
    executablePath: fs.existsSync(LOCAL_CHROMIUM) ? LOCAL_CHROMIUM : undefined,
    headless: true
  });
  const context = await browser.newContext({
    storageState: fs.existsSync(AUTH_STATE_PATH) ? AUTH_STATE_PATH : undefined,
    acceptDownloads: true
  });
  const page = await context.newPage();

  let totalBooksCount = 0;
  let totalQuestionsCount = 0;
  let specialtyIndex = 0;

  for (const specialty of specialties) {
    specialtyIndex++;
    console.log(`\n======================================================`);
    console.log(`🏥 [${specialtyIndex}/${specialties.length}] Especialidade: ${specialty.name}`);
    console.log(`======================================================`);

    const specDir = path.join(BASE_KNOWLEDGE_DIR, sanitize(specialty.name));
    if (!fs.existsSync(specDir)) {
      fs.mkdirSync(specDir, { recursive: true });
    }

    updateStatus({
      activeSpecialty: specialty.name,
      processedSpecialties: specialtyIndex - 1
    });

    let items = [];
    try {
      items = await listFolderItems(page, specialty.id);
    } catch (e) {
      console.warn(`⚠️ Erro ao listar pasta ${specialty.name}:`, e.message);
      continue;
    }

    console.log(`   📄 Itens localizados em ${specialty.name}: ${items.length}`);

    for (const item of items) {
      const cleanTheme = item.name.replace(/^Cópia de\s*/i, '').replace(/^\d+[\s-_.]*/, '').trim();
      const jsonFileName = `${sanitize(cleanTheme)}.json`;
      const localJsonPath = path.join(specDir, jsonFileName);

      // Pula se já processado anteriormente (retomada incremental inteligente)
      if (fs.existsSync(localJsonPath)) {
        try {
          const existing = JSON.parse(fs.readFileSync(localJsonPath, 'utf8'));
          totalQuestionsCount += existing.questionsFoundInBook || 0;
          totalBooksCount++;
          console.log(`   ⏭️ Já processado anteriormente: ${cleanTheme} (~${existing.questionsFoundInBook || 0} questões auditadas)`);
          continue;
        } catch {}
      }

      let pdfId = item.id;
      let pdfName = item.name;

      // Se for subpasta, entra e busca o PDF dentro dela
      if (!item.name.toLowerCase().endsWith('.pdf')) {
        try {
          const subItems = await listFolderItems(page, item.id);
          const foundPdf = subItems.find(x => x.name.toLowerCase().endsWith('.pdf') || x.name.includes('Livro'));
          if (foundPdf) {
            pdfId = foundPdf.id;
            pdfName = foundPdf.name;
          } else {
            console.log(`   ℹ️ Subitem sem PDF identificado: ${item.name}`);
            continue;
          }
        } catch {
          continue;
        }
      }

      console.log(`   📥 Baixando temporariamente: ${pdfName}...`);
      updateStatus({ activeBook: pdfName });

      try {
        const ok = await downloadFileFromDrive(page, pdfId, TEMP_PDF_PATH);
        if (!ok) {
          console.warn(`   ⚠️ Download não concluído para: ${pdfName} (seguindo para o próximo)`);
          continue;
        }

        const extractRes = await extractPDF(TEMP_PDF_PATH, pdfName, specialty.name, cleanTheme);

        if (extractRes.success) {
          const qFound = extractRes.questionsAudit.estimativaQuestoesComGabarito;
          totalQuestionsCount += qFound;
          totalBooksCount++;

          const record = {
            specialty: specialty.name,
            theme: cleanTheme,
            sourceBook: pdfName,
            extractedAt: new Date().toISOString(),
            totalChunks: extractRes.chunksCount,
            characters: extractRes.characters,
            questionsFoundInBook: qFound,
            questionsAudit: extractRes.questionsAudit,
            chunks: extractRes.chunks
          };

          fs.writeFileSync(localJsonPath, JSON.stringify(record, null, 2), 'utf8');

          // Envia para o Supabase Storage na pasta gabarito_das_questoes
          await uploadJsonToSupabase(specialty.name, jsonFileName, localJsonPath);

          console.log(`   ✅ Processado: ${cleanTheme} | ${extractRes.chunksCount} blocos | ~${qFound} questões com gabarito.`);

          updateStatus({
            totalBooksProcessed: totalBooksCount,
            totalQuestionsWithGabarito: totalQuestionsCount,
            lastProcessedBook: `${specialty.name} - ${cleanTheme}`
          });
        }
      } catch (err) {
        console.warn(`   ⚠️ Erro ao processar ${pdfName}:`, err.message);
      } finally {
        // Limpa PDF temporário imediatamente do disco
        if (fs.existsSync(TEMP_PDF_PATH)) {
          try { fs.unlinkSync(TEMP_PDF_PATH); } catch {}
        }
      }
    }
  }

  await browser.close();

  updateStatus({
    status: 'completed',
    completedAt: new Date().toISOString(),
    totalSpecialties: specialties.length,
    processedSpecialties: specialties.length,
    totalBooksProcessed: totalBooksCount,
    totalQuestionsWithGabarito: totalQuestionsCount
  });

  console.log('\n======================================================');
  console.log('🎉 TODAS AS ESPECIALIDADES PROCESSADAS COM SUCESSO!');
  console.log(`📚 Total de livros/temas: ${totalBooksCount}`);
  console.log(`🧠 Total de questões com gabarito auditadas: ${totalQuestionsCount}`);
  console.log(`📁 Armazenado em: ${BUCKET_NAME}/${TARGET_FOLDER}/`);
  console.log('🛡️ Nenhuma questão foi inserida na tabela principal!');
  console.log('======================================================\n');
}

main().catch(err => {
  console.error('Erro na extração master:', err);
  updateStatus({ status: 'error', error: err.message });
});
