import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// CLI args
const args = process.argv.slice(2);
const APPLY = args.includes('--apply');

// Carrega .env.local
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
        env[k] = v;
      }
    }
  });
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function consolidar() {
  console.log('========================================================================');
  console.log('🔄 CONSOLIDADOR DE GABARITOS HOMOLOGADOS — BANCO RESIDÊNCIA');
  console.log(`Modo: ${APPLY ? '⚡ PERSISTÊNCIA DIRETA (--apply ATIVO)' : '🔍 DRY-RUN (SOMENTE AUDITORIA)'}`);
  console.log('========================================================================\n');

  const files = fs.readdirSync('data').filter(f => f.startsWith('staging_lote_') && f.endsWith('.json'));
  console.log(`Encontrados ${files.length} arquivos de staging de workers:`, files);

  const masterMap = new Map();
  let totalLotesRead = 0;

  for (const f of files) {
    const fullPath = path.join('data', f);
    try {
      const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      const decisoes = Array.isArray(content.decisoes) ? content.decisoes : [];
      console.log(`  -> ${f}: ${decisoes.length} questões homologadas (Lote ${content.lote})`);
      totalLotesRead += decisoes.length;
      for (const d of decisoes) {
        if (!masterMap.has(d.id)) {
          masterMap.set(d.id, d);
        }
      }
    } catch (e) {
      console.error(`Erro ao ler ${f}:`, e.message);
    }
  }

  const consolidatedList = Array.from(masterMap.values());
  console.log(`\n📊 Total de decisões brutas lidas: ${totalLotesRead}`);
  console.log(`✨ Total de decisões únicas consolidadas: ${consolidatedList.length}`);

  const remapeados = consolidatedList.filter(d => d.foiRemapeado);
  const anuladas = consolidatedList.filter(d => d.isAnulada);

  console.log(`⚠️ Total com Anti-Permutação (letra remapeada): ${remapeados.length}`);
  console.log(`🚫 Total de Anuladas homologadas: ${anuladas.length}`);

  // Salva master staging unificado
  const masterStagingPath = path.resolve('data/coleta_gabaritos_staging.json');
  let existingMaster = { homologados: [] };
  if (fs.existsSync(masterStagingPath)) {
    try {
      existingMaster = JSON.parse(fs.readFileSync(masterStagingPath, 'utf8'));
    } catch (_) {}
  }

  const existingMap = new Map((existingMaster.homologados || []).map(h => [h.id, h]));
  for (const c of consolidatedList) {
    existingMap.set(c.id, c);
  }

  const updatedMasterList = Array.from(existingMap.values());
  fs.writeFileSync(masterStagingPath, JSON.stringify({
    ultimaAtualizacao: new Date().toISOString(),
    totalGeralHomologados: updatedMasterList.length,
    homologados: updatedMasterList
  }, null, 2), 'utf8');

  console.log(`💾 Master staging atualizado em '${masterStagingPath}' com ${updatedMasterList.length} itens.`);

  if (!APPLY) {
    console.log('\n💡 Para aplicar as alterações ao banco Supabase, execute:');
    console.log('   node scripts/consolidar_e_aplicar_todos_os_lotes.mjs --apply\n');
    return;
  }

  console.log('\n🚀 Aplicando atualizações ao Supabase em lotes de 50...');
  let sucessos = 0;
  let erros = 0;

  for (let i = 0; i < consolidatedList.length; i += 50) {
    const chunk = consolidatedList.slice(i, i + 50);
    for (const item of chunk) {
      try {
        const updatePayload = {
          correct_answer: item.gabaritoMapeadoNoBanco
        };

        if (item.isAnulada) {
          updatePayload.anulada = true;
        }

        const { error } = await supabase
          .from(item.table || 'questions')
          .update(updatePayload)
          .eq('id', item.id);

        if (error) {
          erros++;
          console.error(`Erro ao atualizar [${item.code}]:`, error.message);
        } else {
          sucessos++;
        }
      } catch (err) {
        erros++;
        console.error(`Exceção ao atualizar [${item.code}]:`, err.message);
      }
    }
    console.log(`   Progresso persistência: ${Math.min(i + 50, consolidatedList.length)}/${consolidatedList.length} (Sucessos: ${sucessos}, Falhas: ${erros})`);
  }

  console.log('\n========================================================================');
  console.log(`🎉 PERSISTÊNCIA CONCLUÍDA: ${sucessos} gabaritos atualizados no banco com sucesso!`);
  if (erros > 0) console.log(`⚠️ Falhas: ${erros}`);
  console.log('========================================================================\n');
}

consolidar().catch(console.error);
