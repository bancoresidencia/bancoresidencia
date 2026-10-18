import fs from 'fs';
import path from 'path';

const BASE_DIR = process.cwd();
const DATA_DIR = path.join(BASE_DIR, 'data');

// Carrega .env.local
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
  console.error('❌ ERRO: Credenciais Supabase ausentes em .env.local');
  process.exit(1);
}

const QUESTION_FILES = [
  'all_homologated_questions_gold.json',
  'cirurgia_final_questions.json',
  'clinica_medica_final_questions.json',
  'ginecologia_final_questions.json',
  'medicina_preventiva_final_questions.json',
  'obstetricia_final_questions.json',
  'pediatria_final_questions.json',
  'urologia_final_questions.json'
];

async function main() {
  console.log('='.repeat(80));
  console.log('🚀 SINCRONIZADOR EM MASSA: GABARITOS LOCAIS -> BANCO SUPABASE');
  console.log('='.repeat(80));

  const letterGroups = {
    'A': new Set(),
    'B': new Set(),
    'C': new Set(),
    'D': new Set(),
    'E': new Set(),
    'ANULADA': new Set()
  };

  let totalQuestionsInFiles = 0;

  console.log('\n📂 Lendo arquivos JSON locais e agrupando por gabarito com deduplicação...');
  for (const filename of QUESTION_FILES) {
    const fpath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(fpath)) continue;

    const content = JSON.parse(fs.readFileSync(fpath, 'utf8'));
    totalQuestionsInFiles += content.length;

    for (const q of content) {
      const qid = (q.id || '').trim();
      if (!qid) continue;

      const ans = (q.correctAnswer || q.correct_answer || '').trim().toUpperCase();
      const isAnulada = Boolean(q.isAnulada || q.is_anulada || ans === 'ANULADA' || ans === '!');

      if (isAnulada) {
        // Remover de letras anteriores se houver
        ['A', 'B', 'C', 'D', 'E'].forEach(l => letterGroups[l].delete(qid));
        letterGroups['ANULADA'].add(qid);
      } else if (['A', 'B', 'C', 'D', 'E'].includes(ans)) {
        if (!letterGroups['ANULADA'].has(qid)) {
          letterGroups[ans].add(qid);
        }
      }
    }
  }

  let totalUniqueWithAnswers = 0;
  for (const [key, set] of Object.entries(letterGroups)) {
    totalUniqueWithAnswers += set.size;
    console.log(`   • Gabarito [${key}]: ${set.size.toLocaleString('pt-BR')} questões únicas`);
  }
  console.log(`🎯 Total de questões únicas homologadas para sincronizar: ${totalUniqueWithAnswers.toLocaleString('pt-BR')}`);

  // Prepara tarefas de atualização em lotes de 50 IDs (limite seguro de URL)
  const tasks = [];
  const BATCH_SIZE = 50;

  for (const [letter, idSet] of Object.entries(letterGroups)) {
    const idList = Array.from(idSet);
    for (let i = 0; i < idList.length; i += BATCH_SIZE) {
      const chunk = idList.slice(i, i + BATCH_SIZE);
      const isAnul = letter === 'ANULADA';
      const body = isAnul
        ? { correct_answer: 'ANULADA', is_anulada: true }
        : { correct_answer: letter, is_anulada: false };

      tasks.push({
        ids: chunk,
        body,
        label: `${letter} (${chunk.length} itens)`
      });
    }
  }

  console.log(`\n📦 Total de requisições PATCH em lote: ${tasks.length.toLocaleString('pt-BR')} (lotes de ${BATCH_SIZE})`);
  console.log('⚡ Enviando para o Supabase com 12 conexões concorrentes...');

  const CONCURRENCY = 12;
  let completed = 0;
  let totalRowsUpdated = 0;
  let errorCount = 0;

  async function worker(task) {
    const filter = `id=in.(${task.ids.join(',')})`;
    const endpoint = `${SUPABASE_URL}/rest/v1/questions?${filter}`;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(endpoint, {
          method: 'PATCH',
          headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'count=exact'
          },
          body: JSON.stringify(task.body)
        });

        if (res.ok) {
          const range = res.headers.get('content-range');
          const count = range ? parseInt(range.split('/')[1] || '0') : task.ids.length;
          totalRowsUpdated += count;
          completed++;
          return;
        }

        const errText = await res.text();
        if (attempt === 3) {
          console.warn(`\n⚠️ Falha no lote ${task.label}: Status ${res.status} - ${errText.slice(0, 100)}`);
          errorCount++;
        } else {
          await new Promise(r => setTimeout(r, 800 * attempt));
        }
      } catch (err) {
        if (attempt === 3) {
          console.warn(`\n⚠️ Erro de rede no lote ${task.label}: ${err.message}`);
          errorCount++;
        } else {
          await new Promise(r => setTimeout(r, 800 * attempt));
        }
      }
    }
  }

  // Execução com pool concorrente
  const executing = [];
  const startTime = Date.now();

  for (const task of tasks) {
    const p = worker(task).then(() => {
      executing.splice(executing.indexOf(p), 1);
      const pct = ((completed / tasks.length) * 100).toFixed(1);
      process.stdout.write(`   [Progresso: ${completed}/${tasks.length} lotes (${pct}%)] | ${totalRowsUpdated.toLocaleString('pt-BR')} questões sincronizadas no Supabase...\r`);
    });
    executing.push(p);

    if (executing.length >= CONCURRENCY) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n\n' + '='.repeat(80));
  console.log(`🎉 SINCRONIZAÇÃO COM SUPABASE CONCLUÍDA EM ${duration}s!`);
  console.log(`✅ Total de questões atualizadas no Supabase: ${totalRowsUpdated.toLocaleString('pt-BR')}`);
  if (errorCount > 0) {
    console.log(`⚠️ Lotes com erro: ${errorCount}`);
  }
  console.log('='.repeat(80));
}

main().catch(console.error);
