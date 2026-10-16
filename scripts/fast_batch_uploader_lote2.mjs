import fs from 'fs';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

// Blindagem Lote 1
const LOTE1_BLINDADAS = [
  'ENARE', 'SUS-SP', 'USP', 'FUVEST', 'IAMSPE', 'UNESP', 'FMABC', 'UNIFESP',
  'Santa Casa SP', 'Santa Casa de São Paulo', 'INEP', 'Revalida'
];

async function runUploader() {
  console.log('🚀 Iniciando Upload em Lote Ultrarrápido no Supabase...');

  if (!fs.existsSync('data/lote2_ultra_strict_matches.json')) {
    console.log('❌ data/lote2_ultra_strict_matches.json não encontrado.');
    return;
  }

  const matches = JSON.parse(fs.readFileSync('data/lote2_ultra_strict_matches.json', 'utf8'));
  console.log(`📦 Total de questões ultra-estritas (Score >= 0.70) para upload: ${matches.length}`);

  const headers = {
    'apikey': SERVICE_KEY,
    'Authorization': 'Bearer ' + SERVICE_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  };

  let successCount = 0;
  let errorCount = 0;
  const startTime = Date.now();

  // Executa em pequenos lotes concorrentes para velocidade máxima
  const CONCURRENCY = 10;
  for (let i = 0; i < matches.length; i += CONCURRENCY) {
    const batch = matches.slice(i, i + CONCURRENCY);
    const promises = batch.map(async (item) => {
      // Dupla checagem de blindagem do Lote 1
      const isLote1 = LOTE1_BLINDADAS.some(b => 
        (item.banca || '').toLowerCase().includes(b.toLowerCase()) || 
        (item.institution || '').toLowerCase().includes(b.toLowerCase())
      );
      if (isLote1) {
        console.log(`🛡️ Bloqueado por blindagem do Lote 1: ${item.code}`);
        return;
      }

      const body = {
        correct_answer: item.correct_answer,
        commentary: item.commentary,
        is_anulada: item.correct_answer === 'ANULADA'
      };

      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?id=eq.${item.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(body)
        });
        if (res.ok) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (e) {
        errorCount++;
      }
    });

    await Promise.all(promises);

    if ((i + CONCURRENCY) % 200 === 0 || i + CONCURRENCY >= matches.length) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const pct = (((i + batch.length) / matches.length) * 100).toFixed(1);
      console.log(`  ⚡ Progresso: ${i + batch.length}/${matches.length} (${pct}%) | Gravadas: ${successCount} | Erros: ${errorCount} | Tempo: ${elapsed}s`);
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n🎉 UPLOAD EM LOTE CONCLUÍDO!`);
  console.log(`  • Questões atualizadas com sucesso: ${successCount}`);
  console.log(`  • Erros: ${errorCount}`);
  console.log(`  • Tempo total: ${totalTime}s`);

  const summary = {
    timestamp: new Date().toISOString(),
    total_resolvidas: matches.length,
    sucesso: successCount,
    erros: errorCount,
    tempo_segundos: totalTime
  };
  fs.writeFileSync('data/lote2_upload_summary.json', JSON.stringify(summary, null, 2), 'utf8');
}

runUploader();
