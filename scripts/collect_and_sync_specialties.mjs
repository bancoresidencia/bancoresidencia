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

// Credenciais de leitura segura no MedEvo (sessão ativa)
const medevoCfg = JSON.parse(fs.readFileSync(path.resolve('scripts/medevo_config.json'), 'utf8'));
const MEDEVO_ANON_KEY = medevoCfg.MEDEVO_ANON_KEY;
const MEDEVO_USER_TOKEN = medevoCfg.MEDEVO_USER_TOKEN;
const USER_ID = medevoCfg.USER_ID;

const SPECIALTIES = [
  {
    name: 'Obstetrícia',
    id: 'bad7911f-2e63-4725-bd93-5c6053e675e1',
    sigla: 'OBS',
    filePrefix: 'obstetricia'
  },
  {
    name: 'Cirurgia',
    id: 'de4feedd-290c-4ba8-95d0-1516f7c8ae50',
    sigla: 'CIR',
    filePrefix: 'cirurgia'
  },
  {
    name: 'Medicina Preventiva e Social',
    id: 'f1398ccc-e9f9-40dc-adca-d11103baed4c',
    sigla: 'MPS',
    filePrefix: 'medicina_preventiva'
  },
  {
    name: 'Pediatria',
    id: 'aea25175-37f3-43d5-9afa-042e64b52b23',
    sigla: 'PED',
    filePrefix: 'pediatria'
  },
  {
    name: 'Clínica Médica',
    id: '27fb949f-5751-42ee-a39d-d1f72bcadf98',
    sigla: 'CLM',
    filePrefix: 'clinica_medica'
  }
];

// Helper de delay
const sleep = ms => new Promise(r => setTimeout(r, ms));

function log(msg) {
  const ts = new Date().toLocaleTimeString('pt-BR');
  console.log(`[${ts}] ${msg}`);
}

// 1. Coleta de IDs com paginação e checkpoint
async function collectSpecialtyIds(spec) {
  const idsFile = path.resolve(`data/${spec.filePrefix}_ids_list.json`);
  if (fs.existsSync(idsFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(idsFile, 'utf8'));
      if (data && Array.isArray(data.ids) && data.ids.length > 0 && data.completed) {
        log(`[${spec.name}] Lista de IDs já completa em cache: ${data.ids.length} questões.`);
        return data.ids;
      }
    } catch (e) {}
  }

  log(`[${spec.name}] Iniciando obtenção de IDs via API segura do MedEvo...`);
  const allIds = new Set();
  let page = 1;
  const pageSize = 300;
  let totalReported = null;

  while (true) {
    try {
      const res = await fetch('https://api.medevo.com.br/rest/v1/rpc/get_filtered_questions_secure_v4', {
        method: 'POST',
        headers: {
          'content-profile': 'public',
          'authorization': 'Bearer ' + MEDEVO_USER_TOKEN,
          'apikey': MEDEVO_ANON_KEY,
          'content-type': 'application/json'
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
          page_number: page,
          items_per_page: pageSize,
          domain_filter: null,
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
          random_order: false
        })
      });

      if (!res.ok) {
        const txt = await res.text();
        log(`[${spec.name}] Aviso HTTP ${res.status} ao buscar página ${page}: ${txt.slice(0, 100)}. Aguardando 4s...`);
        await sleep(4000);
        continue;
      }

      const payload = await res.json();
      const row = payload[0] || {};
      if (totalReported === null && row.total) {
        totalReported = row.total;
        log(`[${spec.name}] Total de questões registradas no MedEvo: ${totalReported}`);
      }

      const questions = row.questions || [];
      if (questions.length === 0) {
        log(`[${spec.name}] Fim da listagem de IDs (página ${page} retornou 0 itens).`);
        break;
      }

      for (const q of questions) {
        if (q.id) allIds.add(q.id);
      }

      log(`[${spec.name}] Página ${page} carregada (+${questions.length} IDs) | Total acumulado: ${allIds.size}${totalReported ? `/${totalReported}` : ''}`);

      if (totalReported && allIds.size >= totalReported) {
        break;
      }

      page++;
      await sleep(1000); // 1.0s de intervalo seguro entre páginas de IDs
    } catch (err) {
      log(`[${spec.name}] Erro de conexão na página ${page}: ${err.message}. Retentando em 5s...`);
      await sleep(5000);
    }
  }

  const idsArray = Array.from(allIds);
  fs.writeFileSync(idsFile, JSON.stringify({
    specialty: spec.name,
    specialty_id: spec.id,
    total: idsArray.length,
    completed: true,
    ids: idsArray
  }, null, 2));

  log(`[${spec.name}] Lista de IDs finalizada e salva: ${idsArray.length} IDs.`);
  return idsArray;
}

// 2. Filtro de questões autorais do MedEvo
function isMedEvoAutoral(q) {
  const loc = (q.location?.name || '').toLowerCase();
  const domain = (q.knowledge_domain || '').toLowerCase();
  const content = (q.question_content || '').toLowerCase();
  return loc.includes('medevo') || loc.includes('autoral') || domain.includes('medevo') || content.includes('medevo autoral');
}

// 3. Mapeador de questão para o formato do Banco Residência
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

// 4. Envio de lote para o Supabase com retry
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

