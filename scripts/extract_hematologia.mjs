import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { PDFParse } from 'pdf-parse';

const BASE_DIR = process.cwd();
const AUTH_STATE_PATH = path.join(BASE_DIR, 'scripts', 'drive_auth_state.json');
const KNOWLEDGE_DIR = path.join(BASE_DIR, 'data', 'knowledge');
const TEMP_PDF_PATH = path.join(KNOWLEDGE_DIR, 'temp_hemato.pdf');

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

function toS3Key(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._\-\/]/g, '_')
    .replace(/_+/g, '_');
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

async function downloadFileFromDrive(page, fileId, destPath) {
  try {
    const dlPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.goto(`https://drive.usercontent.google.com/u/0/uc?id=${fileId}&export=download`, {
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

async function uploadJsonToSupabase(specialty, fileName, localJsonPath) {
  if (!SUPABASE_URL || !SERVICE_KEY) return;
  const s3Path = `${toS3Key(specialty)}/${toS3Key(fileName)}`;
  const targetUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${s3Path}`;
  const fileBuffer = fs.readFileSync(localJsonPath);

  await fetch(targetUrl, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'x-upsert': 'true'
    },
    body: fileBuffer
  });
}

async function run() {
  console.log('🚀 Extraindo a última especialidade pendente: Hematologia...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: AUTH_STATE_PATH,
    acceptDownloads: true
  });
  const page = await context.newPage();

  const hemDir = path.join(KNOWLEDGE_DIR, 'Hematologia');
  if (!fs.existsSync(hemDir)) fs.mkdirSync(hemDir, { recursive: true });

  await page.goto('https://drive.google.com/drive/folders/11Dp1Z2RYYBN9xEunEk92wCiUyRhiNcq1', {
    waitUntil: 'domcontentloaded',
    timeout: 35000
  });
  await page.waitForTimeout(3000);

  const hemFolders = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr[role="row"][data-id]'));
    return rows.map(r => {
      const strong = r.querySelector('strong, span.WQJtxb');
      const name = strong ? strong.textContent.trim() : r.innerText.split('\t')[0].trim();
      return { id: r.getAttribute('data-id'), name };
    }).filter(f => f.id && f.name);
  });

  console.log(`Encontradas ${hemFolders.length} pastas de temas em Hematologia.`);

  let count = 0;
  for (const folder of hemFolders) {
    const cleanTheme = folder.name.replace(/^\d+[\s-_]*/, '').trim();
    const jsonPath = path.join(hemDir, `${sanitize(cleanTheme)}.json`);

    if (fs.existsSync(jsonPath)) {
      console.log(`   ⏭️ Já existe: Hematologia -> ${cleanTheme}`);
      continue;
    }

    console.log(`   🔍 Abrindo tema: ${folder.name}...`);
    await page.goto(`https://drive.google.com/drive/folders/${folder.id}`, {
      waitUntil: 'domcontentloaded',
      timeout: 35000
    });
    await page.waitForTimeout(2500);

    const pdfInfo = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr[role="row"][data-id]'));
      for (const r of rows) {
        const text = r.innerText || '';
        if (text.includes('.pdf') || text.includes('Cópia de') || text.includes('Livro')) {
          const strong = r.querySelector('strong, span.WQJtxb');
          return {
            id: r.getAttribute('data-id'),
            name: (strong ? strong.textContent : text).split('\n')[0].trim()
          };
        }
      }
      return null;
    });

    if (!pdfInfo) {
      console.warn(`   ⚠️ Nenhum PDF encontrado em ${folder.name}`);
      continue;
    }

    console.log(`   📥 Baixando Hematologia: ${pdfInfo.name}...`);
    const downloaded = await downloadFileFromDrive(page, pdfInfo.id, TEMP_PDF_PATH);
    if (!downloaded) {
      console.warn(`   ⚠️ Falha ao baixar ${pdfInfo.name}`);
      continue;
    }

    const res = await extractPDF(TEMP_PDF_PATH, pdfInfo.name, 'Hematologia', cleanTheme);
    if (fs.existsSync(TEMP_PDF_PATH)) {
      try { fs.unlinkSync(TEMP_PDF_PATH); } catch {}
    }

    if (res.success) {
      fs.writeFileSync(jsonPath, JSON.stringify({
        specialty: 'Hematologia',
        theme: cleanTheme,
        bookTitle: pdfInfo.name,
        extractedAt: new Date().toISOString(),
        totalChunks: res.chunksCount,
        characters: res.characters,
        chunks: res.chunks
      }, null, 2), 'utf8');

      await uploadJsonToSupabase('Hematologia', `${sanitize(cleanTheme)}.json`, jsonPath);
      count++;
      console.log(`   ✅ Sucesso: Hematologia -> ${cleanTheme} (${res.chunksCount} blocos indexados e sincronizados com Supabase).`);
    }
  }

  await browser.close();
  console.log(`\n🎉 HEMATOLOGIA CONCLUÍDA! ${count} livros extraídos e sincronizados.`);
}

run().catch(console.error);
