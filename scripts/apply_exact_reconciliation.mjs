import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

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

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

function cleanPrefix(id) {
  if (!id) return '';
  if (id.startsWith('questions_expansion_titulo_especialista_')) return id.slice(40);
  if (id.startsWith('questions_expansion_revalida_')) return id.slice(29);
  if (id.startsWith('questions_expansion_direto_')) return id.slice(27);
  if (id.startsWith('questions_expansion_r_plus_')) return id.slice(27);
  if (id.startsWith('questions_')) return id.slice(10);
  return id;
}

async function fetchAllIds(table) {
  const ids = [];
  let lastId = null;
  while (true) {
    let url = `${SUPABASE_URL}/rest/v1/${table}?select=id&limit=1000&order=id.asc`;
    if (lastId) url += `&id=gt.${encodeURIComponent(lastId)}`;
    const res = await fetch(url, { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } });
    const rows = await res.json();
    if (!rows || rows.length === 0) break;
    for (const r of rows) {
      ids.push(r.id);
      lastId = r.id;
    }
  }
  return ids;
}

async function deleteInBatches(table, ids) {
  if (!ids || ids.length === 0) return;
  console.log(`🗑️ [${table}] Excluindo ${ids.length} registros excedentes/duplicados...`);
  const chunkSize = 150;
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const inFilter = `id=in.(${chunk.map(id => encodeURIComponent(id)).join(',')})`;
    const url = `${SUPABASE_URL}/rest/v1/${table}?${inFilter}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });
    if (!res.ok) {
      const err = await res.text();
      console.warn(`  ⚠️ Erro ao deletar lote em ${table}: ${err}`);
    }
  }
  console.log(`  ✅ Exclusões em ${table} finalizadas com sucesso.`);
}

async function getExactCount(table) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?limit=1`, {
    method: 'HEAD',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Prefer: 'count=exact'
    }
  });
  const range = res.headers.get('content-range');
  return range ? parseInt(range.split('/')[1], 10) : 0;
}

async function run() {
  console.log('='.repeat(80));
  console.log('🎯 APLICANDO RECONCILIAÇÃO FINAL DE CONTAGENS EXATAS NO SUPABASE');
  console.log('='.repeat(80));

  // 1. Reconciliação questions_rplus: 45.585 -> 45.413 (remover 172 excedentes)
  console.log('\n[1/3] Identificando excedentes em questions_rplus...');
  const validRplus = new Set(db.prepare("SELECT id FROM questions_curated_staging WHERE modalidade = 'R+'").all().map(r => cleanPrefix(r.id)));
  const liveRplus = await fetchAllIds('questions_rplus');
  const surplusRplus = liveRplus.filter(id => !validRplus.has(id));
  console.log(`  -> Total em questions_rplus: ${liveRplus.length} | Excedentes: ${surplusRplus.length}`);
  if (surplusRplus.length > 0) {
    await deleteInBatches('questions_rplus', surplusRplus);
  }

  // 2. Reconciliação questions_direto: 206.858 -> 206.599 (remover 259 excedentes)
  console.log('\n[2/3] Identificando excedentes em questions_direto...');
  const validDireto = new Set(db.prepare("SELECT id FROM questions_curated_staging WHERE modalidade = 'Acesso Direto'").all().map(r => cleanPrefix(r.id)));
  const liveDireto = await fetchAllIds('questions_direto');
  const surplusDireto = liveDireto.filter(id => !validDireto.has(id));
  console.log(`  -> Total em questions_direto: ${liveDireto.length} | Excedentes: ${surplusDireto.length}`);
  if (surplusDireto.length > 0) {
    await deleteInBatches('questions_direto', surplusDireto);
  }

  // 3. Reconciliação questions_revalida: 4.419 -> 4.411 (remover 8 duplicatas secundárias unificadas na SSOT)
  console.log('\n[3/3] Identificando duplicatas secundárias em questions_revalida...');
  const mergedSecondary = new Set(db.prepare('SELECT clean_id FROM ssot_id_mapping WHERE is_primary = 0').all().map(r => r.clean_id));
  const liveRevalida = await fetchAllIds('questions_revalida');
  const surplusRevalida = liveRevalida.filter(id => mergedSecondary.has(id));
  console.log(`  -> Total em questions_revalida: ${liveRevalida.length} | Duplicatas secundárias: ${surplusRevalida.length}`);
  if (surplusRevalida.length > 0) {
    await deleteInBatches('questions_revalida', surplusRevalida);
  }

  // 4. Verificação Final de Contagens
  console.log('\n' + '='.repeat(80));
  console.log('🏆 AUDITORIA FINAL DE CONTAGENS APÓS RECONCILIAÇÃO');
  console.log('='.repeat(80));

  const tables = ['questions_direto', 'questions_rplus', 'questions_revalida', 'questions_titulo'];
  const targets = {
    questions_direto: 206599,
    questions_rplus: 45413,
    questions_revalida: 4411,
    questions_titulo: 688
  };

  let globalTotal = 0;
  for (const t of tables) {
    const c = await getExactCount(t);
    globalTotal += c;
    const diff = c - targets[t];
    const status = diff === 0 ? '✅ EXATO 100%' : `⚠️ DIFERENÇA (${diff})`;
    console.log(`  📊 ${t.padEnd(25)} -> ${c.toLocaleString('pt-BR')} registros (Esperado: ${targets[t].toLocaleString('pt-BR')}) [${status}]`);
  }

  console.log('─'.repeat(80));
  const globalExpected = 257111;
  const globalDiff = globalTotal - globalExpected;
  const globalStatus = globalDiff === 0 ? '🏆 100% HOMOLOGADO E EXATO' : `⚠️ DISCREPÂNCIA (${globalDiff})`;
  console.log(`  🌐 TOTAL GLOBAL CONSOLIDADO -> ${globalTotal.toLocaleString('pt-BR')} registros (Esperado: ${globalExpected.toLocaleString('pt-BR')}) [${globalStatus}]`);
  console.log('='.repeat(80));

  // Checar Take-Home preservado
  const resTakeHome = await fetch(`${SUPABASE_URL}/rest/v1/questions_direto?commentary=like.*Take-Home*&limit=1`, {
    method: 'HEAD',
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, Prefer: 'count=exact' }
  });
  const thCount = parseInt(resTakeHome.headers.get('content-range')?.split('/')[1] || '0', 10);
  console.log(`  ✨ Comentários Take-Home Padrão-Ouro preservados em questions_direto: ${thCount.toLocaleString('pt-BR')}`);
}

run().catch(console.error);

