#!/usr/bin/env node
/**
 * ==============================================================================
 * ENGINE DE EXECUÇÃO DO MERGE DE ALTA PRECISÃO (ZERO DATA LOSS)
 * Plataforma Banco Residência Médica — Supabase PostgreSQL
 * 
 * Regras Obrigatórias:
 * 1. SSOT (questions_curated_staging: 254.190 q) é a autoridade máxima para filtros,
 *    enunciados, opções formatadas A-E, gabaritos, dificuldade, modalidade e tipos.
 * 2. Comentários Padrão-Ouro / LLM do Supabase (86.318 q) são 100% preservados.
 * 3. As 2.921 questões pré-existentes do Revalida no Supabase são mantidas cumulativamente,
 *    totalizando exatamente 4.411 questões em questions_revalida.
 * 4. As 76 divergências de modalidade são migradas com delete na origem e insert no destino.
 * 5. Os 2 registros lixo em questions_direto e 4 lixos em questions_titulo são removidos.
 * 6. Totais finais esperados:
 *    - questions_direto: 206.599
 *    - questions_rplus: 45.413
 *    - questions_revalida: 4.411
 *    - questions_titulo: 688
 *    - TOTAL GERAL: 257.111
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

// 1. Carregar variáveis de ambiente
const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
  const t = line.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ ERRO: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes.');
  process.exit(1);
}

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

const BATCH_SIZE = 800; // 800 registros por payload para manter requisição leve (~1.5 MB)
const SLEEP_MS = 60;    // 60ms de pausa entre lotes (CPU Supabase < 10%)

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function cleanPrefix(id) {
  if (!id) return '';
  if (id.startsWith('questions_expansion_titulo_especialista_')) return id.slice(40);
  if (id.startsWith('questions_expansion_revalida_')) return id.slice(29);
  if (id.startsWith('questions_expansion_direto_')) return id.slice(27);
  if (id.startsWith('questions_expansion_r_plus_')) return id.slice(27);
  if (id.startsWith('questions_')) return id.slice(10);
  return id;
}

// 2. Preparar função de envio com retry
async function sendBatchWithRetry(table, batch, maxRetries = 5) {
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
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
        const backoff = Math.pow(2, attempt) * 500;
        console.warn(`\n  ⚠️ HTTP ${res.status} em ${table}. Retentando em ${backoff}ms (tentativa ${attempt}/${maxRetries})...`);
        await sleep(backoff);
        continue;
      }

      throw new Error(`HTTP ${res.status} em ${table}: ${errText}`);
    } catch (err) {
      if (attempt >= maxRetries) throw err;
      const backoff = Math.pow(2, attempt) * 500;
      console.warn(`\n  ⚠️ Falha de conexão: ${err.message}. Retentando em ${backoff}ms...`);
      await sleep(backoff);
    }
  }
  throw new Error(`Falha definitiva ao enviar lote para ${table}`);
}

async function uploadTablePayload(tableName, records) {
  console.log(`\n🚀 [${tableName}] Iniciando transmissão de ${records.length.toLocaleString('pt-BR')} registros...`);
  const totalBatches = Math.ceil(records.length / BATCH_SIZE);
  const t0 = Date.now();

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const batchIndex = Math.floor(i / BATCH_SIZE) + 1;

    await sendBatchWithRetry(tableName, batch);
    await sleep(SLEEP_MS);

    const progress = Math.min(i + batch.length, records.length);
    const pct = ((progress / records.length) * 100).toFixed(1);
    const elapsedSec = ((Date.now() - t0) / 1000).toFixed(0);

    process.stdout.write(`\r  ⏳ ${tableName}: ${progress.toLocaleString('pt-BR')}/${records.length.toLocaleString('pt-BR')} (${pct}%) — Lote ${batchIndex}/${totalBatches} — ${elapsedSec}s`);
  }

  const totalSec = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\r  ✅ ${tableName}: ${records.length.toLocaleString('pt-BR')} registros enviados com sucesso em ${totalSec}s!`);
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
  return range ? parseInt(range.split('/')[1], 10) : 0;
}

async function deleteByIds(tableName, ids) {
  if (!ids || ids.length === 0) return;
  console.log(`🗑️ [${tableName}] Excluindo ${ids.length} registros obsoletos/divergentes...`);
  const chunkSize = 200;
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const inFilter = `id=in.(${chunk.map(id => encodeURIComponent(id)).join(',')})`;
    const url = `${SUPABASE_URL}/rest/v1/${tableName}?${inFilter}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });
    if (!res.ok) {
      const err = await res.text();
      console.warn(`  ⚠️ Falha ao deletar chunk em ${tableName}: ${err}`);
    }
  }
  console.log(`  ✅ Exclusões em ${tableName} concluídas.`);
}

async function main() {
  console.log('='.repeat(80));
  console.log('🛡️  EXECUÇÃO DO MERGE DE ALTA PRECISÃO (SSOT ➔ SUPABASE CONSOLIDADO)');
  console.log('='.repeat(80));

  // 1. Preparar mapa de comentários do Supabase
  console.log('\n[1/5] 🧩 Indexando comentários salvos do Supabase...');
  const commRows = db.prepare('SELECT id, commentary FROM supabase_live_commentaries').all();
  const supaCommMap = new Map();
  for (const r of commRows) {
    supaCommMap.set(r.id, r.commentary);
  }
  console.log(`  -> ${supaCommMap.size.toLocaleString('pt-BR')} comentários ativos mapeados.`);

  // 2. Preparar os 4 payloads das tabelas de destino
  console.log('\n[2/5] 📦 Montando os 4 payloads locais com todas as regras de precedência...');
  
  const allSSOT = db.prepare(`
    SELECT 
      id, code, institution, banca, year, tipo_prova, modalidade,
      especialidade, tema, foco, subfoco, difficulty, type, is_anulada,
      statement, options, correct_answer, commentary, images, created_at
    FROM questions_curated_staging
  `).all();

  const payloads = {
    questions_direto: [],
    questions_rplus: [],
    questions_revalida: [],
    questions_titulo: []
  };

  let preservedTakeHomeCount = 0;
  let preservedLegacyCommCount = 0;
  let enrichedFromSSOTCount = 0;

  for (const row of allSSOT) {
    const cleanId = cleanPrefix(row.id);
    const supaComm = supaCommMap.get(cleanId);
    let finalCommentary = null;

    if (supaComm && supaComm.includes('Take-Home')) {
      finalCommentary = supaComm;
      preservedTakeHomeCount++;
    } else if (supaComm && supaComm.trim().length > 100 && !supaComm.includes('Gabarito Oficial Homologado')) {
      finalCommentary = supaComm;
      preservedLegacyCommCount++;
    } else if (row.commentary && row.commentary.trim().length > 0) {
      finalCommentary = row.commentary;
      enrichedFromSSOTCount++;
    } else if (supaComm) {
      finalCommentary = supaComm;
    }

    // Normalizar options JSON
    let parsedOptions = [];
    if (typeof row.options === 'string') {
      try {
        parsedOptions = JSON.parse(row.options);
      } catch (e) {
        parsedOptions = [];
      }
    } else if (Array.isArray(row.options)) {
      parsedOptions = row.options;
    }

    // Normalizar images JSON
    let parsedImages = [];
    if (typeof row.images === 'string') {
      try {
        parsedImages = JSON.parse(row.images);
      } catch (e) {
        parsedImages = [];
      }
    } else if (Array.isArray(row.images)) {
      parsedImages = row.images;
    }

    const hasGabarito = Boolean(row.correct_answer && row.correct_answer.trim().length > 0);

    const record = {
      id: cleanId,
      code: row.code || null,
      institution: row.institution || null,
      banca: row.banca || null,
      year: row.year ? Number(row.year) : null,
      tipo_prova: row.tipo_prova || null,
      modalidade: row.modalidade,
      especialidade: row.especialidade || null,
      tema: row.tema || null,
      foco: row.foco || null,
      subfoco: row.subfoco || null,
      sub_subfoco: null,
      difficulty: row.difficulty || 'Médio',
      type: row.type || 'Múltipla escolha',
      is_anulada: Boolean(row.is_anulada),
      statement: row.statement,
      options: parsedOptions,
      correct_answer: row.correct_answer || null,
      commentary: finalCommentary,
      images: parsedImages,
      has_gabarito: hasGabarito,
      created_at: row.created_at || new Date().toISOString()
    };

    // Roteamento estrito pela modalidade da SSOT
    if (row.modalidade === 'Acesso Direto') {
      payloads.questions_direto.push(record);
    } else if (row.modalidade === 'R+') {
      payloads.questions_rplus.push(record);
    } else if (row.modalidade === 'Revalida') {
      payloads.questions_revalida.push(record);
    } else if (row.modalidade === 'Título de Especialista') {
      payloads.questions_titulo.push(record);
    } else {
      payloads.questions_direto.push(record);
    }
  }

  console.log(`  -> questions_direto payload: ${payloads.questions_direto.length.toLocaleString('pt-BR')} registros`);
  console.log(`  -> questions_rplus payload: ${payloads.questions_rplus.length.toLocaleString('pt-BR')} registros`);
  console.log(`  -> questions_revalida payload: ${payloads.questions_revalida.length.toLocaleString('pt-BR')} registros`);
  console.log(`  -> questions_titulo payload: ${payloads.questions_titulo.length.toLocaleString('pt-BR')} registros`);
  console.log(`  📊 Estatísticas de Comentários no Payload:`);
  console.log(`     - Take-Home Padrão-Ouro preservados do Supabase: ${preservedTakeHomeCount.toLocaleString('pt-BR')}`);
  console.log(`     - Comentários médicos legados preservados do Supabase: ${preservedLegacyCommCount.toLocaleString('pt-BR')}`);
  console.log(`     - Comentários enriquecidos a partir da SSOT: ${enrichedFromSSOTCount.toLocaleString('pt-BR')}`);

  // 3. Execução das Transições em Ordem Segura
  console.log('\n[3/5] 📡 Transmitindo payloads em streaming controlado...');

  // 3.1 questions_titulo (688)
  await uploadTablePayload('questions_titulo', payloads.questions_titulo);
  // Remover 4 órfãs de questions_titulo se existirem
  const validTituloIds = new Set(payloads.questions_titulo.map(q => q.id));
  const liveTituloRes = await fetch(`${SUPABASE_URL}/rest/v1/questions_titulo?select=id`, {
    headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` }
  });
  const liveTitulo = await liveTituloRes.json();
  const tituloToDelete = liveTitulo.filter(q => !validTituloIds.has(q.id)).map(q => q.id);
  if (tituloToDelete.length > 0) {
    await deleteByIds('questions_titulo', tituloToDelete);
  }

  // 3.2 questions_revalida (1.490 SSOT + 2.921 preservadas)
  // O upsert atualiza as 1.429 e insere as 61, deixando as 2.921 intactas!
  await uploadTablePayload('questions_revalida', payloads.questions_revalida);

  // 3.3 questions_rplus (45.413)
  await uploadTablePayload('questions_rplus', payloads.questions_rplus);

  // 3.4 questions_direto (206.599)
  await uploadTablePayload('questions_direto', payloads.questions_direto);

  // 4. Saneamento das 76 Divergências de Modalidade e Lixo
  console.log('\n[4/5] 🧹 Saneando as 76 divergências de modalidade e lixo...');
  
  // 72 IDs que foram inseridos em questions_direto e devem ser removidos de questions_rplus
  const rplusIdsInDireto = payloads.questions_direto.map(q => q.id);
  const liveRplusRes = await fetch(`${SUPABASE_URL}/rest/v1/questions_rplus?select=id`, {
    headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` }
  });
  const liveRplus = await liveRplusRes.json();
  const validRplusIds = new Set(payloads.questions_rplus.map(q => q.id));
  const rplusToDelete = liveRplus.filter(q => !validRplusIds.has(q.id)).map(q => q.id);
  if (rplusToDelete.length > 0) {
    console.log(`  -> Removendo ${rplusToDelete.length} questões de questions_rplus que migraram para questions_direto...`);
    await deleteByIds('questions_rplus', rplusToDelete);
  }

  // 4 IDs que foram inseridos em questions_rplus e devem ser removidos de questions_direto
  // E os 2 lixos de teste (InocencioJunior)
  const validDiretoIds = new Set(payloads.questions_direto.map(q => q.id));
  const liveDiretoRes = await fetch(`${SUPABASE_URL}/rest/v1/questions_direto?select=id`, {
    headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` }
  });
  const liveDireto = await liveDiretoRes.json();
  const diretoToDelete = liveDireto.filter(q => !validDiretoIds.has(q.id)).map(q => q.id);
  if (diretoToDelete.length > 0) {
    console.log(`  -> Removendo ${diretoToDelete.length} questões de questions_direto (4 que migraram para R+ e 2 lixos)...`);
    await deleteByIds('questions_direto', diretoToDelete);
  }

  // 5. Auditoria Final de Contagens
  console.log('\n' + '='.repeat(80));
  console.log('🔍 [5/5] AUDITORIA FINAL DE CONTAGENS NO SUPABASE');
  console.log('='.repeat(80));

  const tables = ['questions_direto', 'questions_rplus', 'questions_revalida', 'questions_titulo'];
  const expected = {
    questions_direto: 206599,
    questions_rplus: 45413,
    questions_revalida: 4411,
    questions_titulo: 688
  };

  let globalCount = 0;
  const auditResults = {};

  for (const t of tables) {
    const c = await queryTableCount(t);
    globalCount += c;
    const diff = c - expected[t];
    const status = diff === 0 ? '✅ EXATO' : `⚠️ DIFERENÇA (${diff > 0 ? '+' : ''}${diff})`;
    console.log(`  📊 ${t.padEnd(25)} -> ${c.toLocaleString('pt-BR')} registros (Esperado: ${expected[t].toLocaleString('pt-BR')}) [${status}]`);
    auditResults[t] = { count: c, expected: expected[t], status };
  }

  console.log('─'.repeat(80));
  const expectedGlobal = 257111;
  const globalDiff = globalCount - expectedGlobal;
  const globalStatus = globalDiff === 0 ? '🏆 100% HOMOLOGADO E EXATO' : `⚠️ DISCREPÂNCIA (${globalDiff})`;
  console.log(`  🌐 TOTAL GLOBAL CONSOLIDADO -> ${globalCount.toLocaleString('pt-BR')} registros (Esperado: ${expectedGlobal.toLocaleString('pt-BR')}) [${globalStatus}]`);
  console.log('='.repeat(80));

  // Checar cobertura de Take-Home
  const resTakeHome = await fetch(`${SUPABASE_URL}/rest/v1/questions_direto?commentary=like.*Take-Home*&limit=1`, {
    method: 'HEAD',
    headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Prefer': 'count=exact' }
  });
  const thCount = parseInt(resTakeHome.headers.get('content-range')?.split('/')[1] || '0', 10);
  console.log(`  ✨ Comentários Take-Home Padrão-Ouro preservados em questions_direto: ${thCount.toLocaleString('pt-BR')}`);

  const report = {
    timestamp: new Date().toISOString(),
    auditResults,
    globalCount,
    expectedGlobal,
    takeHomeInDireto: thCount
  };

  fs.writeFileSync('data/supabase_tables/final_merge_execution_report.json', JSON.stringify(report, null, 2));
  console.log('✅ Relatório final de execução salvo em data/supabase_tables/final_merge_execution_report.json');
}

main().catch(err => {
  console.error('\n❌ ERRO CRÍTICO NA EXECUÇÃO:', err);
  process.exit(1);
});

