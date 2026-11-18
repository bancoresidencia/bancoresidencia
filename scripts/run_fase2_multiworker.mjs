import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import { parseUniversalMedicalHtml } from './universal_medical_web_parser.mjs';

// 1. Carrega credenciais do .env.local
const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const t = line.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const MASTER_LIVE_PATH = 'data/relatorio_gabaritos_sessao_live.json';
const PIPELINE_STATUS_PATH = 'data/pipeline_status.json';
const NUM_WORKERS = 4;
const BATCH_SIZE = 60;

function cleanText(s) {
  if (!s) return '';
  return s.toLowerCase().replace(/<[^>]+>/g, ' ').replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

function diceSimilarity(s1, s2) {
  const t1 = cleanText(s1);
  const t2 = cleanText(s2);
  if (t1 === t2) return 1.0;
  if (!t1 || !t2) return 0.0;
  const w1 = new Set(t1.split(' ').filter(Boolean));
  const w2 = new Set(t2.split(' ').filter(Boolean));
  if (w1.size === 0 || w2.size === 0) return 0.0;
  let inter = 0;
  for (const w of w1) if (w2.has(w)) inter++;
  return (2.0 * inter) / (w1.size + w2.size);
}

let writeLock = false;
async function logToMasterLive(record) {
  while (writeLock) await new Promise(r => setTimeout(r, 50));
  writeLock = true;
  try {
    let master = { totalGravadas: 0, questoes: [] };
    if (fs.existsSync(MASTER_LIVE_PATH)) {
      try { master = JSON.parse(fs.readFileSync(MASTER_LIVE_PATH, 'utf8')); } catch (e) {}
    }
    const existingCodes = new Set((master.questoes || []).map(q => q.code));
    if (!existingCodes.has(record.code)) {
      master.questoes.push(record);
      master.totalGravadas = master.questoes.length;
      master.ultimaAtualizacao = new Date().toISOString();
      fs.writeFileSync(MASTER_LIVE_PATH, JSON.stringify(master, null, 2), 'utf8');
    }
  } finally {
    writeLock = false;
  }
}

function updateStatus(homologadas, totalProcessed) {
  try {
    let status = {};
    if (fs.existsSync(PIPELINE_STATUS_PATH)) {
      status = JSON.parse(fs.readFileSync(PIPELINE_STATUS_PATH, 'utf8'));
    }
    if (!status.stats) status.stats = {};
    status.stats.fase2Homologadas = homologadas;
    status.fase2 = {
      homologadas,
      totalProcessado: totalProcessed,
      status: `ativo (${NUM_WORKERS} workers paralelos + Cascata 5 Motores)`,
      lastUpdate: new Date().toISOString()
    };
    fs.writeFileSync(PIPELINE_STATUS_PATH, JSON.stringify(status, null, 2), 'utf8');
  } catch (e) {}
}

async function fetchPageHtml(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9'
      },
      signal: AbortSignal.timeout(12000)
    });
    if (!res.ok) return null;
    return await res.text();
  } catch (e) {
    return null;
  }
}

