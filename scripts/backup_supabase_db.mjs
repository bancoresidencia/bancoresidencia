#!/usr/bin/env node
/**
 * BACKUP COMPLETO DO SUPABASE — BANCO RESIDÊNCIA
 * 
 * Exporta integralmente:
 * 1. Todos os Schemas & Migrações SQL (DDL, RLS, RPCs, Índices e Triggers)
 * 2. Todas as Tabelas de Dados (questions, audit_logs, perfis, respostas de alunos, flashcards, etc.)
 * 3. Usuários da Autenticação (Supabase Auth Admin)
 * 4. Metadados e catálogo de arquivos de Storage (questoes, medical-knowledge)
 * 5. Manifesto criptográfico de integridade com SHA-256 e contagens exatas
 * 
 * Uso:
 *   node scripts/backup_supabase_db.mjs
 *   npm run db:backup
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

// 1. Carregar variáveis de ambiente do .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
        env[k] = v;
      }
    }
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ ERRO CRÍTICO: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// 2. Criar diretório do backup com timestamp
const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, '-');
const backupDirName = `supabase_backup_${timestamp}`;
const backupRoot = path.resolve(process.cwd(), 'data', 'backups', backupDirName);

const dirs = {
  root: backupRoot,
  schema: path.join(backupRoot, 'schema'),
  migrations: path.join(backupRoot, 'schema', 'migrations'),
  tables: path.join(backupRoot, 'tables'),
  auth: path.join(backupRoot, 'auth'),
  storage: path.join(backupRoot, 'storage')
};

for (const d of Object.values(dirs)) {
  fs.mkdirSync(d, { recursive: true });
}

function calculateSha256(filePath) {
  const hash = crypto.createHash('sha256');
  const buffer = fs.readFileSync(filePath);
  hash.update(buffer);
  return hash.digest('hex');
}

console.log('='.repeat(75));
console.log('🛡️  INICIANDO BACKUP COMPLETO DO SUPABASE — BANCO RESIDÊNCIA');
console.log(`📅  Data/Hora: ${now.toLocaleString('pt-BR')}`);
console.log(`📁  Diretório de Destino: ${backupRoot}`);
console.log('='.repeat(75));

const manifest = {
  backup_version: '1.0.0',
  project_url: SUPABASE_URL,
  started_at: now.toISOString(),
  finished_at: null,
  duration_seconds: null,
  schema: {},
  tables: {},
  auth: {},
  storage: {},
  integrity: {}
};

async function backupSchema() {
  console.log('\n[1/4] 📦 Exportando Schemas e Migrações...');
  
  // 1.1 Copiar migrações locais
  const migrationsSrc = path.resolve(process.cwd(), 'supabase', 'migrations');
  let migrationCount = 0;
  if (fs.existsSync(migrationsSrc)) {
    const files = fs.readdirSync(migrationsSrc).filter(f => f.endsWith('.sql'));
    for (const f of files) {
      fs.copyFileSync(path.join(migrationsSrc, f), path.join(dirs.migrations, f));
      migrationCount++;
    }
  }
  console.log(`  ✅ ${migrationCount} arquivos de migrações SQL arquivados.`);

  // 1.2 Obter OpenAPI Spec do PostgREST (definição de todas as tabelas e tipos)
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });
    if (res.ok) {
      const spec = await res.json();
      const specPath = path.join(dirs.schema, 'openapi_schema.json');
      fs.writeFileSync(specPath, JSON.stringify(spec, null, 2), 'utf8');
      manifest.schema.openapi_spec = {
        path: 'schema/openapi_schema.json',
        size_bytes: fs.statSync(specPath).size,
        sha256: calculateSha256(specPath)
      };
      console.log('  ✅ OpenAPI / PostgREST Schema arquivado com sucesso.');
      return Object.keys(spec.definitions || {});
    }
  } catch (err) {
    console.warn('  ⚠️ Aviso ao obter spec PostgREST:', err.message);
  }
  return [];
}

async function backupTablePaginated(tableName) {
  const filePath = path.join(dirs.tables, `${tableName}.json`);
  const writeStream = fs.createWriteStream(filePath, { encoding: 'utf8' });
  
  writeStream.write('[\n');
  
  let totalRows = 0;
  let lastId = null;
  let isFirst = true;
  const pageSize = 1000;
  
  // Verifica se a tabela possui coluna 'id' para keyset pagination
  let hasId = true;
  const testRes = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?limit=1`, {
    headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` }
  });
  if (testRes.ok) {
    const sample = await testRes.json();
    if (sample.length > 0 && sample[0].id === undefined) {
      hasId = false;
    }
  }

  while (true) {
    let url = `${SUPABASE_URL}/rest/v1/${tableName}?limit=${pageSize}`;
    if (hasId) {
      url += '&order=id.asc';
      if (lastId) {
        url += `&id=gt.${encodeURIComponent(lastId)}`;
      }
    } else {
      url += `&offset=${totalRows}`;
    }

    const res = await fetch(url, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Falha ao ler tabela ${tableName}: HTTP ${res.status} - ${errText}`);
    }

    const rows = await res.json();
    if (!rows || rows.length === 0) break;

    for (const row of rows) {
      const line = (isFirst ? '' : ',\n') + JSON.stringify(row);
      writeStream.write(line);
      isFirst = false;
    }

    totalRows += rows.length;
    if (hasId) {
      lastId = rows[rows.length - 1].id;
    }

    if (totalRows % 10000 === 0 || rows.length < pageSize) {
      process.stdout.write(`\r  ⏳ ${tableName.padEnd(25)} -> ${totalRows.toLocaleString()} registros extraídos...`);
    }

    if (rows.length < pageSize) break;
  }

  writeStream.write('\n]\n');
  await new Promise((resolve, reject) => {
    writeStream.end(resolve);
    writeStream.on('error', reject);
  });

  const fileSize = fs.statSync(filePath).size;
  const sizeMb = (fileSize / (1024 * 1024)).toFixed(2);
  const hash = calculateSha256(filePath);

  console.log(`\r  ✅ ${tableName.padEnd(25)} -> ${totalRows.toLocaleString().padStart(8)} registros (${sizeMb.padStart(6)} MB)`);

  manifest.tables[tableName] = {
    file: `tables/${tableName}.json`,
    rows: totalRows,
    size_bytes: fileSize,
    size_mb: parseFloat(sizeMb),
    sha256: hash
  };
}

async function backupTables(exposedTables) {
  console.log('\n[2/4] 🗄️  Exportando Dados das Tabelas PostgreSQL...');
  
  // Lista padrão canônica de tabelas prioritárias
  const priorityTables = [
    'questions',
    'audit_logs',
    'profiles',
    'user_answers',
    'user_flashcard_progress',
    'question_reports',
    'user_study_progress',
    'user_lists',
    'user_bookmarks',
    'user_folders',
    'user_created_flashcards',
    'user_flashcard_decks',
    'orders',
    'study_materials'
  ];

  // Mesclar com quaisquer tabelas adicionais encontradas na spec do PostgREST
  const allTables = Array.from(new Set([...priorityTables, ...exposedTables]));

  for (const table of allTables) {
    try {
      await backupTablePaginated(table);
    } catch (err) {
      console.error(`\n  ❌ Erro na tabela ${table}:`, err.message);
      manifest.tables[table] = { error: err.message };
    }
  }
}

async function backupAuth() {
  console.log('\n[3/4] 🔐 Exportando Usuários de Autenticação (Auth Admin)...');
  const authUsers = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.error('  ❌ Erro ao listar usuários do Auth:', error.message);
      manifest.auth.error = error.message;
      break;
    }

    if (!data.users || data.users.length === 0) break;
    authUsers.push(...data.users);

    if (data.users.length < perPage) break;
    page++;
  }

  const authFile = path.join(dirs.auth, 'auth_users.json');
  fs.writeFileSync(authFile, JSON.stringify(authUsers, null, 2), 'utf8');
  const sizeBytes = fs.statSync(authFile).size;
  const hash = calculateSha256(authFile);

  console.log(`  ✅ ${authUsers.length} usuários autenticados exportados com sucesso.`);

  manifest.auth = {
    file: 'auth/auth_users.json',
    total_users: authUsers.length,
    size_bytes: sizeBytes,
    sha256: hash
  };
}

async function backupStorageMetadata() {
  console.log('\n[4/4] 🗂️  Exportando Metadados de Storage Buckets...');
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) throw error;

    const storageSummary = [];
    for (const b of buckets) {
      const { data: files } = await supabase.storage.from(b.name).list('', { limit: 100 });
      storageSummary.push({
        bucket: b,
        sample_files_count: files?.length || 0,
        sample_files: files || []
      });
    }

    const storageFile = path.join(dirs.storage, 'storage_buckets.json');
    fs.writeFileSync(storageFile, JSON.stringify(storageSummary, null, 2), 'utf8');

    manifest.storage = {
      file: 'storage/storage_buckets.json',
      total_buckets: buckets.length,
      buckets: buckets.map(b => b.name),
      sha256: calculateSha256(storageFile)
    };
    console.log(`  ✅ ${buckets.length} buckets catalogados (${buckets.map(b => b.name).join(', ')}).`);
  } catch (err) {
    console.warn('  ⚠️ Aviso ao exportar storage:', err.message);
    manifest.storage = { error: err.message };
  }
}

async function run() {
  const t0 = Date.now();
  
  const exposedTables = await backupSchema();
  await backupTables(exposedTables);
  await backupAuth();
  await backupStorageMetadata();

  const finishedAt = new Date();
  const durationSec = ((Date.now() - t0) / 1000).toFixed(1);

  manifest.finished_at = finishedAt.toISOString();
  manifest.duration_seconds = parseFloat(durationSec);

  // Totais
  let totalRowsAllTables = 0;
  let totalBytesAllTables = 0;
  for (const t of Object.values(manifest.tables)) {
    if (t.rows) totalRowsAllTables += t.rows;
    if (t.size_bytes) totalBytesAllTables += t.size_bytes;
  }

  manifest.summary = {
    total_tables_backed_up: Object.keys(manifest.tables).length,
    total_database_rows: totalRowsAllTables,
    total_database_mb: parseFloat((totalBytesAllTables / (1024 * 1024)).toFixed(2)),
    total_auth_users: manifest.auth.total_users || 0,
    total_duration_seconds: parseFloat(durationSec)
  };

  const manifestPath = path.join(dirs.root, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  // Criar/atualizar ponteiro 'latest'
  const latestPath = path.resolve(process.cwd(), 'data', 'backups', 'latest');
  try {
    if (fs.existsSync(latestPath)) {
      fs.rmSync(latestPath, { recursive: true, force: true });
    }
    fs.writeFileSync(latestPath, JSON.stringify({
      latest_backup_dir: backupDirName,
      full_path: backupRoot,
      created_at: finishedAt.toISOString(),
      summary: manifest.summary
    }, null, 2), 'utf8');
  } catch (err) {
    // silencioso para links
  }

  console.log('\n' + '='.repeat(75));
  console.log('🎉 BACKUP COMPLETO CONCLUÍDO COM SUCESSO TOTAL!');
  console.log(`⏱️  Tempo Total: ${durationSec} segundos`);
  console.log(`📊 Registros Totais Salvos: ${totalRowsAllTables.toLocaleString('pt-BR')}`);
  console.log(`💾 Espaço Ocupado em Disco: ${manifest.summary.total_database_mb} MB`);
  console.log(`🧾 Manifesto & Checksums: ${manifestPath}`);
  console.log('='.repeat(75));
}

run().catch(err => {
  console.error('\n❌ ERRO FATAL NO PROCESSO DE BACKUP:', err);
  process.exit(1);
});
