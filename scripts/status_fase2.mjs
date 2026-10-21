import fs from 'fs';
import path from 'path';

// Carrega variáveis de ambiente
const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Erro: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos.');
  process.exit(1);
}

const isWatch = process.argv.includes('--watch');

async function fetchJsonFromSupabase(filename) {
  const url = `${SUPABASE_URL}/storage/v1/object/questoes/${filename}?t=${Date.now()}`;
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

function formatElapsed(isoDate) {
  if (!isoDate) return '-';
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s atrás`;
  const diffMin = Math.floor(diffSec / 60);
  return `${diffMin}m atrás`;
}

async function renderDashboard() {
  const queue = await fetchJsonFromSupabase('fase2_motor_queue.json');
  const w1 = await fetchJsonFromSupabase('fase2_worker_DEV_1.json');
  const w2 = await fetchJsonFromSupabase('fase2_worker_DEV_2.json');

  if (!queue || !Array.isArray(queue)) {
    console.log('⚠️ Fila ainda não encontrada ou inicializando no Supabase...');
    return;
  }

  const total = queue.length;
  const concluidas = queue.filter(t => t.status === 'CONCLUIDO');
  const emAndamento = queue.filter(t => t.status === 'EM_ANDAMENTO');
  const buscaWebConcluida = queue.filter(t => t.status === 'BUSCA_WEB_CONCLUIDA');
  const pendentes = queue.filter(t => t.status === 'PENDENTE');

  const totalGabaritosAplicados = concluidas.reduce((acc, t) => acc + (t.resultado?.gabaritos_aplicados || 0), 0);
  const totalQuestoesFaltantes = queue.reduce((acc, t) => acc + (t.faltam_gabaritos || 0), 0);
  const pctGeral = (((concluidas.length + buscaWebConcluida.length) / total) * 100).toFixed(1);

  if (isWatch) console.clear();

  console.log('================================================================================');
  console.log(`  🎯 PAINEL DE MONITORAMENTO FASE 2 — BANCO RESIDÊNCIA (2020-2026)`);
  console.log(`  Hora: ${new Date().toLocaleTimeString('pt-BR')} | Atualização via Supabase Storage`);
  console.log('================================================================================\n');

  console.log(`📊 STATUS GERAL DA FILA DISTRIBUÍDA:`);
  console.log(`  • Total de Provas no Motor  : ${total}`);
  console.log(`  • Provas Concluídas com Sucesso : ${concluidas.length.toString().padEnd(4)} (${((concluidas.length/total)*100).toFixed(1)}%)`);
  console.log(`  • Provas Buscadas na Web (Varredura OK): ${buscaWebConcluida.length.toString().padEnd(4)}`);
  console.log(`  • Provas Em Andamento (Lock Ativo) : ${emAndamento.length}`);
  console.log(`  • Provas Pendentes na Fila  : ${pendentes.length}`);
  console.log(`  • Total Processadas Geral   : ${(concluidas.length + buscaWebConcluida.length)} / ${total} (${pctGeral}%)`);
  console.log(`  • Gabaritos Aplicados       : ${totalGabaritosAplicados.toLocaleString('pt-BR')} / ${totalQuestoesFaltantes.toLocaleString('pt-BR')}\n`);

  // Status dos Workers
  console.log(`👥 WORKERS ATIVOS EM PARALELO:`);
  
  // Dev 1
  const d1Active = w1 && (Date.now() - new Date(w1.last_heartbeat).getTime() < 3 * 60 * 1000);
  const d1Status = d1Active ? '🟢 ATIVO' : '⚪ DESCONECTADO';
  console.log(`  [DEV 1 - Máquina Principal]  : ${d1Status}`);
  if (w1) {
    console.log(`     Último pulso: ${formatElapsed(w1.last_heartbeat)} | Tarefa: ${w1.current_task || 'Aguardando próxima'}`);
    console.log(`     Concluídas por DEV 1: ${w1.tasks_completed || 0} | Gabaritos aplicados: ${w1.gabaritos_applied || 0}`);
  }

  // Dev 2
  const d2Active = w2 && (Date.now() - new Date(w2.last_heartbeat).getTime() < 3 * 60 * 1000);
  const d2Status = d2Active ? '🟢 ATIVO' : '⚪ DESCONECTADO';
  console.log(`  [DEV 2 - Máquina Paralela]   : ${d2Status}`);
  if (w2) {
    console.log(`     Último pulso: ${formatElapsed(w2.last_heartbeat)} | Tarefa: ${w2.current_task || 'Aguardando próxima'}`);
    console.log(`     Concluídas por DEV 2: ${w2.tasks_completed || 0} | Gabaritos aplicados: ${w2.gabaritos_applied || 0}`);
  }
  console.log('');

  // Tarefas em Andamento
  if (emAndamento.length > 0) {
    console.log(`⚡ TAREFAS EM ANDAMENTO AGORA (LOCK ATIVO):`);
    emAndamento.forEach(t => {
      console.log(`  ▶ [${t.assigned_to}] ${t.id} - ${t.banca} (${t.ano}) | Faltam: ${t.faltam_gabaritos} | Iniciado: ${formatElapsed(t.claimed_at)}`);
    });
    console.log('');
  }

  // Últimas concluídas
  if (concluidas.length > 0) {
    console.log(`🏆 ÚLTIMAS PROVAS CONCLUÍDAS:`);
    concluidas.slice(-5).reverse().forEach(t => {
      console.log(`  ✅ [${t.assigned_to || 'DEV'}] ${t.id} - ${t.banca} (${t.ano}) | +${t.resultado?.gabaritos_aplicados || 0} gabaritos aplicados`);
    });
    console.log('');
  }

  if (isWatch) {
    console.log('🔄 Atualizando automaticamente a cada 5 segundos... (Pressione Ctrl+C para sair)');
  }
}

async function loop() {
  await renderDashboard();
  if (isWatch) {
    setInterval(async () => {
      await renderDashboard();
    }, 5000);
  }
}

loop();
