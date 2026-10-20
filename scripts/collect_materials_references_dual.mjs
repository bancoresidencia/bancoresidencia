import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Arquivos de persistência e status
const CONFIG_PATH = path.join(process.cwd(), 'scripts', 'medevo_config.json');
const SESSION_PATH = path.join(process.cwd(), 'scripts', 'medevo_session.json');
const PROGRESS_PATH = path.join(process.cwd(), 'data', 'medevo_materials_extraction_progress.json');
const OUTPUT_PATH = path.join(process.cwd(), 'data', 'medevo_materials_references_gold.json');
const STATUS_PATH = path.join(process.cwd(), 'data', 'medevo_extraction_live_status.json');

const APIKEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZWRwZG1ndmdhdGpkZnhneGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNzk3MTgsImV4cCI6MjA0Nzg1NTcxOH0.cjoaggOXt1kY9WmVNbAipCOQ2dP4PWLP43KMf8cO8Wo';
const BASE_URL = 'https://data.medevo.com.br/rest/v1';

const sleep = ms => new Promise(r => setTimeout(r, ms));

function getAccounts() {
  const accounts = [];

  // Conta 1 (Carlos Nathan)
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      if (cfg.MEDEVO_USER_TOKEN) {
        accounts.push({
          id: 1,
          name: 'Conta 1 (Carlos)',
          email: cfg.USER_EMAIL || 'cnath02839739@gmail.com',
          token: cfg.MEDEVO_USER_TOKEN
        });
      }
    } catch (e) {
      console.warn('⚠️ Falha ao ler medevo_config.json:', e.message);
    }
  }

  // Conta 2 (Joao Feijao)
  if (fs.existsSync(SESSION_PATH)) {
    try {
      const sess = JSON.parse(fs.readFileSync(SESSION_PATH, 'utf8'));
      const auth = JSON.parse(sess.value);
      if (auth.access_token) {
        accounts.push({
          id: 2,
          name: 'Conta 2 (Joao)',
          email: auth.user?.email || 'joaofeijaoante@gmail.com',
          token: auth.access_token
        });
      }
    } catch (e) {
      console.warn('⚠️ Falha ao ler medevo_session.json:', e.message);
    }
  }

  if (accounts.length === 0) {
    throw new Error('Nenhuma conta com token válido encontrada!');
  }

  return accounts;
}

