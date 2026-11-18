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

// Configuração de Concorrência e Segurança de Taxa
const NUM_WORKERS = 3;
const BATCH_SIZE = 50;

// Domínios autorizados que contêm gabaritos oficiais / comentados de residência
const TARGET_DOMAINS = [
  'med.estrategia.com',
  'estrategia.com',
  'sanarmed.com',
  'qconcursos.com',
  'medway.com.br',
  'passeidireto.com',
  'docero.com',
  'studocu.com',
  'romed.com.br',
  'questaoprova.com',
  'preparamais.com',
  'medcof.com.br',
  'medcel.com.br'
];

function cleanText(s) {
  if (!s) return '';
  return s.toLowerCase()
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9áàâãéèêíïóôõöúçñ]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripIntro(s) {
  let clean = (s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const intros = [
    /^(?:aten[cç][aã]o:?\s*)?leia o caso cl[ií]nico a seguir:?\s*/i,
    /^(?:aten[cç][aã]o:?\s*)?leia o texto a seguir:?\s*/i,
    /^com base no caso cl[ií]nico(?: a seguir)?:?\s*/i,
    /^considere o caso cl[ií]nico(?: a seguir)?:?\s*/i,
    /^baseado no texto(?: a seguir)?:?\s*/i,
    /^quest[aã]o\s+\d+[\.\-\s:]+/i
  ];
  for (const re of intros) {
    clean = clean.replace(re, '').trim();
  }
  return clean;
}

function buildPureStatementQuery(statement) {
  const rawClean = stripIntro(statement);
  if (rawClean.length <= 160) {
    return rawClean;
  }
  // Pega os primeiros ~150 caracteres respeitando limite de palavras
  const words = rawClean.split(' ').filter(Boolean);
  let q = '';
  for (const w of words) {
    if ((q + ' ' + w).trim().length > 150) break;
    q = (q + ' ' + w).trim();
  }
  return q || rawClean.slice(0, 150);
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

function isTargetMedicalDomain(urlStr) {
  try {
    const host = new URL(urlStr).hostname.toLowerCase();
    return TARGET_DOMAINS.some(d => host.includes(d));
  } catch {
    return false;
  }
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
      status: `ativo (Fast Scan Fail-Fast com ${NUM_WORKERS} workers)`,
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

export async function runFastScanDaemon() {
  console.log('========================================================================');
  console.log(`⚡ FASE 2: FAST-SCAN MULTI-WORKER (${NUM_WORKERS} WORKERS PARALELOS)`);
  console.log('   Pilar 1: Busca Estritamente por Enunciado (Sem Metadados Extras)');
  console.log('   Pilar 2: Triagem Instantânea nos Resultados (Fail-Fast Zero-Cost)');
  console.log('   Pilar 3: Somente abre páginas de domínios médicos de gabarito');
  console.log('   Pilar 4: Dual-Gate >= 85% E Atualização Estrita de Gabarito no Supabase');
  console.log('========================================================================\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox', '--disable-dev-shm-usage']
  });

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
        console.log(`\n🏁 [FILA] Varredura completa atingida (offset ${currentOffset}). Reiniciando em 15s...`);
        currentOffset = 0;
      } else {
        console.log(`\n📥 [FILA] Lote de ${batch.length} questões abastecido (Offset: ${currentOffset}). Fila: ${workQueue.length + batch.length}`);
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

  await refillQueueIfNeeded();

  async function findTargetMedicalUrls(page, stmtQuery) {
    const searchUrl = 'https://www.bing.com/search?q=' + encodeURIComponent(stmtQuery);
    try {
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 12000 });
      await page.waitForTimeout(600);

      const foundUrls = await page.evaluate(() => {
        const urls = [];
        document.querySelectorAll('li.b_algo').forEach(li => {
          const a = li.querySelector('h2 a');
          const cite = li.querySelector('cite');
          if (a && a.href) urls.push({ href: a.href, cite: cite ? cite.innerText : '' });
        });
        return urls;
      });

      const medicalCandidates = [];
      for (const item of foundUrls) {
        let dec = decodeBingUrl(item.href) || item.href;
        
        // Checa se a URL decodificada é de domínio médico
        if (dec && isTargetMedicalDomain(dec)) {
          if (!medicalCandidates.includes(dec)) medicalCandidates.push(dec);
        } else if (item.cite && isTargetMedicalDomain(item.cite)) {
          // Se o cite indica um domínio alvo (mesmo com redirect oculto)
          if (!medicalCandidates.includes(dec)) medicalCandidates.push(dec);
        }
      }

      return medicalCandidates;
    } catch (e) {
      return [];
    }
  }

  async function runWorker(workerId) {
    const ctx = await browser.newContext({
      userAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.${10 + workerId} Safari/537.36`,
      viewport: { width: 1280, height: 720 },
      locale: 'pt-BR',
      timezoneId: 'America/Sao_Paulo'
    });
    const page = await ctx.newPage();
    await page.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => undefined }); });

    console.log(`🤖 [Worker ${workerId}] Inicializado e pronto para Fast-Scan.`);

    while (true) {
      await refillQueueIfNeeded();

      const q = workQueue.shift();
      if (!q) {
        await new Promise(r => setTimeout(r, 1500));
        continue;
      }

      totalProcessado++;
      const queryStmt = buildPureStatementQuery(q.statement);
      if (queryStmt.length < 25) continue;

      // 1. Busca rápida no Bing
      const medicalUrls = await findTargetMedicalUrls(page, queryStmt);

      // FAIL-FAST: Se não apareceu nenhum site de gabarito nos resultados, PULA IMEDIATAMENTE
      if (medicalUrls.length === 0) {
        console.log(`⏭️ [W${workerId}|#${totalProcessado}] ${q.code}: Sem sites de gabarito nos resultados. Próxima!`);
        // Jitter mínimo de segurança contra rate limit (700ms - 1100ms)
        await new Promise(r => setTimeout(r, Math.floor(Math.random() * 400) + 700));
        continue;
      }

      // Se encontrou site médico de gabarito, analisa a página
      console.log(`🔍 [W${workerId}|#${totalProcessado}] ${q.code}: ${medicalUrls.length} candidato(s) médico(s) encontrado(s)!`);
      let matched = false;

      for (const targetUrl of medicalUrls.slice(0, 2)) {
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
                origem: `Fase 2 Fast-Scan (${parsed.source}: ${new URL(targetUrl).hostname})`,
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
        console.log(`   ❌ [W${workerId}] Sem match Dual-Gate nos candidatos.`);
      }

      // Jitter de segurança anti-bloqueio (800ms - 1300ms)
      await new Promise(r => setTimeout(r, Math.floor(Math.random() * 500) + 800));
    }
  }

  // Dispara os workers
  await Promise.all(
    Array.from({ length: NUM_WORKERS }, (_, i) => runWorker(i + 1))
  );
}

runFastScanDaemon().catch(err => {
  console.error('❌ Erro fatal no daemon fast-scan:', err);
  process.exit(1);
});
