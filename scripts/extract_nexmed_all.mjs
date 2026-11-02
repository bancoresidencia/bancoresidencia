/**
 * EXTRATOR NEXMED — ENUNCIADOS COMPLETOS, IMAGENS E GABARITOS
 * 
 * Regra: Sem justificativas/comentários. Apenas enunciados completos (com imagens) e gabarito oficial.
 * 
 * Modos de execução:
 *   node scripts/extract_nexmed_all.mjs --phase=questions   (Baixa catálogo de 73.553 questões)
 *   node scripts/extract_nexmed_all.mjs --phase=answers     (Resolve gabaritos oficiais)
 *   node scripts/extract_nexmed_all.mjs --all               (Executa fluxo contínuo completo)
 */

import fs from 'fs';
import path from 'path';

const BASE_SITE = 'https://nexmed.space';
const CONFIG_PATH = path.join(process.cwd(), 'scripts', 'nexmed_config.json');
const PROGRESS_PATH = path.join(process.cwd(), 'scripts', 'nexmed_progress.json');
const CATALOG_PATH = path.join(process.cwd(), 'scripts', 'nexmed_questions_catalog.json');
const FINAL_OUTPUT_JSONL = path.join(process.cwd(), 'scripts', 'nexmed_questoes_gabaritos.jsonl');

if (!fs.existsSync(CONFIG_PATH)) {
  console.error('❌ Configuração scripts/nexmed_config.json não encontrada!');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
const BASE_URL = config.baseUrl || `${BASE_SITE}/api`;
const TOKEN = config.token;
const args = process.argv.slice(2);

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

function cleanZeroWidth(text) {
  if (!text || typeof text !== 'string') return text;
  return text.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
}

function resolveImageUrl(img) {
  if (!img) return null;
  if (/^(https?:\/\/|data:|blob:)/i.test(img)) return img;
  return `${BASE_SITE}${img.startsWith('/') ? '' : '/'}${img}`;
}

async function apiRequest(endpoint, options = {}, retries = 5) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { ...options, headers });

      if (res.status === 429) {
        const resetSeconds = parseInt(res.headers.get('ratelimit-reset') || '60', 10);
        console.warn(`\n⚠️ Rate limit atingido (429). Aguardando ${resetSeconds + 2}s...`);
        await sleep((resetSeconds + 2) * 1000);
        continue;
      }

      if (res.status >= 500) {
        console.warn(`\n⚠️ Erro do servidor (${res.status}). Tentativa ${attempt}/${retries}...`);
        await sleep(3000 * attempt);
        continue;
      }

      const data = await res.json().catch(() => null);
      return { ok: res.ok, status: res.status, headers: res.headers, data };
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(2000 * attempt);
    }
  }
  return { ok: false, status: 0, data: null };
}

function loadProgress() {
  if (fs.existsSync(PROGRESS_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf-8'));
    } catch {}
  }
  return { lastPageScraped: 0, totalPages: 0, totalQuestions: 0 };
}

function saveProgress(prog) {
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(prog, null, 2), 'utf-8');
}

