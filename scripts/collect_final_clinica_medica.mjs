import fs from 'fs';
import path from 'path';

// Carrega variáveis do .env.local
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || 'https://ezluharxlmlqhdkqrjbz.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('ERRO CRÍTICO: SUPABASE_SERVICE_ROLE_KEY não encontrada em .env.local!');
  process.exit(1);
}

// Credenciais de leitura segura no MedEvo
const medevoCfg = JSON.parse(fs.readFileSync(path.resolve('scripts/medevo_config.json'), 'utf8'));
const MEDEVO_ANON_KEY = medevoCfg.MEDEVO_ANON_KEY;
const MEDEVO_USER_TOKEN = medevoCfg.MEDEVO_USER_TOKEN;
const USER_ID = medevoCfg.USER_ID;

const spec = {
  name: 'Clínica Médica',
  id: '27fb949f-5751-42ee-a39d-d1f72bcadf98',
  sigla: 'CLM',
  filePrefix: 'clinica_medica'
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

function log(msg) {
  const ts = new Date().toLocaleTimeString('pt-BR');
  console.log(`[${ts}] ${msg}`);
}

function isMedEvoAutoral(q) {
  const loc = (q.location?.name || '').toLowerCase();
  const domain = (q.knowledge_domain || '').toLowerCase();
  const content = (q.question_content || '').toLowerCase();
  return loc.includes('medevo') || loc.includes('autoral') || domain.includes('medevo') || content.includes('medevo autoral');
}

function mapQuestionToBancoResidencia(qRaw, spec, index) {
  const locName = qRaw.location?.name || '';
  let banca = locName;
  if (locName.includes(' - ')) {
    const parts = locName.split(' - ');
    banca = parts[0].trim();
  } else if (locName.includes('-')) {
    const parts = locName.split('-');
    banca = parts[0].trim();
  }

  const year = Number(qRaw.exam_year) || 2024;
  const institutionClean = (banca || 'BANCA').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12).toUpperCase();
  const code = `${institutionClean}-${year}-${spec.sigla}-${String(index).padStart(4, '0')}`;

  let difficulty = 'Médio';
  if (qRaw.difficulty_level === 'facil') difficulty = 'Fácil';
  else if (qRaw.difficulty_level === 'dificil') difficulty = 'Difícil';

  const type = qRaw.question_format === 'CERTO_ERRADO' ? 'Certo ou Errado' : 'Múltipla escolha';

  const rawChoices = Array.isArray(qRaw.response_choices) ? qRaw.response_choices : [];
  const options = rawChoices.map((choiceText, idx) => ({
    letter: String.fromCharCode(65 + idx),
    text: String(choiceText || '').trim()
  }));

  const images = (qRaw.media_attachments || []).map(m => {
    if (typeof m === 'string') return m;
    if (m && m.url) return m.url;
    return null;
  }).filter(Boolean);

  return {
    id: String(qRaw.id).trim(),
    code,
    institution: locName,
    banca: banca,
    year,
    tipo_prova: 'Prova 1',
    modalidade: 'Residência Médica',
    especialidade: spec.name,
    tema: qRaw.theme_v2?.name || '',
    foco: qRaw.focus_v2?.name || '',
    subfoco: qRaw.subfocus_v2?.name || qRaw.focus_v2?.name || '',
    difficulty,
    type,
    is_anulada: Boolean(qRaw.is_annulled),
    statement: String(qRaw.question_content || '').trim(),
    options,
    correct_answer: '',
    commentary: '',
    images
  };
}

async function uploadBatchToSupabase(records, retries = 3) {
  const url = `${SUPABASE_URL}/rest/v1/questions`;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(records)
      });

      if (res.ok) return true;

      const txt = await res.text();
      log(`[Supabase Upload] Tentativa ${attempt} falhou: HTTP ${res.status} - ${txt.slice(0, 100)}`);
      if (attempt < retries) await sleep(2000 * attempt);
    } catch (err) {
      log(`[Supabase Upload] Erro de rede ${attempt}: ${err.message}`);
      if (attempt < retries) await sleep(2000 * attempt);
    }
  }
  return false;
}

