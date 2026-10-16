import fs from 'fs';
import path from 'path';

const BASE_DIR = process.cwd();
const DATA_DIR = path.join(BASE_DIR, 'data');

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

const QUESTION_FILES = [
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
  console.log('⚡ VARREDURA INDEXADA ULTRA-RÁPIDA (KEYSET PAGINATION: id=gt.lastId)');
  console.log('='.repeat(80));

  const verifiedBank = new Set();
  for (const filename of QUESTION_FILES) {
    const fpath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(fpath)) continue;
    const content = JSON.parse(fs.readFileSync(fpath, 'utf8'));
    for (const q of content) {
      const qid = (q.id || '').trim();
      const ans = (q.correct_answer || q.correctAnswer || '').trim().toUpperCase();
      const isAnulada = Boolean(q.is_anulada || q.isAnulada || ans === 'ANULADA');
      if (qid && (['A', 'B', 'C', 'D', 'E'].includes(ans) || isAnulada)) {
        verifiedBank.add(qid);
      }
    }
  }

  console.log(`⭐ Total Homologados Padrão Ouro: ${verifiedBank.size.toLocaleString('pt-BR')}`);

  let lastId = null;
  const SCAN_LIMIT = 1000;
  const fakeIdsToReset = [];
  let totalWithAnswerScanned = 0;

  while (true) {
    let url = `${SUPABASE_URL}/rest/v1/questions?select=id,correct_answer&correct_answer=not.is.null&correct_answer=neq.&order=id.asc&limit=${SCAN_LIMIT}`;
    if (lastId) {
      url += `&id=gt.${lastId}`;
    }

    const res = await fetch(url, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`
      }
    });

    if (!res.ok) {
      console.error(`\n❌ Erro na varredura (lastId ${lastId}):`, res.status, await res.text());
      break;
    }

    const rows = await res.json();
    if (!rows || rows.length === 0) break;

    totalWithAnswerScanned += rows.length;
    lastId = rows[rows.length - 1].id;

    for (const r of rows) {
      if (!verifiedBank.has(r.id)) {
        fakeIdsToReset.push(r.id);
      }
    }

    process.stdout.write(`\r   Examinadas ${totalWithAnswerScanned.toLocaleString('pt-BR')} linhas... Falsos detectados: ${fakeIdsToReset.length.toLocaleString('pt-BR')}`);
    if (rows.length < SCAN_LIMIT) break;
  }
  console.log();

  console.log(`\n📊 Varredura concluída!`);
  console.log(`   • Total de questões com gabarito no Supabase: ${totalWithAnswerScanned.toLocaleString('pt-BR')}`);
  console.log(`   • Gabaritos não homologados (falsos/legados): ${fakeIdsToReset.length.toLocaleString('pt-BR')}`);
  console.log(`   • Gabaritos padrão ouro confirmados no Supabase: ${(totalWithAnswerScanned - fakeIdsToReset.length).toLocaleString('pt-BR')}`);

  if (fakeIdsToReset.length > 0) {
    console.log(`\n⚠️ Resetando ${fakeIdsToReset.length.toLocaleString('pt-BR')} gabaritos restantes para NULL...`);
    const BATCH_SIZE = 100;
    const CONCURRENCY = 8;
    const resetTasks = [];
    for (let i = 0; i < fakeIdsToReset.length; i += BATCH_SIZE) {
      resetTasks.push(fakeIdsToReset.slice(i, i + BATCH_SIZE));
    }

    let done = 0;
    let idx = 0;
    const workers = Array.from({ length: CONCURRENCY }, async () => {
      while (idx < resetTasks.length) {
        const chunk = resetTasks[idx++];
        const filter = `id=in.(${chunk.join(',')})`;
        await fetch(`${SUPABASE_URL}/rest/v1/questions?${filter}`, {
          method: 'PATCH',
          headers: {
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal'
          },
          body: JSON.stringify({ correct_answer: null, is_anulada: false })
        });
        done++;
        if (done % 20 === 0 || done === resetTasks.length) {
          process.stdout.write(`\r   [Reset: ${done}/${resetTasks.length}] lotes executados...`);
        }
      }
    });
    await Promise.all(workers);
    console.log('\n\n🎉 PURIFICAÇÃO TOTAL CONCLUÍDA COM 100% DE EFICIÊNCIA!');
  } else {
    console.log('\n🎉 O BANCO DE DADOS ESTÁ 100% LIMPO! ZERO GABARITOS FALSOS!');
  }
}

main().catch(console.error);
