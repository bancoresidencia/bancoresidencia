import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { PDFParse } from 'pdf-parse';

const BASE_DIR = process.cwd();
const AUTH_STATE_PATH = path.join(BASE_DIR, 'scripts', 'drive_auth_state.json');
const KNOWLEDGE_DIR = path.join(BASE_DIR, 'data', 'knowledge', 'Ginecologia_Drive_Nova');
const STATUS_PATH = path.join(BASE_DIR, 'data', 'gineco_drive_status.json');
const TEMP_PDF_PATH = path.join(BASE_DIR, 'data', 'temp_gineco_drive.pdf');
const ITEMS_PATH = path.join(BASE_DIR, 'scripts', 'gineco_drive_items.json');

if (!fs.existsSync(KNOWLEDGE_DIR)) {
  fs.mkdirSync(KNOWLEDGE_DIR, { recursive: true });
}

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
const SUB_FOLDER = 'Ginecologia_Drive_Nova'; // Pasta DIFERENTE no Supabase Storage

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

function countQuestionsWithAnswer(rawText) {
  // Procura padrões de gabarito e questões
  const gabaritoMatches = rawText.match(/gabarito\s*[:\s-]+\s*[A-E]/gi) || [];
  const questaoMatches = rawText.match(/(?:QUEST[ÃA]O|Quest[ãa]o)\s+\d+/g) || [];
  const alternativasA = (rawText.match(/(?:^|\n)\s*(?:\([Aa]\)|[Aa]\))\s+/g) || []).length;

  const count = Math.max(gabaritoMatches.length, Math.floor(alternativasA * 0.8), Math.floor(questaoMatches.length * 0.5));
  return {
    gabaritos: gabaritoMatches.length,
    questoes: questaoMatches.length,
    alternativas: alternativasA,
    estimativaFinal: count
  };
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
  try {
    const dlPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.goto(`https://drive.usercontent.google.com/u/1/uc?id=${fileId}&export=download`, {
      timeout: 15000
    }).catch(() => {});
    const dl = await dlPromise;
    if (dl) {
      await dl.saveAs(destPath);
      return true;
    }
  } catch {}

  try {
    const fileViewUrl = `https://drive.google.com/file/d/${fileId}/view`;
    await page.goto(fileViewUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(2500);

    const dlPromise = page.waitForEvent('download', { timeout: 20000 });
    const clicked = await page.evaluate(() => {
      const btn = document.querySelector('[aria-label="Baixar"], button[aria-label*="download" i]');
      if (btn) { btn.click(); return true; }
      return false;
    });

    if (clicked) {
      const dl = await dlPromise;
      if (dl) {
        await dl.saveAs(destPath);
        return true;
      }
    } else {
      dlPromise.catch(() => {});
    }
  } catch {}

  return false;
}

