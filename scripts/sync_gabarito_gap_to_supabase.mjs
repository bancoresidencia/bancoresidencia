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

const syncFile = 'data/pending_supabase_gabarito_sync.json';
if (!fs.existsSync(syncFile)) {
  console.error(`❌ Arquivo de pendências não encontrado: ${syncFile}`);
  process.exit(1);
}

const items = JSON.parse(fs.readFileSync(syncFile, 'utf8'));

console.log('='.repeat(80));
console.log(`🚀 SINCRONIZADOR DE GABARITOS SUPABASE — REST API PATCH CONCORRENTE`);
console.log(`• Total de itens para sincronização: ${items.length.toLocaleString('pt-BR')}`);
console.log(`• Destino: ${SUPABASE_URL}`);
console.log('='.repeat(80));

const CONCURRENCY = 16;
let currentIndex = 0;
let successCount = 0;
let errorCount = 0;
const errors = [];
const t0 = Date.now();

async function runWorker(workerId) {
  while (currentIndex < items.length) {
    const idx = currentIndex++;
    const item = items[idx];
    const { id, correct_answer, is_anulada } = item;

    let ok = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?id=eq.${id}`, {
          method: 'PATCH',
          headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            correct_answer: correct_answer,
            is_anulada: is_anulada
          })
        });

        if (res.ok) {
          ok = true;
          successCount++;
          break;
        } else {
          const errText = await res.text();
          if (attempt === 3) {
            errorCount++;
            errors.push({ id, status: res.status, error: errText.slice(0, 100) });
          }
          await new Promise(r => setTimeout(r, 200 * attempt));
        }
      } catch (err) {
        if (attempt === 3) {
          errorCount++;
          errors.push({ id, status: 'NETWORK_ERR', error: err.message });
        }
        await new Promise(r => setTimeout(r, 300 * attempt));
      }
    }

    const processed = successCount + errorCount;
    if (processed % 500 === 0 || processed === items.length) {
      const elapsedSec = ((Date.now() - t0) / 1000).toFixed(1);
      const rate = (processed / (elapsedSec || 1)).toFixed(1);
      const pct = ((processed / items.length) * 100).toFixed(1);
      console.log(`  [${elapsedSec}s] Progresso: ${processed.toLocaleString('pt-BR')}/${items.length.toLocaleString('pt-BR')} (${pct}%) — Sucessos: ${successCount} | Erros: ${errorCount} | Taxa: ${rate} req/s`);
    }
  }
}

async function main() {
  const workers = Array.from({ length: CONCURRENCY }, (_, i) => runWorker(i));
  await Promise.all(workers);

  const totalTime = ((Date.now() - t0) / 1000).toFixed(1);
  console.log('\n' + '='.repeat(80));
  console.log(`🎉 SINCRONIZAÇÃO CONCLUÍDA EM ${totalTime}s`);
  console.log(`• Sucessos: ${successCount.toLocaleString('pt-BR')}`);
  console.log(`• Erros:    ${errorCount.toLocaleString('pt-BR')}`);
  console.log('='.repeat(80));

  if (errors.length > 0) {
    fs.writeFileSync('scratch/sync_errors.json', JSON.stringify(errors, null, 2));
    console.log(`⚠️  ${errors.length} erros salvos em scratch/sync_errors.json`);
  }
}

main().catch(console.error);
