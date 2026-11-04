#!/usr/bin/env node
/**
 * TESTE EXAUSTIVO DE TABELAS & SCHEMAS — SUPABASE FASE 1
 * Valida a existência e integridade das 9 tabelas e colunas da integração do aluno.
 */
import fs from 'node:fs';
import path from 'node:path';

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
console.log('🧪 DIAGNÓSTICO EXAUSTIVO DE SCHEMAS E TABELAS (FASE 1)');
console.log('================================================================');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ ERRO: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos.');
  process.exit(1);
}

const targetTables = [
  { name: 'user_answers', requiredCols: ['specialty', 'tema', 'foco', 'subfoco', 'difficulty', 'banca', 'year', 'error_reason', 'student_notes', 'status_retrial', 'attempts'] },
  { name: 'user_folders', requiredCols: ['id', 'user_id', 'name', 'parent_id', 'color', 'created_at', 'updated_at'] },
  { name: 'user_lists', requiredCols: ['id', 'user_id', 'folder_id', 'title', 'question_ids', 'total_questions', 'completed_questions', 'progress_percentage'] },
  { name: 'study_materials', requiredCols: ['id', 'title', 'specialty', 'theme', 'focus', 'markdown_content', 'status'] },
  { name: 'user_study_progress', requiredCols: ['user_id', 'material_id', 'last_read_at', 'read_time_minutes', 'is_completed'] },
  { name: 'user_flashcard_progress', requiredCols: ['user_id', 'card_id', 'state', 'repetitions', 'interval_days', 'ease_factor', 'stability', 'difficulty', 'retrievability', 'next_review_date'] },
  { name: 'user_flashcard_decks', requiredCols: ['id', 'user_id', 'title', 'card_ids'] },
  { name: 'user_created_flashcards', requiredCols: ['id', 'user_id', 'front', 'back', 'specialty'] },
  { name: 'profiles', requiredCols: ['preferences', 'target_exam_name', 'target_exam_date'] }
];

async function checkCatalog() {
  const openApiRes = await fetch(`${SUPABASE_URL}/rest/v1/?apikey=${SERVICE_KEY}`, {
    headers: { 'Authorization': `Bearer ${SERVICE_KEY}` }
  });

  if (!openApiRes.ok) {
    console.error(`❌ Falha ao consultar catálogo OpenAPI: HTTP ${openApiRes.status}`);
    return false;
  }

  const spec = await openApiRes.json();
  const defs = spec.definitions || {};
  let totalMissing = 0;

  for (const item of targetTables) {
    const def = defs[item.name];
    if (!def) {
      console.log(`❌ [TABELA AUSENTE] ${item.name}`);
      totalMissing++;
      continue;
    }

    const availableProps = new Set(Object.keys(def.properties || {}));
    const missingCols = item.requiredCols.filter(col => !availableProps.has(col));

    if (missingCols.length > 0) {
      console.log(`⚠️  [COLUNAS PENDENTES] ${item.name} -> Faltam: ${missingCols.join(', ')}`);
      totalMissing++;
    } else {
      console.log(`✅ [OK 100%] ${item.name} (${item.requiredCols.length} colunas validadas)`);
    }
  }

  return totalMissing === 0;
}

async function run() {
  const isHealthy = await checkCatalog();
  console.log('\n================================================================');
  if (isHealthy) {
    console.log('🎉 SUCESSO ABSOLUTO: Todas as tabelas e colunas da Fase 1 estão ativas!');
    process.exit(0);
  } else {
    console.log('📌 PENDÊNCIA IDENTIFICADA:');
    console.log('   Execute o script unificado "supabase/migrations/015_full_student_integration_schema.sql"');
    console.log('   no SQL Editor do Supabase para registrar as tabelas no PostgreSQL:');
    console.log('   👉 https://supabase.com/dashboard/project/ezluharxlmlqhdkqrjbz/sql/new');
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Erro na execução:', err);
  process.exit(1);
});

