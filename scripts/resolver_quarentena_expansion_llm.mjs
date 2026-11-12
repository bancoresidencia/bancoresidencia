import fs from 'fs';
import path from 'path';

/**
 * ============================================================================
 * RESOLVEDOR DE QUARENTENA VIA MODELOS LLM (GEMINI MULTI-MODELO SEQUENCIAL)
 * ============================================================================
 * 
 * Protocolo de Execução Estrita:
 *   - Lotes de 5 questões por requisição (--batch 5).
 *   - Uma chave por vez (processamento sequencial sem colisão de cotas).
 *   - Esgotamento progressivo de todos os modelos da chave antes da próxima.
 *   - Pausa protocolar de 1 hora (60 minutos) entre chaves esgotadas.
 *   - Gravação atômica no Supabase (questions_expansion_direto) e checkpoint em disco.
 */

// 1. Carrega Variáveis de Ambiente (.env.local)
const env = {};
const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Credenciais do Supabase ausentes em .env.local');
  process.exit(1);
}

// 2. Parâmetros de Linha de Comando (CLI)
const args = process.argv.slice(2);
const getArg = (flag, defaultVal = null) => {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : defaultVal;
};
const hasFlag = (flag) => args.includes(flag);

const IS_EXECUTE     = hasFlag('--execute');
const BATCH_SIZE     = getArg('--batch') ? Math.max(1, parseInt(getArg('--batch'), 10)) : 5;
const RUN_LIMIT      = getArg('--limit') ? parseInt(getArg('--limit'), 10) : null;
const PAUSE_MINUTES  = getArg('--pause-minutes') ? parseFloat(getArg('--pause-minutes')) : 60; // 1 hora
const TREE_PATH      = path.resolve('data/catalogo_arvore_canonica_completa.json');
const QUARANTINE_FILE = path.resolve('data/quarentena_questions_expansion_direto.jsonl');
const PROGRESS_FILE   = path.resolve('data/resolucao_quarentena_expansion_progresso.jsonl');

// Modelos ordenados por velocidade e resiliência
const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash'
];

const RAW_API_KEYS = Object.keys(env)
  .filter(k => k.startsWith('GEMINI_API_KEY'))
  .map(k => ({ name: k, key: env[k] }))
  .filter((item, idx, self) => item.key && item.key.length > 10 && self.findIndex(s => s.key === item.key) === idx);

console.log('========================================================================');
console.log('⚡ RESOLVEDOR DE QUARENTENA VIA MODELOS LLM (SEQUENCIAL POR CHAVE)');
console.log(`🛡️  Modo:              ${IS_EXECUTE ? '⚡ EXECUÇÃO ATIVA (Grava no Supabase + Checkpoint)' : '🧪 SIMULAÇÃO AUDITADA (--dry-run)'}`);
console.log(`📦 Lotes:             ${BATCH_SIZE} questões por requisição`);
console.log(`⏳ Pausa entre chaves: ${PAUSE_MINUTES} minutos (após esgotamento total de modelos)`);
console.log(`🧠 Modelos por Chave: ${CANDIDATE_MODELS.join(' -> ')}`);
console.log('========================================================================\n');

// 3. Pre-Flight Check de Saúde das Chaves
console.log('🔍 Executando Pre-Flight Check das Chaves do Pool...');
const VALID_KEYS = [];
for (const item of RAW_API_KEYS) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${CANDIDATE_MODELS[0]}:generateContent?key=${item.key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'PING' }] }] }),
      signal: AbortSignal.timeout(10000)
    });
    if (res.ok) {
      VALID_KEYS.push(item);
      console.log(`  ✅ ${item.name} (...${item.key.slice(-6)}): ATIVA E PRONTA`);
    } else if (res.status === 429) {
      VALID_KEYS.push(item);
      console.log(`  ⏸️  ${item.name} (...${item.key.slice(-6)}): Ativa, aguardando cota/reset`);
    } else {
      console.log(`  ❌ ${item.name} (...${item.key.slice(-6)}): HTTP ${res.status} (Descartada)`);
    }
  } catch (e) {
    console.log(`  ⚠️  ${item.name} (...${item.key.slice(-6)}): Timeout/Rede`);
  }
}

