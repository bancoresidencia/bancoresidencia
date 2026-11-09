import { createClient } from '@supabase/supabase-js';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

// Carrega .env.local
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const [k, ...v] = l.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ ERRO: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausente.');
  process.exit(1);
}

const client = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const DB_PATH = path.resolve(process.cwd(), 'data/questoes_132k.db');
if (!fs.existsSync(DB_PATH)) {
  console.error('❌ ERRO: data/questoes_132k.db não encontrado.');
  process.exit(1);
}

const CHECKPOINT_FILE = path.resolve(process.cwd(), 'data/taxonomy_sync_checkpoint.json');
const BATCH_SIZE = 500;
const DELAY_BETWEEN_BATCHES_MS = 150;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loadCheckpoint() {
  if (fs.existsSync(CHECKPOINT_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf8'));
    } catch {
      return { lastProcessedIndex: 0, totalUpdated: 0 };
    }
  }
  return { lastProcessedIndex: 0, totalUpdated: 0 };
}

function saveCheckpoint(lastProcessedIndex, totalUpdated) {
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify({
    lastProcessedIndex,
    totalUpdated,
    updatedAt: new Date().toISOString()
  }, null, 2), 'utf8');
}

async function checkRpcAvailable() {
  const { error } = await client.rpc('batch_update_taxonomy', { p_rows: [] });
  if (error && error.message.includes('Could not find the function')) {
    return false;
  }
  return true;
}