// Regex e extratores de referências bibliográficas e diretrizes clínicas
function extractReferences(text, title) {
  const references = [];
  const seenKeys = new Set();

  const addRef = (ref) => {
    const key = (ref.url || ref.texto_referencia || '').toLowerCase().trim();
    if (key && key.length > 8 && !seenKeys.has(key)) {
      seenKeys.add(key);
      references.push(ref);
    }
  };

  // 1. Extração da seção formal ## Referências / ## Referências Bibliográficas (padrão oficial MedEvo)
  const normTitle = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[*_`~]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const headingMatches = Array.from(text.matchAll(/^(#{2,6})[ \t]+(.+?)\s*$/gm)).map(e => ({
    index: e.index ?? 0,
    end: (e.index ?? 0) + e[0].length,
    title: normTitle(e[2])
  }));

  const refHeading = headingMatches.filter(e => e.title === "referencias" || e.title === "referencias bibliograficas").at(-1);
  if (refHeading) {
    const nextHeading = headingMatches.find(e => e.index > refHeading.index);
    const refBlock = nextHeading ? text.slice(refHeading.end, nextHeading.index) : text.slice(refHeading.end);
    const lines = refBlock.split(/\r?\n/);
    for (const l of lines) {
      const cleanLine = l.trim().replace(/^[\*\-\d\.\)\s]+/, '').trim();
      if (cleanLine.length > 15 && !cleanLine.startsWith('#') && !cleanLine.startsWith('![')) {
        addRef({
          tipo: 'referencia_bibliografica_formal',
          texto_referencia: cleanLine,
          origem_material: title
        });
      }
    }
  }

  // 2. URLs diretas e links de diretrizes
  const urlMatches = text.match(/https?:\/\/[^\s\)\"\'<>\`]+/g) || [];
  for (const rawUrl of urlMatches) {
    const cleanUrl = rawUrl.replace(/[,\.\;]$/, '');
    if (!cleanUrl.includes('wikimedia.org') && !cleanUrl.includes('medevo.com') && !cleanUrl.includes('posthog')) {
      let tipo = 'documento_online';
      if (cleanUrl.toLowerCase().includes('.pdf')) tipo = 'diretriz_pdf';
      else if (cleanUrl.includes('ncbi') || cleanUrl.includes('pubmed')) tipo = 'artigo_indexado';
      else if (cleanUrl.includes('gov.br') || cleanUrl.includes('saude.gov')) tipo = 'documento_governamental';
      else if (cleanUrl.includes('febrasgo') || cleanUrl.includes('uroweb') || cleanUrl.includes('sbu') || cleanUrl.includes('sbc')) tipo = 'diretriz_sociedade';

      addRef({
        tipo,
        url: cleanUrl,
        dominio: new URL(cleanUrl).hostname,
        origem_material: title
      });
    }
  }

  // 3. Extração de citações textuais de diretrizes e consensos
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 25 && trimmed.length < 350) {
      const lower = trimmed.toLowerCase();
      if (
        lower.includes('diretriz') ||
        lower.includes('consenso') ||
        lower.includes('protocolo') ||
        lower.includes('febrasgo') ||
        lower.includes('eau') ||
        lower.includes('ministério da saúde') ||
        lower.includes('ms/sus') ||
        lower.includes('inca') ||
        lower.includes('acog') ||
        lower.includes('statpearls') ||
        lower.includes('cdc') ||
        lower.includes('uptodate')
      ) {
        if (!trimmed.startsWith('#') && !trimmed.startsWith('![')) {
          addRef({
            tipo: 'citacao_diretriz_clinica',
            texto_referencia: trimmed.replace(/^[\*\-\d\.\s]+/, ''),
            origem_material: title
          });
        }
      }
    }
  }

  return references;
}

async function main() {
  console.log('===============================================================');
  console.log('🚀 INICIANDO EXTRAÇÃO DUAL PARALELA DE REFERÊNCIAS MEDEVO');
  console.log('👥 MODO 2 CONTAS: WORKER POOL CONCORRENTE INDEPENDENTE');
  console.log('🛡️ PROTEÇÃO ANTI-429: INTERVALOS COM JITTER ADAPTATIVO POR WORKER');
  console.log('===============================================================\n');

  const accounts = getAccounts();
  console.log(`🔑 Contas carregadas (${accounts.length}):`);
  accounts.forEach(acc => console.log(`   - [ID ${acc.id}] ${acc.name} (${acc.email})`));

  // 1. Busca lista completa de materiais
  console.log('\n📥 1. Carregando catálogo completo de materiais do backend...');
  const matRes = await fetch(`${BASE_URL}/study_materials?select=id,title,summary,metadata,specialty:study_categoriesv2!specialty_v2_id(name),theme:study_categoriesv2!theme_v2_id(name)&order=created_at.asc`, {
    headers: {
      'apikey': APIKEY,
      'Authorization': `Bearer ${accounts[0].token}`
    }
  });

  if (!matRes.ok) {
    throw new Error(`Falha ao obter lista de materiais: HTTP ${matRes.status}`);
  }

  const allMaterials = await matRes.json();
  console.log(`✅ Total de materiais no catálogo: ${allMaterials.length}`);

  // 2. Carrega progresso anterior (checkpoint)
  let progress = { completedIds: [], materialsProcessed: 0, referencesExtracted: 0 };
  if (fs.existsSync(PROGRESS_PATH)) {
    try {
      progress = JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf8'));
      console.log(`🔄 Checkpoint recuperado: ${progress.completedIds.length} materiais já extraídos anteriormente.`);
    } catch {}
  }

  const completedSet = new Set(progress.completedIds);
  const remaining = allMaterials.filter(m => !completedSet.has(m.id));
  console.log(`📊 Restantes para coletar: ${remaining.length} materiais.\n`);

  if (remaining.length === 0) {
    console.log('🎉 Todos os materiais já foram extraídos!');
    return;
  }

  // Carrega catálogo consolidado
  let catalog = [];
  if (fs.existsSync(OUTPUT_PATH)) {
    try {
      catalog = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));
    } catch {}
  }

  const startTime = Date.now();
  const queue = [...remaining];
  let processedSinceSave = 0;
  let activeWorkers = accounts.length;
  const workerStatus = {};
  accounts.forEach(acc => workerStatus[acc.id] = { name: acc.name, active: true, processed: 0, errors: 0 });

  function flushProgress(force = false) {
    if (processedSinceSave >= 10 || force) {
      fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2), 'utf8');
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(catalog, null, 2), 'utf8');
      processedSinceSave = 0;
    }

    const percent = ((progress.materialsProcessed / allMaterials.length) * 100).toFixed(1);
    const elapsedSec = Math.round((Date.now() - startTime) / 1000);
    const liveStatus = {
      modo: 'DUAL_ACCOUNT_PARALLEL',
      total_materiais: allMaterials.length,
      processados: progress.materialsProcessed,
      restantes: allMaterials.length - progress.materialsProcessed,
      progresso_pct: `${percent}%`,
      referencias_coletadas_total: progress.referencesExtracted,
      workers: workerStatus,
      tempo_decorrido_seg: elapsedSec,
      atualizado_em: new Date().toISOString()
    };
    fs.writeFileSync(STATUS_PATH, JSON.stringify(liveStatus, null, 2), 'utf8');
  }

  // Tratamento de encerramento gracioso (Ctrl+C / Kill)
  process.on('SIGINT', () => {
    console.log('\n🛑 Interrupção detectada! Salvando progresso com segurança...');
    flushProgress(true);
    process.exit(0);
  });

  // Função do Worker para cada conta
  async function runWorker(acc) {
    console.log(`🟢 Worker [${acc.name}] iniciado.`);
    let consecutiveErrors = 0;

    while (queue.length > 0) {
      const mat = queue.shift();
      if (!mat) break;

      // Se já foi processado pelo outro worker
      if (completedSet.has(mat.id)) continue;

      const specialtyName = mat.specialty?.name || 'Geral';
      const themeName = mat.theme?.name || 'Geral';

      try {
        const rpcRes = await fetch(`${BASE_URL}/rpc/get_study_material_content_secure`, {
          method: 'POST',
          headers: {
            'apikey': APIKEY,
            'Authorization': `Bearer ${acc.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ p_material_id: mat.id })
        });

        // Verificação de Rate Limit (429)
        if (rpcRes.status === 429) {
          consecutiveErrors++;
          const errText = await rpcRes.text();
          console.warn(`⚠️ [${acc.name}] HTTP 429 detectado: ${errText.slice(0, 100)}`);

          if (consecutiveErrors >= 2) {
            console.warn(`🛑 [${acc.name}] Limite diário atingido nesta conta! Pausando worker.`);
            workerStatus[acc.id].active = false;
            activeWorkers--;
            // Devolve o material para a fila para ser pego pelo outro worker se ainda ativo
            queue.unshift(mat);
            break;
          }

          // Pausa de 15s antes de retentar
          queue.unshift(mat);
          await sleep(15000);
          continue;
        }

        if (rpcRes.status === 401 || rpcRes.status === 403) {
          console.warn(`🔑 [${acc.name}] Token não autorizado (HTTP ${rpcRes.status}). Encerrando worker.`);
          workerStatus[acc.id].active = false;
          activeWorkers--;
          queue.unshift(mat);
          break;
        }

        if (!rpcRes.ok) {
          console.warn(`⚠️ [${acc.name}] Erro no material ${mat.title.slice(0, 30)}: HTTP ${rpcRes.status}`);
          consecutiveErrors++;
          workerStatus[acc.id].errors++;
        } else {
          consecutiveErrors = 0;
          const textContent = await rpcRes.json();
          let refs = [];
          if (typeof textContent === 'string' && textContent.length > 50) {
            refs = extractReferences(textContent, mat.title);

            catalog.push({
              material_id: mat.id,
              titulo: mat.title,
              especialidade: specialtyName,
              tema: themeName,
              palavras: textContent.split(/\s+/).length,
              total_referencias: refs.length,
              referencias: refs,
              resumo: mat.summary
            });

            progress.referencesExtracted = (progress.referencesExtracted || 0) + refs.length;
          }

          completedSet.add(mat.id);
          progress.completedIds.push(mat.id);
          progress.materialsProcessed = progress.completedIds.length;
          workerStatus[acc.id].processed++;
          processedSinceSave++;

          const pct = ((progress.materialsProcessed / allMaterials.length) * 100).toFixed(1);
          console.log(`✨ [${acc.name}] [${pct}%] (${progress.materialsProcessed}/${allMaterials.length}) ${mat.title.slice(0, 35)} | Refs: +${refs?.length || 0} (Total: ${progress.referencesExtracted})`);

          flushProgress(false);

          // Sincronização periódica no Supabase a cada 100 materiais
          if (progress.materialsProcessed % 100 === 0) {
            console.log(`\n☁️ Sincronizando lote no Supabase (${progress.materialsProcessed} materiais)...`);
            try {
              execSync('node scripts/ingest_all_references_to_supabase.mjs', { stdio: 'inherit' });
            } catch (e) {
              console.warn('⚠️ Aviso na sincronização intermediária:', e.message);
            }
          }
        }

        // Intervalo adaptativo seguro com jitter entre 1.8s e 2.5s
        const jitter = Math.floor(1800 + Math.random() * 700);
        await sleep(jitter);

      } catch (err) {
        console.error(`❌ [${acc.name}] Exceção no material ${mat.title}:`, err.message);
        workerStatus[acc.id].errors++;
        await sleep(3000);
      }
    }

    console.log(`🏁 Worker [${acc.name}] finalizou sua execução.`);
  }

  // Executa os 2 workers em paralelo
  console.log(`⚡ Disparando ${accounts.length} workers concorrentes...\n`);
  await Promise.all(accounts.map(acc => runWorker(acc)));

  // Conclusão final
  flushProgress(true);

  console.log('\n===============================================================');
  console.log('🎉 PROCESSO DUAL DE EXTRAÇÃO CONCLUÍDO / CHECKPOINT SALVO');
  console.log(`Materiais Processados: ${progress.materialsProcessed} de ${allMaterials.length}`);
  console.log(`Total de Referências Catalogadas: ${progress.referencesExtracted}`);
  console.log(`Arquivo salvo em: ${OUTPUT_PATH}`);
  console.log('===============================================================\n');

  console.log('☁️ Realizando sincronização final no Supabase...');
  try {
    execSync('node scripts/ingest_all_references_to_supabase.mjs', { stdio: 'inherit' });
  } catch (e) {
    console.error('❌ Erro na ingestão final:', e.message);
  }
}

main().catch(err => {
  console.error('❌ Falha crítica no executor dual:', err);
  process.exit(1);
});
