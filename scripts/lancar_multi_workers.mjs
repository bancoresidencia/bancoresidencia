import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const args = process.argv.slice(2);
const getArg = (flag, def = null) => {
  const f = args.find(a => a.startsWith(`${flag}=`));
  return f ? f.split('=')[1].trim() : def;
};

const LOTES_ARG = getArg('--lotes', '1,2,3,4,5,6,7,8,9,10');
const LIMIT_PER_LOTE = parseInt(getArg('--limit', '250'), 10);
const AUTO_APPLY = args.includes('--apply');

const lotesToRun = LOTES_ARG.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));

fs.mkdirSync('data/logs', { recursive: true });

console.log('========================================================================');
console.log('🚀 ORQUESTRADOR MULTI-WORKER DE GABARITOS OFICIAIS');
console.log(`Lotes selecionados: [${lotesToRun.join(', ')}] (Total: ${lotesToRun.length} workers paralelos)`);
console.log(`Limite por worker: ${LIMIT_PER_LOTE} questões`);
console.log(`Auto-persistência Supabase: ${AUTO_APPLY ? 'SIM (--apply)' : 'NÃO (apenas staging)'}`);
console.log('========================================================================\n');

const workers = {};

for (const lote of lotesToRun) {
  const logFile = path.resolve(`data/logs/worker_lote_${lote}.log`);
  const logStream = fs.createWriteStream(logFile, { flags: 'w' });

  console.log(`[Spawn] Iniciando Worker para Lote ${lote}... (Log: data/logs/worker_lote_${lote}.log)`);

  const cp = spawn('node', [
    'scripts/worker_lote_paralelo.mjs',
    `--lote=${lote}`,
    `--limit=${LIMIT_PER_LOTE}`
  ], {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  cp.stdout.pipe(logStream);
  cp.stderr.pipe(logStream);

  workers[lote] = {
    process: cp,
    lote,
    logFile,
    startTime: Date.now(),
    done: false,
    exitCode: null,
    totalHomologados: 0
  };

  cp.on('exit', (code) => {
    workers[lote].done = true;
    workers[lote].exitCode = code;
    console.log(`🏁 [LOTE ${lote}] Worker finalizou com código ${code} após ${((Date.now() - workers[lote].startTime) / 1000).toFixed(1)}s`);
  });
}

// Monitora progresso a cada 10 segundos
const monitorInterval = setInterval(() => {
  const running = Object.values(workers).filter(w => !w.done);
  console.log(`\n⏱️ [MONITOR] ${running.length}/${lotesToRun.length} workers em execução...`);

  for (const lote of lotesToRun) {
    const stagingPath = path.resolve(`data/staging_lote_${lote}.json`);
    let count = 0;
    let remap = 0;
    if (fs.existsSync(stagingPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(stagingPath, 'utf8'));
        count = data.decisoes?.length || 0;
        remap = data.totalRemapeados || 0;
      } catch (_) {}
    }
    workers[lote].totalHomologados = count;
    const status = workers[lote].done ? `FINALIZADO (código ${workers[lote].exitCode})` : 'RODANDO ⚙️';
    console.log(`   - Lote ${String(lote).padStart(2)}: ${status} | Homologadas: ${count} (Remapeadas: ${remap})`);
  }

  if (running.length === 0) {
    clearInterval(monitorInterval);
    onAllWorkersFinished();
  }
}, 10000);

async function onAllWorkersFinished() {
  console.log('\n========================================================================');
  console.log('🎉 TODOS OS WORKERS PARALELOS CONCLUÍRAM SUA EXECUÇÃO!');
  console.log('========================================================================\n');

  let totalGeral = 0;
  for (const lote of lotesToRun) {
    totalGeral += workers[lote].totalHomologados;
  }
  console.log(`Total acumulado em todos os lotes: ${totalGeral} questões homologadas.`);

  if (AUTO_APPLY) {
    console.log('\n🚀 Executando consolidador e aplicando ao Supabase (--apply)...');
    const { spawnSync } = await import('child_process');
    const res = spawnSync('node', ['scripts/consolidar_e_aplicar_todos_os_lotes.mjs', '--apply'], { stdio: 'inherit' });
    console.log('Consolidação concluída com código:', res.status);
  } else {
    console.log('\n💡 Próximo passo sugerido:');
    console.log('   node scripts/consolidar_e_aplicar_todos_os_lotes.mjs --apply');
  }
  process.exit(0);
}
