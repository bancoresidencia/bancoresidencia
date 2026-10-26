import fs from 'fs';
import path from 'path';

/**
 * Script para restaurar os enunciados originais das 1.760 questões de Ginecologia
 * que ficaram com o placeholder "Enunciado da questão" no Supabase e no checkpoint.
 *
 * Fonte dos dados autênticos: data/ginecologia_final_questions.json
 */

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/["']/g, '');
  });
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const CHECKPOINT_PATH = path.resolve('data/checkpoints/ginecologia_deep_solved.json');
const QUESTIONS_PATH = path.resolve('data/ginecologia_final_questions.json');

async function restore() {
  console.log('\n======================================================');
  console.log('🩺 RESTAURAÇÃO DE ENUNCIADOS DE GINECOLOGIA');
  console.log('======================================================\n');

  if (!fs.existsSync(QUESTIONS_PATH)) {
    console.error(`❌ Arquivo ${QUESTIONS_PATH} não encontrado.`);
    process.exit(1);
  }

  const catalog = JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf8'));
  const catalogMap = new Map(catalog.map(q => [q.id, q]));
  console.log(`📚 Catálogo local carregado: ${catalog.length} questões.`);

  // 1. Atualiza no Checkpoint local
  let checkpointUpdated = 0;
  if (fs.existsSync(CHECKPOINT_PATH)) {
    const checkpoint = JSON.parse(fs.readFileSync(CHECKPOINT_PATH, 'utf8'));
    for (const q of checkpoint) {
      if (!q.statement || q.statement === 'Enunciado da questão') {
        const orig = catalogMap.get(q.id);
        if (orig && orig.statement && orig.statement !== 'Enunciado da questão') {
          q.statement = orig.statement;
          checkpointUpdated++;
        }
      }
    }
    fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2), 'utf8');
    console.log(`💾 Checkpoint atualizado com enunciados reais: ${checkpointUpdated} itens corrigidos.`);
  }

  // 2. Localiza questões afetadas no Supabase
  console.log('\n🔍 Buscando questões com placeholder no Supabase...');
  const PAGE_SIZE = 500;
  let from = 0;
  const toRestore = [];

  while (true) {
    const to = from + PAGE_SIZE - 1;
    const qUrl = `${SUPABASE_URL}/rest/v1/questions?especialidade=eq.Ginecologia&statement=eq.Enunciado%20da%20quest%C3%A3o&select=id`;
    const res = await fetch(qUrl, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Range': `${from}-${to}`
      }
    });

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    toRestore.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  console.log(`🎯 Questões a restaurar no Supabase: ${toRestore.length}`);
  if (toRestore.length === 0) {
    console.log('✨ Nenhuma questão com placeholder no Supabase. Tudo 100% íntegro!');
    return;
  }

  // 3. Monta lotes de atualização com o statement e options originais
  const BATCH_SIZE = 50;
  let successCount = 0;

  for (let i = 0; i < toRestore.length; i += BATCH_SIZE) {
    const batch = toRestore.slice(i, i + BATCH_SIZE);
    const updates = [];

    for (const item of batch) {
      const orig = catalogMap.get(item.id);
      if (orig && orig.statement && orig.statement !== 'Enunciado da questão') {
        updates.push({
          id: orig.id,
          statement: orig.statement,
          options: orig.options
        });
      }
    }

    if (updates.length > 0) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/questions`, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        successCount += updates.length;
        process.stdout.write(`  ⚡ Restauradas ${successCount}/${toRestore.length} questões no Supabase...\r`);
      } else {
        console.error(`\n❌ Falha ao atualizar lote iniciado em índice ${i}`);
      }
    }
  }

  console.log(`\n\n🎉 Restauração concluída! Total sincronizado no Supabase: ${successCount} questões.`);
}

restore().catch(console.error);