if (VALID_KEYS.length === 0) {
  console.error('❌ Nenhuma chave válida disponível em .env.local.');
  process.exit(1);
}

console.log(`\n🔑 Chaves Operacionais no Circuito: ${VALID_KEYS.length} chave(s)\n`);

// 4. Carregar Árvore Canônica Oficial
if (!fs.existsSync(TREE_PATH)) {
  console.error(`❌ Árvore canônica não encontrada em: ${TREE_PATH}`);
  process.exit(1);
}

const rawTree = JSON.parse(fs.readFileSync(TREE_PATH, 'utf8'));
const canonicalFocoMap = new Map();

for (const espNode of (rawTree.hierarquia_padrao || [])) {
  const espName = espNode.especialidade;
  for (const t of (espNode.temas || [])) {
    for (const f of (t.focos || [])) {
      const focoName = f.foco;
      const subfocosList = [];

      for (const s of (f.subfocos || [])) {
        const sName = typeof s === 'string' ? s : s.subfoco;
        if (sName) subfocosList.push(sName);
      }

      const entry = {
        especialidade: espName,
        tema: t.tema,
        foco: focoName,
        subfocosList
      };

      canonicalFocoMap.set(`${espName.toLowerCase().trim()}|||${focoName.toLowerCase().trim()}`, entry);
      canonicalFocoMap.set(focoName.toLowerCase().trim(), entry);
    }
  }
}

// 5. Carregar Checkpoint de Progresso
const resolvedIds = new Set();
if (fs.existsSync(PROGRESS_FILE)) {
  const progLines = fs.readFileSync(PROGRESS_FILE, 'utf8').trim().split('\n');
  for (const l of progLines) {
    if (!l.trim()) continue;
    try {
      const parsed = JSON.parse(l);
      if (parsed.id) resolvedIds.add(parsed.id);
    } catch {}
  }
  console.log(`📋 Checkpoint existente: ${resolvedIds.size.toLocaleString('pt-BR')} questões já resolvidas anteriormente.`);
}

// 6. Carregar Questões da Quarentena
if (!fs.existsSync(QUARANTINE_FILE)) {
  console.error(`❌ Arquivo de quarentena não encontrado em: ${QUARANTINE_FILE}`);
  process.exit(1);
}

const rawQuarantineLines = fs.readFileSync(QUARANTINE_FILE, 'utf8').trim().split('\n');
const pendingQuarantineItems = [];

for (const l of rawQuarantineLines) {
  if (!l.trim()) continue;
  try {
    const item = JSON.parse(l);
    if (!resolvedIds.has(item.id)) {
      pendingQuarantineItems.push(item);
    }
  } catch {}
}

console.log(`📦 Quarentena Pendente: ${pendingQuarantineItems.length.toLocaleString('pt-BR')} questões elegíveis para resolução.`);

if (pendingQuarantineItems.length === 0) {
  console.log('🎉 Todas as questões da quarentena já foram resolvidas!');
  process.exit(0);
}

// Agrupamento por Foco Canônico
const focoGroups = new Map();

for (const qItem of pendingQuarantineItems) {
  const espTarget = qItem.especialidade_resolvida || qItem.especialidade_original;
  const focoTarget = qItem.foco_sugerido;

  const canonicalEntry = canonicalFocoMap.get(`${(espTarget || '').toLowerCase().trim()}|||${(focoTarget || '').toLowerCase().trim()}`) ||
                         canonicalFocoMap.get((focoTarget || '').toLowerCase().trim());

  if (!canonicalEntry || !canonicalEntry.subfocosList || canonicalEntry.subfocosList.length === 0) {
    continue;
  }

  const gKey = `${canonicalEntry.especialidade}|||${canonicalEntry.foco}`;
  if (!focoGroups.has(gKey)) {
    focoGroups.set(gKey, { canonicalEntry, items: [] });
  }
  focoGroups.get(gKey).items.push(qItem);
}

