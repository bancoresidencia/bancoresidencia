import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSpecialty(name, filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`Arquivo não encontrado: ${filePath}`);
    return;
  }

  const list = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const goldList = list.filter(q => !!q.finalCommentary || (q.commentary && q.commentary.includes('Take-Home Message:')));
  
  if (goldList.length === 0) {
    console.log(`[${name}] Nenhuma questão com padrão-ouro gerado localmente.`);
    return;
  }

  console.log(`\n============================================================`);
  console.log(`🔍 [${name}] Total com Padrão-Ouro local: ${goldList.length}`);
  console.log(`============================================================`);

  const ids = goldList.map(q => q.id);
  const BATCH_SIZE = 100;

  let inSupaWithGold = 0;
  let inSupaOtherComm = 0;
  let inSupaEmpty = 0;
  let notInSupa = 0;
  const missingGoldIds = [];

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase
      .from('questions')
      .select('id, code, commentary')
      .in('id', batch);

    if (error) {
      console.error(`Erro no lote ${i}:`, error.message);
      continue;
    }

    const map = new Map(data.map(d => [d.id, d]));
    for (const id of batch) {
      const row = map.get(id);
      if (!row) {
        notInSupa++;
      } else {
        const comm = row.commentary || '';
        if (comm.includes('Take-Home Message:')) {
          inSupaWithGold++;
        } else if (comm.trim().length > 50) {
          inSupaOtherComm++;
          missingGoldIds.push({ id, code: row.code, status: 'TEM_LEGADO_MAS_FALTA_PADRAO_OURO' });
        } else {
          inSupaEmpty++;
          missingGoldIds.push({ id, code: row.code, status: 'SEM_COMENTARIO_TOTAL' });
        }
      }
    }
  }

  console.log(`- Presentes no Supabase COM comentário Padrão-Ouro: ${inSupaWithGold}`);
  console.log(`- Presentes no Supabase COM comentário legado (não é o nosso Padrão-Ouro): ${inSupaOtherComm}`);
  console.log(`- Presentes no Supabase TOTALMENTE SEM comentário: ${inSupaEmpty}`);
  console.log(`- IDs locais não encontrados no Supabase (staged/fora da base ativa): ${notInSupa}`);
  console.log(`📌 TOTAL PENDENTE DE SUBIR PADRÃO-OURO NO SUPABASE: ${inSupaOtherComm + inSupaEmpty}`);

  return {
    name,
    totalGoldLocal: goldList.length,
    inSupaWithGold,
    inSupaOtherComm,
    inSupaEmpty,
    notInSupa,
    totalPendingInSupa: inSupaOtherComm + inSupaEmpty,
    sampleMissing: missingGoldIds.slice(0, 5)
  };
}

async function main() {
  const specs = [
    { name: 'Obstetrícia', path: 'data/obstetricia_final_questions.json' },
    { name: 'Ginecologia', path: 'data/ginecologia_final_questions.json' },
    { name: 'Urologia', path: 'data/urologia_final_questions.json' },
    { name: 'Clínica Médica', path: 'data/clinica_medica_final_questions.json' },
    { name: 'Cirurgia', path: 'data/cirurgia_final_questions.json' },
    { name: 'Pediatria', path: 'data/pediatria_final_questions.json' },
  ];

  const summary = [];
  for (const s of specs) {
    const res = await checkSpecialty(s.name, s.path);
    if (res) summary.push(res);
  }

  console.log('\n\n============================================================');
  console.log('📊 RESUMO CONSOLIDADO: COMENTÁRIOS PADRÃO-OURO GERADOS');
  console.log('============================================================');
  console.table(summary.map(s => ({
    Especialidade: s.name,
    'Padrão-Ouro Local': s.totalGoldLocal,
    'Sincronizado Supabase': s.inSupaWithGold,
    'Com Legado no Supabase': s.inSupaOtherComm,
    'Vazio no Supabase': s.inSupaEmpty,
    'Pendente Atualizar Supa': s.totalPendingInSupa,
    'Fora da Base Ativa': s.notInSupa
  })));
}

main().catch(console.error);