// -------------------------------------------------------------------------
// FASE 1: Baixar Catálogo com Enunciados, Imagens e Alternativas
// -------------------------------------------------------------------------
async function scrapeQuestionsCatalog() {
  console.log('===============================================================');
  console.log('📥 FASE 1: EXTRAÇÃO DO CATÁLOGO DE QUESTÕES (ENUNCIADOS + IMAGENS)');
  console.log('===============================================================\n');

  const progress = loadProgress();
  const limit = 100; // Limite máximo validado pelo backend

  // Obter primeira página para sincronizar paginação total
  const first = await apiRequest(`/questoes?categoria=residencia&page=1&limit=${limit}`);
  if (!first.ok || !first.data?.pagination) {
    console.error('❌ Falha ao obter paginação inicial:', first);
    return;
  }

  const totalQuestions = first.data.pagination.total;
  const totalPages = Math.ceil(totalQuestions / limit);
  progress.totalQuestions = totalQuestions;
  progress.totalPages = totalPages;
  saveProgress(progress);

  console.log(`📊 Total de Questões no Banco: ${totalQuestions.toLocaleString('pt-BR')}`);
  console.log(`📄 Total de Páginas: ${totalPages} (limit=${limit})`);

  let catalog = [];
  if (fs.existsSync(CATALOG_PATH)) {
    try {
      catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
      console.log(`💾 Catálogo existente em disco: ${catalog.length} questões.`);
    } catch {}
  }

  const seenIds = new Set(catalog.map(q => q.id));
  let page = progress.lastPageScraped + 1;
  console.log(`▶️ Retomando a partir da página: ${page}/${totalPages}\n`);

  process.on('SIGINT', () => {
    console.log('\n⚠️ Interrupção detectada! Salvando progresso em disco...');
    try {
      fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2), 'utf-8');
      saveProgress(progress);
      console.log('✅ Progresso salvo com sucesso.');
    } catch {}
    process.exit(0);
  });

  const pilotArg = args.find(a => a.startsWith('--pilot'));
  const maxPages = pilotArg ? 1 : totalPages;
  while (page <= maxPages) {
    const t0 = Date.now();
    const res = await apiRequest(`/questoes?categoria=residencia&page=${page}&limit=${limit}`);

    if (!res.ok || !res.data?.data?.questions) {
      console.error(`❌ Erro ao baixar página ${page}. Abortando...`);
      break;
    }

    const items = res.data.data.questions;
    for (const item of items) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);

        const imagensLimpa = (item.imagens || [])
          .map(resolveImageUrl)
          .filter(Boolean);

        catalog.push({
          id: item.id,
          fonte: item.fonte || null,
          ano: item.ano || null,
          instituicao: item.instituicao || null,
          especialidade: item.especialidade || null,
          subespecialidade: item.subespecialidade || null,
          tema: item.tema || null,
          tags: item.tags || [],
          tipo: item.tipo || 'multipla_escolha',
          tempo_medio_resposta: item.tempo_medio_resposta || 60,
          enunciado: cleanZeroWidth(item.enunciado),
          imagens: imagensLimpa,
          alternativas: (item.alternativas || []).map(cleanZeroWidth)
        });
      }
    }

    progress.lastPageScraped = page;
    saveProgress(progress);

    if (page % 5 === 0 || page === totalPages) {
      fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2), 'utf-8');
      const pct = ((page / totalPages) * 100).toFixed(1);
      console.log(`💾 [Página ${page}/${totalPages} - ${pct}%] Total catalogado: ${catalog.length} questões.`);
    }

    const elapsed = Date.now() - t0;
    // Rate limit da listagem: 10 req / 60s (6.2s para margem de segurança)
    const delay = Math.max(0, 6200 - elapsed);
    if (page < totalPages) {
      process.stdout.write(`⏳ Aguardando ${(delay / 1000).toFixed(1)}s (rate limit)... `);
      await sleep(delay);
      console.log('✓');
    }

    page++;
  }

  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2), 'utf-8');
  console.log(`\n🎉 FASE 1 CONCLUÍDA: ${catalog.length} questões salvas em ${CATALOG_PATH}!`);
}

