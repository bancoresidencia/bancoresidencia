import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { PDFParse } from 'pdf-parse';

const LOCAL_CHROMIUM = 'C:\\Users\\cnath\\AppData\\Local\\ms-playwright\\chromium-1243\\chrome-win64\\chrome.exe';
const PENDING_FILE = path.join(process.cwd(), 'data', 'knowledge', 'diretrizes_oficiais', 'pendencias_categorizadas.json');
const BASE_DIR = path.join(process.cwd(), 'data', 'knowledge', 'diretrizes_oficiais');
const DOCS_DIR = path.join(BASE_DIR, 'markdown_docs');
const STATUS_PATH = path.join(BASE_DIR, 'rescue_live_status.json');

const sleep = ms => new Promise(r => setTimeout(r, ms));

function htmlToCleanMarkdown(html, title) {
  if (!html || typeof html !== 'string') return '';
  let text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
    .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, '')
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n#### $1\n')
    .replace(/<p[^>]*>/gi, '\n\n')
    .replace(/<\/p>/gi, '')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '\n* $1')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return text;
}

async function extractTextFromPdfBuffer(buffer) {
  try {
    const parser = new PDFParse({ data: buffer });
    await parser.load();
    const extracted = await parser.getText();
    return extracted.text || extracted || '';
  } catch (e) {
    return '';
  }
}

function saveMarkdownDoc(safeId, metadata, content) {
  const finalPath = path.join(DOCS_DIR, `${safeId}.md`);
  const frontmatter = [
    '---',
    `id: "${metadata.id}"`,
    `tipo: "${metadata.tipo || 'DIRETRIZ_OFICIAL'}"`,
    `metodo_recuperacao: "${metadata.metodo}"`,
    `titulo: "${(metadata.titulo || '').replace(/"/g, "'")}"`,
    `url_original: "${metadata.url || ''}"`,
    `doi: "${metadata.doi || ''}"`,
    `caracteres_extraidos: ${content.length}`,
    `recuperado_em: "${new Date().toISOString()}"`,
    '---',
    '',
    `# ${metadata.titulo || 'Diretriz Oficial'}`,
    '',
    content
  ].join('\n');

  fs.writeFileSync(finalPath, frontmatter, 'utf8');
}

