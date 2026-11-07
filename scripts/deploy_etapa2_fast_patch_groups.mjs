import fs from 'fs';

// 1. Carregar variáveis de ambiente
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

const TASKS_FILE = 'data/staging/patches_deploy_tasks.json';
const CHECKPOINT_FILE = 'data/staging/patch_tasks_checkpoint.json';

if (!fs.existsSync(TASKS_FILE)) {
  console.error(`❌ Arquivo de tarefas não encontrado: ${TASKS_FILE}`);
  process.exit(1);
}

console.log('='.repeat(70));
console.log('⚡ DEPLOY TAXONÔMICO ULTRA-RÁPIDO NO SUPABASE (BATCH PATCH GROUPS)');
console.log(`• Destino: ${SUPABASE_URL}`);
console.log('='.repeat(70));

const tasks = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
const totalTasks = tasks.length;
const totalQuestions = tasks.reduce((acc, t) => acc + t.ids.length, 0);

console.log(`Tarefas de PATCH carregadas: ${totalTasks.toLocaleString('pt-BR')}`);
console.log(`Total de questões mapeadas: ${totalQuestions.toLocaleString('pt-BR')}`);

let checkpoint = { lastTaskIndex: 0, totalQuestionsPatched: 0 };
if (fs.existsSync(CHECKPOINT_FILE)) {
  try {
    checkpoint = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf8'));
    console.log(`Retomando do checkpoint: tarefa ${checkpoint.lastTaskIndex.toLocaleString('pt-BR')}/${totalTasks.toLocaleString('pt-BR')}`);
  } catch (e) {
    checkpoint = { lastTaskIndex: 0, totalQuestionsPatched: 0 };
  }
}

const CONCURRENCY = 14;
let taskPointer = checkpoint.lastTaskIndex;
let completedQuestions = checkpoint.totalQuestionsPatched;
let errorTasks = 0;
const t0 = Date.now();

function saveCheckpoint(idx, count) {
  checkpoint.lastTaskIndex = idx;
  checkpoint.totalQuestionsPatched = count;
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2), 'utf8');
}

async function runWorker(workerId) {
  while (taskPointer < totalTasks) {
    const taskIdx = taskPointer++;
    const task = tasks[taskIdx];
    const idsParam = task.ids.join(',');

    const url = `${SUPABASE_URL}/rest/v1/questions?id=in.(${idsParam})`;
    const body = JSON.stringify({
      modalidade: task.modalidade,
      especialidade: task.especialidade,
      tema: task.tema,
      foco: task.foco,
      subfoco: task.subfoco
    });

    let ok = false;
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        const res = await fetch(url, {
          method: 'PATCH',
          headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: body
        });

        if (res.ok) {
          ok = true;
          completedQuestions += task.ids.length;
          break;
        } else {
          const errText = await res.text();
          if (attempt === 4) {
            errorTasks++;
            console.error(`❌ [Worker ${workerId}] Falha tarefa ${taskIdx}: ${res.status} ${errText.slice(0, 100)}`);
          }
          await new Promise(r => setTimeout(r, 250 * attempt));
        }
      } catch (e) {
        if (attempt === 4) {
          errorTasks++;
          console.error(`❌ [Worker ${workerId}] Exceção tarefa ${taskIdx}: ${e.message}`);
        }
        await new Promise(r => setTimeout(r, 250 * attempt));
      }
    }

    if (taskIdx % 50 === 0 || taskIdx === totalTasks - 1) {
      saveCheckpoint(taskIdx + 1, completedQuestions);
      const elapsed = (Date.now() - t0) / 1000;
      const rate = (completedQuestions / (elapsed || 1)).toFixed(0);
      const pct = ((taskIdx / totalTasks) * 100).toFixed(1);
      const remainTasks = totalTasks - taskIdx;
      const etaSec = ((remainTasks / ((taskIdx - checkpoint.lastTaskIndex) / (elapsed || 1))) || 0).toFixed(0);
      console.log(`[PROGRESSO ${pct}%] Tarefa ${taskIdx + 1}/${totalTasks} | Questões: ${completedQuestions.toLocaleString('pt-BR')} | Taxa: ${rate} q/s | ETA: ${etaSec}s`);
    }
  }
}

const workers = [];
for (let i = 0; i < CONCURRENCY; i++) {
  workers.push(runWorker(i + 1));
}

await Promise.all(workers);
saveCheckpoint(totalTasks, completedQuestions);

const totalElapsed = ((Date.now() - t0) / 1000).toFixed(1);
console.log('\n' + '='.repeat(70));
console.log('🏆 DEPLOY TAXONÔMICO NO SUPABASE CONCLUÍDO!');
console.log(`• Total de tarefas concluídas: ${totalTasks.toLocaleString('pt-BR')}`);
console.log(`• Questões atualizadas: ${completedQuestions.toLocaleString('pt-BR')}`);
console.log(`• Tarefas com erro: ${errorTasks}`);
console.log(`• Tempo decorrido: ${totalElapsed}s`);
console.log('='.repeat(70));

if (errorTasks === 0) {
  process.exit(0);
} else {
  process.exit(1);
}

