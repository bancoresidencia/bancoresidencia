import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      }
    }
  });
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function commit107() {
  console.log('🚀 Iniciando ingestão direta autorizada de 107 questões homologadas no Supabase...');

  // 1. Carrega as 40 da USCS (Fase 2)
  let f2Items = [];
  if (fs.existsSync('data/staging_fase2_web.json')) {
    f2Items = JSON.parse(fs.readFileSync('data/staging_fase2_web.json', 'utf8'));
  }

  // 2. Carrega as 67 Gêmeas Limpas
  let twins = [];
  if (fs.existsSync('data/staging_questoes_gemeas_locais.json')) {
    twins = JSON.parse(fs.readFileSync('data/staging_questoes_gemeas_locais.json', 'utf8'));
  }

  const allItems = [...f2Items, ...twins];
  console.log(`📦 Total de questões para ingestão: ${allItems.length} (40 Web + 67 Gêmeas)`);

  let successCount = 0;
  let errorCount = 0;
  const committedIds = new Set();

  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    const qId = item.question_id || item.id;
    if (committedIds.has(qId)) continue;
    committedIds.add(qId);

    const payload = {
      correct_answer: (item.correct_answer || '').trim().toUpperCase(),
      commentary: item.commentary || null
    };

    if (!payload.correct_answer) continue;

    const { error } = await supabase.from('questions')
      .update(payload)
      .eq('id', qId);

    if (error) {
      console.error(`❌ Erro no item ${item.code}:`, error.message);
      errorCount++;
    } else {
      successCount++;
      if (successCount % 10 === 0 || successCount === allItems.length) {
        console.log(`   ✅ Ingestão progresso: ${successCount}/${allItems.length} gravadas no Supabase`);
      }
    }
  }

  // Atualiza relatório de aplicação
  const reportPath = 'data/relatorio_aplicacao_supabase_176.json';
  let report = { totalProcessado: 0, sucesso: 0, registros: [] };
  if (fs.existsSync(reportPath)) {
    try {
      report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    } catch (e) {}
  }
  report.totalProcessado = (report.totalProcessado || 0) + successCount;
  report.sucesso = (report.sucesso || 0) + successCount;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(`\n🎉 INGESTÃO CONCLUÍDA: ${successCount} questões atualizadas com sucesso no Supabase!`);
}

commit107().catch(console.error);
