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
console.log(`⚡ SINCRONIZADOR DE SANEAMENTO SUPABASE VIA HTTP PATCH CONCORRENTE`);
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

function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/\u0000/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

function sanitizeObject(obj) {
  if (!obj) return obj;
  if (typeof obj === 'string') return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (typeof obj === 'object') {
    const res = {};
    for (const [k, v] of Object.entries(obj)) {
      res[k] = sanitizeObject(v);
    }
    return res;
  }
  return obj;
}

const targetQuestions = new Map();

for (const f of QUESTION_FILES) {
  const qs = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const q of qs) {
    if (modifiedIds.has(q.id)) {
      const isAnul = Boolean(q.is_anulada || q.isAnulada);
      const ans = isAnul ? 'ANULADA' : (q.correct_answer || q.correctAnswer || null);
      
      const payload = {
        correct_answer: ans,
        is_anulada: isAnul
      };

      if (q.commentary) {
        payload.commentary = sanitizeString(q.commentary);
      }
      if (q.options) {
        payload.options = sanitizeObject(q.options);
      }

      targetQuestions.set(q.id, payload);
    }
  }
}

console.log(`• Questões preparadas para sync no Supabase: ${targetQuestions.size}`);

async function runPatchSync() {
  const items = Array.from(targetQuestions.entries());
  const CONCURRENCY = 16;
  let currentIndex = 0;
  let successCount = 0;
  let errorCount = 0;

  const workers = Array.from({ length: CONCURRENCY }, async (_, workerId) => {
    while (currentIndex < items.length) {
      const idx = currentIndex++;
      const [id, body] = items[idx];

      let ok = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
              apikey: SERVICE_KEY,
              Authorization: `Bearer ${SERVICE_KEY}`,
              'Content-Type': 'application/json',
              Prefer: 'return=minimal'
            },
            body: JSON.stringify(body)
          });

          if (res.ok) {
            ok = true;
            successCount++;
            break;
          } else {
            const errText = await res.text();
            if (attempt === 3) {
              console.error(`❌ Erro no ID ${id} (${res.status}): ${errText.slice(0, 100)}`);
              errorCount++;
            }
          }
        } catch (err) {
          if (attempt === 3) {
            console.error(`❌ Falha de rede no ID ${id}: ${err.message}`);
            errorCount++;
          }
          await new Promise(r => setTimeout(r, 500));
        }
      }

      if ((successCount + errorCount) % 250 === 0 || (successCount + errorCount) === items.length) {
        console.log(`  Progresso: ${successCount + errorCount}/${items.length} (${((successCount + errorCount) / items.length * 100).toFixed(1)}%) - Sucessos: ${successCount}, Erros: ${errorCount}`);
      }
    }
  });

  await Promise.all(workers);

  console.log('\n' + '='.repeat(80));
  console.log(`🎉 SINCRONIZAÇÃO SUPABASE CONCLUÍDA:`);
  console.log(`• Sucessos: ${successCount}`);
  console.log(`• Erros:    ${errorCount}`);
  console.log('='.repeat(80));
}

runPatchSync().catch(console.error);