// Montagem dos Lotes
const allBatches = [];
let totalQueued = 0;
const effectiveLimit = RUN_LIMIT ? Math.min(RUN_LIMIT, pendingQuarantineItems.length) : pendingQuarantineItems.length;

for (const [key, group] of focoGroups.entries()) {
  if (totalQueued >= effectiveLimit) break;
  const items = group.items;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    if (totalQueued >= effectiveLimit) break;
    const chunk = items.slice(i, Math.min(items.length, i + BATCH_SIZE, i + (effectiveLimit - totalQueued)));
    allBatches.push({
      canonicalEntry: group.canonicalEntry,
      items: chunk
    });
    totalQueued += chunk.length;
  }
}

console.log(`📦 Fila Montada: ${allBatches.length.toLocaleString('pt-BR')} lotes agendados (${totalQueued.toLocaleString('pt-BR')} questões).\n`);

// 7. Funções de Chamada e Persistência
async function fetchFullQuestionsFromSupabase(ids) {
  try {
    const url = `${SUPABASE_URL}/rest/v1/questions_expansion_direto?id=in.(${ids.join(',')})&select=id,code,statement,options,correct_answer,commentary`;
    const res = await fetch(url, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      },
      signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function callBatchGemini(questionsPayload, canonicalEntry, apiKey, modelName) {
  const prompt = `Você é um Professor e Preceptor Médico de Residência Médica da plataforma Banco Residência.
Classifique o LOTE DE QUESTÕES abaixo na árvore taxonômica oficial.

ESPECIALIDADE: ${canonicalEntry.especialidade}
TEMA: ${canonicalEntry.tema}
FOCO: ${canonicalEntry.foco}

SUBFOCOS VÁLIDOS (Escolha estritamente UM por questão a partir desta lista oficial):
${JSON.stringify(canonicalEntry.subfocosList, null, 2)}

REGRAS:
1. Para cada questão, escolha OBRIGATORIAMENTE um dos nomes exatos da lista de Subfocos acima.
2. Analise o que o examinador realmente está cobrando (comando terminal + gabarito oficial).
3. Seja cirúrgico na justificativa médica (1 frase concisa).

LOTE DE QUESTÕES:
${JSON.stringify(questionsPayload, null, 2)}

RESPONDA ESTRITAMENTE EM FORMATO JSON COMO UM ARRAY DE OBJETOS:
[
  {
    "id": "ID_EXATO_DA_QUESTAO",
    "subfoco_escolhido": "NOME_EXATO_DO_SUBFOCO",
    "justificativa_clinica": "Explicação médica concisa."
  }
]`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json'
      }
    }),
    signal: AbortSignal.timeout(45000)
  });

  return res;
}

async function applyUpdateToSupabase(id, tema, foco, subfoco) {
  if (!IS_EXECUTE) return true;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/questions_expansion_direto?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ tema, foco, subfoco })
    });
    return res.ok;
  } catch {
    return false;
  }
}

// 8. Loop de Execução Sequencial (Uma Chave por Vez -> Todos os Modelos -> Pausa de 1h)
let batchIndex = 0;
let totalResolved = 0;
const startTime = Date.now();

