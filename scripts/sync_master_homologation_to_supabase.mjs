#!/usr/bin/env node

/**
 * scripts/sync_master_homologation_to_supabase.mjs
 * 
 * Sincronizador de Alta Velocidade do Manifesto Mestre de Homologação (10.510 ações)
 * diretamente na tabela `questions` do banco remoto Supabase (PostgreSQL).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const DATA_DIR = path.join(ROOT_DIR, 'data');
const AUDIT_DIR = path.join(DATA_DIR, 'audit_triagem_geral');

// Carregar variáveis de ambiente do .env.local
const env = {};
const envPath = path.join(ROOT_DIR, '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Credenciais do Supabase não encontradas no .env.local');
  process.exit(1);
}

async function patchWithRetry(url, payload, headers, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        return { success: true };
      }

      if (attempt === maxRetries) {
        const text = await res.text();
        return { success: false, error: `HTTP ${res.status}: ${text.slice(0, 120)}` };
      }
    } catch (err) {
      if (attempt === maxRetries) {
        return { success: false, error: err.message };
      }
    }
    // Backoff
    await new Promise(r => setTimeout(r, 200 * attempt));
  }
  return { success: false, error: 'Max retries exceeded' };
}

async function main() {
  console.log('========================================================');
  console.log('⚡ SINCRONIZADOR REMOTO SUPABASE — MANIFESTO MESTRE');
  console.log('   Alvo: 10.510 retificações e homologações no PostgreSQL');
  console.log('========================================================');

  const payloadPath = path.join(AUDIT_DIR, 'payload_supabase_sync_10510.json');
  if (!fs.existsSync(payloadPath)) {
    throw new Error(`Arquivo de payload não encontrado: ${payloadPath}`);
  }

  const items = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
  console.log(`📦 Carregados ${items.length.toLocaleString('pt-BR')} registros para sincronização.`);

  const headers = {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  };

  const CONCURRENCY = 35;
  let successCount = 0;
  let failCount = 0;
  const failures = [];
  const startTime = Date.now();

  console.log(`🚀 Iniciando pool concorrente (${CONCURRENCY} conexões paralelas)...`);

  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const chunk = items.slice(i, i + CONCURRENCY);

    await Promise.all(chunk.map(async (item) => {
      const url = `${SUPABASE_URL}/rest/v1/questions?id=eq.${item.id}`;
      const payload = {
        correct_answer: item.correct_answer,
        is_anulada: item.is_anulada
      };

      const result = await patchWithRetry(url, payload, headers);
      if (result.success) {
        successCount++;
      } else {
        failCount++;
        failures.push({ id: item.id, error: result.error });
      }
    }));

    const totalProcessed = i + chunk.length;
    if (totalProcessed % 500 === 0 || totalProcessed === items.length) {
      const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
      const rate = (totalProcessed / (Date.now() - startTime) * 1000).toFixed(0);
      const pct = Math.round((totalProcessed / items.length) * 100);
      console.log(`⏳ Progresso: ${totalProcessed.toLocaleString('pt-BR')}/${items.length.toLocaleString('pt-BR')} (${pct}%) | Sucessos: ${successCount.toLocaleString('pt-BR')} | Falhas: ${failCount} | Velocidade: ${rate} req/s (${elapsedSec}s)`);
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

  // Grava relatório de sincronização
  const syncReport = {
    dataSincronizacao: new Date().toISOString(),
    tempoExecucaoSegundos: parseFloat(totalTime),
    totalRegistros: items.length,
    sucessos: successCount,
    falhas: failCount,
    taxaSucesso: ((successCount / items.length) * 100).toFixed(2) + '%',
    errosDetalhados: failures.slice(0, 50)
  };

  fs.writeFileSync(path.join(AUDIT_DIR, 'relatorio_sync_supabase.json'), JSON.stringify(syncReport, null, 2), 'utf8');

  console.log('\n========================================================');
  console.log('🏁 RESULTADO CONSOLIDADO DA SINCRONIZAÇÃO:');
  console.log(`   Tempo total: ${totalTime}s`);
  console.log(`   Total de registros processados: ${items.length.toLocaleString('pt-BR')}`);
  console.log(`   ✅ Sincronizados com sucesso:   ${successCount.toLocaleString('pt-BR')} (${syncReport.taxaSucesso})`);
  console.log(`   ❌ Falhas / Erros:              ${failCount}`);
  console.log(`   Relatório registrado em: data/audit_triagem_geral/relatorio_sync_supabase.json`);
  console.log('========================================================');
}

main().catch(err => {
  console.error('💥 Erro fatal na sincronização:', err);
  process.exit(1);
});