async function main() {
  console.log('===============================================================');
  console.log('🚀 ESTEIRA DE RESGATE: GRUPOS A (ANTI-BOT), B (LINKS) E C (SCI-HUB)');
  console.log('💾 PROTEÇÃO TOTAL DE SSD: PDFs SÃO PROCESSADOS EM BUFFER RAM');
  console.log('📚 DESTINO FINAL LEVE: data/knowledge/diretrizes_oficiais/markdown_docs/');
  console.log('===============================================================\n');

  if (!fs.existsSync(PENDING_FILE)) {
    throw new Error(`Arquivo de pendências não encontrado: ${PENDING_FILE}`);
  }

  const pendencias = JSON.parse(fs.readFileSync(PENDING_FILE, 'utf8'));
  const groupC = pendencias.groupC_doi || [];
  const groupA = pendencias.groupA_cloudflare || [];
  const groupB = pendencias.groupB_broken_or_other || [];

  const totalAlvos = groupC.length + groupA.length + groupB.length;
  console.log(`📊 Total de pendências para resgatar: ${totalAlvos}`);
  console.log(`   - Grupo C (Sci-Hub / DOIs): ${groupC.length}`);
  console.log(`   - Grupo A (Navegador Real / Cloudflare): ${groupA.length}`);
  console.log(`   - Grupo B (Wayback / Espelhos de Links): ${groupB.length}\n`);

  let resgatadosTotal = 0;
  let stats = { grupoC: 0, grupoA: 0, grupoB: 0, falhas: 0 };
  const startTime = Date.now();

  function updateStatus(etapaAtual = '', ultimoItem = '') {
    const elapsedSec = Math.round((Date.now() - startTime) / 1000);
    const liveStatus = {
      status: 'RESGATANDO_PENDENCIAS',
      etapa_atual: etapaAtual,
      total_pendencias: totalAlvos,
      resgatados: resgatadosTotal,
      restantes: totalAlvos - resgatadosTotal,
      stats,
      ultimo_item: ultimoItem,
      tempo_decorrido_seg: elapsedSec,
      atualizado_em: new Date().toISOString()
    };
    fs.writeFileSync(STATUS_PATH, JSON.stringify(liveStatus, null, 2), 'utf8');
  }

  // =========================================================================
  // FASE 1: GRUPO C - RESGATE VIA SCI-HUB (DOIs)
  // =========================================================================
  console.log('---------------------------------------------------------------');
  console.log(`🔬 FASE 1: RESGATANDO GRUPO C VIA SCI-HUB (${groupC.length} DOIs)...`);
  console.log('---------------------------------------------------------------');

  for (let i = 0; i < groupC.length; i++) {
    const item = groupC[i];
    const safeId = item.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const mdPath = path.join(DOCS_DIR, `${safeId}.md`);

    if (fs.existsSync(mdPath)) {
      stats.grupoC++;
      resgatadosTotal++;
      continue;
    }

    console.log(`[C ${i + 1}/${groupC.length}] Buscando DOI: ${item.doi} (${(item.titulo || '').slice(0, 50)})...`);
    updateStatus('GRUPO_C_SCIHUB', item.titulo);

    let resolved = false;
    const scihubMirrors = ['https://www.sci-hub.in', 'https://sci.bban.top', 'https://sci-hub.st'];

    for (const mirror of scihubMirrors) {
      if (resolved) break;
      try {
        const scihubUrl = `${mirror}/${item.doi}`;
        const pageRes = await fetch(scihubUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          signal: AbortSignal.timeout(15000)
        });

        if (!pageRes.ok) continue;
        const html = await pageRes.text();

        // Extrai URL do PDF
        const embedMatch = html.match(/<embed[^>]+src=["']([^"']+)["']/i);
        const iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
        const btnMatch = html.match(/location\.href=['"]([^'"]+)['"]/i);
        const pdfLinkMatch = html.match(/href=['"]([^'"]+\.pdf[^'"]*)['"]/i);

        let pdfUrl = embedMatch?.[1] || iframeMatch?.[1] || btnMatch?.[1] || pdfLinkMatch?.[1];
        if (pdfUrl) {
          if (pdfUrl.startsWith('//')) pdfUrl = 'https:' + pdfUrl;
          if (pdfUrl.startsWith('/')) pdfUrl = mirror + pdfUrl;

          // Limpa escapes de barra
          pdfUrl = pdfUrl.replace(/\\\//g, '/');

          // Baixa stream do PDF diretamente na memória (Buffer)
          const pdfRes = await fetch(pdfUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: AbortSignal.timeout(30000)
          });

          if (pdfRes.ok) {
            const buffer = Buffer.from(await pdfRes.arrayBuffer());
            if (buffer.length > 5000) {
              const text = await extractTextFromPdfBuffer(buffer);
              if (text.length > 200) {
                saveMarkdownDoc(safeId, { ...item, metodo: 'SCI_HUB' }, text);
                stats.grupoC++;
                resgatadosTotal++;
                resolved = true;
                console.log(`   ✨ Sucesso Sci-Hub: ${text.length} caracteres extraídos! (0 MB de PDF no SSD)`);
                break;
              }
            }
          }
        }
      } catch (err) {
        // Tenta próximo espelho
      }
    }

    if (!resolved) {
      console.warn(`   ⚠️ Não localizado no Sci-Hub: ${item.doi}`);
      stats.falhas++;
    }

    await sleep(1000);
  }

  // =========================================================================
  // FASE 2: GRUPO A - RESGATE VIA NAVEGADOR REAL (ANTI-BOT / CLOUDFLARE)
  // =========================================================================
  console.log('\n---------------------------------------------------------------');
  console.log(`🌐 FASE 2: RESGATANDO GRUPO A VIA NAVEGADOR REAL (${groupA.length} DIRETRIZES)...`);
  console.log('---------------------------------------------------------------');

  const browser = await chromium.launch({
    executablePath: fs.existsSync(LOCAL_CHROMIUM) ? LOCAL_CHROMIUM : undefined,
    headless: true
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    acceptDownloads: true
  });

  for (let i = 0; i < groupA.length; i++) {
    const item = groupA[i];
    const safeId = item.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const mdPath = path.join(DOCS_DIR, `${safeId}.md`);

    if (fs.existsSync(mdPath)) {
      stats.grupoA++;
      resgatadosTotal++;
      continue;
    }

    console.log(`[A ${i + 1}/${groupA.length}] Acessando com Chromium: ${(item.titulo || item.url).slice(0, 50)}...`);
    updateStatus('GRUPO_A_CHROMIUM', item.titulo);

    const page = await context.newPage();
    let resolved = false;

    try {
      // Captura se houver download de PDF automático
      let downloadBuffer = null;
      page.on('download', async d => {
        const stream = await d.createReadStream();
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        downloadBuffer = Buffer.concat(chunks);
      });

      const res = await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 35000 }).catch(() => null);
      await sleep(3500); // Aguarda desafios JS ou Cloudflare

      if (downloadBuffer && downloadBuffer.length > 5000) {
        const text = await extractTextFromPdfBuffer(downloadBuffer);
        if (text.length > 200) {
          saveMarkdownDoc(safeId, { ...item, metodo: 'CHROMIUM_PDF_STREAM' }, text);
          stats.grupoA++;
          resgatadosTotal++;
          resolved = true;
          console.log(`   ✨ Sucesso Download PDF: ${text.length} caracteres extraídos!`);
        }
      }

      if (!resolved) {
        const bodyText = await page.innerText('body').catch(() => '');
        if (bodyText.length > 500 && !bodyText.includes('Attention Required!') && !bodyText.includes('Just a moment...')) {
          const contentHtml = await page.content();
          const cleanMd = htmlToCleanMarkdown(contentHtml, item.titulo);
          if (cleanMd.length > 300) {
            saveMarkdownDoc(safeId, { ...item, metodo: 'CHROMIUM_HTML' }, cleanMd);
            stats.grupoA++;
            resgatadosTotal++;
            resolved = true;
            console.log(`   ✨ Sucesso Página Web: ${cleanMd.length} caracteres extraídos!`);
          }
        }
      }

    } catch (err) {
      console.warn(`   ⚠️ Erro ao acessar com Chromium: ${err.message}`);
    } finally {
      await page.close().catch(() => {});
    }

    if (!resolved) stats.falhas++;
    await sleep(1500);
  }

  // =========================================================================
  // FASE 3: GRUPO B - RESGATE VIA WAYBACK MACHINE E ESPELHOS (LINKS MUDADOS)
  // =========================================================================
  console.log('\n---------------------------------------------------------------');
  console.log(`🏛️ FASE 3: RESGATANDO GRUPO B VIA WAYBACK MACHINE E ESPELHOS (${groupB.length} LINKS)...`);
  console.log('---------------------------------------------------------------');

  for (let i = 0; i < groupB.length; i++) {
    const item = groupB[i];
    const safeId = item.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const mdPath = path.join(DOCS_DIR, `${safeId}.md`);

    if (fs.existsSync(mdPath)) {
      stats.grupoB++;
      resgatadosTotal++;
      continue;
    }

    console.log(`[B ${i + 1}/${groupB.length}] Consultando Arquivo Histórico: ${(item.titulo || item.url).slice(0, 50)}...`);
    updateStatus('GRUPO_B_WAYBACK', item.titulo);

    let resolved = false;

    try {
      // Consulta Wayback Machine API
      const waybackUrl = `https://archive.org/wayback/available?url=${encodeURIComponent(item.url)}`;
      const wbRes = await fetch(waybackUrl, { signal: AbortSignal.timeout(10000) });

      if (wbRes.ok) {
        const wbData = await wbRes.json();
        const closest = wbData?.archived_snapshots?.closest;

        if (closest && closest.available && closest.url) {
          console.log(`   📍 Snapshot encontrado no Wayback! Baixando...`);
          const snapRes = await fetch(closest.url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: AbortSignal.timeout(25000)
          });

          if (snapRes.ok) {
            const isPdf = item.url.toLowerCase().endsWith('.pdf') || (snapRes.headers.get('content-type') || '').includes('pdf');
            if (isPdf) {
              const buffer = Buffer.from(await snapRes.arrayBuffer());
              const text = await extractTextFromPdfBuffer(buffer);
              if (text.length > 200) {
                saveMarkdownDoc(safeId, { ...item, metodo: 'WAYBACK_PDF' }, text);
                stats.grupoB++;
                resgatadosTotal++;
                resolved = true;
                console.log(`   ✨ Sucesso Snapshot PDF: ${text.length} caracteres!`);
              }
            } else {
              const html = await snapRes.text();
              const cleanMd = htmlToCleanMarkdown(html, item.titulo);
              if (cleanMd.length > 300) {
                saveMarkdownDoc(safeId, { ...item, metodo: 'WAYBACK_HTML' }, cleanMd);
                stats.grupoB++;
                resgatadosTotal++;
                resolved = true;
                console.log(`   ✨ Sucesso Snapshot HTML: ${cleanMd.length} caracteres!`);
              }
            }
          }
        }
      }
    } catch (e) {
      // Silencioso
    }

    if (!resolved) {
      // Se não estava no Wayback, tenta carregar via Chromium com fallback de espelho
      try {
        const page = await context.newPage();
        await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => null);
        const bodyText = await page.innerText('body').catch(() => '');
        if (bodyText.length > 400 && !bodyText.includes('404') && !bodyText.includes('Página não encontrada')) {
          const contentHtml = await page.content();
          const cleanMd = htmlToCleanMarkdown(contentHtml, item.titulo);
          if (cleanMd.length > 250) {
            saveMarkdownDoc(safeId, { ...item, metodo: 'DIRECT_RETRY_CHROMIUM' }, cleanMd);
            stats.grupoB++;
            resgatadosTotal++;
            resolved = true;
            console.log(`   ✨ Sucesso Reconexão Direta: ${cleanMd.length} caracteres!`);
          }
        }
        await page.close().catch(() => {});
      } catch {}
    }

    if (!resolved) {
      stats.falhas++;
    }

    await sleep(1000);
  }

  await browser.close().catch(() => {});
  updateStatus('CONCLUIDO');

  console.log('\n===============================================================');
  console.log('🎉 ESTEIRA DE RESGATE FINALIZADA COM SUCESSO!');
  console.log(`Total de Pendências Resgatadas: ${resgatadosTotal} de ${totalAlvos}`);
  console.log(`- Grupo C (Sci-Hub / DOIs): ${stats.grupoC}`);
  console.log(`- Grupo A (Navegador Real Anti-Bot): ${stats.grupoA}`);
  console.log(`- Grupo B (Wayback & Reconexão): ${stats.grupoB}`);
  console.log(`- Falhas Irrecuperáveis: ${stats.falhas}`);
  console.log('===============================================================\n');
}

main().catch(err => {
  console.error('❌ Falha crítica no pipeline de resgate:', err);
  process.exit(1);
});
