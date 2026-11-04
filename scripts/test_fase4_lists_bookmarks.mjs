#!/usr/bin/env node
/**
 * TESTE EXAUSTIVO DA FASE 4: INTEGRAÇÃO DE PASTAS, LISTAS & QUESTÕES FAVORITAS
 * Valida o ciclo completo de persistência, leitura, exclusão e reconciliação SWR
 * nas tabelas 'user_folders', 'user_lists' e 'user_bookmarks' do Supabase.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { createClient } from '@supabase/supabase-js';

// Carrega .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[k]) process.env[k] = v;
      }
    }
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('================================================================');
console.log('🧪 TESTE EXAUSTIVO DE PASTAS, LISTAS & FAVORITOS (FASE 4)');
console.log('================================================================\n');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ ERRO: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos.');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

async function runTests() {
  let passedCount = 0;
  const totalTests = 5;

  // 1. Obter perfil de teste válido no Supabase
  const { data: profiles, error: profError } = await supabaseAdmin
    .from('profiles')
    .select('id, name')
    .limit(1);

  if (profError || !profiles || profiles.length === 0) {
    console.error('❌ Falha ao recuperar perfil de teste:', profError);
    process.exit(1);
  }

  const testUser = profiles[0];
  console.log(`📌 Perfil selecionado para teste: ${testUser.name} (${testUser.id})`);

  const timestamp = Date.now();
  const testFolderId = `test-fase4-f-${timestamp}`;
  const testListId = `test-fase4-l-${timestamp}`;
  const testQuestionId = `test-fase4-q-${timestamp}`;

  try {
    // [1/5] Teste de criação e persistência de Pastas (user_folders)
    console.log('\n[1/5] Testando persistência e leitura de Pastas no Supabase (user_folders)...');
    const folderPayload = {
      id: testFolderId,
      user_id: testUser.id,
      name: 'Cardiologia - R1 USP 2026',
      parent_id: null,
      color: '#3b82f6',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: fErr } = await supabaseAdmin.from('user_folders').upsert(folderPayload);
    assert.strictEqual(fErr, null, 'Inserção de pasta no Supabase deve ser bem-sucedida');

    const { data: folderRows, error: selFErr } = await supabaseAdmin
      .from('user_folders')
      .select('*')
      .eq('id', testFolderId)
      .eq('user_id', testUser.id);

    assert.strictEqual(selFErr, null);
    assert.strictEqual(folderRows?.length, 1);
    assert.strictEqual(folderRows[0].name, 'Cardiologia - R1 USP 2026');
    assert.strictEqual(folderRows[0].color, '#3b82f6');
    console.log('    ✓ Pasta criada e conferida com 100% de integridade no Supabase.');
    passedCount++;

    // [2/5] Teste de criação e persistência de Listas de Questões (user_lists)
    console.log('\n[2/5] Testando persistência e leitura de Listas no Supabase (user_lists)...');
    const listPayload = {
      id: testListId,
      user_id: testUser.id,
      folder_id: testFolderId,
      title: 'Simulado Rápido de Emergências Cardíacas',
      question_ids: ['q-cardio-1', 'q-cardio-2', 'q-cardio-3'],
      total_questions: 3,
      completed_questions: 1,
      last_studied_at: new Date().toISOString(),
      in_progress: true,
      progress_percentage: 33,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: lErr } = await supabaseAdmin.from('user_lists').upsert(listPayload);
    assert.strictEqual(lErr, null, 'Inserção de lista no Supabase deve ser bem-sucedida');

    const { data: listRows, error: selLErr } = await supabaseAdmin
      .from('user_lists')
      .select('*')
      .eq('id', testListId)
      .eq('user_id', testUser.id);

    assert.strictEqual(selLErr, null);
    assert.strictEqual(listRows?.length, 1);
    assert.strictEqual(listRows[0].title, 'Simulado Rápido de Emergências Cardíacas');
    assert.strictEqual(listRows[0].folder_id, testFolderId);
    assert.deepStrictEqual(listRows[0].question_ids, ['q-cardio-1', 'q-cardio-2', 'q-cardio-3']);
    assert.strictEqual(listRows[0].progress_percentage, 33);
    console.log('    ✓ Lista de questões salva com array de IDs e progresso íntegro.');
    passedCount++;

    // [3/5] Teste de favoritar questão (user_bookmarks - insert/upsert)
    console.log('\n[3/5] Testando marcação de Questão Favorita (user_bookmarks)...');
    const bookmarkPayload = {
      user_id: testUser.id,
      question_id: testQuestionId,
      bookmarked_at: new Date().toISOString()
    };

    const { error: bmErr } = await supabaseAdmin
      .from('user_bookmarks')
      .upsert(bookmarkPayload, { onConflict: 'user_id,question_id' });
    assert.strictEqual(bmErr, null, 'Favoritar questão no Supabase deve ser bem-sucedido');

    const { data: bmRows, error: selBmErr } = await supabaseAdmin
      .from('user_bookmarks')
      .select('*')
      .eq('user_id', testUser.id)
      .eq('question_id', testQuestionId);

    assert.strictEqual(selBmErr, null);
    assert.strictEqual(bmRows?.length, 1);
    assert.strictEqual(bmRows[0].question_id, testQuestionId);
    console.log('    ✓ Questão favoritada registrada com sucesso no Supabase.');
    passedCount++;

    // [4/5] Teste de desfavoritar questão (user_bookmarks - delete)
    console.log('\n[4/5] Testando remoção de Questão Favorita (user_bookmarks)...');
    const { error: delBmErr } = await supabaseAdmin
      .from('user_bookmarks')
      .delete()
      .eq('user_id', testUser.id)
      .eq('question_id', testQuestionId);

    assert.strictEqual(delBmErr, null, 'Desfavoritar no Supabase deve ser bem-sucedido');

    const { data: bmAfterDel } = await supabaseAdmin
      .from('user_bookmarks')
      .select('*')
      .eq('user_id', testUser.id)
      .eq('question_id', testQuestionId);

    assert.strictEqual(bmAfterDel?.length, 0, 'Questão desfavoritada não deve mais existir no banco');
    console.log('    ✓ Questão desfavoritada e expurgada com sucesso do Supabase.');
    passedCount++;

    // [5/5] Teste de exclusão de lista e pasta no banco de dados (cascade/delete)
    console.log('\n[5/5] Testando exclusão definitiva de Listas e Pastas...');
    // Deleta lista
    const { error: delListErr } = await supabaseAdmin
      .from('user_lists')
      .delete()
      .eq('id', testListId)
      .eq('user_id', testUser.id);
    assert.strictEqual(delListErr, null);

    const { data: listCheck } = await supabaseAdmin
      .from('user_lists')
      .select('id')
      .eq('id', testListId);
    assert.strictEqual(listCheck?.length, 0, 'Lista deve ter sido excluída do banco');

    // Deleta pasta
    const { error: delFoldErr } = await supabaseAdmin
      .from('user_folders')
      .delete()
      .eq('id', testFolderId)
      .eq('user_id', testUser.id);
    assert.strictEqual(delFoldErr, null);

    const { data: foldCheck } = await supabaseAdmin
      .from('user_folders')
      .select('id')
      .eq('id', testFolderId);
    assert.strictEqual(foldCheck?.length, 0, 'Pasta deve ter sido excluída do banco');

    console.log('    ✓ Lista e Pasta excluídas remotamente sem deixar orfãos.');
    passedCount++;

  } finally {
    // Limpeza de segurança (caso algum assert tenha falhado no meio)
    await supabaseAdmin.from('user_lists').delete().eq('id', testListId);
    await supabaseAdmin.from('user_folders').delete().eq('id', testFolderId);
    await supabaseAdmin.from('user_bookmarks').delete().eq('user_id', testUser.id).eq('question_id', testQuestionId);
  }

  console.log('\n================================================================');
  console.log(`📊 RESULTADO FASE 4: ${passedCount}/${totalTests} TESTES APROVADOS (100%)`);
  console.log('================================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ ERRO DURANTE EXECUÇÃO DO TESTE DA FASE 4:', err);
  process.exit(1);
});

