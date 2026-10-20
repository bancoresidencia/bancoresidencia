import fs from 'fs';
import path from 'path';

// Arquivos e Diretórios de Destino
const SOURCE_FILE = path.join(process.cwd(), 'data', 'knowledge', 'referencias_materiais_apoio', 'todas_referencias_unificadas.json');
const BASE_DIR = path.join(process.cwd(), 'data', 'knowledge', 'diretrizes_oficiais');
const PDF_DIR = path.join(BASE_DIR, 'raw_pdfs');
const DOCS_DIR = path.join(BASE_DIR, 'markdown_docs');
const CHECKPOINT_PATH = path.join(BASE_DIR, 'checkpoint.json');
const STATUS_PATH = path.join(BASE_DIR, 'live_status.json');

// Garante que os diretórios existam
[BASE_DIR, PDF_DIR, DOCS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Função rigorosa para filtrar e EXCLUIR livros
function isBookReference(r) {
  if (r.tipo === 'livro_texto') return true;
  const str = ((r.titulo || '') + ' ' + (r.texto_referencia || '')).toLowerCase();
  const bookKeywords = [
    'tratado de', 'campbell-walsh', 'harrison', 'sabiston',
    'nelson tratado', 'williams obstetric', 'cecil medicina',
    'guyton', 'current medical diagnosis', 'manual de farmacologia',
    'atls: advanced trauma', 'robbins patologia', 'goldman-cecil',
    'barash clinical anesthesia', 'berek & novak', 'schwartz principios'
  ];
  return bookKeywords.some(kw => str.includes(kw));
}

// Limpeza básica e conversão de HTML para Markdown estruturado
function htmlToCleanMarkdown(html, title) {
  if (!html || typeof html !== 'string') return '';

  let text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
    .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, '');

  // Conversão de tags estruturais
  text = text
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n#### $1\n')
    .replace(/<p[^>]*>/gi, '\n\n')
    .replace(/<\/p>/gi, '')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '\n* $1')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');

  // Decodificação de entidades HTML comuns
  text = text
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

async function fetchWithTimeout(url, options = {}, timeoutMs = 25000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
      redirect: 'follow'
    });
    return res;
  } finally {
    clearTimeout(id);
  }
}

