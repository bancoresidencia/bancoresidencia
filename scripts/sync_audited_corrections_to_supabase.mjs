import fs from 'fs';
import path from 'path';

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

const log1_2 = JSON.parse(fs.readFileSync('data/log_execucao_fase1_fase2.json', 'utf8'));
const log3 = JSON.parse(fs.readFileSync('data/log_execucao_fase3.json', 'utf8'));

const modifiedIds = new Set();
for (const item of (log1_2.phase1?.log || [])) modifiedIds.add(item.id);
for (const item of (log1_2.phase2?.log || [])) modifiedIds.add(item.id);
for (const item of (log3.log || [])) modifiedIds.add(item.id);

console.log('='.repeat(80));
console.log(`⚡ SINCRONIZADOR DE SANEAMENTO SUPABASE — FASE 4`);
console.log(`• Total de IDs modificados localmente: ${modifiedIds.size}`);
console.log('='.repeat(80));

// Carregar questões atualizadas dos arquivos locais
const QUESTION_FILES = [
  'data/cirurgia_final_questions.json',
  'data/clinica_medica_final_questions.json',
  'data/ginecologia_final_questions.json',
  'data/medicina_preventiva_final_questions.json',
  'data/obstetricia_final_questions.json',
  'data/pediatria_final_questions.json',
  'data/urologia_final_questions.json'
];

const targetQuestions = new Map();

for (const f of QUESTION_FILES) {
  const qs = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const q of qs) {
    if (modifiedIds.has(q.id)) {
      targetQuestions.set(q.id, {
        id: q.id,
        correct_answer: q.correct_answer || q.correctAnswer || null,
        is_anulada: Boolean(q.is_anulada || q.isAnulada),
        commentary: q.commentary || null,
        options: q.options || null
      });
    }
  }
}

console.log(`• Questões preparadas para sync no Supabase: ${targetQuestions.size}`);

async function syncInBatches() {
  const entries = Array.from(targetQuestions.values());
  const BATCH_SIZE = 50;
  let synced = 0;
  let errors = 0;

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    
    // Executar updates usando upsert no PostgREST
    const payload = batch.map(b => {
      const item = {
        id: b.id,
        correct_answer: b.correct_answer,
        is_anulada: b.is_anulada
      };
      if (b.commentary) item.commentary = b.commentary;
      if (b.options) item.options = b.options;
      return item;
    });

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?on_conflict=id`, {
        method: 'POST',
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(`❌ Erro no lote ${Math.floor(i / BATCH_SIZE) + 1}: ${res.status} - ${text.slice(0, 150)}`);
        errors += batch.length;
      } else {
        synced += batch.length;
        if (synced % 200 === 0 || synced === entries.length) {
          console.log(`  Progresso: ${synced}/${entries.length} questões sincronizadas com o Supabase...`);
        }
      }
    } catch (err) {
      console.error(`❌ Falha de rede no lote:`, err.message);
      errors += batch.length;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`✅ SINCRONIZAÇÃO SUPABASE CONCLUÍDA:`);
  console.log(`• Sincronizadas com Sucesso: ${synced}`);
  console.log(`• Falhas/Erros:              ${errors}`);
  console.log('='.repeat(80));
}

syncInBatches().catch(console.error);
