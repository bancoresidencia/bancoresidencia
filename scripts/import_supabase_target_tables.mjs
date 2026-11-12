#!/usr/bin/env node
/**
 * IMPORTAÇÃO DAS TABELAS DO SUPABASE:
 * - questions
 * - questions_expansion_r_plus
 * - questions_expansion_direto
 * - questions_expansion_revalida
 * - questions_expansion_titulo_especialista
 * 
 * Exporta os dados diretamente do Supabase via PostgREST keyset pagination,
 * gerando arquivos JSON canônicos e banco SQLite relacional com integridade SHA-256.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

// 1. Carrega variáveis de ambiente (.env.local)
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
  console.error('❌ ERRO: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados em .env.local');
  process.exit(1);
}

const TARGET_TABLES = [
  'questions_expansion_titulo_especialista',
  'questions_expansion_revalida',
  'questions_expansion_r_plus',
  'questions_expansion_direto',
  'questions'
];

const OUT_DIR = path.resolve(process.cwd(), 'data', 'supabase_tables');
const TABLES_DIR = path.resolve(process.cwd(), 'data', 'tables');
const DATA_ROOT = path.resolve(process.cwd(), 'data');

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(TABLES_DIR, { recursive: true });

function calculateSha256(filePath) {
  const hash = crypto.createHash('sha256');
  const buffer = fs.readFileSync(filePath);
  hash.update(buffer);
  return hash.digest('hex');
}

async function fetchWithRetry(url, options, maxRetries = 5) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      attempt++;
      const res = await fetch(url, options);
      if (res.ok) return res;
      if (res.status === 429 || res.status >= 500) {
        const backoff = Math.pow(2, attempt) * 500;
        console.warn(`  ⚠️ HTTP ${res.status} em ${url}. Tentando novamente em ${backoff}ms (tentativa ${attempt}/${maxRetries})...`);
        await new Promise(r => setTimeout(r, backoff));
        continue;
      }
      const errText = await res.text();
      throw new Error(`HTTP ${res.status} - ${errText}`);
    } catch (err) {
      if (attempt >= maxRetries) throw err;
      const backoff = Math.pow(2, attempt) * 500;
      console.warn(`  ⚠️ Falha de rede: ${err.message}. Retentando em ${backoff}ms...`);
      await new Promise(r => setTimeout(r, backoff));
    }
  }
  throw new Error(`Falha após ${maxRetries} tentativas: ${url}`);
}

async function importTable(tableName, db) {
  console.log(`\n📥 [Tabela: ${tableName}] Iniciando extração do Supabase...`);
  const finalJsonPath = path.join(OUT_DIR, `${tableName}.json`);
  const tmpJsonPath = path.join(OUT_DIR, `${tableName}.json.tmp`);
  
  const writeStream = fs.createWriteStream(tmpJsonPath, { encoding: 'utf8' });
  writeStream.write('[\n');

  let totalRows = 0;
  let lastId = null;
  let isFirst = true;
  const pageSize = 1000;
  let sampleRow = null;

  // Criação de tabela SQLite preparada dinamicamente na primeira iteração
  let sqliteTableCreated = false;
  let insertStmt = null;
  let colNames = [];

  const t0 = Date.now();

  while (true) {
    let url = `${SUPABASE_URL}/rest/v1/${tableName}?limit=${pageSize}&order=id.asc`;
    if (lastId) {
      url += `&id=gt.${encodeURIComponent(lastId)}`;
    }

    const res = await fetchWithRetry(url, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });

    const rows = await res.json();
    if (!rows || rows.length === 0) break;

    // Inicializar schema SQLite com as colunas reais da tabela
    if (!sqliteTableCreated && rows.length > 0) {
      sampleRow = rows[0];
      colNames = Object.keys(sampleRow);
      
      db.exec(`DROP TABLE IF EXISTS "${tableName}"`);
      const colDefs = colNames.map(c => `"${c}" TEXT`).join(', ');
      db.exec(`CREATE TABLE "${tableName}" (${colDefs}, PRIMARY KEY ("id"))`);
      
      const placeholders = colNames.map(() => '?').join(', ');
      insertStmt = db.prepare(`INSERT OR REPLACE INTO "${tableName}" (${colNames.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders})`);
      sqliteTableCreated = true;
    }

    // Inserção em transação SQLite e escrita no stream JSON
    db.exec('BEGIN TRANSACTION');
    try {
      for (const row of rows) {
        // Grava no arquivo JSON
        const line = (isFirst ? '' : ',\n') + JSON.stringify(row);
        writeStream.write(line);
        isFirst = false;

        // Grava no SQLite
        const values = colNames.map(col => {
          const val = row[col];
          if (val === null || val === undefined) return null;
          if (typeof val === 'object') return JSON.stringify(val);
          return String(val);
        });
        insertStmt.run(...values);
      }
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }

    totalRows += rows.length;
    lastId = rows[rows.length - 1].id;

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    process.stdout.write(`\r  ⏳ ${tableName.padEnd(40)} -> ${totalRows.toLocaleString()} registros (${elapsed}s)...`);

    if (rows.length < pageSize) break;
  }

  writeStream.write('\n]\n');
  await new Promise((resolve, reject) => {
    writeStream.end(resolve);
    writeStream.on('error', reject);
  });

  // Renomeia o arquivo temporário para o destino final atomicamente
  if (fs.existsSync(finalJsonPath)) {
    fs.unlinkSync(finalJsonPath);
  }
  fs.renameSync(tmpJsonPath, finalJsonPath);

  // Cria hardlinks em data/tables/ e data/
  const tablesLinkPath = path.join(TABLES_DIR, `${tableName}.json`);
  if (fs.existsSync(tablesLinkPath)) fs.unlinkSync(tablesLinkPath);
  try {
    fs.linkSync(finalJsonPath, tablesLinkPath);
  } catch (err) {
    fs.copyFileSync(finalJsonPath, tablesLinkPath);
  }

  const dataRootLinkPath = path.join(DATA_ROOT, `${tableName}.json`);
  if (fs.existsSync(dataRootLinkPath)) fs.unlinkSync(dataRootLinkPath);
  try {
    fs.linkSync(finalJsonPath, dataRootLinkPath);
  } catch (err) {
    fs.copyFileSync(finalJsonPath, dataRootLinkPath);
  }

  const fileSize = fs.statSync(finalJsonPath).size;
  const sizeMb = (fileSize / (1024 * 1024)).toFixed(2);
  const hash = calculateSha256(finalJsonPath);
  const totalSec = ((Date.now() - t0) / 1000).toFixed(1);

  console.log(`\r  ✅ ${tableName.padEnd(40)} -> ${totalRows.toLocaleString().padStart(8)} registros (${sizeMb.padStart(6)} MB) em ${totalSec}s`);

  return {
    table: tableName,
    rows: totalRows,
    size_bytes: fileSize,
    size_mb: parseFloat(sizeMb),
    sha256: hash,
    duration_seconds: parseFloat(totalSec),
    json_path: path.relative(process.cwd(), finalJsonPath),
    tables_link: path.relative(process.cwd(), tablesLinkPath),
    data_link: path.relative(process.cwd(), dataRootLinkPath)
  };
}

async function integrateProvaDeResidenciaParte2(db, manifest) {
  const pdrPath = path.resolve(process.cwd(), 'data', 'provaderesidencia_coleta_parte2.db');
  if (!fs.existsSync(pdrPath)) {
    console.log('\n⚠️ Arquivo data/provaderesidencia_coleta_parte2.db não encontrado. Pulando integração local.');
    return;
  }

  console.log('\n📦 Integrando data/provaderesidencia_coleta_parte2.db ao acervo...');
  const t0 = Date.now();

  // 1. Vincular arquivo .db em data/supabase_tables e data/tables
  const pdrDest = path.join(OUT_DIR, 'provaderesidencia_coleta_parte2.db');
  if (fs.existsSync(pdrDest)) fs.unlinkSync(pdrDest);
  try { fs.linkSync(pdrPath, pdrDest); } catch { fs.copyFileSync(pdrPath, pdrDest); }

  const pdrTablesLink = path.join(TABLES_DIR, 'provaderesidencia_coleta_parte2.db');
  if (fs.existsSync(pdrTablesLink)) fs.unlinkSync(pdrTablesLink);
  try { fs.linkSync(pdrPath, pdrTablesLink); } catch { fs.copyFileSync(pdrPath, pdrTablesLink); }

  // 2. Anexar e replicar tabelas para o supabase_tables.db
  const pdrSqliteEscaped = pdrPath.replace(/'/g, "''");
  db.exec(`ATTACH DATABASE '${pdrSqliteEscaped}' AS pdr`);

  db.exec(`DROP TABLE IF EXISTS "provaderesidencia_provas"`);
  db.exec(`CREATE TABLE "provaderesidencia_provas" AS SELECT * FROM pdr.provas`);

  db.exec(`DROP TABLE IF EXISTS "provaderesidencia_questoes"`);
  db.exec(`CREATE TABLE "provaderesidencia_questoes" AS SELECT * FROM pdr.questoes`);

  db.exec(`DROP TABLE IF EXISTS "provaderesidencia_imagens_arquivo"`);
  db.exec(`CREATE TABLE "provaderesidencia_imagens_arquivo" AS SELECT * FROM pdr.imagens_arquivo`);

  db.exec(`DETACH DATABASE pdr`);

  db.exec(`CREATE INDEX IF NOT EXISTS "idx_pdr_questoes_id" ON "provaderesidencia_questoes"("id")`);
  db.exec(`CREATE INDEX IF NOT EXISTS "idx_pdr_questoes_prova_id" ON "provaderesidencia_questoes"("prova_id")`);
  db.exec(`CREATE INDEX IF NOT EXISTS "idx_pdr_questoes_esp" ON "provaderesidencia_questoes"("especialidade")`);

  // 3. Exportar JSON de questões
  const questoesJsonPath = path.join(OUT_DIR, 'provaderesidencia_questoes.json');
  const qStream = fs.createWriteStream(questoesJsonPath, { encoding: 'utf8' });
  qStream.write('[\n');

  const qRows = db.prepare('SELECT * FROM "provaderesidencia_questoes"').all();
  for (let i = 0; i < qRows.length; i++) {
    const line = (i === 0 ? '' : ',\n') + JSON.stringify(qRows[i]);
    qStream.write(line);
  }
  qStream.write('\n]\n');
  await new Promise(r => qStream.end(r));

  const qTablesLink = path.join(TABLES_DIR, 'provaderesidencia_questoes.json');
  if (fs.existsSync(qTablesLink)) fs.unlinkSync(qTablesLink);
  try { fs.linkSync(questoesJsonPath, qTablesLink); } catch { fs.copyFileSync(questoesJsonPath, qTablesLink); }

  const qDataLink = path.join(DATA_ROOT, 'provaderesidencia_questoes.json');
  if (fs.existsSync(qDataLink)) fs.unlinkSync(qDataLink);
  try { fs.linkSync(questoesJsonPath, qDataLink); } catch { fs.copyFileSync(questoesJsonPath, qDataLink); }

  // 4. Exportar JSON de provas
  const provasJsonPath = path.join(OUT_DIR, 'provaderesidencia_provas.json');
  const pRows = db.prepare('SELECT * FROM "provaderesidencia_provas"').all();
  fs.writeFileSync(provasJsonPath, JSON.stringify(pRows, null, 2), 'utf8');

  const pTablesLink = path.join(TABLES_DIR, 'provaderesidencia_provas.json');
  if (fs.existsSync(pTablesLink)) fs.unlinkSync(pTablesLink);
  try { fs.linkSync(provasJsonPath, pTablesLink); } catch { fs.copyFileSync(provasJsonPath, pTablesLink); }

  const qStat = fs.statSync(questoesJsonPath);
  const pStat = fs.statSync(provasJsonPath);
  const dbStat = fs.statSync(pdrPath);
  const totalSec = ((Date.now() - t0) / 1000).toFixed(1);

  manifest.provaderesidencia = {
    source_db: path.relative(process.cwd(), pdrPath),
    integrated_db: path.relative(process.cwd(), pdrDest),
    db_size_mb: parseFloat((dbStat.size / (1024 * 1024)).toFixed(2)),
    sha256_db: calculateSha256(pdrPath),
    total_questoes: qRows.length,
    total_provas: pRows.length,
    questoes_json: path.relative(process.cwd(), questoesJsonPath),
    questoes_json_mb: parseFloat((qStat.size / (1024 * 1024)).toFixed(2)),
    provas_json: path.relative(process.cwd(), provasJsonPath),
    duration_seconds: parseFloat(totalSec)
  };

  console.log(`  ✅ Prova de Residência Parte 2 integrado: ${qRows.length.toLocaleString()} questões e ${pRows.length} provas em ${totalSec}s.`);
}

async function main() {
  console.log('='.repeat(80));
  console.log('🚀 IMPORTAÇÃO CANÔNICA DE TABELAS DO SUPABASE');
  console.log(`🌐 Supabase URL: ${SUPABASE_URL}`);
  console.log(`📁 Diretório Principal: ${OUT_DIR}`);
  console.log(`📋 Tabelas Selecionadas: ${TARGET_TABLES.join(', ')}`);
  console.log('='.repeat(80));

  const sqliteDbPath = path.join(OUT_DIR, 'supabase_tables.db');
  if (fs.existsSync(sqliteDbPath)) {
    fs.unlinkSync(sqliteDbPath);
  }
  const db = new DatabaseSync(sqliteDbPath);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA synchronous = NORMAL;');

  const manifest = {
    imported_at: new Date().toISOString(),
    supabase_url: SUPABASE_URL,
    tables: {},
    sqlite_db: path.relative(process.cwd(), sqliteDbPath),
    total_rows: 0,
    total_size_mb: 0,
    total_duration_seconds: 0
  };

  const tStart = Date.now();

  for (const table of TARGET_TABLES) {
    const meta = await importTable(table, db);
    manifest.tables[table] = meta;
    manifest.total_rows += meta.rows;
    manifest.total_size_mb += meta.size_mb;
  }

  // Criação de índices no SQLite para consulta rápida
  console.log('\n⚙️  Criando índices de alta performance no banco SQLite...');
  for (const table of TARGET_TABLES) {
    try {
      db.exec(`CREATE INDEX IF NOT EXISTS "idx_${table}_id" ON "${table}"("id")`);
      db.exec(`CREATE INDEX IF NOT EXISTS "idx_${table}_especialidade" ON "${table}"("especialidade")`);
    } catch {
      // Alguns campos podem não existir em todas as tabelas
    }
  }
  // Integração automática do provaderesidencia_coleta_parte2.db
  await integrateProvaDeResidenciaParte2(db, manifest);

  db.close();

  // Também cria link/cópia do SQLite na raiz de data/
  const dataDbLink = path.join(DATA_ROOT, 'supabase_tables.db');
  if (fs.existsSync(dataDbLink)) fs.unlinkSync(dataDbLink);
  try {
    fs.linkSync(sqliteDbPath, dataDbLink);
  } catch {
    fs.copyFileSync(sqliteDbPath, dataDbLink);
  }

  const durationSec = ((Date.now() - tStart) / 1000).toFixed(1);
  manifest.total_duration_seconds = parseFloat(durationSec);
  manifest.total_size_mb = parseFloat(manifest.total_size_mb.toFixed(2));

  const manifestPath = path.join(OUT_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log('\n' + '='.repeat(80));
  console.log('🎉 TODAS AS TABELAS IMPORTADAS COM SUCESSO ABSOLUTO!');
  console.log(`⏱️  Tempo Total: ${durationSec}s`);
  console.log(`📊 Total de Registros: ${manifest.total_rows.toLocaleString('pt-BR')}`);
  console.log(`💾 Volume Total em Disco: ${manifest.total_size_mb} MB`);
  console.log(`🗄️  Banco SQLite Relacional: ${sqliteDbPath}`);
  console.log(`🧾 Manifesto & Checksums: ${manifestPath}`);
  console.log('='.repeat(80));
}

main().catch(err => {
  console.error('\n❌ ERRO FATAL NA IMPORTAÇÃO:', err);
  process.exit(1);
});

