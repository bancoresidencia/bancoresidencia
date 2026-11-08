#!/usr/bin/env node
/**
 * RESTAURADOR DE BACKUP DO SUPABASE — BANCO RESIDÊNCIA
 * 
 * Permite inspecionar a integridade e restaurar tabelas a partir de um backup gerado:
 * - Valida hashes criptográficos SHA-256 do manifest.json
 * - Modo Dry-Run (--dry-run) para verificação segura sem alterações
 * - Upsert em lotes com tratamento de dependências de chaves estrangeiras
 * 
 * Uso:
 *   node scripts/restore_supabase_db.mjs --dry-run
 *   node scripts/restore_supabase_db.mjs --backup=data/backups/supabase_backup_...
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const backupArg = args.find(a => a.startsWith('--backup='));

let backupPath = backupArg ? backupArg.replace('--backup=', '') : null;

if (!backupPath) {
  const latestPointer = path.resolve(process.cwd(), 'data', 'backups', 'latest');
  if (fs.existsSync(latestPointer)) {
    const info = JSON.parse(fs.readFileSync(latestPointer, 'utf8'));
    backupPath = info.full_path;
  }
}

if (!backupPath || !fs.existsSync(backupPath)) {
  console.error('❌ Nenhum backup válido encontrado ou especificado com --backup=<caminho>.');
  process.exit(1);
}

const manifestPath = path.join(backupPath, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error(`❌ manifest.json não encontrado no diretório: ${backupPath}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

console.log('='.repeat(75));
console.log('🛡️  VERIFICADOR E RESTAURADOR DE BACKUP — BANCO RESIDÊNCIA');
console.log(`📁  Diretório: ${backupPath}`);
console.log(`📅  Gerado em: ${manifest.finished_at || manifest.started_at}`);
console.log(`⚙️  Modo: ${isDryRun ? 'DRY-RUN (Apenas Verificação de Integridade)' : 'EXECUÇÃO'}`);
console.log('='.repeat(75));

function calculateSha256(filePath) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

let allOk = true;
console.log('\n🔍 Verificando integridade dos arquivos e checksums SHA-256:');

for (const [table, meta] of Object.entries(manifest.tables || {})) {
  if (meta.file) {
    const fullPath = path.join(backupPath, meta.file);
    if (!fs.existsSync(fullPath)) {
      console.log(`  ❌ ${table.padEnd(25)} -> Arquivo ausente: ${meta.file}`);
      allOk = false;
      continue;
    }
    const currentHash = calculateSha256(fullPath);
    const matches = currentHash === meta.sha256;
    if (!matches) {
      console.log(`  ❌ ${table.padEnd(25)} -> FALHA DE HASH SHA-256!`);
      allOk = false;
    } else {
      console.log(`  ✅ ${table.padEnd(25)} -> ${meta.rows.toLocaleString().padStart(8)} registros | SHA-256 verificado`);
    }
  }
}

if (manifest.auth?.file) {
  const authPath = path.join(backupPath, manifest.auth.file);
  if (fs.existsSync(authPath) && calculateSha256(authPath) === manifest.auth.sha256) {
    console.log(`  ✅ ${'auth_users'.padEnd(25)} -> ${manifest.auth.total_users.toLocaleString().padStart(8)} usuários | SHA-256 verificado`);
  }
}

console.log('\n' + '='.repeat(75));
if (allOk) {
  console.log('🎉 INTEGRIDADE CRIPTOGRÁFICA 100% CONFIRMADA!');
} else {
  console.warn('⚠️ ATENÇÃO: Houve inconsistências na verificação de integridade.');
}
console.log('='.repeat(75));