async function main() {
  log(`======================================================`);
  log(`INICIANDO COLETA FINAL DE CLÍNICA MÉDICA`);
  log(`Destino: ${SUPABASE_URL}`);
  log(`======================================================`);

  const outputFile = path.resolve(`data/${spec.filePrefix}_medevo_extracted.json`);
  const finalFile = path.resolve(`data/${spec.filePrefix}_final_questions.json`);

  let savedQuestions = [];
  let totalIgnoredAutorais = 0;

  if (fs.existsSync(outputFile)) {
    try {
      const existing = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
      if (existing && Array.isArray(existing.questions)) {
        savedQuestions = existing.questions;
        totalIgnoredAutorais = existing.ignored_autorais || 0;
        log(`Progresso recuperado: ${savedQuestions.length} questões já salvas.`);
      }
    } catch (e) {}
  }

  const existingIds = new Set(savedQuestions.map(q => q.id));
  const PAGE_SIZE = 100;
  const TOTAL_EXPECTED = 39033;
  const TOTAL_PAGES = Math.ceil(TOTAL_EXPECTED / PAGE_SIZE); // 391 páginas

  let runningIndex = savedQuestions.length;
  const startPage = Math.max(1, Math.floor(savedQuestions.length / PAGE_SIZE) - 2);
  log(`Iniciando diretamente da página ${startPage}/${TOTAL_PAGES} (as anteriores já estão 100% salvas)...`);

  for (let page = startPage; page <= TOTAL_PAGES; page++) {
    // 1. Busca página com trusted grant
    let pageData = null;
    let pageAttempts = 0;

    while (!pageData) {
      pageAttempts++;
      try {
        const res = await fetch('https://api.medevo.com.br/rest/v1/rpc/get_filtered_questions_secure_v4', {
          method: 'POST',
          headers: {
            'apikey': MEDEVO_ANON_KEY,
            'Authorization': 'Bearer ' + MEDEVO_USER_TOKEN,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            specialty_ids: [spec.id],
            theme_ids: [],
            focus_ids: [],
            subfocus_ids: [],
            location_ids: [],
            years: [],
            question_types: [],
            question_formats: [],
            domain_filters: ['residencia', 'revalida'],
            exclude_annulled: false,
            p_user_id: USER_ID,
            p_exclude_revised: false,
            p_last_years: null,
            p_exclude_answered: false,
            p_answer_status: 'all',
            p_difficulty_levels: null,
            p_blacklisted_location_ids: null,
            p_include_similar_locations: false,
            p_similar_location_rank_limit: 10,
            random_order: false,
            page_number: page,
            items_per_page: PAGE_SIZE
          })
        });

        if (res.status === 429) {
          log(`Rate limit (429) na página ${page}. Pausando 15 segundos...`);
          await sleep(15000);
          continue;
        }

        if (!res.ok) {
          const txt = await res.text();
          if (txt.includes('Rate limit')) {
            log(`Rate limit no corpo na página ${page}. Pausando 15 segundos...`);
            await sleep(15000);
            continue;
          }
          throw new Error(`HTTP ${res.status}: ${txt.slice(0, 100)}`);
        }

        pageData = await res.json();
      } catch (err) {
        const wait = Math.min(pageAttempts * 3000, 15000);
        log(`Erro ao buscar página ${page}/${TOTAL_PAGES} (tentativa ${pageAttempts}): ${err.message}. Aguardando ${wait}ms...`);
        await sleep(wait);
      }
    }

    const questionsOnPage = pageData[0]?.questions || [];
    if (questionsOnPage.length === 0) {
      log(`Página ${page} retornou 0 questões. Fim da paginação.`);
      break;
    }

    // Filtra IDs que ainda não temos
    const needed = questionsOnPage.filter(q => !existingIds.has(q.id));
    if (needed.length === 0) {
      // Já temos todas desta página
      continue;
    }

    const neededIds = needed.map(q => q.id);

    // 2. Busca o conteúdo completo das questões necessárias
    let fullQuestions = null;
    let fetchAttempts = 0;

    while (!fullQuestions) {
      fetchAttempts++;
      try {
        const qRes = await fetch('https://api.medevo.com.br/rest/v1/rpc/get_questions_by_ids_secure_v2', {
          method: 'POST',
          headers: {
            'apikey': MEDEVO_ANON_KEY,
            'Authorization': 'Bearer ' + MEDEVO_USER_TOKEN,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ question_ids: neededIds })
        });

        if (qRes.status === 429) {
          log(`Rate limit (429) buscando lote de questões da página ${page}. Pausando 15 segundos...`);
          await sleep(15000);
          continue;
        }

        if (!qRes.ok) {
          const txt = await qRes.text();
          if (txt.includes('Rate limit')) {
            log(`Rate limit no corpo buscando questões da página ${page}. Pausando 15 segundos...`);
            await sleep(15000);
            continue;
          }
          throw new Error(`HTTP ${qRes.status}: ${txt.slice(0, 100)}`);
        }

        fullQuestions = await qRes.json();
      } catch (err) {
        const wait = Math.min(fetchAttempts * 3000, 15000);
        log(`Erro ao buscar questões da página ${page} (tentativa ${fetchAttempts}): ${err.message}. Aguardando ${wait}ms...`);
        await sleep(wait);
      }
    }

    // 3. Filtra autorais
    const nonAutorais = [];
    for (const q of fullQuestions) {
      if (isMedEvoAutoral(q)) {
        totalIgnoredAutorais++;
      } else {
        nonAutorais.push(q);
        existingIds.add(q.id);
      }
    }

    savedQuestions.push(...nonAutorais);

    // 4. Mapeia e envia para o Supabase
    const mappedForSupabase = nonAutorais.map(q => {
      runningIndex++;
      return mapQuestionToBancoResidencia(q, spec, runningIndex);
    });

    if (mappedForSupabase.length > 0) {
      await uploadBatchToSupabase(mappedForSupabase);
    }

    // 5. Salva arquivo local incremental
    fs.writeFileSync(outputFile, JSON.stringify({
      specialty: spec.name,
      total: savedQuestions.length,
      ignored_autorais: totalIgnoredAutorais,
      questions: savedQuestions
    }, null, 2));

    const pct = Math.round((savedQuestions.length / TOTAL_EXPECTED) * 100);
    log(`[Clínica Médica] Página ${page}/${TOTAL_PAGES} processada: +${nonAutorais.length} válidas | Acumulado: ${savedQuestions.length}/${TOTAL_EXPECTED} (${pct}%)`);

    await sleep(1600); // 1.6s entre requisições
  }

  // 6. Finalização e geração do arquivo final
  log(`Salvando arquivo final: ${finalFile}...`);
  const finalMapped = savedQuestions.map((q, idx) => mapQuestionToBancoResidencia(q, spec, idx + 1));
  fs.writeFileSync(finalFile, JSON.stringify(finalMapped, null, 2));

  log(`🎉 [Clínica Médica] 100% CONCLUÍDA COM SUCESSO!`);
  log(`Total salvas e enviadas ao Supabase: ${savedQuestions.length} | Autorais ignoradas: ${totalIgnoredAutorais}`);
}

main().catch(console.error);
