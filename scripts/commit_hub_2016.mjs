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

async function main() {
  const readyData = JSON.parse(fs.readFileSync('data/ready_to_commit_hub_2016.json', 'utf8'));
  console.log(`Carregadas ${readyData.length} questões para comitar no Supabase.`);

  let committed = 0;
  const committedLog = [];

  for (let i = 0; i < readyData.length; i++) {
    const item = readyData[i];
    
    // REGRA DE OURO: Atualizar ESTRITAMENTE correct_answer
    const { error } = await supabase
      .from('questions')
      .update({ correct_answer: item.correct_answer })
      .eq('id', item.id);

    if (error) {
      console.error(`❌ Erro ao salvar ${item.code} (${item.id}):`, error);
      continue;
    }

    committed++;
    const logEntry = `[${committed}/${readyData.length}] Gravada no Supabase: ${item.code} -> Gabarito '${item.correct_answer}' (${item.cebraspe_ans === 'C' ? 'Certo' : 'Errado'}) | Prova: ${item.pdf} Item ${item.item_num}`;
    console.log(logEntry);
    committedLog.push({
      index: committed,
      id: item.id,
      code: item.code,
      correct_answer: item.correct_answer,
      cebraspe_ans: item.cebraspe_ans,
      pdf: item.pdf,
      item_num: item.item_num,
      stmt_snippet: item.stmt_snippet
    });
  }

  fs.writeFileSync('data/committed_hub_2016_log.json', JSON.stringify(committedLog, null, 2), 'utf8');
  console.log(`\n🎉 FINALIZADO: ${committed} de ${readyData.length} questões gravadas com sucesso no Supabase!`);
}

main().catch(console.error);