async function runSync() {
  console.log('='.repeat(80));
  console.log('🚀 BANCO RESIDÊNCIA — SINCRONIZAÇÃO GRADUAL DE TAXONOMIA PARA O SUPABASE');
  console.log('='.repeat(80));

  // 1. Verificar RPC no Supabase
  const rpcOk = await checkRpcAvailable();
  if (!rpcOk) {
    console.error('\n⚠️  A função RPC "batch_update_taxonomy" ainda não foi criada no Supabase.');
    console.log('\n👉 POR FAVOR, EXECUTE O SEGUINTE SCRIPT NO SQL EDITOR DO SUPABASE ANTES DE PROSSEGUIR:');
    console.log('   Arquivo: supabase/migrations/002_create_batch_update_taxonomy.sql');
    console.log('   URL direta: https://supabase.com/dashboard/project/ezluharxlmlqhdkqrjbz/sql/new\n');
    process.exit(1);
  }

  console.log('✅ RPC "batch_update_taxonomy" pronta e ativa no Supabase!\n');

  // 2. Carregar dados do SQLite
  console.log('📦 Carregando questões do SQLite data/questoes_132k.db...');
  const db = new DatabaseSync(DB_PATH, { readOnly: true });
  
  const allRows = db.prepare(`
    SELECT id, novo_tema AS tema, novo_foco AS foco, novo_subfoco AS subfoco 
    FROM questions 
    ORDER BY id ASC
  `).all();

  const totalQuestions = allRows.length;
  console.log(`✓ Total de questões no SQLite: ${totalQuestions.toLocaleString('pt-BR')}`);

  // 3. Carregar Checkpoint
  const checkpoint = loadCheckpoint();
  let startIndex = checkpoint.lastProcessedIndex || 0;
  let totalUpdated = checkpoint.totalUpdated || 0;

  if (startIndex > 0 && startIndex < totalQuestions) {
    console.log(`🔄 Retomando do Checkpoint anterior: índice ${startIndex.toLocaleString('pt-BR')} (${totalUpdated.toLocaleString('pt-BR')} atualizadas até agora)`);
  } else if (startIndex >= totalQuestions) {
    console.log(`ℹ️  Todos os ${totalQuestions.toLocaleString('pt-BR')} registros já foram enviados segundo o checkpoint.`);
  }

  // 4. Executar Upload Gradual em Lotes
  const t0 = Date.now();
  let batchCount = 0;

  for (let i = startIndex; i < totalQuestions; i += BATCH_SIZE) {
    const rawChunk = allRows.slice(i, i + BATCH_SIZE);
    const chunk = rawChunk.map(r => ({
      id: String(r.id),
      tema: String(r.tema || ''),
      foco: String(r.foco || ''),
      subfoco: String(r.subfoco || '')
    }));
    
    let retries = 3;
    let success = false;
    while (retries > 0 && !success) {
      try {
        const { data: updatedCount, error } = await client.rpc('batch_update_taxonomy', { p_rows: chunk });
        if (error) {
          throw new Error(error.message);
        }
        totalUpdated += (typeof updatedCount === 'number' ? updatedCount : chunk.length);
        success = true;
      } catch (err) {
        retries--;
        console.warn(`\n⚠️  Falha no lote [${i}..${i + chunk.length}]: ${err.message}. Retentando (${retries} restantes)...`);
        await sleep(1000);
      }
    }

    if (!success) {
      console.error(`\n❌ ERRO CRÍTICO: Lote [${i}..${i + chunk.length}] falhou após 3 tentativas. Interrompendo no checkpoint seguro.`);
      saveCheckpoint(i, totalUpdated);
      process.exit(1);
    }

    batchCount++;
    const currentProgress = Math.min(i + BATCH_SIZE, totalQuestions);
    const pct = ((currentProgress / totalQuestions) * 100).toFixed(2);
    const elapsedSec = ((Date.now() - t0) / 1000).toFixed(1);
    
    process.stdout.write(`\r⚡ [Lote ${batchCount}] ${currentProgress.toLocaleString('pt-BR')}/${totalQuestions.toLocaleString('pt-BR')} (${pct}%) — ${totalUpdated.toLocaleString('pt-BR')} atualizadas [${elapsedSec}s]`);

    saveCheckpoint(currentProgress, totalUpdated);
    await sleep(DELAY_BETWEEN_BATCHES_MS);
  }

  console.log(`\n\n🎉 Sincronização concluída com sucesso em ${((Date.now() - t0) / 1000).toFixed(1)}s!`);
  console.log(`Total de questões enviadas: ${totalUpdated.toLocaleString('pt-BR')}\n`);

  // 5. Auditoria Campo a Campo de 100% das 132.947 Questões
  console.log('='.repeat(80));
  console.log('🔍 INICIANDO AUDITORIA INTEGRAL CAMPO A CAMPO (100% DAS QUESTÕES)');
  console.log('='.repeat(80));

  const sqliteMap = new Map();
  allRows.forEach(r => sqliteMap.set(String(r.id), { tema: String(r.tema || ''), foco: String(r.foco || ''), subfoco: String(r.subfoco || '') }));

  let auditPage = 0;
  const auditPageSize = 1000;
  let totalAudited = 0;
  let totalMatches = 0;
  let divergences = [];

  console.log('Comparando campo a campo (tema, foco, subfoco) com o Supabase...');

  while (totalAudited < totalQuestions) {
    const from = auditPage * auditPageSize;
    const to = from + auditPageSize - 1;

    const { data: supaRows, error: fetchErr } = await client
      .from('questions')
      .select('id, tema, foco, subfoco')
      .order('id', { ascending: true })
      .range(from, to);

    if (fetchErr) {
      console.warn(`\n⚠️  Erro ao buscar página de auditoria [${from}..${to}]: ${fetchErr.message}`);
      await sleep(1000);
      continue;
    }

    if (!supaRows || supaRows.length === 0) {
      break;
    }

    for (const supa of supaRows) {
      totalAudited++;
      const local = sqliteMap.get(String(supa.id));
      if (!local) {
        divergences.push({ id: supa.id, field: 'ID_NOT_FOUND_IN_SQLITE', sqliteVal: '', supaVal: supa.id });
        continue;
      }

      let rowMatch = true;
      if (supa.tema !== local.tema) {
        rowMatch = false;
        divergences.push({ id: supa.id, field: 'tema', sqliteVal: local.tema, supaVal: supa.tema });
      }
      if (supa.foco !== local.foco) {
        rowMatch = false;
        divergences.push({ id: supa.id, field: 'foco', sqliteVal: local.foco, supaVal: supa.foco });
      }
      if (supa.subfoco !== local.subfoco) {
        rowMatch = false;
        divergences.push({ id: supa.id, field: 'subfoco', sqliteVal: local.subfoco, supaVal: supa.subfoco });
      }

      if (rowMatch) {
        totalMatches++;
      }
    }

    auditPage++;
    const auditPct = ((totalAudited / totalQuestions) * 100).toFixed(2);
    process.stdout.write(`\r🔎 Auditoria: ${totalAudited.toLocaleString('pt-BR')}/${totalQuestions.toLocaleString('pt-BR')} (${auditPct}%) — Casamentos perfeitos: ${totalMatches.toLocaleString('pt-BR')}`);
  }

  console.log('\n\n' + '='.repeat(80));
  console.log('📋 RELATÓRIO FINAL DE AUDITORIA DE 100% DAS QUESTÕES');
  console.log('='.repeat(80));
  console.log(`• Total Auditado: ${totalAudited.toLocaleString('pt-BR')} questões`);
  console.log(`• Casamentos Idênticos (100% fiéis): ${totalMatches.toLocaleString('pt-BR')}`);
  console.log(`• Divergências Encontradas: ${divergences.length}`);

  const reportPath = path.resolve(process.cwd(), 'data/relatorio_auditoria_taxonomia_completa_132k.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalQuestions,
    totalAudited,
    totalMatches,
    divergencesCount: divergences.length,
    sampleDivergences: divergences.slice(0, 100)
  }, null, 2), 'utf8');

  console.log(`✓ Relatório completo salvo em: ${reportPath}`);

  if (divergences.length === 0) {
    console.log('\n🏆 CERTIFICADO: 100% DA BASE DO SUPABASE ESTÁ PERFEITAMENTE SINCRONIZADA COM O SQLITE!');
  } else {
    console.log(`\n⚠️  Atenção: Houve ${divergences.length} divergências. Verifique o relatório.`);
  }

  db.close();
}

runSync().catch(console.error);
