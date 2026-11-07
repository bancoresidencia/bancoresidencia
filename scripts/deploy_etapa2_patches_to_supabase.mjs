import fs from 'fs';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Credenciais do Supabase não encontradas no .env.local');
  process.exit(1);
}

const patchFiles = [
  'data/staging/patches_etapa2/patches_fase_2_1_preventiva.json',
  'data/staging/patches_etapa2/patches_fase_2_2_pediatria.json',
  'data/staging/patches_etapa2/patches_fase_2_3_go.json',
  'data/staging/patches_etapa2/patches_fase_2_4_cirurgia.json',
  'data/staging/patches_etapa2/patches_fase_2_5_clinica.json'
];

console.log('='.repeat(70));
console.log('⚡ FASE 2.6: DEPLOY DOS PATCHES TAXONÔMICOS OURO NO SUPABASE');
console.log(`• Destino: ${SUPABASE_URL}`);
console.log('='.repeat(70));

let allPatches = [];
for (const pf of patchFiles) {
  if (fs.existsSync(pf)) {
    const data = JSON.parse(fs.readFileSync(pf, 'utf8'));
    console.log(`Carregando ${pf}: ${data.length.toLocaleString('pt-BR')} patches`);
    allPatches = allPatches.concat(data);
  } else {
    console.warn(`Arquivo não encontrado ainda: ${pf}`);
  }
}

console.log(`\nTotal consolidado de patches a aplicar: ${allPatches.length.toLocaleString('pt-BR')}`);

const BATCH_SIZE = 250;
const CONCURRENCY = 12;

const batches = [];
for (let i = 0; i < allPatches.length; i += BATCH_SIZE) {
  batches.push(allPatches.slice(i, i + BATCH_SIZE));
}

console.log(`Total de batches: ${batches.length} (lotes de ${BATCH_SIZE}) com ${CONCURRENCY} workers concorrentes.`);

let batchPointer = 0;
let successCount = 0;
let errorCount = 0;
const t0 = Date.now();

async function runWorker(workerId) {
  while (batchPointer < batches.length) {
    const bIdx = batchPointer++;
    const batch = batches[bIdx];

    // Payload de UPSERT por ID contendo apenas os 5 campos taxonômicos
    const payload = batch.map(p => ({
      id: p.id,
      modalidade: p.modalidade,
      especialidade: p.especialidade,
      tema: p.tema,
      foco: p.foco,
      subfoco: p.subfoco
    }));

    let ok = false;
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/questions`, {
          method: 'POST',
          headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates,return=minimal'
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          ok = true;
          successCount += batch.length;
          break;
        } else {
          const errText = await res.text();
          if (attempt === 4) {
            errorCount += batch.length;
            console.error(`❌ [Worker ${workerId}] Falha no batch ${bIdx}: ${res.status} ${errText.slice(0, 100)}`);
          }
          await new Promise(r => setTimeout(r, 400 * attempt));
        }
      } catch (err) {
        if (attempt === 4) {
          errorCount += batch.length;
          console.error(`❌ [Worker ${workerId}] Erro de rede batch ${bIdx}: ${err.message}`);
        }
        await new Promise(r => setTimeout(r, 500 * attempt));
      }
    }

    if (bIdx % 20 === 0 || bIdx === batches.length - 1) {
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      const rate = (successCount / Math.max(1, elapsed)).toFixed(0);
      console.log(`⚡ Progresso Taxonomia: ${successCount.toLocaleString('pt-BR')} patches aplicados (${rate} q/s) | Batch ${bIdx + 1}/${batches.length}`);
    }
  }
}

const workers = [];
for (let i = 0; i < CONCURRENCY; i++) {
  workers.push(runWorker(i + 1));
}

await Promise.all(workers);

console.log('='.repeat(70));
console.log('🏁 DEPLOY TAXONÔMICO NO SUPABASE CONCLUÍDO!');
console.log(`• Total Patches Aplicados: ${successCount.toLocaleString('pt-BR')}`);
console.log(`• Total Erros            : ${errorCount}`);
console.log(`• Tempo Total            : ${((Date.now() - t0) / 1000).toFixed(1)}s`);
console.log('='.repeat(70));

