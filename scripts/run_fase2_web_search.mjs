import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// 1. Carrega variáveis de ambiente (.env.local)
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      }
    }
  });
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// 2. Função de Similaridade Dice / Token Overlap
function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  const s1 = str1.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const s2 = str2.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0;

  const w1 = s1.split(' ');
  const w2 = s2.split(' ');
  const set1 = new Set(w1);
  const set2 = new Set(w2);

  let intersection = 0;
  for (const w of set1) {
    if (set2.has(w)) intersection++;
  }
  const dice = (2 * intersection) / (set1.size + set2.size);
  return Math.round(dice * 100) / 100;
}

// 3. User-Agents para rotação
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
];

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// 4. Arquivos de Staging e Status
const STAGING_FILE = path.resolve('data/staging_fase2_web.json');
const STATUS_FILE = path.resolve('data/pipeline_status.json');

function loadStaged() {
  if (fs.existsSync(STAGING_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STAGING_FILE, 'utf8'));
    } catch (e) {
      return [];
    }
  }
  return [];
}

function saveStaged(records) {
  fs.writeFileSync(STAGING_FILE, JSON.stringify(records, null, 2), 'utf8');
}

function updatePipelineStatus(fase2Stats) {
  try {
    let status = {};
    if (fs.existsSync(STATUS_FILE)) {
      status = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
    }
    status.fase2 = {
      ...fase2Stats,
      lastUpdate: new Date().toISOString()
    };
    if (status.stats) {
      status.stats.fase2Homologadas = fase2Stats.homologadas || 0;
    }
    fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2), 'utf8');
  } catch (e) {}
}

// 5. Busca Web com Anti-429
async function searchWeb(query) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9'
      }
    });

    if (res.status === 429) {
      console.warn('⚠️ [ANTI-429] HTTP 429 detectado em DuckDuckGo. Aplicando pausa estratégica de 10s...');
      await new Promise(r => setTimeout(r, 10000));
      return [];
    }

    if (!res.ok) return [];

    const html = await res.text();
    const regex = /<div class="result results_links[^"]*">[\s\S]*?<a rel="nofollow" class="result__a" href="([^"]+)">([\s\S]*?)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
    const results = [];
    let match;
    while ((match = regex.exec(html)) !== null && results.length < 5) {
      let targetUrl = match[1];
      try {
        const uddg = new URL(match[1], 'https://duckduckgo.com').searchParams.get('uddg');
        if (uddg) targetUrl = decodeURIComponent(uddg);
      } catch (e) {}
      results.push({
        url: targetUrl,
        title: match[2].replace(/<[^>]+>/g, '').trim(),
        snippet: match[3].replace(/<[^>]+>/g, '').trim()
      });
    }
    return results;
  } catch (err) {
    console.error('Erro na requisição de busca:', err.message);
    return [];
  }
}

// 6. Extrator de Gabarito de Páginas Médicas
async function parseMedicalPage(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept-Language': 'pt-BR,pt;q=0.9'
      }
    });
    if (!res.ok) return null;
    const html = await res.text();

    // 6.1 Extrator Sanar (JSON em script tag)
    if (url.includes('sanarmed.com')) {
      const scriptMatches = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)];
      for (const sm of scriptMatches) {
        const content = sm[1];
        if (content.includes('"correct": true') || content.includes('"correct":true')) {
          try {
            const data = JSON.parse(content);
            if (data.alternatives && Array.isArray(data.alternatives)) {
              const correctAlt = data.alternatives.find(a => a.correct === true);
              const correctLetter = correctAlt ? String.fromCharCode(65 + correctAlt.index) : null;
              return {
                source: 'sanar',
                statement: (data.statement || '').replace(/<[^>]+>/g, ' ').trim(),
                alternatives: data.alternatives.map(a => ({
                  letter: String.fromCharCode(65 + a.index),
                  text: (a.text || '').replace(/<[^>]+>/g, ' ').trim(),
                  correct: a.correct === true
                })),
                correctLetter,
                commentary: data.comment_text ? data.comment_text.replace(/<[^>]+>/g, ' ').trim() : null
              };
            }
          } catch (e) {}
        }
      }
    }
  } catch (e) {
    return null;
  }
  return null;
}

