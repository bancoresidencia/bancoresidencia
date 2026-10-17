import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configurações e credenciais
const SESSION_PATH = path.join(process.cwd(), 'scripts', 'medevo_session.json');
const PROGRESS_PATH = path.join(process.cwd(), 'data', 'medevo_materials_extraction_progress.json');
const OUTPUT_PATH = path.join(process.cwd(), 'data', 'medevo_materials_references_gold.json');
const STATUS_PATH = path.join(process.cwd(), 'data', 'medevo_extraction_live_status.json');

const APIKEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZWRwZG1ndmdhdGpkZnhneGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNzk3MTgsImV4cCI6MjA0Nzg1NTcxOH0.cjoaggOXt1kY9WmVNbAipCOQ2dP4PWLP43KMf8cO8Wo';
const BASE_URL = 'https://data.medevo.com.br/rest/v1';

const sleep = ms => new Promise(r => setTimeout(r, ms));

function getAuthToken() {
  if (!fs.existsSync(SESSION_PATH)) {
    throw new Error('scripts/medevo_session.json não encontrado');
  }
  const session = JSON.parse(fs.readFileSync(SESSION_PATH, 'utf8'));
  const auth = JSON.parse(session.value);
  return auth.access_token;
}

// Regex e extratores de referências bibliográficas e diretrizes
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
  console.log('🚀 INICIANDO EXTRAÇÃO DE REFERÊNCIAS DO BACKEND MEDEVO');
  console.log('🛡️ CONTROLE DE FLUXO: ADAPTATIVO (1.8s - 2.5s) ANTI-RATE LIMIT (429)');
  console.log('📚 MATERIAIS DE APOIO: TOTALMENTE ACESSÍVEIS EM CONTAS FREE');
  console.log('===============================================================\n');

  let token = getAuthToken();

  // 1. Busca a lista completa de materiais disponíveis no backend
  console.log('📥 1. Carregando catálogo completo de materiais de apoio...');
  const matRes = await fetch(`${BASE_URL}/study_materials?select=id,title,summary,metadata,specialty:study_categoriesv2!specialty_v2_id(name),theme:study_categoriesv2!theme_v2_id(name)&order=created_at.asc`, {
    headers: {
      'apikey': APIKEY,
      'Authorization': `Bearer ${token}`
    }
  });

  if (!matRes.ok) {
    throw new Error(`Falha ao obter lista de materiais: HTTP ${matRes.status}`);
  }

  const allMaterials = await matRes.json();
  console.log(`✅ Total de materiais encontrados no banco: ${allMaterials.length}`);

  // 2. Carrega checkpoint anterior se existir
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

  // Carrega repositório consolidado
  let catalog = [];
  if (fs.existsSync(OUTPUT_PATH)) {
    try {
      catalog = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));
    } catch {}
  }

  const startTime = Date.now();
  let consecutiveErrors = 0;

  for (let i = 0; i < remaining.length; i++) {
    const mat = remaining[i];
    const itemNum = progress.completedIds.length + 1;
    const specialtyName = mat.specialty?.name || 'Geral';
    const themeName = mat.theme?.name || 'Geral';

    try {
      // Chama a RPC com token ativo
      const rpcRes = await fetch(`${BASE_URL}/rpc/get_study_material_content_secure`, {
        method: 'POST',
        headers: {
          'apikey': APIKEY,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ p_material_id: mat.id })
      });

      if (rpcRes.status === 429) {
        console.warn(`⚠️ Rate limit (429/PT429) detectado. Pausando 60s para resetar janela de taxa do servidor...`);
        await sleep(60000);
        i--; // repete o item
        continue;
      }

      if (rpcRes.status === 401 || rpcRes.status === 403) {
        console.warn(`🔑 Token expirado ou rejeitado. Tentando recarregar sessão...`);
        token = getAuthToken();
        await sleep(3000);
        i--;
        continue;
      }

      if (!rpcRes.ok) {
        console.warn(`⚠️ Aviso no material [${itemNum}/${allMaterials.length}] ${mat.title.slice(0, 30)}: HTTP ${rpcRes.status}`);
        consecutiveErrors++;
        if (consecutiveErrors > 5) {
          console.warn(`⚠️ Muitos erros consecutivos. Pausando 15s...`);
          await sleep(15000);
          consecutiveErrors = 0;
        }
      } else {
        consecutiveErrors = 0;
        const textContent = await rpcRes.json();
        if (typeof textContent === 'string' && textContent.length > 50) {
          const refs = extractReferences(textContent, mat.title);

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
      }

      progress.completedIds.push(mat.id);
      progress.materialsProcessed = progress.completedIds.length;
      completedSet.add(mat.id);

      // Atualiza arquivo de status ao vivo
      const percent = ((progress.materialsProcessed / allMaterials.length) * 100).toFixed(1);
      const elapsedSec = Math.round((Date.now() - startTime) / 1000);
      const liveStatus = {
        total_materiais: allMaterials.length,
        processados: progress.materialsProcessed,
        restantes: allMaterials.length - progress.materialsProcessed,
        progresso_pct: `${percent}%`,
        referencias_coletadas_total: progress.referencesExtracted,
        ultimo_material: mat.title,
        especialidade_atual: specialtyName,
        tempo_decorrido_seg: elapsedSec,
        atualizado_em: new Date().toISOString()
      };

      fs.writeFileSync(STATUS_PATH, JSON.stringify(liveStatus, null, 2), 'utf8');

      // Salva progresso incremental no disco a cada 10 materiais
      if (progress.materialsProcessed % 10 === 0 || i === remaining.length - 1) {
        fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2), 'utf8');
        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(catalog, null, 2), 'utf8');
        console.log(`💾 [${percent}%] (${progress.materialsProcessed}/${allMaterials.length}) ${mat.title.slice(0, 35)} | Total Refs: ${progress.referencesExtracted}`);
      }

      // Sincronização periódica no Supabase a cada 100 materiais
      if (progress.materialsProcessed % 100 === 0) {
        console.log(`\n☁️ Sincronizando lote no Supabase (${progress.materialsProcessed} materiais)...`);
        try {
          execSync('node scripts/ingest_all_references_to_supabase.mjs', { stdio: 'inherit' });
        } catch (e) {
          console.warn('⚠️ Falha temporária na sincronização periódica:', e.message);
        }
      }

      // Micro-pausa periódica a cada 25 materiais
      if (progress.materialsProcessed % 25 === 0) {
        console.log(`☕ Pausa preventiva de segurança (4s)...`);
        await sleep(4000);
      } else {
        // Intervalo adaptativo seguro: 1.8s a 2.5s
        const jitter = Math.floor(1800 + Math.random() * 700);
        await sleep(jitter);
      }

    } catch (err) {
      console.error(`❌ Erro no material ${mat.id} (${mat.title}):`, err.message);
      await sleep(3000);
    }
  }

  // Conclusão final
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2), 'utf8');
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(catalog, null, 2), 'utf8');

  console.log('\n===============================================================');
  console.log('🎉 TODAS AS REFERÊNCIAS DE MATERIAIS FORAM EXTRAÍDAS COM SUCESSO!');
  console.log(`Total de Materiais: ${progress.materialsProcessed}`);
  console.log(`Total de Referências Catalogadas: ${progress.referencesExtracted}`);
  console.log(`Arquivo salvo em: ${OUTPUT_PATH}`);
  console.log('===============================================================\n');

  console.log('☁️ Realizando ingestão final consolidada no Supabase...');
  try {
    execSync('node scripts/ingest_all_references_to_supabase.mjs', { stdio: 'inherit' });
  } catch (e) {
    console.error('❌ Erro na ingestão final:', e.message);
  }
}

main().catch(err => {
  console.error('❌ Falha crítica:', err);
  process.exit(1);
});
