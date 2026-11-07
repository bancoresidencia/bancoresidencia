import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { solveQuestionDeep, PAID_KEY } from './solve_questions_engine.mjs';

const env = { ...process.env };
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const r10 = JSON.parse(fs.readFileSync('C:/Users/froge/.gemini/antigravity/brain/7b3c779d-de2a-4d34-9e11-0f56afb8dcbf/scratch/resolved_10_output.json', 'utf8'));
const r3 = JSON.parse(fs.readFileSync('C:/Users/froge/.gemini/antigravity/brain/7b3c779d-de2a-4d34-9e11-0f56afb8dcbf/scratch/test_3_results.json', 'utf8'));
const r4 = JSON.parse(fs.readFileSync('C:/Users/froge/.gemini/antigravity/brain/7b3c779d-de2a-4d34-9e11-0f56afb8dcbf/scratch/resolved_4_avc_hemorragico.json', 'utf8'));

const allChatIds = [
  '10e76580-a740-4708-b318-48b12c7fe597',
  'c1b750cf-9f7f-46f9-866f-8e860bf436d0',
  '3a13087b-ffd2-4422-9fed-b97e688341c7',
  'ffed3e25-82f1-4cf2-ba32-9ad49fcf97cf',
  '69cd133a-45a8-4a3d-9060-21791b7958c6',
  '61811d7d-16a6-4def-a384-0d0823c5dcc4',
  '4e1540f8-eecf-4ebf-a1a3-69a4c5e570b2',
  '0b257dbd-0cac-4bc4-90ff-0baf889e4bd4',
  '57ee1182-b696-4151-91d8-ea21c1a20aa9',
  'd025af0f-10d4-409b-b91a-7bb63b3a1a2e',
  '60aa48ce-2430-4f7a-bfab-f5c48b3a4d85',
  '568ebfb1-9c70-44e8-8ab9-61b2c40cca4f',
  '5e5f6e88-46e8-4b27-9c72-f2ddfb668030',
  '6c998a2d-0c7c-4787-8a07-731c5c2f745e',
  '17004dcf-f0b1-4106-8196-56a2b471ca7a',
  '75a8fb9f-0851-4171-899e-37c5a0ec341e',
  '85ac3a97-5436-4382-87ea-8ae4fed8fde6',
  '3202ab2d-e6d7-42e4-8e4e-30e628a1b810'
];

async function syncAll() {
  console.log(`Verificando e sincronizando todas as ${allChatIds.length} questões feitas no chat para o Supabase...`);

  // Carrega todas as bases de questões locais para buscar registros completos
  const clinicaList = JSON.parse(fs.readFileSync('data/clinica_medica_final_questions.json', 'utf8'));
  const allResolvedMap = new Map();
  [...r10, ...r3, ...r4].forEach(q => allResolvedMap.set(q.id, q));

  for (const id of allChatIds) {
    const { data: current } = await supabase
      .from('questions')
      .select('id, code, commentary, options')
      .eq('id', id)
      .single();

    if (current && current.commentary && current.commentary.trim().length > 100) {
      console.log(`✓ ID ${id} (${current.code}) já está sincronizado no Supabase (${current.commentary.length} chars).`);
      continue;
    }

    console.log(`\n⏳ Sincronizando ID pendente: ${id}...`);
    let qData = allResolvedMap.get(id);

    // Se não tiver em allResolvedMap ou se precisar de resolução padrão:
    if (!qData || !qData.commentary) {
      const foundInClinica = clinicaList.find(q => q.id === id);
      if (foundInClinica) {
        console.log(`Resolvendo ${id} (${foundInClinica.code}) com Chave PAGA...`);
        const solved = await solveQuestionDeep(foundInClinica);
        qData = { ...foundInClinica, ...solved };
      }
    }

    if (qData) {
      const payload = {
        commentary: qData.commentary,
        options: qData.options || []
      };
      const { error } = await supabase
        .from('questions')
        .update(payload)
        .eq('id', id);

      if (error) {
        console.error(`❌ Erro ao atualizar ID ${id}:`, error);
      } else {
        console.log(`✅ ID ${id} sincronizado com sucesso no Supabase!`);
      }
    }
  }

  // Verificação final no Supabase
  console.log('\n🔍 Conferência final de todas as 18 questões no Supabase:');
  const { data: finalCheck } = await supabase
    .from('questions')
    .select('id, code, commentary')
    .in('id', allChatIds);

  const syncedCount = (finalCheck || []).filter(r => !!r.commentary && r.commentary.length > 50).length;
  console.log(`Resultado: ${syncedCount} de ${allChatIds.length} questões com comentário completo gravado no Supabase.`);
}

syncAll().catch(console.error);