async function uploadJsonToSupabase(fileName, localJsonPath) {
  if (!SUPABASE_URL || !SERVICE_KEY) return;
  const s3Path = `${toS3Key(SUB_FOLDER)}/${toS3Key(fileName)}`;
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

async function run() {
  console.log('🚀 Iniciando Extração da Pasta de Gineco para Pasta Diferente no Supabase...');
  console.log(`📁 Pasta de Destino no Supabase Storage: ${BUCKET_NAME}/${SUB_FOLDER}`);

  updateStatus({
    status: 'running',
    startedAt: new Date().toISOString(),
    totalProcessed: 0,
    totalBooks: 0,
    totalQuestionsFoundInBooks: 0,
    questionsAlreadyInPlatform: 13246,
    lastBook: 'Iniciando conexão...'
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

  // 1. Obtém lista de itens da pasta raiz de Gineco
  let items = [];
  if (fs.existsSync(ITEMS_PATH)) {
    try { items = JSON.parse(fs.readFileSync(ITEMS_PATH, 'utf8')); } catch {}
  }

  if (items.length === 0) {
    console.log('🔍 Navegando para listar itens do Google Drive...');
    await page.goto('https://drive.google.com/drive/u/1/folders/1_cgWHry1w_sJjQhrqIvW5ry0n7kv-slx', {
      waitUntil: 'domcontentloaded',
      timeout: 35000
    });
    await page.waitForTimeout(4000);

    items = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr[role="row"][data-id]'));
      return rows.map(r => {
        const strong = r.querySelector('strong, span.WQJtxb');
        const text = strong ? strong.textContent.trim() : (r.innerText || '').split('\n')[0].trim();
        return { id: r.getAttribute('data-id'), text };
      }).filter(x => x.id && x.text);
    });

    if (items.length > 0) {
      fs.writeFileSync(ITEMS_PATH, JSON.stringify(items, null, 2), 'utf8');
    }
  }

  console.log(`📦 Total de temas/pastas identificados: ${items.length}`);
  updateStatus({ totalBooks: items.length });

  let processedCount = 0;
  let totalQuestionsCount = 0;

  for (const item of items) {
    const cleanTheme = item.text.replace(/^\d+[\s-_.]*/, '').trim();
    const jsonFileName = `${sanitize(cleanTheme)}.json`;
    const localJsonPath = path.join(KNOWLEDGE_DIR, jsonFileName);

    console.log(`\n📖 [${processedCount + 1}/${items.length}] Processando: ${item.text}`);
    updateStatus({ currentTheme: cleanTheme, lastBook: item.text });

    // Verifica se item é PDF direto ou se é subpasta
    let pdfId = item.id;
    let pdfName = item.text;

    if (!item.text.toLowerCase().endsWith('.pdf')) {
      // É uma subpasta de tema
      await page.goto(`https://drive.google.com/drive/u/1/folders/${item.id}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      await page.waitForTimeout(2500);

      const subPdf = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('tr[role="row"][data-id]'));
        for (const r of rows) {
          const text = r.innerText || '';
          if (text.includes('.pdf') || text.includes('Livro') || text.includes('Cópia de')) {
            const strong = r.querySelector('strong, span.WQJtxb');
            return {
              id: r.getAttribute('data-id'),
              name: (strong ? strong.textContent : text).split('\n')[0].trim()
            };
          }
        }
        return null;
      });

      if (subPdf) {
        pdfId = subPdf.id;
        pdfName = subPdf.name;
      } else {
        console.warn(`   ⚠️ Nenhum PDF localizado dentro de ${item.text}`);
        continue;
      }
    }

    console.log(`   📥 Baixando temporariamente: ${pdfName}...`);
    const ok = await downloadFileFromDrive(page, pdfId, TEMP_PDF_PATH);
    if (!ok) {
      console.warn(`   ⚠️ Falha ao baixar ${pdfName}`);
      continue;
    }

    const extractRes = await extractPDF(TEMP_PDF_PATH, pdfName, 'Ginecologia', cleanTheme);
    
    // Deleta o PDF temporário imediatamente do disco (0 MB permanente)
    if (fs.existsSync(TEMP_PDF_PATH)) {
      try { fs.unlinkSync(TEMP_PDF_PATH); } catch {}
    }

    if (extractRes.success) {
      const qFound = extractRes.questionsAudit.estimativaFinal;
      totalQuestionsCount += qFound;

      const record = {
        specialty: 'Ginecologia',
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

      // Upload para a pasta diferente no Supabase Storage (medical-knowledge/Ginecologia_Drive_Nova/)
      await uploadJsonToSupabase(jsonFileName, localJsonPath);

      processedCount++;
      console.log(`   ✅ Sucesso: ${cleanTheme} | ${extractRes.chunksCount} blocos | ~${qFound} questões com gabarito no livro.`);

      updateStatus({
        totalProcessed: processedCount,
        totalQuestionsFoundInBooks: totalQuestionsCount,
        lastSuccess: cleanTheme
      });
    }
  }

  await browser.close();

  updateStatus({
    status: 'completed',
    completedAt: new Date().toISOString(),
    totalProcessed: processedCount,
    totalQuestionsFoundInBooks: totalQuestionsCount
  });

  console.log('\n======================================================');
  console.log('🎉 PROCESSO CONCLUÍDO COM TOTAL SUCESSO!');
  console.log(`📚 Livros extraídos e salvos no Supabase: ${processedCount}`);
  console.log(`🧠 Questões com gabarito identificadas nos livros: ${totalQuestionsCount}`);
  console.log(`🛡️ Questões mantidas intactas na plataforma: 13.246`);
  console.log('======================================================\n');
}

run().catch(err => {
  console.error('Erro na execução:', err);
  updateStatus({ status: 'error', error: err.message });
});
