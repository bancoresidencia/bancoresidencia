import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { solveQuestionDeep, PAID_KEY, API_KEYS } from './solve_questions_engine.mjs';

// Carrega variáveis do ambiente
const env = { ...process.env };
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

console.log('================================================================================');
console.log('VERIFICAÇÃO DE CHAVE E SUPABASE:');
console.log(`- Chave Paga ativa: ${!!PAID_KEY}`);
console.log(`- Total de chaves no pool: ${API_KEYS.length} (Uso exclusivo da chave paga: ${API_KEYS.length === 1 && !!PAID_KEY})`);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: Credenciais do Supabase não encontradas.');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

const DB_PATH = 'data/clinica_medica_final_questions.json';
const questions = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

const targetIndices = [];
questions.forEach((q, idx) => {
  if (
    q.especialidade === 'Clínica Médica' &&
    q.tema === 'Neurologia' &&
    q.foco === 'AVC Hemorrágico' &&
    q.subfoco === 'AVC Hemorrágico'
  ) {
    targetIndices.push(idx);
  }
});

console.log(`- Questões alvo encontradas na base local: ${targetIndices.length}`);
console.log('================================================================================\n');

async function run() {
  const syncResults = [];

  for (let i = 0; i < targetIndices.length; i++) {
    const idx = targetIndices[i];
    const q = questions[idx];

    console.log(`\n[${i + 1}/${targetIndices.length}] Processando com CHAVE PAGA: ID ${q.id} (${q.code})`);
    console.log(`Banca: ${q.banca} (${q.year}) | Gabarito: ${q.correct_answer || q.correctAnswer}`);
    
    const t0 = Date.now();
    const solved = await solveQuestionDeep(q);
    const elapsed = ((Date.now() - t0) / 1000).toFixed(2);

    console.log(`⚡ Concluído em ${elapsed}s!`);
    console.log(`- finalCommentary (${solved.finalCommentary.length} chars): "${solved.finalCommentary.slice(0, 100)}..."`);

    // Atualiza base local
    questions[idx] = {
      ...q,
      ...solved,
      updatedAt: new Date().toISOString()
    };

    // Prepara payload para o Supabase
    const supabasePayload = {
      commentary: solved.commentary,
      options: solved.options || []
    };

    console.log(`📤 Enviando atualização para o Supabase (ID: ${q.id})...`);
    const { error: supaErr } = await supabase
      .from('questions')
      .update(supabasePayload)
      .eq('id', q.id);

    if (supaErr) {
      console.error(`❌ Erro ao atualizar no Supabase:`, supaErr);
      syncResults.push({ id: q.id, success: false, error: supaErr.message });
    } else {
      console.log(`✅ Supabase atualizado com sucesso para questão ${q.id}!`);
      syncResults.push({ id: q.id, success: true, length: solved.commentary.length });
    }
  }

  // Salva no banco local
  fs.writeFileSync(DB_PATH, JSON.stringify(questions, null, 2), 'utf8');
  console.log(`\n💾 Base local '${DB_PATH}' atualizada com sucesso.`);

  // Verificação final no Supabase
  console.log('\n🔍 Verificando integridade no Supabase agora...');
  const targetIds = targetIndices.map(idx => questions[idx].id);
  const { data: supaCheck, error: checkErr } = await supabase
    .from('questions')
    .select('id, code, commentary, options')
    .in('id', targetIds);

  if (checkErr) {
    console.error('Erro na checagem final:', checkErr);
  } else {
    console.log('📊 Estado confirmado no Supabase:');
    supaCheck.forEach((row, i) => {
      console.log(`  ${i + 1}. ID: ${row.id} | Código: ${row.code} | Comentário gravado: ${!!row.commentary} (${row.commentary ? row.commentary.length : 0} chars) | Opções com explicação: ${(row.options || []).filter(o => o.explanation).length}`);
    });
  }
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

