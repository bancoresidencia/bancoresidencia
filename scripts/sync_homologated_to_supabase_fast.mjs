import fs from 'fs';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Faltam credenciais do Supabase em .env.local');
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync('data/all_homologated_questions_gold.json', 'utf8'));
console.log(`📦 Carregados ${raw.length} registros brutos para sincronização.`);

// Deduplica por ID
const uniqueMap = new Map();
raw.forEach(r => {
  if (r.id && r.correct_answer) {
    uniqueMap.set(r.id, r);
  }
});

const items = Array.from(uniqueMap.values());
console.log(`🚀 Sincronizando ${items.length} questões com gabarito oficial no Supabase...`);

async function runSync() {
  const CONCURRENCY = 25;
  let updated = 0;
  let errors = 0;
  const startTime = Date.now();

  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const chunk = items.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(async item => {
      const audit = item.audit || {};
      const commentary = audit.exam_id 
        ? `Gabarito Oficial Homologado - ${audit.exam_id} Questão ${audit.question_number || ''}.` 
        : (audit.book ? `Gabarito Oficial Homologado - Livro: ${audit.book}` : 'Gabarito Oficial Homologado.');

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
            commentary: commentary
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

    if ((i + CONCURRENCY) % 500 === 0 || i + CONCURRENCY >= items.length) {
      const processed = Math.min(i + CONCURRENCY, items.length);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`  • Progresso: ${processed}/${items.length} (${((processed / items.length) * 100).toFixed(1)}%) | Atualizadas: ${updated} | Erros: ${errors} | Tempo: ${elapsed}s`);
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ SINCRONIZAÇÃO COM SUPABASE CONCLUÍDA!`);
  console.log(` • Total atualizado com sucesso: ${updated}`);
  console.log(` • Falhas: ${errors}`);
  console.log(` • Tempo total: ${totalTime} segundos\n`);
}

runSync();
