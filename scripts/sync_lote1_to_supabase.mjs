import fs from 'fs';
import path from 'path';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Faltam credenciais do Supabase em .env.local");
  process.exit(1);
}

const specialtyFiles = [
  'data/clinica_medica_final_questions.json',
  'data/cirurgia_final_questions.json',
  'data/pediatria_final_questions.json',
  'data/ginecologia_final_questions.json',
  'data/medicina_preventiva_final_questions.json',
  'data/obstetricia_final_questions.json',
  'data/urologia_final_questions.json'
];

const lote1Keywords = [
  'SES-PE', 'UNIFESP', 'SUS-SP', 'FMABC', 'USP', 'AMRIGS', 'Santa Casa', 'IAMSPE', 'UNESP'
];

console.log("================================================================================");
console.log("SINCRONIZANDO GABARITOS HOMOLOGADOS DO LOTE 1 DIRETAMENTE COM A PLATAFORMA");
console.log("================================================================================");

const questionsToSync = [];
const seenIds = new Set();

for (const sf of specialtyFiles) {
  if (!fs.existsSync(sf)) continue;
  const list = JSON.parse(fs.readFileSync(sf, 'utf8'));
  for (const q of list) {
    const inst = q.institution || '';
    const isLote1 = lote1Keywords.some(k => inst.toLowerCase().includes(k.toLowerCase()));
    const ans = (q.correct_answer || q.correctAnswer || '').trim();
    const isAnul = q.is_anulada || q.isAnulada;

    if (isLote1 && (ans || isAnul) && q.id && !seenIds.has(q.id)) {
      seenIds.add(q.id);
      questionsToSync.push({
        id: q.id,
        correct_answer: isAnul ? 'ANULADA' : ans,
        commentary: q.commentary || (q.official_exam_meta ? `Gabarito Oficial Homologado - ${q.official_exam_meta.institution} ${q.official_exam_meta.year} (${q.official_exam_meta.source || ''}).` : 'Gabarito Oficial Homologado.')
      });
    }
  }
}

console.log(`📦 Encontradas ${questionsToSync.length} questões com gabarito do Lote 1 para sincronizar.`);

async function syncBatch() {
  const CONCURRENCY = 40;
  let updated = 0;
  let errors = 0;
  const startTime = Date.now();

  for (let i = 0; i < questionsToSync.length; i += CONCURRENCY) {
    const chunk = questionsToSync.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(async item => {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?id=eq.${item.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            correct_answer: item.correct_answer,
            commentary: item.commentary
          })
        });

        if (res.ok) {
          updated++;
        } else {
          errors++;
        }
      } catch (e) {
        errors++;
      }
    }));

    if ((i + CONCURRENCY) % 400 === 0 || i + CONCURRENCY >= questionsToSync.length) {
      const processed = Math.min(i + CONCURRENCY, questionsToSync.length);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const pct = ((processed / questionsToSync.length) * 100).toFixed(1);
      console.log(`  • Progresso: ${processed}/${questionsToSync.length} (${pct}%) | Atualizadas: ${updated} | Tempo: ${elapsed}s`);
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n🎉 SINCRONIZAÇÃO DO LOTE 1 COM A PLATAFORMA FINALIZADA COM SUCESSO!`);
  console.log(` • Questões Atualizadas no Supabase: ${updated}`);
  console.log(` • Falhas: ${errors}`);
  console.log(` • Tempo: ${totalTime}s\n`);
}

syncBatch().catch(console.error);