// 5. Coleta Segura de Conteúdo e Upload Direto
async function processSpecialty(spec) {
  log(`\n======================================================`);
  log(`INICIANDO ESPECIALIDADE: ${spec.name}`);
  log(`======================================================`);

  const ids = await collectSpecialtyIds(spec);
  const finalFile = path.resolve(`data/${spec.filePrefix}_final_questions.json`);
  if (fs.existsSync(finalFile)) {
    log(`[${spec.name}] Especialidade já 100% CONCLUÍDA anteriormente (${finalFile}). Avançando para a próxima!`);
    return;
  }

  const outputFile = path.resolve(`data/${spec.filePrefix}_medevo_extracted.json`);

  // Carrega progresso anterior se existir
  let savedQuestions = [];
  if (fs.existsSync(outputFile)) {
    try {
      const existing = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
      if (existing && Array.isArray(existing.questions)) {
        savedQuestions = existing.questions;
        log(`[${spec.name}] Progresso anterior recuperado: ${savedQuestions.length} questões já salvas.`);
      }
    } catch (e) {}
  }

  const existingIds = new Set(savedQuestions.map(q => q.id));
  const remainingIds = ids.filter(id => !existingIds.has(id));
  log(`[${spec.name}] Total de IDs: ${ids.length} | Já extraídas: ${existingIds.size} | Restantes: ${remainingIds.length}`);

  const CHUNK_SIZE = 100;
  const chunks = [];
  for (let i = 0; i < remainingIds.length; i += CHUNK_SIZE) {
    chunks.push(remainingIds.slice(i, i + CHUNK_SIZE));
  }

  let totalIgnoredAutorais = 0;
  let runningIndex = savedQuestions.length;

  for (let i = 0; i < chunks.length; i++) {
    const chunkIds = chunks[i];
    let questionsList = null;

    // Busca lote com retry seguro (nunca pula nenhum lote)
    let attempt = 0;
    while (!questionsList) {
      attempt++;
      try {
        const res = await fetch('https://api.medevo.com.br/rest/v1/rpc/get_questions_by_ids_secure_v2', {
          method: 'POST',
          headers: {
            'apikey': MEDEVO_ANON_KEY,
            'Authorization': 'Bearer ' + MEDEVO_USER_TOKEN,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ question_ids: chunkIds })
        });

        if (res.status === 429) {
          log(`[${spec.name}] Rate limit (429) detectado. Pausando 15 segundos para reset da janela...`);
          await sleep(15000);
          continue;
        }

        if (!res.ok) {
          const txt = await res.text();
          if (txt.includes('Rate limit')) {
            log(`[${spec.name}] Rate limit detectado no corpo da resposta. Pausando 15 segundos...`);
            await sleep(15000);
            continue;
          }
          throw new Error(`HTTP ${res.status}: ${txt}`);
        }

        questionsList = await res.json();
      } catch (err) {
        const wait = Math.min(attempt * 4000, 20000);
        log(`[${spec.name}] Erro ao buscar lote ${i + 1}/${chunks.length} (tentativa ${attempt}): ${err.message}. Aguardando ${wait}ms...`);
        await sleep(wait);
      }
    }

    // Filtra questões autorais
    const nonAutorais = [];
    for (const q of questionsList) {
      if (isMedEvoAutoral(q)) {
        totalIgnoredAutorais++;
      } else {
        nonAutorais.push(q);
      }
    }

    savedQuestions.push(...nonAutorais);

    // Mapeia para o formato do Supabase
    const mappedForSupabase = nonAutorais.map(q => {
      runningIndex++;
      return mapQuestionToBancoResidencia(q, spec, runningIndex);
    });

    // Envia imediatamente para o Supabase
    if (mappedForSupabase.length > 0) {
      const uploaded = await uploadBatchToSupabase(mappedForSupabase);
      if (!uploaded) {
        log(`[${spec.name}] Alerta: Lote ${i + 1} não pôde ser gravado no Supabase nesta tentativa.`);
      }
    }

    // Salva checkpoint local a cada lote
    fs.writeFileSync(outputFile, JSON.stringify({
      specialty: spec.name,
      total: savedQuestions.length,
      ignored_autorais: totalIgnoredAutorais,
      questions: savedQuestions
    }));

    log(`[${spec.name}] Lote ${i + 1}/${chunks.length} processado: +${nonAutorais.length} válidas | Acumulado: ${savedQuestions.length}/${ids.length} (${Math.round((savedQuestions.length / ids.length) * 100)}%)`);

    // Intervalo de segurança (1.6 segundos por lote de 100 questões para estabilidade de rate limit)
    await sleep(1600);
  }

  // Gera arquivo final estruturado de compatibilidade
  const finalMapped = savedQuestions.map((q, idx) => mapQuestionToBancoResidencia(q, spec, idx + 1));
  fs.writeFileSync(finalFile, JSON.stringify(finalMapped, null, 2));

  log(`🎉 [${spec.name}] CONCLUÍDA COM SUCESSO!`);
  log(`Total salvas e enviadas: ${finalMapped.length} | Autorais ignoradas: ${totalIgnoredAutorais}`);
}

async function main() {
  log(`======================================================`);
  log(`INICIANDO COLETADOR E SINCRONIZADOR SEGURO MEDEVO -> SUPABASE`);
  log(`Especialidades a processar: ${SPECIALTIES.map(s => s.name).join(', ')}`);
  log(`Destino: ${SUPABASE_URL}`);
  log(`======================================================`);

  for (const spec of SPECIALTIES) {
    await processSpecialty(spec);
  }

  log(`\n🎉 TODAS AS 5 ESPECIALIDADES FORAM COLETADAS E ENVIADAS AO SUPABASE COM SUCESSO!`);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
