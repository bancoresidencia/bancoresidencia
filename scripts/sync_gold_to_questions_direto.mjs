/**
 * Sincronização Otimizada de Comentários Padrão-Ouro para "questions_direto"
 */

import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

function sanitizePostgres(str) {
  if (!str) return '';
  return String(str)
    .replace(/\u0000/g, '')
    .replace(/\\u0000/g, '')
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '');
}

const SOURCES = [
  { name: 'Obstetrícia', path: 'data/obstetricia_final_questions.json' },
  { name: 'Ginecologia', path: 'data/ginecologia_final_questions.json' },
  { name: 'Pediatria', path: 'data/pediatria_final_questions.json' },
  { name: 'Clínica Médica', path: 'data/clinica_medica_final_questions.json' },
  { name: 'Cirurgia', path: 'data/cirurgia_final_questions.json' },
  { name: 'Urologia', path: 'data/urologia_final_questions.json' }
];

async function run() {
  console.log('='.repeat(80));
  console.log('🚀 SINCRONIZADOR DE ALTA PERFORMANCE PARA "questions_direto"');
  console.log('='.repeat(80));

  const goldMap = new Map();
  for (const src of SOURCES) {
    if (!fs.existsSync(src.path)) continue;
    const list = JSON.parse(fs.readFileSync(src.path, 'utf8'));
    let added = 0;
    for (const q of list) {
      const comm = q.commentary || q.finalCommentary || '';
      if (comm.includes('Take-Home')) {
        goldMap.set(q.id, {
          id: q.id,
          code: q.code || q.id,
          especialidade: src.name,
          commentary: sanitizePostgres(comm),
          options: (q.options || []).map(o => ({
            letter: o.letter || '',
            text: sanitizePostgres(o.text || ''),
            explanation: sanitizePostgres(o.explanation || '')
          }))
        });
        added++;
      }
    }
    console.log(`📂 ${src.name.padEnd(20)}: ${added.toLocaleString('pt-BR')} questões ouro carregadas.`);
  }

  console.log(`\n📦 Total de questões Padrão-Ouro únicas: ${goldMap.size.toLocaleString('pt-BR')}`);

  // 1. Atualização rápida no SQLite local com índice
  const dbPath = 'data/supabase_tables/supabase_tables.db';
  if (fs.existsSync(dbPath)) {
    console.log('\n💾 Sincronizando banco SQLite local...');
    const db = new DatabaseSync(dbPath);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_staging_clean_id ON questions_curated_staging(id);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_staging_code ON questions_curated_staging(code);`);

    const updateById = db.prepare(`
      UPDATE questions_curated_staging 
      SET commentary = ? 
      WHERE id = ? AND (commentary IS NULL OR commentary NOT LIKE '%Take-Home%')
    `);

    let localCount = 0;
    db.exec('BEGIN TRANSACTION');
    for (const [id, item] of goldMap) {
      const res1 = updateById.run(item.commentary, `questions_${id}`);
      if (res1.changes > 0) {
        localCount++;
      } else {
        const res2 = updateById.run(item.commentary, `questions_expansion_direto_${id}`);
        if (res2.changes > 0) {
          localCount++;
        } else {
          const res3 = updateById.run(item.commentary, id);
          if (res3.changes > 0) localCount++;
        }
      }
    }
    db.exec('COMMIT');
    console.log(`✨ SQLite local atualizado: +${localCount} questões sincronizadas com Padrão-Ouro.`);
  }

  // 2. Mapeamento de pendências no Supabase remoto
  console.log('\n🔍 Mapeando pendências na tabela "questions_direto" do Supabase...');
  const allGoldList = Array.from(goldMap.values());
  const pendingToSync = [];
  const BATCH_SIZE = 150;

  for (let i = 0; i < allGoldList.length; i += BATCH_SIZE) {
    const chunk = allGoldList.slice(i, i + BATCH_SIZE);
    const chunkIds = chunk.map(q => q.id);

    const { data, error } = await supabase
      .from('questions_direto')
      .select('id, commentary')
      .in('id', chunkIds);

    if (error) {
      console.error('Erro na consulta em lote:', error.message);
      continue;
    }

    const supaMap = new Map((data || []).map(d => [d.id, d.commentary || '']));

    for (const item of chunk) {
      if (supaMap.has(item.id)) {
        const currentComm = supaMap.get(item.id);
        if (!currentComm || !currentComm.includes('Take-Home')) {
          pendingToSync.push(item);
        }
      }
    }

    if ((i + BATCH_SIZE) % 15000 === 0 || (i + BATCH_SIZE) >= allGoldList.length) {
      console.log(`   - Verificados ${Math.min(i + BATCH_SIZE, allGoldList.length).toLocaleString('pt-BR')} / ${allGoldList.length.toLocaleString('pt-BR')} itens (Pendentes no remoto: ${pendingToSync.length})...`);
    }
  }

  console.log(`\n📋 TOTAL DE QUESTÕES PENDENTES EM questions_direto: ${pendingToSync.length}`);

  if (pendingToSync.length === 0) {
    console.log('✨ Tudo já está 100% sincronizado com Padrão-Ouro em questions_direto!');
    return;
  }

  // 3. Execução da sincronização em lote com 6 workers
  console.log('\n' + '='.repeat(80));
  console.log(`🚀 SINCRONIZANDO ${pendingToSync.length} QUESTÕES EM questions_direto`);
  console.log('='.repeat(80));

  const CONCURRENCY = 6;
  const DELAY_MS = 25;
  let successCount = 0;
  let errorCount = 0;
  let activeIndex = 0;

  async function worker(workerId) {
    while (true) {
      const idx = activeIndex++;
      if (idx >= pendingToSync.length) break;

      const task = pendingToSync[idx];
      let success = false;
      let attempts = 0;

      while (!success && attempts < 3) {
        attempts++;
        try {
          const { error } = await supabase
            .from('questions_direto')
            .update({
              commentary: task.commentary,
              options: task.options
            })
            .eq('id', task.id);

          if (!error) {
            success = true;
            successCount++;
          } else {
            if (attempts === 3) {
              errorCount++;
              console.error(`❌ [Worker ${workerId}] Falha id ${task.id}:`, error.message);
            } else {
              await new Promise(r => setTimeout(r, 200 * attempts));
            }
          }
        } catch (err) {
          if (attempts === 3) {
            errorCount++;
            console.error(`❌ [Worker ${workerId}] Exceção id ${task.id}:`, err.message);
          } else {
            await new Promise(r => setTimeout(r, 200 * attempts));
          }
        }
      }

      if ((successCount + errorCount) % 250 === 0 || (successCount + errorCount) === pendingToSync.length) {
        const pct = (((successCount + errorCount) / pendingToSync.length) * 100).toFixed(1);
        console.log(`📊 Progresso: ${successCount + errorCount} / ${pendingToSync.length} (${pct}%) | Sucessos: ${successCount} | Falhas: ${errorCount}`);
      }

      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, (_, i) => worker(i + 1));
  await Promise.all(workers);

  console.log('\n' + '='.repeat(80));
  console.log('✨ SINCRONIZAÇÃO EM questions_direto FINALIZADA!');
  console.log(` - Sucessos sincronizados: ${successCount}`);
  console.log(` - Falhas: ${errorCount}`);
  console.log('='.repeat(80));
}

run();