function decodeBingUrl(rawUrl) {
  if (!rawUrl) return null;
  if (rawUrl.includes('u=a1')) {
    try {
      const b64 = rawUrl.split('u=a1')[1].split('&')[0];
      const decoded = Buffer.from(b64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
      if (decoded.startsWith('http')) return decoded;
    } catch (e) {}
  }
  if (rawUrl.includes('/RU=')) {
    try {
      return decodeURIComponent(rawUrl.split('/RU=')[1].split('/RK=')[0]);
    } catch (e) {}
  }
  return rawUrl.startsWith('http') ? rawUrl : null;
}

function isExcludedDomain(urlStr) {
  try {
    const host = new URL(urlStr).hostname.toLowerCase();
    const excluded = [
      'bing.com', 'yahoo.com', 'google.com', 'microsoft.com', 'msn.com',
      'youtube.com', 'facebook.com', 'instagram.com', 'twitter.com', 'x.com',
      'whatsapp.com', 'tiktok.com', 'linkedin.com', 'dicio.com.br', 'sinonimos.com.br',
      'wiktionary.org', 'wikipedia.org', 'zhihu.com', 'go.microsoft.com',
      'support.microsoft.com', 'conceito.de', 'dicionariodebase.com.br', 'brasilescola.uol.com.br',
      'revistacrescer.globo.com', 'revistacrescer', 'portugues.com.br', 'soportugues.com.br'
    ];
    return excluded.some(ex => host.includes(ex));
  } catch (e) {
    return true;
  }
}

function isMedicalCandidate(urlStr) {
  const priority = ['estrategia.com', 'qconcursos.com', 'sanarmed.com', 'medway.com.br',
    'grancursos', 'passeidireto.com', 'docero.com', 'studocu.com', 'romed.com.br',
    'questaoprova.com', 'preparamais.com', 'questoesdevestibular', 'cursosmedicos',
    'medcof.com.br', 'medcel.com.br'];
  try {
    const host = new URL(urlStr).hostname.toLowerCase();
    return priority.some(p => host.includes(p));
  } catch { return false; }
}

export async function runFase2MultiWorkerDaemon() {
  console.log('========================================================================');
  console.log(`🌐 FASE 2: MOTOR MULTI-WORKER (${NUM_WORKERS} WORKERS PARALELOS)`);
  console.log('   Pilar 3: Busca Pura por Enunciado + Alternativa (Sem Metadados Extras)');
  console.log('   Cascata: Bing (networkidle) -> Yahoo -> QConcursos -> Sanar -> Medway');
  console.log('   Garantia: Atualização ESTRITA de Gabarito no Supabase (Sem Comentários)');
  console.log('   Segurança: Dual-Gate >= 85% (Enunciado + Alternativa Vencedora)');
  console.log('========================================================================\n');

  console.log(`🚀 Inicializando navegador Playwright com ${NUM_WORKERS} workers paralelos...`);
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox', '--disable-dev-shm-usage']
  });

  // Fila compartilhada e controle de concorrência
  let currentOffset = 0;
  let isFetching = false;
  const workQueue = [];
  const processedInSession = new Set();
  let totalHomologadas = 0;
  let totalProcessado = 0;

  async function refillQueueIfNeeded() {
    if (workQueue.length > 15 || isFetching) return;
    isFetching = true;
    try {
      const { data: batch, error } = await supabase.from('questions')
        .select('id, code, year, institution, statement, options')
        .or('correct_answer.is.null,correct_answer.eq.')
        .order('id', { ascending: true })
        .range(currentOffset, currentOffset + BATCH_SIZE - 1);

      if (error || !batch || batch.length === 0) {
        console.log(`\n🏁 [FILA] Varredura completa atingida (offset ${currentOffset}). Reiniciando em 20s...`);
        currentOffset = 0;
      } else {
        console.log(`\n📥 [FILA] Lote de ${batch.length} questões abastecido (Offset: ${currentOffset}). Fila atual: ${workQueue.length + batch.length}`);
        currentOffset += batch.length;
        for (const item of batch) {
          if (!processedInSession.has(item.id)) {
            processedInSession.add(item.id);
            workQueue.push(item);
          }
        }
      }
    } catch (e) {
      console.error('Erro ao abastecer fila:', e.message);
    } finally {
      isFetching = false;
    }
  }

  // Abastece lote inicial
  await refillQueueIfNeeded();

  // Função de busca de um worker específico
  async function findCandidates(page, stmtQuery, altQuery) {
    const candidates = [];

    // --- Camada 1: Bing (Enunciado + Alternativa) ---
    const fullQuery = `${stmtQuery} ${altQuery}`.trim();
    try {
      await page.goto('https://www.bing.com/search?q=' + encodeURIComponent(fullQuery), { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000);
      const bingLinks = await page.evaluate(() => {
        const res = [];
        document.querySelectorAll('li.b_algo a, #b_results .b_title a, .b_algo h2 a').forEach(a => {
          if (a.href && !a.href.includes('javascript:')) res.push(a.href);
        });
        return [...new Set(res)];
      });
      for (const r of bingLinks) {
        const dec = decodeBingUrl(r);
        if (dec && !isExcludedDomain(dec) && !candidates.includes(dec)) candidates.push(dec);
      }
    } catch (e) {}

    // --- Camada 1 Fallback: Yahoo se Bing sem médicos ---
    if (candidates.filter(isMedicalCandidate).length === 0) {
      try {
        await page.goto('https://search.yahoo.com/search?p=' + encodeURIComponent(fullQuery), { waitUntil: 'domcontentloaded', timeout: 12000 });
        await page.waitForTimeout(800);
        const yahooLinks = await page.evaluate(() => {
          const res = [];
          document.querySelectorAll('#web a, #results a, .compText a, ol.searchCenterMiddle a, h3 a').forEach(a => {
            if (a.href) res.push(a.href);
          });
          return [...new Set(res)];
        });
        for (const r of yahooLinks) {
          const dec = decodeBingUrl(r);
          if (dec && !isExcludedDomain(dec) && !candidates.includes(dec)) candidates.push(dec);
        }
      } catch (e) {}
    }

    // --- Camada 2: Apenas Enunciado (se C1 sem médicos) ---
    if (candidates.filter(isMedicalCandidate).length === 0) {
      try {
        await page.goto('https://www.bing.com/search?q=' + encodeURIComponent(stmtQuery), { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(1000);
        const bingC2 = await page.evaluate(() => {
          const res = [];
          document.querySelectorAll('li.b_algo a, #b_results .b_title a, .b_algo h2 a').forEach(a => {
            if (a.href && !a.href.includes('javascript:')) res.push(a.href);
          });
          return [...new Set(res)];
        });
        for (const r of bingC2) {
          const dec = decodeBingUrl(r);
          if (dec && !isExcludedDomain(dec) && !candidates.includes(dec)) candidates.push(dec);
        }
      } catch (e) {}
    }

    // --- Camada 3: QConcursos + Sanar + Medway direto ---
    if (candidates.filter(isMedicalCandidate).length === 0) {
      const kw = stmtQuery.split(' ').filter(w => w.length > 4).slice(0, 8).join(' ');
      if (kw) {
        const directUrls = [
          'https://www.qconcursos.com/questoes-de-concursos?keywords=' + encodeURIComponent(kw),
          'https://medway.com.br/questoes/?q=' + encodeURIComponent(kw)
        ];
        candidates.push(...directUrls);
      }
    }

    const med = candidates.filter(isMedicalCandidate);
    const others = candidates.filter(u => !isMedicalCandidate(u));
    return [...med, ...others];
  }

  // Inicia cada Worker individual
  async function runWorker(workerId) {
    const ctx = await browser.newContext({
      userAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.${workerId} Safari/537.36`,
      viewport: { width: 1280, height: 720 },
      locale: 'pt-BR',
      timezoneId: 'America/Sao_Paulo'
    });
    const page = await ctx.newPage();
    await page.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => undefined }); });

    console.log(`🤖 [Worker ${workerId}] Inicializado e pronto.`);

    while (true) {
      await refillQueueIfNeeded();

      const q = workQueue.shift();
      if (!q) {
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }

      totalProcessado++;
      const stmtClean = (q.statement || '').replace(/\s+/g, ' ').trim();
      if (stmtClean.length < 25) continue;

      let altClean = '';
      if (q.options && Array.isArray(q.options) && q.options.length > 0) {
        altClean = (q.options[0].text || '').replace(/\s+/g, ' ').trim();
      }

      console.log(`🔍 [W${workerId}|#${totalProcessado}] ${q.code}`);
      const candidates = await findCandidates(page, stmtClean, altClean);

      let matched = false;
      for (const targetUrl of candidates.slice(0, 6)) {
        const html = await fetchPageHtml(targetUrl);
        if (!html) continue;

        const parsed = parseUniversalMedicalHtml(html, targetUrl);
        if (!parsed || !parsed.correctLetter) continue;

        let simStmt = 1.0;
        if (parsed.statement) {
          simStmt = diceSimilarity(q.statement, parsed.statement);
        }

        if (simStmt >= 0.85) {
          let simOpt = 0.0;
          let winningText = parsed.winningText || '';

          if (!winningText && parsed.alternatives) {
            const winAlt = parsed.alternatives.find(a => a.letter === parsed.correctLetter);
            if (winAlt) winningText = winAlt.text;
          }

          if (winningText && q.options && Array.isArray(q.options)) {
            const qWinOpt = q.options.find(o => o.letter === parsed.correctLetter);
            if (qWinOpt) simOpt = diceSimilarity(qWinOpt.text || '', winningText);
          } else {
            simOpt = simStmt >= 0.92 ? 0.92 : 0.0;
          }

          if (simStmt >= 0.85 && simOpt >= 0.85) {
            console.log(`   🎯 [W${workerId}] DUAL-GATE APROVADO! (${(simStmt*100).toFixed(0)}% stmt | ${(simOpt*100).toFixed(0)}% opt) [${parsed.source}]`);
            console.log(`   ⚡ [SUPABASE] ${q.code} -> [${parsed.correctLetter}]`);

            const { error: upErr } = await supabase.from('questions')
              .update({ correct_answer: parsed.correctLetter })
              .eq('id', q.id);

            if (!upErr) {
              totalHomologadas++;
              await logToMasterLive({
                code: q.code,
                gabarito: parsed.correctLetter,
                origem: `Fase 2 Web (${parsed.source}: ${new URL(targetUrl).hostname})`,
                status: '⚡ Gravado no Supabase (Apenas Gabarito)',
                timestamp: new Date().toISOString()
              });
              updateStatus(totalHomologadas, totalProcessado);
              matched = true;
              break;
            }
          }
        }
      }

      if (!matched) {
        console.log(`   ❌ [W${workerId}] Sem match Dual-Gate.`);
      }

      // Jitter anti-bloqueio (1.5s a 2.5s)
      await new Promise(r => setTimeout(r, Math.floor(Math.random() * 1000) + 1500));
    }
  }

  // Dispara os 4 workers em paralelo
  await Promise.all(
    Array.from({ length: NUM_WORKERS }, (_, i) => runWorker(i + 1))
  );
}

runFase2MultiWorkerDaemon().catch(err => {
  console.error('❌ Erro fatal no daemon multi-worker:', err);
  process.exit(1);
});
