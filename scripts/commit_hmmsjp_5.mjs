import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const t = line.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function commitHMMSJP() {
  const staging = JSON.parse(fs.readFileSync('data/staging_fase1_fafipa_hmmsjp.json', 'utf8'));
  console.log(`🚀 Iniciando gravação autorizada de ${staging.length} questões HMMSJP (FAFIPA)...`);

  const results = [];
  for (const item of staging) {
    // 1. Verifica estado atual
    const { data: before, error: bErr } = await supabase.from('questions')
      .select('id, code, correct_answer, has_gabarito')
      .eq('id', item.id)
      .single();

    if (bErr || !before) {
      console.error(`❌ Erro ao buscar questão ${item.code}:`, bErr?.message);
      results.push({ id: item.id, code: item.code, status: 'error_fetch', error: bErr?.message });
      continue;
    }

    // 2. Executa update seguro
    const { data: updated, error: uErr } = await supabase.from('questions')
      .update({
        correct_answer: item.correct_answer,
        commentary: item.commentary
      })
      .eq('id', item.id)
      .select('id, code, correct_answer, has_gabarito')
      .single();

    if (uErr) {
      console.error(`❌ Falha no update de ${item.code}:`, uErr.message);
      results.push({ id: item.id, code: item.code, status: 'error_update', error: uErr.message });
    } else {
      console.log(`✅ [SUCESSO] ${item.code}: ${before.correct_answer || 'NULL'} -> ${updated.correct_answer} (has_gabarito: ${updated.has_gabarito})`);
      results.push({
        id: item.id,
        code: item.code,
        status: 'updated',
        before: before.correct_answer,
        after: updated.correct_answer,
        has_gabarito: updated.has_gabarito
      });
    }
  }

  // Atualiza arquivo de relatório
  const reportPath = 'data/relatorio_aplicacao_supabase_176.json';
  let report = { totalProcessado: 0, sucesso: 0, registros: [] };
  if (fs.existsSync(reportPath)) {
    try {
      report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    } catch (e) {}
  }
  report.totalProcessado = (report.totalProcessado || 0) + results.filter(r => r.status === 'updated').length;
  report.sucesso = (report.sucesso || 0) + results.filter(r => r.status === 'updated').length;
  report.registros = (report.registros || []).concat(results);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(`\n🏁 Concluído: ${results.filter(r => r.status === 'updated').length}/${staging.length} questões gravadas com sucesso no Supabase!`);
}

commitHMMSJP().catch(console.error);
