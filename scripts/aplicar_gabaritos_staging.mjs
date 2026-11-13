import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const STAGING_PATH = path.resolve('data/coleta_gabaritos_staging.json');

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

const isApply = process.argv.includes('--apply');

async function applyStaging() {
  console.log('========================================================================');
  console.log(`🚀 APLICAÇÃO DE GABARITOS HOMOLOGADOS NO BANCO (${isApply ? 'MODO GRAVAÇÃO REAL' : 'MODO DRY-RUN'})`);
  console.log('========================================================================\n');

  if (!fs.existsSync(STAGING_PATH)) {
    console.error('Arquivo de staging não encontrado:', STAGING_PATH);
    return;
  }

  const staging = JSON.parse(fs.readFileSync(STAGING_PATH, 'utf8'));
  const decisoes = staging.decisoes || [];

  console.log(`📋 Total de decisões em staging: ${decisoes.length}`);
  console.log(`• Remapeadas por anti-permutação: ${decisoes.filter(d => d.foiRemapeado).length}`);
  console.log(`• Anuladas: ${decisoes.filter(d => d.isAnulada).length}`);

  let sucessoCount = 0;
  let erroCount = 0;
  let ignoradasCount = 0;

  for (let i = 0; i < decisoes.length; i++) {
    const d = decisoes[i];
    const table = d.table || 'questions';
    const isAnul = Boolean(d.isAnulada) || d.gabaritoMapeadoNoBanco === 'ANULADA';
    const finalAnswer = isAnul ? '' : d.gabaritoMapeadoNoBanco;

    if (!finalAnswer && !isAnul) {
      ignoradasCount++;
      continue;
    }

    if (isApply) {
      // 1. Busca questão atual para preservar comentário
      const { data: currentQ, error: fetchErr } = await supabase
        .from(table)
        .select('id, correct_answer, commentary')
        .eq('id', d.id)
        .single();

      if (fetchErr || !currentQ) {
        console.error(`❌ Erro ao buscar questão ${d.code} (${d.id}):`, fetchErr?.message);
        erroCount++;
        continue;
      }

      // 2. Prepara atualização
      const stamp = `[Gabarito Oficial Homologado] ${d.caderno} | Letra Oficial: ${d.gabaritoOficialExtraido} | Banco: ${d.gabaritoMapeadoNoBanco} | Fonte: ${d.fonte}`;
      const updatedCommentary = currentQ.commentary && currentQ.commentary.includes('[Gabarito Oficial Homologado]')
        ? currentQ.commentary
        : (currentQ.commentary ? `${currentQ.commentary}\n\n${stamp}` : stamp);

      const updatePayload = {
        correct_answer: finalAnswer,
        is_anulada: isAnul,
        commentary: updatedCommentary
      };

      const { error: updErr } = await supabase
        .from(table)
        .update(updatePayload)
        .eq('id', d.id);

      if (updErr) {
        console.error(`❌ Erro ao atualizar ${d.code}:`, updErr.message);
        erroCount++;
      } else {
        sucessoCount++;
        if ((sucessoCount % 25 === 0) || (i === decisoes.length - 1)) {
          console.log(`   [${sucessoCount}/${decisoes.length}] Aplicada com sucesso: ${d.code} -> Gabarito '${finalAnswer || 'ANULADA'}'`);
        }
      }
    } else {
      sucessoCount++;
    }
  }

  console.log('\n========================================================================');
  console.log('📊 BALANÇO DA OPERAÇÃO:');
  console.log(`• Total analisadas: ${decisoes.length}`);
  console.log(`• Total aplicadas com sucesso: ${sucessoCount}`);
  console.log(`• Total de erros: ${erroCount}`);
  console.log(`• Total ignoradas (sem gabarito válido): ${ignoradasCount}`);
  if (!isApply) {
    console.log('\n💡 Para gravar efetivamente no banco, execute com a flag: --apply');
  } else {
    console.log('\n✅ Todas as alterações foram persistidas no Supabase com sucesso!');
  }
  console.log('========================================================================\n');
}

applyStaging().catch(console.error);