for (let keyIdx = 0; keyIdx < VALID_KEYS.length; keyIdx++) {
  const currentKeyObj = VALID_KEYS[keyIdx];
  console.log(`\n========================================================================`);
  console.log(`🔑 INICIANDO CHAVE [${keyIdx + 1}/${VALID_KEYS.length}]: ${currentKeyObj.name} (...${currentKeyObj.key.slice(-6)})`);
  console.log(`========================================================================`);

  for (let modelIdx = 0; modelIdx < CANDIDATE_MODELS.length; modelIdx++) {
    const currentModel = CANDIDATE_MODELS[modelIdx];
    console.log(`\n  🧠 Modelo Ativo: ${currentModel} (Chave: ${currentKeyObj.name})`);

    let modelExhausted = false;
    let consecutive503 = 0;

    while (batchIndex < allBatches.length && !modelExhausted) {
      const batch = allBatches[batchIndex];
      const batchIds = batch.items.map(it => it.id);

      // Busca dados completos no Supabase
      const fullRows = await fetchFullQuestionsFromSupabase(batchIds);
      if (fullRows.length === 0) {
        batchIndex++;
        continue;
      }

      const questionsPayload = fullRows.map(q => {
        let optsText = '';
        try {
          const opts = Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]');
          optsText = opts.map(o => `${o.letter || o.index}) ${o.text}`).join(' | ');
        } catch {}

        return {
          id: q.id,
          enunciado: (q.statement || '').slice(0, 800),
          alternativas: optsText.slice(0, 600),
          gabarito_oficial: `Alternativa ${q.correct_answer || ''}`,
          comentario: (q.commentary || '').slice(0, 300)
        };
      });

      // Rate limit individual: 4.3 segundos de respiro (~14 RPM seguro)
      await new Promise(r => setTimeout(r, 4300));

      let res;
      try {
        res = await callBatchGemini(questionsPayload, batch.canonicalEntry, currentKeyObj.key, currentModel);
      } catch (e) {
        console.warn(`    ⚠️  Timeout de rede na requisição (${e.message}). Retentando...`);
        await new Promise(r => setTimeout(r, 6000));
        continue;
      }

      // Tratamento de Erro 503 (Alta Demanda Temporária)
      if (res.status === 503) {
        consecutive503++;
        console.warn(`    ⚠️  Modelo ${currentModel} com alta demanda temporária (503).`);
        if (consecutive503 >= 2) {
          console.log(`    ⏩ Alternando para o próximo modelo por instabilidade 503...`);
          modelExhausted = true;
          break;
        }
        await new Promise(r => setTimeout(r, 8000));
        continue;
      }
      consecutive503 = 0;

      // Tratamento de 429 (Cota por Minuto vs Cota Diária)
      if (res.status === 429) {
        const errorText = await res.text();
        const isDailyQuota =
          errorText.includes('PerDay') ||
          errorText.includes('requests per day') ||
          errorText.includes('per day limit exceeded') ||
          errorText.includes('quota exceeded for the day') ||
          /retry in \d+h/.test(errorText);

        if (isDailyQuota) {
          console.log(`    🛑 Cota diária do modelo '${currentModel}' esgotada nesta chave.`);
          modelExhausted = true;
          break;
        } else {
          console.log(`    ⏳ Rate-limit transitório de RPM. Aguardando 16s...`);
          await new Promise(r => setTimeout(r, 16000));
          continue;
        }
      }

      if (res.status === 401 || res.status === 403) {
        console.warn(`    ❌ Chave ${currentKeyObj.name} desativada ou com acesso revogado (${res.status}).`);
        modelExhausted = true;
        break;
      }

      if (!res.ok) {
        console.warn(`    ⚠️  HTTP ${res.status}. Pulando lote com segurança.`);
        batchIndex++;
        continue;
      }

      // Sucesso na resposta do modelo
      let jsonRes;
      try {
        jsonRes = await res.json();
      } catch {
        batchIndex++;
        continue;
      }

      const rawText = jsonRes?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        batchIndex++;
        continue;
      }

      let parsedArray;
      try {
        parsedArray = JSON.parse(rawText.replace(/```json\s*|\s*```/g, '').trim());
        if (!Array.isArray(parsedArray)) parsedArray = [parsedArray];
      } catch {
        batchIndex++;
        continue;
      }

      // Validação e Gravação das Decisões
      let batchSuccessCount = 0;
      for (const dec of parsedArray) {
        const matchingItem = batch.items.find(it => String(it.id).trim() === String(dec.id).trim());
        if (!matchingItem || !dec.subfoco_escolhido) continue;

        let chosenSubfoco = String(dec.subfoco_escolhido).trim();
        if (chosenSubfoco.includes(': Diagnóstico e Conduta')) {
          chosenSubfoco = chosenSubfoco.replace(': Diagnóstico e Conduta', '').trim();
        }

        const matched = batch.canonicalEntry.subfocosList.find(s => s === chosenSubfoco) ||
                        batch.canonicalEntry.subfocosList.find(s => s.toLowerCase().trim() === chosenSubfoco.toLowerCase().trim());

        if (!matched) continue;
        if (matched.toLowerCase().trim() === batch.canonicalEntry.foco.toLowerCase().trim()) continue;

        if (IS_EXECUTE) {
          await applyUpdateToSupabase(matchingItem.id, batch.canonicalEntry.tema, batch.canonicalEntry.foco, matched);

          const logLine = JSON.stringify({
            id: matchingItem.id,
            code: matchingItem.code,
            especialidade: batch.canonicalEntry.especialidade,
            tema: batch.canonicalEntry.tema,
            foco: batch.canonicalEntry.foco,
            subfoco: matched,
            justificativa: dec.justificativa_clinica || '',
            model: currentModel,
            key_name: currentKeyObj.name,
            timestamp: new Date().toISOString()
          });
          fs.appendFileSync(PROGRESS_FILE, logLine + '\n', 'utf8');
        }

        totalResolved++;
        batchSuccessCount++;
      }

      batchIndex++;
      const pct = ((totalResolved / totalQueued) * 100).toFixed(1);
      console.log(`    ⚡ [${currentKeyObj.name} | ${currentModel}] Resolvidas: ${totalResolved.toLocaleString('pt-BR')} / ${totalQueued.toLocaleString('pt-BR')} (${pct}%) | Lote ${batchIndex}/${allBatches.length} (+${batchSuccessCount})`);
    }

    if (batchIndex >= allBatches.length) {
      console.log('\n🎉 Todos os lotes foram processados com sucesso!');
      break;
    }
  }

  if (batchIndex >= allBatches.length) break;

  // Se não for a última chave, aplica a pausa de 1 hora solicitada
  if (keyIdx < VALID_KEYS.length - 1) {
    console.log(`\n\n🛑 Todos os modelos da chave [${currentKeyObj.name}] foram esgotados.`);
    console.log(`⏳ INICIANDO PAUSA PROTOCOLAR DE ${PAUSE_MINUTES} MINUTOS (1 HORA) ANTES DA PRÓXIMA CHAVE...`);
    console.log(`   Horário de Retomada Previsto: ${new Date(Date.now() + PAUSE_MINUTES * 60000).toLocaleTimeString('pt-BR')}`);

    const totalSeconds = PAUSE_MINUTES * 60;
    const intervalCheck = 300; // Log a cada 5 minutos
    let elapsed = 0;

    while (elapsed < totalSeconds) {
      const waitChunk = Math.min(intervalCheck, totalSeconds - elapsed);
      await new Promise(r => setTimeout(r, waitChunk * 1000));
      elapsed += waitChunk;
      const minsRemaining = Math.ceil((totalSeconds - elapsed) / 60);
      if (minsRemaining > 0) {
        console.log(`   ⏳ Pausa em andamento... Faltam ${minsRemaining} minutos para iniciar a próxima chave.`);
      }
    }

    console.log(`\n🔔 Pausa de 1 hora concluída! Despertando e iniciando próxima chave...\n`);
  }
}

const totalTimeSec = ((Date.now() - startTime) / 1000).toFixed(1);

console.log('\n\n========================================================================');
console.log('📊 RELATÓRIO FINAL DA CATEGORIZAÇÃO DE QUARENTENA');
console.log('========================================================================');
console.log(`  • Questões Agendadas:      ${totalQueued.toLocaleString('pt-BR')}`);
console.log(`  • Resolvidas com Sucesso:  ${totalResolved.toLocaleString('pt-BR')} (${((totalResolved / Math.max(1, totalQueued)) * 100).toFixed(1)}%)`);
console.log(`  • Lotes Concluídos:        ${batchIndex} de ${allBatches.length}`);
console.log(`  • Tempo de Execução:       ${totalTimeSec}s`);
console.log(`  • Checkpoint Atualizado:   ${PROGRESS_FILE}`);
console.log('========================================================================\n');
