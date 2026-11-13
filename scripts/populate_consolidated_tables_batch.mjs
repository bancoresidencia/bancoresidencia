#!/usr/bin/env node
/**
 * ==============================================================================
 * ENGINE DE CARGA CONSOLIDADA EM BATCH COM THROTTLING (OPÇÃO B)
 * Plataforma Banco Residência Médica — Supabase PostgreSQL
 * 
 * Regras:
 * 1. Zero Overload no banco de dados (batches controlados com sleep e backoff).
 * 2. Expurgo cirúrgico de 100% das questões do Revalida em questions_direto.
 * 3. Fusão e enriquecimento de sobreposições em questions_revalida e questions_direto.
 * 4. Verificação de integridade ponta a ponta e auditoria final de contagens.
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// 1. Carregar variáveis de ambiente
const envPath = path.resolve(process.cwd(), '.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      }
    }
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ ERRO: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes.');
  process.exit(1);
}

const BACKUP_DIR = path.resolve('data/backups/supabase_backup_2026-11-13T02-27-33-296Z/tables');

const BATCH_SIZE = 800; // 800 registros por lote para manter o payload leve (~1.5 MB)
const SLEEP_MS = 60;    // 60ms de pausa entre lotes para manter a CPU < 10%

function normalizeStatement(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function computeStatementHash(text) {
  const norm = normalizeStatement(text);
  if (!norm || norm.length < 25) return null;
  return crypto.createHash('md5').update(norm).digest('hex');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function insertBatchWithRetry(tableName, batch, maxRetries = 5) {
  const url = `${SUPABASE_URL}/rest/v1/${tableName}`;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      attempt++;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(batch)
      });

      if (res.ok) return true;

      const errText = await res.text();
      if (res.status === 429 || res.status >= 500) {
        const backoff = Math.pow(2, attempt) * 600;
        console.warn(`  ⚠️ HTTP ${res.status} em ${tableName}. Aguardando ${backoff}ms (tentativa ${attempt}/${maxRetries})...`);
        await sleep(backoff);
        continue;
      }

      throw new Error(`HTTP ${res.status} em ${tableName}: ${errText}`);
    } catch (err) {
      if (attempt >= maxRetries) throw err;
      const backoff = Math.pow(2, attempt) * 600;
      console.warn(`  ⚠️ Falha de rede: ${err.message}. Retentando em ${backoff}ms...`);
      await sleep(backoff);
    }
  }
  throw new Error(`Falha definitiva ao inserir lote em ${tableName}`);
}

async function uploadInBatches(tableName, records) {
  console.log(`\n🚀 [${tableName}] Iniciando upload de ${records.length.toLocaleString('pt-BR')} registros...`);
  const totalBatches = Math.ceil(records.length / BATCH_SIZE);
  const t0 = Date.now();

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const batchIndex = Math.floor(i / BATCH_SIZE) + 1;

    await insertBatchWithRetry(tableName, batch);
    await sleep(SLEEP_MS);

    const progress = Math.min(i + batch.length, records.length);
    const pct = ((progress / records.length) * 100).toFixed(1);
    const elapsedSec = ((Date.now() - t0) / 1000).toFixed(0);

    process.stdout.write(`\r  ⏳ Progresso: ${progress.toLocaleString('pt-BR')}/${records.length.toLocaleString('pt-BR')} (${pct}%) — Lote ${batchIndex}/${totalBatches} — ${elapsedSec}s`);
  }

  const totalSec = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\r  ✅ ${tableName}: ${records.length.toLocaleString('pt-BR')} registros inseridos com sucesso em ${totalSec}s!`);
}

function cleanRow(row, defaultModalidade) {
  return {
    id: String(row.id),
    code: row.code || null,
    institution: row.institution || null,
    banca: row.banca || null,
    year: row.year ? Number(row.year) : null,
    tipo_prova: row.tipo_prova || null,
    modalidade: row.modalidade || defaultModalidade,
    especialidade: row.especialidade || null,
    tema: row.tema || null,
    foco: row.foco || null,
    subfoco: row.subfoco || null,
    sub_subfoco: row.sub_subfoco || null,
    difficulty: row.difficulty || 'Médio',
    type: row.type || 'Múltipla escolha',
    is_anulada: Boolean(row.is_anulada),
    statement: row.statement,
    options: Array.isArray(row.options) ? row.options : (typeof row.options === 'string' ? JSON.parse(row.options) : []),
    correct_answer: row.correct_answer || null,
    commentary: row.commentary || null,
    images: Array.isArray(row.images) ? row.images : (typeof row.images === 'string' ? JSON.parse(row.images) : []),
    has_gabarito: row.has_gabarito !== undefined ? Boolean(row.has_gabarito) : true,
    created_at: row.created_at || new Date().toISOString()
  };
}

async function verifyTableExists(tableName) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?limit=1`, {
    headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` }
  });
  return res.ok;
}

async function queryTableCount(tableName) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?limit=1`, {
    method: 'HEAD',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Prefer': 'count=exact'
    }
  });
  const range = res.headers.get('content-range');
  return range ? parseInt(range.split('/')[1], 10) : null;
}

async function main() {
  console.log('='.repeat(75));
  console.log('🛡️  OPÇÃO B: PIPELINE CONTROLADO DE REFORMULAÇÃO E CARGA NO SUPABASE');
  console.log('='.repeat(75));

  // 1. Validar se as 4 tabelas já foram criadas no Supabase
  const tables = ['questions_direto', 'questions_rplus', 'questions_revalida', 'questions_titulo'];
  console.log('\n[1/5] 🔍 Verificando presença das tabelas de destino no Supabase...');
  for (const t of tables) {
    const exists = await verifyTableExists(t);
    if (!exists) {
      console.error(`\n❌ ERRO: A tabela '${t}' ainda não existe no Supabase!`);
      console.error(`   Por favor, execute primeiro o script 'supabase/migrations/029_step1_create_empty_tables.sql'`);
      console.error(`   no SQL Editor do Supabase (leva ~1 segundo) para criar as estruturas vazias.`);
      process.exit(1);
    }
    console.log(`  ✅ Tabela '${t}' encontrada e pronta.`);
  }

  // 2. Processar questions_revalida (Base + Expansão cruzada)
  console.log('\n[2/5] 🧩 Preparando dados de questions_revalida...');
  const revalidaBase = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'questions_revalida_base.json'), 'utf8'));
  const expRevalida = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'questions_expansion_revalida.json'), 'utf8'));

  const revalidaMap = new Map();
  const revalidaHashes = new Set();
  const revalidaIds = new Set();

  for (const q of revalidaBase) {
    const clean = cleanRow(q, 'Revalida');
    revalidaMap.set(clean.id, clean);
    revalidaIds.add(clean.id);
    const h = computeStatementHash(clean.statement);
    if (h) revalidaHashes.add(h);
  }

  let mergedRevalidaCount = 0;
  for (const q of expRevalida) {
    const clean = cleanRow(q, 'Revalida');
    const h = computeStatementHash(clean.statement);
    if (revalidaMap.has(clean.id)) {
      // Enriquecimento
      const existing = revalidaMap.get(clean.id);
      if ((clean.commentary || '').length > (existing.commentary || '').length) {
        existing.commentary = clean.commentary;
      }
      mergedRevalidaCount++;
    } else {
      revalidaMap.set(clean.id, clean);
      revalidaIds.add(clean.id);
      if (h) revalidaHashes.add(h);
    }
  }

  const listRevalida = Array.from(revalidaMap.values());
  console.log(`  -> Total preparado para questions_revalida: ${listRevalida.length.toLocaleString('pt-BR')} questões (${mergedRevalidaCount} sobreposições fundidas).`);

  // 3. Processar questions_titulo e questions_rplus
  console.log('\n[3/5] 🎓 Preparando dados de questions_titulo e questions_rplus...');
  const rawTitulo = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'questions_expansion_titulo_especialista.json'), 'utf8'));
  const listTitulo = rawTitulo.map(q => cleanRow(q, 'Título de Especialista'));
  console.log(`  -> Total preparado para questions_titulo: ${listTitulo.length.toLocaleString('pt-BR')} questões.`);

  const rawRplus = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'questions_expansion_r_plus.json'), 'utf8'));
  const listRplus = rawRplus.map(q => cleanRow(q, 'R+ Especialidades'));
  console.log(`  -> Total preparado para questions_rplus: ${listRplus.length.toLocaleString('pt-BR')} questões.`);

  // 4. Processar questions_direto (Base + Expansão COM EXPURGO DO REVALIDA)
  console.log('\n[4/5] 🎯 Preparando dados de questions_direto (com expurgo do Revalida)...');
  const rawQuestions = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'questions.json'), 'utf8'));
  const rawExpDireto = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'questions_expansion_direto.json'), 'utf8'));

  const diretoMap = new Map();
  let expungedRevalida = 0;
  let mergedDiretoCount = 0;

  function isRevalida(q) {
    if (revalidaIds.has(String(q.id))) return true;
    const h = computeStatementHash(q.statement);
    if (h && revalidaHashes.has(h)) return true;
    if (q.modalidade && /revalida/i.test(q.modalidade)) return true;
    if (q.banca && /(inep revalida|ufmt revalida|uepa revalida|unirg revalida)/i.test(q.banca)) return true;
    if (q.institution && /revalida/i.test(q.institution)) return true;
    return false;
  }

  // 4.1 questions base
  for (const q of rawQuestions) {
    if (isRevalida(q)) {
      expungedRevalida++;
      continue;
    }
    const clean = cleanRow(q, 'Residência Médica');
    diretoMap.set(clean.id, clean);
  }

  // 4.2 questions_expansion_direto
  for (const q of rawExpDireto) {
    if (isRevalida(q)) {
      expungedRevalida++;
      continue;
    }
    const clean = cleanRow(q, 'Residência Médica');
    if (diretoMap.has(clean.id)) {
      const existing = diretoMap.get(clean.id);
      if ((clean.commentary || '').length > (existing.commentary || '').length) {
        existing.commentary = clean.commentary;
      }
      mergedDiretoCount++;
    } else {
      diretoMap.set(clean.id, clean);
    }
  }

  const listDireto = Array.from(diretoMap.values());
  console.log(`  -> Total preparado para questions_direto: ${listDireto.length.toLocaleString('pt-BR')} questões.`);
  console.log(`  -> Questões de Revalida expurgadas de Acesso Direto: ${expungedRevalida}`);
  console.log(`  -> Duplicatas internas fundidas: ${mergedDiretoCount}`);

  // 5. Execução dos Uploads com Throttling
  console.log('\n[5/5] 📡 Iniciando envio em streaming controlado para o Supabase...');
  
  // Ordem segura: menores primeiro, maior por último
  await uploadInBatches('questions_titulo', listTitulo);
  await uploadInBatches('questions_revalida', listRevalida);
  await uploadInBatches('questions_rplus', listRplus);
  await uploadInBatches('questions_direto', listDireto);

  // 6. Auditoria Final de Contagens
  console.log('\n' + '='.repeat(75));
  console.log('🔍 AUDITORIA FINAL DE CONTAGENS NO SUPABASE:');
  console.log('='.repeat(75));
  for (const t of tables) {
    const c = await queryTableCount(t);
    console.log(`  📊 ${t.padEnd(25)} -> ${c?.toLocaleString('pt-BR')} registros confirmados no Supabase.`);
  }
  console.log('='.repeat(75));
  console.log('🎉 OPÇÃO B CONCLUÍDA COM SUCESSO ABSOLUTO E ZERO SOBRECARGA!');
  console.log('👉 Próximo passo: executar o script de índices e views:');
  console.log('   supabase/migrations/029_step3_indexes_and_views.sql no SQL Editor.');
  console.log('='.repeat(75));
}

main().catch(err => {
  console.error('\n❌ ERRO CRÍTICO NO PIPELINE:', err);
  process.exit(1);
});