async function main() {
  console.log('===============================================================');
  console.log('📥 INICIANDO COLETA AUTOMÁTICA DE DIRETRIZES E FONTES OFICIAIS');
  console.log('🚫 REGRA ATIVA: LIVROS TEXTO E TRATADOS EXCLUÍDOS DA COLETA');
  console.log('🏛️ ESCOPO: DIRETRIZES (FEBRASGO, SBC, EAU), PCDT/SUS, PUBMED/NCBI');
  console.log('===============================================================\n');

  if (!fs.existsSync(SOURCE_FILE)) {
    throw new Error(`Arquivo de referências não encontrado: ${SOURCE_FILE}`);
  }

  const rawData = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf8'));
  const allRefs = rawData.referencias || [];

  // Filtragem estrita: exclui livros e seleciona fontes oficiais com URL
  const targetRefs = allRefs.filter(r => !isBookReference(r) && r.url);
  console.log(`📊 Total de referências analisadas: ${allRefs.length}`);
  console.log(`📚 Livros excluídos da coleta: ${allRefs.length - targetRefs.length}`);
  console.log(`🎯 Alvos oficiais selecionados com URL: ${targetRefs.length} itens\n`);

  // Carrega checkpoint se existir
  let checkpoint = { completedIds: [], stats: { pdfs: 0, htmlDocs: 0, errors: 0 } };
  if (fs.existsSync(CHECKPOINT_PATH)) {
    try {
      checkpoint = JSON.parse(fs.readFileSync(CHECKPOINT_PATH, 'utf8'));
      console.log(`🔄 Checkpoint recuperado: ${checkpoint.completedIds.length} fontes já baixadas.`);
    } catch {}
  }

  const completedSet = new Set(checkpoint.completedIds);
  const queue = targetRefs.filter(r => !completedSet.has(r.id));
  console.log(`⏳ Restantes para baixar: ${queue.length} documentos oficiais.\n`);

  if (queue.length === 0) {
    console.log('🎉 Todas as diretrizes e documentos oficiais já foram coletados!');
    return;
  }

  const startTime = Date.now();
  let processedSinceFlush = 0;

  function updateStatus(force = false) {
    if (processedSinceFlush >= 5 || force) {
      fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2), 'utf8');
      processedSinceFlush = 0;
    }

    const processed = checkpoint.completedIds.length;
    const pct = ((processed / targetRefs.length) * 100).toFixed(1);
    const elapsedSec = Math.round((Date.now() - startTime) / 1000);

    const liveStatus = {
      status: 'EM_EXECUCAO',
      total_alvos_oficiais: targetRefs.length,
      processados: processed,
      restantes: targetRefs.length - processed,
      progresso_pct: `${pct}%`,
      pdfs_salvos: checkpoint.stats.pdfs,
      artigos_html_salvos: checkpoint.stats.htmlDocs,
      falhas_de_acesso: checkpoint.stats.errors,
      tempo_decorrido_seg: elapsedSec,
      atualizado_em: new Date().toISOString()
    };

    fs.writeFileSync(STATUS_PATH, JSON.stringify(liveStatus, null, 2), 'utf8');
  }

  // Tratamento de encerramento
  process.on('SIGINT', () => {
    console.log('\n🛑 Interrupção solicitada. Gravando checkpoint antes de sair...');
    updateStatus(true);
    process.exit(0);
  });

  // Função de coleta por worker
  async function worker(workerId) {
    while (queue.length > 0) {
      const ref = queue.shift();
      if (!ref) break;

      if (completedSet.has(ref.id)) continue;

      const cleanUrl = ref.url.trim();
      const isPdfUrl = cleanUrl.toLowerCase().includes('.pdf');
      const safeId = ref.id.replace(/[^a-zA-Z0-9_-]/g, '_');

      try {
        const res = await fetchWithTimeout(cleanUrl);

        if (!res.ok) {
          console.warn(`⚠️ [W${workerId}] HTTP ${res.status} em: ${cleanUrl.slice(0, 60)}`);
          checkpoint.stats.errors = (checkpoint.stats.errors || 0) + 1;
        } else {
          const contentType = (res.headers.get('content-type') || '').toLowerCase();

          if (isPdfUrl || contentType.includes('application/pdf')) {
            // Salva PDF binário
            const buffer = Buffer.from(await res.arrayBuffer());
            if (buffer.length > 1000) {
              const pdfFile = path.join(PDF_DIR, `${safeId}.pdf`);
              fs.writeFileSync(pdfFile, buffer);

              // Salva metadados
              const metaFile = path.join(DOCS_DIR, `${safeId}.md`);
              const frontmatter = [
                '---',
                `id: "${ref.id}"`,
                `tipo: "DIRETRIZ_PDF"`,
                `titulo: "${(ref.titulo || ref.texto_referencia || 'Diretriz Oficial').replace(/"/g, "'")}"`,
                `url_original: "${cleanUrl}"`,
                `dominio: "${ref.dominio || ''}"`,
                `arquivo_pdf: "raw_pdfs/${safeId}.pdf"`,
                `bytes: ${buffer.length}`,
                `coletado_em: "${new Date().toISOString()}"`,
                '---',
                '',
                `# ${(ref.titulo || ref.texto_referencia || 'Diretriz Oficial')}`,
                `\nArquivo PDF baixado e armazenado com sucesso no repositório seguro.`
              ].join('\n');

              fs.writeFileSync(metaFile, frontmatter, 'utf8');
              checkpoint.stats.pdfs = (checkpoint.stats.pdfs || 0) + 1;
              console.log(`📄 [W${workerId}] PDF Salvo: ${(ref.titulo || cleanUrl).slice(0, 45)} (${Math.round(buffer.length / 1024)} KB)`);
            }
          } else {
            // Processa documento HTML / Artigo web
            const htmlText = await res.text();
            if (htmlText.length > 200) {
              const cleanMd = htmlToCleanMarkdown(htmlText, ref.titulo);
              const docFile = path.join(DOCS_DIR, `${safeId}.md`);

              const frontmatter = [
                '---',
                `id: "${ref.id}"`,
                `tipo: "DOCUMENTO_CIENTIFICO_WEB"`,
                `titulo: "${(ref.titulo || ref.texto_referencia || 'Documento Oficial').replace(/"/g, "'")}"`,
                `url_original: "${cleanUrl}"`,
                `dominio: "${ref.dominio || ''}"`,
                `caracteres: ${cleanMd.length}`,
                `coletado_em: "${new Date().toISOString()}"`,
                '---',
                '',
                `# ${(ref.titulo || ref.texto_referencia || 'Documento Oficial')}`,
                '',
                cleanMd
              ].join('\n');

              fs.writeFileSync(docFile, frontmatter, 'utf8');
              checkpoint.stats.htmlDocs = (checkpoint.stats.htmlDocs || 0) + 1;
              console.log(`🌐 [W${workerId}] Doc Salvo: ${(ref.titulo || cleanUrl).slice(0, 45)} (${cleanMd.length} caracteres)`);
            }
          }
        }

        completedSet.add(ref.id);
        checkpoint.completedIds.push(ref.id);
        processedSinceFlush++;
        updateStatus(false);

        // Intervalo com jitter seguro para não sobrecarregar servidores de diretrizes
        const delay = Math.floor(600 + Math.random() * 500);
        await sleep(delay);

      } catch (err) {
        console.warn(`❌ [W${workerId}] Falha em ${cleanUrl.slice(0, 50)}: ${err.message}`);
        checkpoint.stats.errors = (checkpoint.stats.errors || 0) + 1;
        completedSet.add(ref.id);
        checkpoint.completedIds.push(ref.id);
        processedSinceFlush++;
        updateStatus(false);
        await sleep(1000);
      }
    }
  }

  // Executa com pool de 4 workers concorrentes
  const NUM_WORKERS = 4;
  console.log(`🚀 Disparando pool de ${NUM_WORKERS} workers para coleta das diretrizes oficiais...\n`);
  const workers = Array.from({ length: NUM_WORKERS }, (_, i) => worker(i + 1));
  await Promise.all(workers);

  updateStatus(true);

  console.log('\n===============================================================');
  console.log('🎉 COLETA DE DIRETRIZES E FONTES OFICIAIS FINALIZADA COM SUCESSO!');
  console.log(`PDFs Oficiais Armazenados: ${checkpoint.stats.pdfs}`);
  console.log(`Documentos Científicos Estruturados: ${checkpoint.stats.htmlDocs}`);
  console.log(`Diretório: ${BASE_DIR}`);
  console.log('===============================================================\n');
}

main().catch(err => {
  console.error('❌ Falha crítica no pipeline de coleta:', err);
  process.exit(1);
});
