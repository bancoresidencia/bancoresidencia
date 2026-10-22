import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('ERRO: SUPABASE_SERVICE_ROLE_KEY não encontrada!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const QUESTION_FILES = [
  { name: 'Cirurgia', file: 'cirurgia_final_questions.json' },
  { name: 'Clínica Médica', file: 'clinica_medica_final_questions.json' },
  { name: 'Ginecologia', file: 'ginecologia_final_questions.json' },
  { name: 'Medicina Preventiva e Social', file: 'medicina_preventiva_final_questions.json' },
  { name: 'Obstetrícia', file: 'obstetricia_final_questions.json' },
  { name: 'Pediatria', file: 'pediatria_final_questions.json' },
  { name: 'Urologia', file: 'urologia_final_questions.json' }
];

async function updateSupabaseBatch(updates, batchSize = 100) {
  let done = 0;
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    // Usar upsert em lote para performance ultra-rápida
    const { error } = await supabase.from('questions').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.warn(`[Aviso lote ${Math.floor(i / batchSize) + 1}]:`, error.message);
      // Fallback linha por linha se lote falhar
      for (const row of batch) {
        await supabase.from('questions').update(row).eq('id', row.id);
      }
    }
    done += batch.length;
    process.stdout.write(`\r   Progresso Supabase: ${done}/${updates.length} (${((done/updates.length)*100).toFixed(1)}%)`);
  }
  console.log();
}