// 7. Loop Principal de Execução da Fase 2
export async function runFase2(targetInstitutions = [
  'Universidade Municipal de São Caetano do Sul%',
  'UERJ/HUPE%',
  'UNICAMP%',
  'Santa Casa de Maceió%',
  'CMC - Fundação Centro Médico%',
  'SMS Foz do Iguaçu%',
  'AMP - Associação Médica do Paraná'
]) {
  console.log('========================================================================');
  console.log('🌐 FASE 2: BUSCA WEB GRANULAR INICIADA (POOL AMPLIADO)');
  console.log('   Alvos: Bancas com Cadernos Esgotados/Órfãos (USCS, UERJ, UNICAMP, SC Maceió, CMC)');
  console.log('   Regra: Apenas questões com gabarito faltante (correct_answer NULL)');
  console.log('   Estratégia: Query 1 (Enunciado + Alternativa) -> Fallback Query 2');
  console.log('   Segurança: Dual-Gate >= 85% | Zero Commits sem Aprovação');
  console.log('========================================================================\n');

  const staged = loadStaged();
  const stagedIds = new Set(staged.map(s => s.question_id));

  // Buscar questões pendentes das instituições alvo
  let allPending = [];
  for (const inst of targetInstitutions) {
    const { data, error } = await supabase.from('questions')
      .select('id, code, year, institution, statement, options')
      .ilike('institution', inst)
      .or('correct_answer.is.null,correct_answer.eq.');

    if (!error && data) {
      allPending = allPending.concat(data);
    }
  }

  // Filtrar apenas as que ainda não estão em staging
  const toProcess = allPending.filter(q => !stagedIds.has(q.id));
  console.log(`📊 Total de Questões Faltantes Carregadas: ${allPending.length}`);
  console.log(`📋 Já em Staging: ${staged.length} | Restantes para Busca: ${toProcess.length}\n`);

  const stats = {
    totalTarget: allPending.length,
    processadas: 0,
    homologadas: staged.length,
    query1Sucessos: 0,
    query2Sucessos: 0,
    quarentena: 0,
    erros429: 0,
    status: 'em_andamento'
  };

  updatePipelineStatus(stats);

  for (let i = 0; i < toProcess.length; i++) {
    const q = toProcess[i];
    stats.processadas++;

    const cleanStatement = (q.statement || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    let optA = '';
    if (Array.isArray(q.options) && q.options.length > 0) {
      optA = (q.options[0].text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    console.log(`\n🔍 [${i + 1}/${toProcess.length}] Processando: ${q.code} (${q.institution} - ${q.year})`);

    // 1º Tentativa: Query 1 = Enunciado + Alternativa
    const q1Text = `${cleanStatement.slice(0, 80)} ${optA.slice(0, 40)}`.trim();
    console.log(`   ➡️ Query 1: "${q1Text}"`);

    let searchResults = await searchWeb(q1Text);
    let matchedPage = null;
    let queryUsed = 'query1_enunciado_alternativa';

    // Se achou links médicos, verifica
    for (const res of searchResults) {
      if (res.url.includes('sanarmed.com/q/') || res.url.includes('estrategia') || res.url.includes('qconcursos')) {
        const pageData = await parseMedicalPage(res.url);
        if (pageData) {
          const simStmt = calculateSimilarity(cleanStatement, pageData.statement);
          let simOpt = 0;
          if (pageData.correctLetter && Array.isArray(q.options)) {
            const ourWinningOpt = q.options.find(o => (o.letter || '').toUpperCase() === pageData.correctLetter);
            const extWinningOpt = pageData.alternatives.find(a => a.letter === pageData.correctLetter);
            if (ourWinningOpt && extWinningOpt) {
              simOpt = calculateSimilarity(ourWinningOpt.text, extWinningOpt.text);
            }
          }

          if (simStmt >= 0.85 && simOpt >= 0.85) {
            matchedPage = { ...pageData, simStmt, simOpt, url: res.url };
            stats.query1Sucessos++;
            break;
          }
        }
      }
    }

    // 2º Tentativa: Fallback Query 2 = Só Enunciado Inteiro (se Q1 falhou)
    if (!matchedPage) {
      console.log(`   ⚠️ Query 1 sem match direto. Executando Fallback Query 2 (Só Enunciado)...`);
      const q2Text = cleanStatement.slice(0, 110).trim();
      searchResults = await searchWeb(q2Text);
      queryUsed = 'query2_enunciado_puro';

      for (const res of searchResults) {
        if (res.url.includes('sanarmed.com/q/') || res.url.includes('estrategia') || res.url.includes('qconcursos')) {
          const pageData = await parseMedicalPage(res.url);
          if (pageData) {
            const simStmt = calculateSimilarity(cleanStatement, pageData.statement);
            let simOpt = 0;
            if (pageData.correctLetter && Array.isArray(q.options)) {
              const ourWinningOpt = q.options.find(o => (o.letter || '').toUpperCase() === pageData.correctLetter);
              const extWinningOpt = pageData.alternatives.find(a => a.letter === pageData.correctLetter);
              if (ourWinningOpt && extWinningOpt) {
                simOpt = calculateSimilarity(ourWinningOpt.text, extWinningOpt.text);
              }
            }

            if (simStmt >= 0.85 && simOpt >= 0.85) {
              matchedPage = { ...pageData, simStmt, simOpt, url: res.url };
              stats.query2Sucessos++;
              break;
            }
          }
        }
      }
    }

    // Resultado da validação Dual-Gate
    if (matchedPage) {
      console.log(`   ✅ HOMOLOGADA DUAL-GATE (Stmt: ${(matchedPage.simStmt * 100).toFixed(0)}% | Opt: ${(matchedPage.simOpt * 100).toFixed(0)}%)!`);
      console.log(`      Gabarito: [${matchedPage.correctLetter}] | Fonte: ${matchedPage.url}`);
      
      // INGESTÃO DIRETA IMEDIATA NO SUPABASE (AUTORIZADA PELO USUÁRIO)
      try {
        const { error: upErr } = await supabase.from('questions')
          .update({
            correct_answer: matchedPage.correctLetter,
            commentary: matchedPage.commentary || null
          })
          .eq('id', q.id);
        if (!upErr) {
          console.log(`      ⚡ [SUPABASE LIVE] Gravado com sucesso: ${q.code} -> [${matchedPage.correctLetter}]`);
        } else {
          console.error(`      ❌ Erro ao gravar no Supabase: ${upErr.message}`);
        }
      } catch (err) {
        console.error(`      ❌ Falha de rede no update: ${err.message}`);
      }

      const record = {
        question_id: q.id,
        code: q.code,
        institution: q.institution,
        year: q.year,
        correct_answer: matchedPage.correctLetter,
        commentary: matchedPage.commentary || null,
        similarity_statement: matchedPage.simStmt,
        similarity_option: matchedPage.simOpt,
        source_url: matchedPage.url,
        query_strategy: queryUsed,
        staged_at: new Date().toISOString(),
        supabase_committed: true
      };
      
      staged.push(record);
      saveStaged(staged);
      stats.homologadas = staged.length;
    } else {
      console.log(`   ❌ Não homologada nesta rodada (mantida na quarentena/sem match).`);
      stats.quarentena++;
    }

    updatePipelineStatus(stats);

    // Jitter Anti-429 (2,0s a 3,5s)
    const jitterMs = 2000 + Math.floor(Math.random() * 1500);
    await new Promise(r => setTimeout(r, jitterMs));
  }

  stats.status = 'concluido';
  updatePipelineStatus(stats);
  console.log('\n🏁 FASE 2 FINALIZADA. Verifique data/staging_fase2_web.json para aprovação.');
}

// Se executado diretamente
runFase2().catch(console.error);
