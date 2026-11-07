import fs from 'fs';

// 1. Carrega credenciais do .env.local
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

const discursivasFile = 'data/discursivas_to_sync_supabase.json';
const brokenMcqFile = 'data/broken_mcq_to_quarantine_supabase.json';

if (!fs.existsSync(discursivasFile) || !fs.existsSync(brokenMcqFile)) {
  console.error('❌ Arquivos de discursivas/MCQ quebradas não encontrados!');
  process.exit(1);
}

const discursivas = JSON.parse(fs.readFileSync(discursivasFile, 'utf8'));
const brokenMcqs = JSON.parse(fs.readFileSync(brokenMcqFile, 'utf8'));

console.log('='.repeat(80));
console.log('⚡ FASE 3: SINCRONIZAÇÃO E NORMALIZAÇÃO DE DISCURSIVAS NO SUPABASE');
console.log(`• Total de Discursivas Legítimas a Atualizar: ${discursivas.length.toLocaleString('pt-BR')}`);
console.log(`• Total de MCQs com Opções Perdidas         : ${brokenMcqs.length.toLocaleString('pt-BR')}`);
console.log('='.repeat(80));

const CONCURRENCY = 16;
let currentIndex = 0;
let successCount = 0;
let errorCount = 0;
const errors = [];
const t0 = Date.now();

// 1. Processa Discursivas: type = 'Discursiva', is_anulada = false, correct_answer = null, options = []
async function runDiscursivasWorker() {
  while (currentIndex < discursivas.length) {
    const idx = currentIndex++;
    const item = discursivas[idx];
    const { id } = item;

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
            type: 'Discursiva',
            is_anulada: false,
            correct_answer: null,
            options: []
          })
        });

        if (res.ok) {
          successCount++;
          break;
        } else {
          if (attempt === 3) {
            errorCount++;
            errors.push({ id, status: res.status });
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
    if (processed % 250 === 0 || processed === discursivas.length) {
      const elapsedSec = ((Date.now() - t0) / 1000).toFixed(1);
      const rate = (processed / (elapsedSec || 1)).toFixed(1);
      const pct = ((processed / discursivas.length) * 100).toFixed(1);
      console.log(`  [Discursivas] [${elapsedSec}s] ${processed}/${discursivas.length} (${pct}%) — OK: ${successCount} | Erros: ${errorCount} | Taxa: ${rate} req/s`);
    }
  }
}

// 2. Processa MCQs quebradas: type = 'Múltipla escolha', is_anulada = false
async function runBrokenMcqWorker() {
  while (currentIndex < brokenMcqs.length) {
    const idx = currentIndex++;
    const item = brokenMcqs[idx];
    const { id, correct_answer } = item;

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
            type: 'Múltipla escolha',
            is_anulada: false,
            correct_answer: correct_answer
          })
        });

        if (res.ok) {
          successCount++;
          break;
        } else {
          if (attempt === 3) {
            errorCount++;
            errors.push({ id, status: res.status });
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
  }
}

async function main() {
  console.log('\n--- 1/2: Atualizando Discursivas Legítimas no Supabase ---');
  const workers = Array.from({ length: CONCURRENCY }, () => runDiscursivasWorker());
  await Promise.all(workers);

  console.log(`\n✅ Discursivas concluídas: ${successCount} atualizadas com sucesso! Erros: ${errorCount}`);

  currentIndex = 0;
  const mcqSuccessStart = successCount;
  const workers2 = Array.from({ length: CONCURRENCY }, () => runBrokenMcqWorker());
  await Promise.all(workers2);

  const mcqUpdated = successCount - mcqSuccessStart;
  console.log(`✅ MCQs quebradas atualizadas: ${mcqUpdated} itens!`);
  console.log('='.repeat(80));
  console.log('🚀 FASE 3 CONCLUÍDA COM SUCESSO!');
  console.log('='.repeat(80));
}

main().catch(console.error);