// -------------------------------------------------------------------------
// FASE 2: Extrair Apenas Gabaritos Oficiais (Sem Justificativas)
// -------------------------------------------------------------------------
async function scrapeAnswersOnly() {
  console.log('===============================================================');
  console.log('🎯 FASE 2: RESOLUÇÃO DOS GABARITOS OFICIAIS (SEM JUSTIFICATIVAS)');
  console.log('===============================================================\n');

  if (!fs.existsSync(CATALOG_PATH)) {
    console.error(`❌ Catálogo ${CATALOG_PATH} não encontrado. Execute a Fase 1 primeiro.`);
    return;
  }

  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
  console.log(`📦 Questões disponíveis no catálogo: ${catalog.length.toLocaleString('pt-BR')}`);

  // Mapear questões já resolvidas no arquivo de saída final
  const resolvedMap = new Map();
  if (fs.existsSync(FINAL_OUTPUT_JSONL)) {
    const lines = fs.readFileSync(FINAL_OUTPUT_JSONL, 'utf-8').split('\n').filter(Boolean);
    for (const l of lines) {
      try {
        const obj = JSON.parse(l);
        if (obj.id && obj.gabarito) {
          resolvedMap.set(obj.id, obj.gabarito);
        }
      } catch {}
    }
  }

  console.log(`✅ Já com gabarito extraído: ${resolvedMap.size.toLocaleString('pt-BR')}`);
  let pending = catalog.filter(q => !resolvedMap.has(q.id));
  if (args.includes('--pilot')) {
    pending = pending.slice(0, 5);
    console.log(`🧪 Modo Piloto ativado: processando amostra de ${pending.length} questões.`);
  }
  console.log(`⏳ Pendentes de resolução: ${pending.length.toLocaleString('pt-BR')}\n`);

  if (pending.length === 0) {
    console.log('🎉 Todas as questões já possuem gabarito extraído com sucesso!');
    return;
  }

  const appendStream = fs.createWriteStream(FINAL_OUTPUT_JSONL, { flags: 'a', encoding: 'utf-8' });

  // Rate limit para /responder: 6.000 req / 900s (~400 req/min). Usamos ~300 req/min (200ms por req)
  let count = 0;
  for (const q of pending) {
    count++;
    const t0 = Date.now();

    const ansRes = await apiRequest(`/questoes/${q.id}/responder`, {
      method: 'POST',
      body: JSON.stringify({ resposta: 'A', tempo_resposta_segundos: 10 })
    });

    if (ansRes.ok && ansRes.data?.success) {
      const respData = ansRes.data.data;
      const gabarito = respData.resposta_correta;

      // Objeto limpo: ENUNCIADO COMPLETO + IMAGENS + ALTERNATIVAS + GABARITO (SEM JUSTIFICATIVA)
      const finalQuestion = {
        id: q.id,
        fonte: q.fonte,
        ano: q.ano,
        instituicao: q.instituicao,
        especialidade: q.especialidade,
        subespecialidade: q.subespecialidade,
        tema: q.tema,
        tags: q.tags,
        tipo: q.tipo,
        tempo_medio_resposta: q.tempo_medio_resposta,
        enunciado: q.enunciado,
        imagens: q.imagens,
        alternativas: q.alternativas,
        gabarito: gabarito
      };

      appendStream.write(JSON.stringify(finalQuestion) + '\n');
      resolvedMap.set(q.id, gabarito);

      if (count % 25 === 0 || count === pending.length) {
        const totalDone = resolvedMap.size;
        const totalAll = catalog.length;
        const pct = ((totalDone / totalAll) * 100).toFixed(2);
        console.log(`🎯 [${totalDone}/${totalAll} - ${pct}%] [${q.fonte || 'Banca'} ${q.ano}] ID: ${q.id} -> Gabarito: ${gabarito}`);
      }
    } else {
      console.warn(`⚠️ Não foi possível obter gabarito de ${q.id}: HTTP ${ansRes.status}`);
    }

    const elapsed = Date.now() - t0;
    const delay = Math.max(0, 200 - elapsed);
    await sleep(delay);
  }

  appendStream.end();
  console.log(`\n🎉 FASE 2 CONCLUÍDA! Arquivo final gerado em: ${FINAL_OUTPUT_JSONL}`);
}

// -------------------------------------------------------------------------
// FASE 3: Download Opcional de Imagens Locais
// -------------------------------------------------------------------------
async function downloadImagesLocally() {
  console.log('===============================================================');
  console.log('🖼️ FASE 3: DOWNLOAD DE IMAGENS LOCAIS (461 QUESTÕES COM IMAGEM)');
  console.log('===============================================================\n');

  if (!fs.existsSync(CATALOG_PATH)) {
    console.error(`❌ Catálogo ${CATALOG_PATH} não encontrado.`);
    return;
  }

  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
  const outputDir = path.join(process.cwd(), 'public', 'uploads', 'questoes-imagens');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const allImages = [];
  for (const q of catalog) {
    if (q.imagens && Array.isArray(q.imagens)) {
      for (const imgUrl of q.imagens) {
        allImages.push({ qId: q.id, url: imgUrl });
      }
    }
  }

  console.log(`📸 Total de imagens identificadas: ${allImages.length}`);
  let downloaded = 0;

  for (const item of allImages) {
    const filename = path.basename(new URL(item.url).pathname);
    const dest = path.join(outputDir, filename);

    if (fs.existsSync(dest)) {
      downloaded++;
      continue;
    }

    try {
      const res = await fetch(item.url);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(dest, buf);
        downloaded++;
        if (downloaded % 20 === 0 || downloaded === allImages.length) {
          console.log(`⬇️ [${downloaded}/${allImages.length}] Imagem salva: ${filename}`);
        }
      }
    } catch (e) {
      console.warn(`⚠️ Falha ao baixar ${item.url}:`, e.message);
    }
    await sleep(50);
  }

  console.log(`\n🎉 Imagens salvas com sucesso em: ${outputDir}`);
}

async function run() {
  const isQuestions = args.includes('--phase=questions');
  const isAnswers = args.includes('--phase=answers');
  const isImages = args.includes('--download-images');
  const isAll = args.includes('--all') || (!isQuestions && !isAnswers && !isImages);

  if (isQuestions || isAll) {
    await scrapeQuestionsCatalog();
  }

  if (isAnswers || isAll) {
    await scrapeAnswersOnly();
  }

  if (isImages) {
    await downloadImagesLocally();
  }
}

run().catch(console.error);
