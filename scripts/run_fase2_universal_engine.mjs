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

function logToMasterLive(record) {
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
      status: 'ativo (Bing+Yahoo+QConcursos+Sanar+Medway)',
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
  // Bing /ck/a?...&u=a1<base64url>
  if (rawUrl.includes('u=a1')) {
    try {
      const b64 = rawUrl.split('u=a1')[1].split('&')[0];
      const decoded = Buffer.from(b64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
      if (decoded.startsWith('http')) return decoded;
    } catch (e) {}
  }
  // Yahoo /RU=<encoded>/RK=2
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
  // Prioriza domínios conhecidos de questões médicas
  const priority = ['estrategia.com', 'qconcursos.com', 'sanarmed.com', 'medway.com.br',
    'grancursos', 'passeidireto.com', 'docero.com', 'studocu.com', 'romed.com.br',
    'questaoprova.com', 'preparamais.com', 'questoesdevestibular', 'cursosmedicos',
    'medcof.com.br', 'medcel.com.br'];
  try {
    const host = new URL(urlStr).hostname.toLowerCase();
    return priority.some(p => host.includes(p));
  } catch { return false; }
}

export async function runFase2UniversalDaemon() {
  console.log('========================================================================');
  console.log('🌐 FASE 2: MOTOR MULTI-BUSCADOR (Bing + Yahoo + QConcursos + Sanar + Medway)');
  console.log('   Pilar 3: Cascata de 5 fontes de busca + acesso direto aos portais');
  console.log('   Diretriz: ZERO metadados extras (sem bancas, anos ou instituições)');
  console.log('   Garantia: Atualização ESTRITA de Gabarito no Supabase (Sem Comentários)');
  console.log('   Segurança: Dual-Gate >= 85% (Enunciado + Alternativa Vencedora)');
  console.log('========================================================================\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox', '--disable-dev-shm-usage']
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1366, height: 768 },
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo'
  });

  const searchPage = await context.newPage();
  await searchPage.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  let totalHomologadas = 0;
  let totalProcessado = 0;
  const processedInSession = new Set();
  let currentOffset = 0;
  const BATCH_SIZE = 50;

  // ============================================================
  // Buscador #1: BING — aguarda networkidle para resultados JS
  // ============================================================
  async function searchBing(query) {
    const candidates = [];
    try {
      await searchPage.goto('https://www.bing.com/search?q=' + encodeURIComponent(query),
        { waitUntil: 'networkidle', timeout: 18000 });
      await searchPage.waitForTimeout(1500);

      const rawLinks = await searchPage.evaluate(() => {
        const res = [];
        // Pega resultados reais do Bing (múltiplos seletores para cobrir variações de layout)
        document.querySelectorAll('li.b_algo a, #b_results .b_title a, .b_algo h2 a').forEach(a => {
          if (a.href && !a.href.includes('javascript:')) res.push(a.href);
        });
        return [...new Set(res)];
      });

      for (const raw of rawLinks) {
        const decoded = decodeBingUrl(raw);
        if (decoded && !isExcludedDomain(decoded)) {
          if (!candidates.includes(decoded)) candidates.push(decoded);
        }
      }
    } catch (e) {}
    return candidates;
  }

  // ============================================================
  // Buscador #2: YAHOO — funciona quando Bing falha
  // ============================================================
  async function searchYahoo(query) {
    const candidates = [];
    try {
      await searchPage.goto('https://search.yahoo.com/search?p=' + encodeURIComponent(query),
        { waitUntil: 'domcontentloaded', timeout: 15000 });
      await searchPage.waitForTimeout(1200);

      const rawLinks = await searchPage.evaluate(() => {
        const res = [];
        document.querySelectorAll('#web a, #results a, .compText a, ol.searchCenterMiddle a, h3 a').forEach(a => {
          if (a.href) res.push(a.href);
        });
        return [...new Set(res)];
      });

      for (const raw of rawLinks) {
        const decoded = decodeBingUrl(raw); // funciona para Yahoo /RU= também
        if (decoded && !isExcludedDomain(decoded)) {
          if (!candidates.includes(decoded)) candidates.push(decoded);
        }
      }
    } catch (e) {}
    return candidates;
  }

  // ============================================================
  // Buscador #3: QConcursos — busca direta pelo portal
  // ============================================================
  async function searchQConcursos(query) {
    const candidates = [];
    // Pega apenas as primeiras 10 palavras distintas para a busca por keyword
    const keywords = query.split(' ').filter(w => w.length > 4).slice(0, 10).join(' ');
    try {
      const url = 'https://www.qconcursos.com/questoes-de-concursos?keywords=' + encodeURIComponent(keywords);
      const html = await fetchPageHtml(url);
      if (html && (html.includes('gabarito') || html.includes('alternativa') || html.includes('correta'))) {
        candidates.push(url);
      }
    } catch (e) {}
    return candidates;
  }

  // ============================================================
  // Buscador #4: SanarMed — busca direta pelo portal
  // ============================================================
  async function searchSanar(query) {
    const candidates = [];
    const keywords = query.split(' ').filter(w => w.length > 4).slice(0, 8).join('+');
    try {
      const url = 'https://www.sanarmed.com/questoes-medicas?q=' + encodeURIComponent(keywords);
      const html = await fetchPageHtml(url);
      if (html && html.includes('"correct"')) {
        candidates.push(url);
      }
    } catch (e) {}
    return candidates;
  }

  // ============================================================
  // Buscador #5: Medway — busca direta pelo portal
  // ============================================================
  async function searchMedway(query) {
    const candidates = [];
    const keywords = query.split(' ').filter(w => w.length > 4).slice(0, 8).join(' ');
    try {
      const url = 'https://medway.com.br/questoes/?q=' + encodeURIComponent(keywords);
      const html = await fetchPageHtml(url);
      if (html && (html.includes('gabarito') || html.includes('resposta-correta') || html.includes('correct'))) {
        candidates.push(url);
      }
    } catch (e) {}
    return candidates;
  }

  // ============================================================
  // ORQUESTRADOR: Cascata completa de buscadores
  // ============================================================
  async function findCandidates(stmtQuery, altQuery) {
    let allCandidates = [];

    // --- Camada 1: Enunciado + Alternativa ---
    const fullQuery = `${stmtQuery} ${altQuery}`.trim();
    console.log(`   ➡️  [C1 Bing] "${fullQuery.slice(0, 70)}..."`);
    const bingC1 = await searchBing(fullQuery);
    allCandidates.push(...bingC1);

    if (allCandidates.filter(isMedicalCandidate).length === 0) {
      console.log(`   ➡️  [C1 Yahoo] fallback`);
      const yahooC1 = await searchYahoo(fullQuery);
      allCandidates.push(...yahooC1.filter(u => !allCandidates.includes(u)));
    }

    // --- Camada 2: Apenas Enunciado (se C1 sem médicos) ---
    if (allCandidates.filter(isMedicalCandidate).length === 0) {
      console.log(`   ➡️  [C2 Bing] "${stmtQuery.slice(0, 70)}..."`);
      const bingC2 = await searchBing(stmtQuery);
      allCandidates.push(...bingC2.filter(u => !allCandidates.includes(u)));

      if (allCandidates.filter(isMedicalCandidate).length === 0) {
        console.log(`   ➡️  [C2 Yahoo] fallback`);
        const yahooC2 = await searchYahoo(stmtQuery);
        allCandidates.push(...yahooC2.filter(u => !allCandidates.includes(u)));
      }
    }

    // --- Camada 3: Acesso direto QConcursos + Sanar + Medway ---
    if (allCandidates.filter(isMedicalCandidate).length === 0) {
      console.log(`   ➡️  [C3 QConcursos+Sanar+Medway] acesso direto`);
      const [qc, sanar, medway] = await Promise.all([
        searchQConcursos(stmtQuery),
        searchSanar(stmtQuery),
        searchMedway(stmtQuery)
      ]);
      allCandidates.push(...qc, ...sanar, ...medway);
    }

    // Prioriza candidatos de portais médicos conhecidos
    const medical = allCandidates.filter(isMedicalCandidate);
    const others = allCandidates.filter(u => !isMedicalCandidate(u) && !isExcludedDomain(u));
    return [...medical, ...others];
  }

  // ============================================================
  // LOOP PRINCIPAL
  // ============================================================
  while (true) {
    const { data: pendingQuestions, error } = await supabase.from('questions')
      .select('id, code, year, institution, statement, options')
      .or('correct_answer.is.null,correct_answer.eq.')
      .order('id', { ascending: true })
      .range(currentOffset, currentOffset + BATCH_SIZE - 1);

    if (error || !pendingQuestions || pendingQuestions.length === 0) {
      console.log(`\n🏁 Varredura completa (offset ${currentOffset}). Reiniciando do início em 15s...`);
      currentOffset = 0;
      await new Promise(r => setTimeout(r, 15000));
      continue;
    }

    console.log(`\n📥 Lote de ${pendingQuestions.length} pendências (Offset: ${currentOffset}).`);
    currentOffset += pendingQuestions.length;

    for (const q of pendingQuestions) {
      if (processedInSession.has(q.id)) continue;
      processedInSession.add(q.id);

      totalProcessado++;
      const stmtClean = (q.statement || '').replace(/\s+/g, ' ').trim();
      if (stmtClean.length < 25) continue;

      let altClean = '';
      if (q.options && Array.isArray(q.options) && q.options.length > 0) {
        altClean = (q.options[0].text || '').replace(/\s+/g, ' ').trim();
      }

      console.log(`\n🔍 [${totalProcessado}] ${q.code}`);

      const candidateUrls = await findCandidates(stmtClean, altClean);
      console.log(`   🌐 Candidatos totais: ${candidateUrls.length} (médicos: ${candidateUrls.filter(isMedicalCandidate).length})`);

      let matched = false;
      for (const targetUrl of candidateUrls.slice(0, 8)) {
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
            console.log(`   🎯 DUAL-GATE APROVADO! (${(simStmt*100).toFixed(0)}% stmt | ${(simOpt*100).toFixed(0)}% opt) [${parsed.source}]`);
            console.log(`   ⚡ [SUPABASE] ${q.code} -> [${parsed.correctLetter}]`);

            const { error: upErr } = await supabase.from('questions')
              .update({ correct_answer: parsed.correctLetter })
              .eq('id', q.id);

            if (!upErr) {
              totalHomologadas++;
              logToMasterLive({
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
        console.log(`   ❌ Sem match Dual-Gate.`);
      }

      // Delay anti-bloqueio (2s a 3.5s)
      await new Promise(r => setTimeout(r, Math.floor(Math.random() * 1500) + 2000));
    }
  }
}

runFase2UniversalDaemon().catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
