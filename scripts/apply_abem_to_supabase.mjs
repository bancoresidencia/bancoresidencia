import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const STAGING_PATH = 'data/staging_abem_homologados.json';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function applyAbem() {
  if (!fs.existsSync(STAGING_PATH)) {
    console.error(`Arquivo ${STAGING_PATH} não encontrado.`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(STAGING_PATH, 'utf8'));
  const homologadas = data.homologadas || [];
  console.log(`=== APLICAÇÃO OFICIAL NO SUPABASE: ABEM 2026 ===`);
  console.log(`Total de questões a atualizar: ${homologadas.length}`);

  let sucessos = 0;
  let erros = 0;
  const relatorio = [];

  for (let i = 0; i < homologadas.length; i++) {
    const item = homologadas[i];
    
    // Payload estrito: nunca passar updated_at
    const updatePayload = {
      correct_answer: item.gabaritoDb,
      has_gabarito: true
    };
    if (item.comentarioOficial && item.comentarioOficial.trim() !== '') {
      updatePayload.commentary = item.comentarioOficial;
    }

    const { error } = await supabase
      .from('questions')
      .update(updatePayload)
      .eq('id', item.id);

    if (error) {
      console.error(`[ERRO] ${item.code} (${item.id}):`, error.message);
      erros++;
      relatorio.push({ id: item.id, code: item.code, status: 'ERROR', error: error.message });
    } else {
      sucessos++;
      relatorio.push({
        id: item.id,
        code: item.code,
        status: 'SUCCESS',
        gabarito: item.gabaritoDb,
        num: item.numOficial,
        simEnunciado: item.simEnunciado,
        simAlternativa: item.simAlternativa
      });
      if ((i + 1) % 10 === 0 || i === homologadas.length - 1) {
        console.log(`Progresso: ${i + 1}/${homologadas.length} aplicadas.`);
      }
    }
  }

  console.log(`\n========================================`);
  console.log(`RESULTADO DA APLICAÇÃO:`);
  console.log(`Sucessos: ${sucessos}`);
  console.log(`Erros: ${erros}`);
  console.log(`========================================`);

  fs.writeFileSync('data/relatorio_aplicacao_abem_96.json', JSON.stringify({
    data: new Date().toISOString(),
    total: homologadas.length,
    sucessos,
    erros,
    detalhes: relatorio
  }, null, 2), 'utf8');
}

applyAbem().catch(console.error);
