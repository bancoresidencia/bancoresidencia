import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function applyToSupabase() {
  console.log('========================================================================');
  console.log('🚀 INICIANDO APLICAÇÃO SEGURA DE 176 GABARITOS HOMOLOGADOS NO SUPABASE');
  console.log('Modo: COMMIT OFICIAL AUTORIZADO PELO USUÁRIO');
  console.log('========================================================================\n');

  // 1. Coleta consolidada dos 176 itens
  const map = new Map();

  const p85 = 'data/staging_homologados_85pct.json';
  if (fs.existsSync(p85)) {
    const d = JSON.parse(fs.readFileSync(p85, 'utf8').replace(/^\uFEFF/, ''));
    (d.decisoes || []).forEach(x => {
      const key = x.id || x.code;
      map.set(key, {
        id: x.id,
        code: x.code,
        ano: x.ano,
        gabarito: x.gabaritoMapeadoNoBanco || x.gabaritoOficialExtraido || (x.isAnulada ? 'ANULADA' : null),
        origem: x.caderno || 'staging_homologados_85pct',
        isAnulada: x.isAnulada || false
      });
    });
  }

  for (let i = 1; i <= 10; i++) {
    const p = `data/staging_lote_${i}.json`;
    if (fs.existsSync(p)) {
      const d = JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));
      (d.decisoes || []).forEach(x => {
        const key = x.id || x.code;
        if (!map.has(key)) {
          map.set(key, {
            id: x.id,
            code: x.code,
            ano: x.year || x.ano,
            gabarito: x.mappedLetter || x.gabaritoMapeadoNoBanco || x.gabaritoOficialExtraido || (x.isAnulada ? 'ANULADA' : null),
            origem: `Worker Lote ${i} (${x.provider || 'Web QAPage'})`,
            isAnulada: x.isAnulada || false
          });
        }
      });
    }
  }

  const items = Array.from(map.values());
  console.log(`📦 Itens consolidados a processar: ${items.length}`);

  // 2. Pré-checagem do banco
  const { count: beforeMissing } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .or('correct_answer.is.null,correct_answer.eq.');

  console.log(`📊 Pendências no Supabase ANTES da aplicação: ${beforeMissing}\n`);

  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const auditLog = [];

  // 3. Aplicação em lotes controlados
  const BATCH_SIZE = 15;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);

    for (const item of batch) {
      try {
        let query = supabase.from('questions').update({
          correct_answer: item.gabarito
        });

        if (item.id) {
          query = query.eq('id', item.id);
        } else {
          query = query.eq('code', item.code);
        }

        const { data, error } = await query.select('id, code, correct_answer');

        if (error) {
          console.error(`❌ Erro ao atualizar ${item.code}:`, error.message);
          errorCount++;
          auditLog.push({ code: item.code, status: 'ERROR', error: error.message });
        } else if (!data || data.length === 0) {
          // tenta pelo código se tentou por ID ou vice-versa
          if (item.code) {
            const { data: d2, error: e2 } = await supabase
              .from('questions')
              .update({ correct_answer: item.gabarito })
              .eq('code', item.code)
              .select('id, code, correct_answer');

            if (!e2 && d2 && d2.length > 0) {
              successCount++;
              auditLog.push({ code: item.code, status: 'SUCCESS', gabarito: item.gabarito, origem: item.origem });
              console.log(`✅ [${successCount}/${items.length}] Atualizado via code: ${item.code} -> GB: ${item.gabarito}`);
            } else {
              console.warn(`⚠️ Não encontrado no banco: ${item.code}`);
              skippedCount++;
              auditLog.push({ code: item.code, status: 'NOT_FOUND' });
            }
          } else {
            console.warn(`⚠️ Não encontrado no banco por ID: ${item.id}`);
            skippedCount++;
            auditLog.push({ id: item.id, status: 'NOT_FOUND' });
          }
        } else {
          successCount++;
          auditLog.push({ code: item.code, status: 'SUCCESS', gabarito: item.gabarito, origem: item.origem });
          console.log(`✅ [${successCount}/${items.length}] Atualizado: ${item.code} -> GB: ${item.gabarito} (${item.origem})`);
        }
      } catch (err) {
        console.error(`❌ Exceção em ${item.code}:`, err.message);
        errorCount++;
        auditLog.push({ code: item.code, status: 'EXCEPTION', error: err.message });
      }
    }

    // Pequena pausa para garantir taxa estável
    await new Promise(r => setTimeout(r, 200));
  }

  // 4. Pós-checagem no banco
  const { count: afterMissing } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .or('correct_answer.is.null,correct_answer.eq.');

  console.log('\n========================================================================');
  console.log('🏁 RESULTADO FINAL DA APLICAÇÃO:');
  console.log(`- Sucessos gravados no Supabase: ${successCount}`);
  console.log(`- Itens não encontrados / ignorados: ${skippedCount}`);
  console.log(`- Erros: ${errorCount}`);
  console.log(`- Pendências ANTES: ${beforeMissing}`);
  console.log(`- Pendências DEPOIS: ${afterMissing}`);
  console.log(`- Redução líquida de pendências: ${beforeMissing - afterMissing}`);
  console.log('========================================================================\n');

  // Salvar relatório de auditoria
  const reportPath = 'data/relatorio_aplicacao_supabase_176.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    dataAplicacao: new Date().toISOString(),
    totalProcessado: items.length,
    sucesso: successCount,
    naoEncontrados: skippedCount,
    erros: errorCount,
    pendenciasAntes: beforeMissing,
    pendenciasDepois: afterMissing,
    registros: auditLog
  }, null, 2));

  console.log(`📄 Relatório de auditoria detalhado salvo em: ${reportPath}`);
}

applyToSupabase().catch(console.error);