async function main() {
  console.log('='.repeat(90));
  console.log('🚀 EXECUÇÃO DA CORREÇÃO E SANEAMENTO COMPLETO DE GABARITOS (100% DO BANCO)');
  console.log('='.repeat(90));

  // 1. Carregar Checkpoints de Ouro
  console.log('\n📥 1. Carregando Checkpoints Homologados...');
  const goldGineco = JSON.parse(fs.readFileSync('data/checkpoints/ginecologia_gold_anchors_complete.json', 'utf8'));
  const goldGinecoMap = new Map(goldGineco.map(g => [g.id, g]));

  const goldAll = JSON.parse(fs.readFileSync('data/all_homologated_questions_gold.json', 'utf8'));
  const goldAllMap = new Map(goldAll.filter(q => q.id).map(q => [q.id, q]));

  const goldUro = JSON.parse(fs.readFileSync('data/checkpoints/urologia_gold_anchors_complete.json', 'utf8'));
  const goldUroMap = new Map(goldUro.map(u => [u.id, u]));

  const allSupabaseUpdates = [];

  // 2. Corrigir Ginecologia (4.951 divergências + 11.967 comentários de homologação)
  console.log('\n🩺 2. Corrigindo e Homologando GINECOLOGIA (13.246 questões)...');
  const ginPath = path.resolve('data/ginecologia_final_questions.json');
  const ginecoData = JSON.parse(fs.readFileSync(ginPath, 'utf8'));

  let ginFixedAnswers = 0;
  let ginFixedComments = 0;

  for (const q of ginecoData) {
    const gold = goldGinecoMap.get(q.id);
    if (!gold) continue;

    const goldAns = gold.official_answer;
    const isAnulada = gold.status === 'ANULADA_BANCA' || goldAns === 'ANULADA';
    const isDissertativa = gold.status === 'DISSERTATIVA' || goldAns === 'DISCURSIVA';

    const oldAns = (q.correct_answer || q.correctAnswer || '').trim().toUpperCase();
    const targetAns = (isAnulada || isDissertativa) ? null : goldAns;

    let needsUpdate = false;
    const dbRow = { id: q.id };

    if (oldAns !== (targetAns || '')) {
      q.correct_answer = targetAns || '';
      q.correctAnswer = targetAns || '';
      dbRow.correct_answer = targetAns;
      needsUpdate = true;
      ginFixedAnswers++;
    }

    if (q.is_anulada !== isAnulada || q.isAnulada !== isAnulada) {
      q.is_anulada = isAnulada;
      q.isAnulada = isAnulada;
      dbRow.is_anulada = isAnulada;
      needsUpdate = true;
    }

    // Limpar comentário provisório
    if ((q.commentary || '').includes('processo de homologação')) {
      const cleanComment = isAnulada
        ? 'Questão anulada oficialmente pela banca examinadora.'
        : (isDissertativa
            ? 'Questão discursiva da 2ª fase do processo seletivo.'
            : `Gabarito Oficial: Alternativa ${targetAns}.`);
      q.commentary = cleanComment;
      dbRow.commentary = cleanComment;
      needsUpdate = true;
      ginFixedComments++;
    }

    // Se o banco precisa de atualização
    if (needsUpdate) {
      dbRow.correct_answer = targetAns;
      dbRow.is_anulada = isAnulada;
      if (dbRow.commentary === undefined) dbRow.commentary = q.commentary || `Gabarito Oficial: Alternativa ${targetAns}.`;
      allSupabaseUpdates.push(dbRow);
    }
  }

  fs.writeFileSync(ginPath, JSON.stringify(ginecoData, null, 2));
  console.log(`✅ Ginecologia: ${ginFixedAnswers} gabaritos corrigidos | ${ginFixedComments} comentários provisórios saneados!`);

  // 3. Corrigir Urologia contra o Checkpoint Urologia
  console.log('\n🩺 3. Corrigindo e Homologando UROLOGIA (987 questões)...');
  const uroPath = path.resolve('data/urologia_final_questions.json');
  if (fs.existsSync(uroPath)) {
    const uroData = JSON.parse(fs.readFileSync(uroPath, 'utf8'));
    let uroFixed = 0;
    for (const q of uroData) {
      const gold = goldUroMap.get(q.id);
      if (!gold) continue;
      const goldAns = gold.official_answer;
      const isAnul = gold.status === 'ANULADA_BANCA' || goldAns === 'ANULADA';
      const isDisc = gold.status === 'DISSERTATIVA' || goldAns === 'DISCURSIVA';
      const targetAns = (isAnul || isDisc) ? null : goldAns;
      const oldAns = (q.correct_answer || q.correctAnswer || '').trim().toUpperCase();

      if (oldAns !== (targetAns || '')) {
        q.correct_answer = targetAns || '';
        q.correctAnswer = targetAns || '';
        q.is_anulada = isAnul;
        q.isAnulada = isAnul;
        allSupabaseUpdates.push({
          id: q.id,
          correct_answer: targetAns,
          is_anulada: isAnul,
          commentary: q.commentary || `Gabarito Oficial: Alternativa ${targetAns}.`
        });
        uroFixed++;
      }
    }
    fs.writeFileSync(uroPath, JSON.stringify(uroData, null, 2));
    console.log(`✅ Urologia: ${uroFixed} gabaritos atualizados contra checkpoint!`);
  }

  // 4. Corrigir Demais Especialidades contra o Checkpoint Gold Geral (Cirurgia, Preventiva, etc.)
  console.log('\n🩺 4. Corrigindo Demais Especialidades contra all_homologated_questions_gold...');
  for (const item of QUESTION_FILES) {
    if (['Ginecologia', 'Urologia'].includes(item.name)) continue;
    const fpath = path.join('data', item.file);
    if (!fs.existsSync(fpath)) continue;
    const data = JSON.parse(fs.readFileSync(fpath, 'utf8'));
    let specFixed = 0;

    for (const q of data) {
      const gold = goldAllMap.get(q.id);
      if (!gold) continue;
      const goldAns = (gold.correct_answer || gold.correctAnswer || gold.official_answer || '').trim().toUpperCase();
      if (!goldAns || !['A', 'B', 'C', 'D', 'E', 'ANULADA'].includes(goldAns)) continue;

      const isAnul = goldAns === 'ANULADA' || Boolean(gold.is_anulada || gold.isAnulada);
      const targetAns = isAnul ? null : goldAns;
      const oldAns = (q.correct_answer || q.correctAnswer || '').trim().toUpperCase();

      if (oldAns !== (targetAns || '')) {
        q.correct_answer = targetAns || '';
        q.correctAnswer = targetAns || '';
        q.is_anulada = isAnul;
        q.isAnulada = isAnul;
        allSupabaseUpdates.push({
          id: q.id,
          correct_answer: targetAns,
          is_anulada: isAnul,
          commentary: q.commentary || (isAnul ? 'Questão anulada oficialmente pela banca examinadora.' : `Gabarito Oficial: Alternativa ${targetAns}.`)
        });
        specFixed++;
      }
    }

    fs.writeFileSync(fpath, JSON.stringify(data, null, 2));
    console.log(`✅ [${item.name}]: ${specFixed} gabaritos corrigidos contra a base ouro.`);
  }

  // 5. Eliminar os 253 Gabaritos Impossíveis (Letra fora das Opções existentes)
  console.log('\n🧹 5. Saneando Questões com Letra de Resposta Impossível (Fora das Opções)...');
  let totalInvalidReset = 0;

  for (const item of QUESTION_FILES) {
    const fpath = path.join('data', item.file);
    if (!fs.existsSync(fpath)) continue;
    const data = JSON.parse(fs.readFileSync(fpath, 'utf8'));
    let countInFile = 0;

    for (const q of data) {
      const ans = (q.correct_answer || q.correctAnswer || '').trim().toUpperCase();
      const isAnul = Boolean(q.is_anulada || q.isAnulada || ans === 'ANULADA');
      const isDisc = q.type === 'Dissertativa' || ans === 'DISCURSIVA';
      const optLetters = (q.options || []).map(o => o.letter);

      // Se há opções e a letra indicada NÃO existe nelas
      if (!isAnul && !isDisc && ans && optLetters.length > 0 && !optLetters.includes(ans)) {
        q.correct_answer = '';
        q.correctAnswer = '';
        allSupabaseUpdates.push({
          id: q.id,
          correct_answer: null,
          commentary: 'Gabarito provisório removido por inconsistência com as alternativas originais da prova.'
        });
        countInFile++;
      }
    }

    if (countInFile > 0) {
      fs.writeFileSync(fpath, JSON.stringify(data, null, 2));
      console.log(`   - [${item.name}]: ${countInFile} gabaritos espúrios resetados.`);
      totalInvalidReset += countInFile;
    }
  }
  console.log(`✅ Total de gabaritos impossíveis resetados: ${totalInvalidReset}`);

  // 6. Aplicar Atualizações em Lote no Supabase
  console.log(`\n🚀 6. Enviando ${allSupabaseUpdates.length.toLocaleString('pt-BR')} atualizações para o Supabase em produção...`);
  
  // Deduplicar por ID
  const dedupedMap = new Map();
  allSupabaseUpdates.forEach(u => dedupedMap.set(u.id, u));
  const uniqueUpdates = Array.from(dedupedMap.values());
  console.log(`📦 Lote consolidado e deduplicado: ${uniqueUpdates.length.toLocaleString('pt-BR')} registros únicos.`);

  await updateSupabaseBatch(uniqueUpdates, 150);

  console.log('\n🎉 SANEAMENTO E HOMOLOGAÇÃO 100% CONCLUÍDOS!');
}

main().catch(console.error);
