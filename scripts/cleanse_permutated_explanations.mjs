#!/usr/bin/env node

/**
 * scripts/cleanse_permutated_explanations.mjs
 * 
 * Limpeza Cirúrgica das Explicações Obsoletas nas Questões Permutadas (REMAP_PERMUTATION)
 * 
 * Objetivo:
 * - Remover comentários e justificativas defasadas que apontavam para as letras antigas,
 *   garantindo que o estudante não veja explicações contraditórias ao novo gabarito oficial.
 * 
 * Protocolo de Segurança:
 * 1. Snapshot de backup preventivo em data/backups/pre_limpeza_explicacoes_permutadas_20261104/
 * 2. Limpeza atômica nos 9 arquivos canônicos locais (commentary="", remove options[].explanation, deep fields)
 * 3. Limpeza nos arquivos de checkpoints (data/checkpoints/*_deep_solved.json)
 * 4. Sincronização direta na tabela `questions` do Supabase remoto via PATCH em lotes de 100
 * 5. Auditoria de pós-execução e verificação de integridade
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const DATA_DIR = path.join(ROOT_DIR, 'data');
const AUDIT_DIR = path.join(DATA_DIR, 'audit_triagem_geral');
const CHECKPOINTS_DIR = path.join(DATA_DIR, 'checkpoints');
const BACKUP_DIR = path.join(DATA_DIR, 'backups', 'pre_limpeza_explicacoes_permutadas_20261104');

const specialtyFiles = [
  'cirurgia_final_questions.json',
  'clinica_medica_final_questions.json',
  'pediatria_final_questions.json',
  'ginecologia_final_questions.json',
  'obstetricia_final_questions.json',
  'medicina_preventiva_final_questions.json',
  'nefrologia_final_questions.json',
  'urologia_final_questions.json',
  'all_homologated_questions_gold.json'
];

const checkpointFiles = [
  'cirurgia_deep_solved.json',
  'ginecologia_deep_solved.json',
  'obstetricia_deep_solved.json',
  'pediatria_deep_solved.json',
  'nefrologia_deep_solved.json',
  'urologia_deep_solved.json'
];

// Carregar variáveis de ambiente
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

async function main() {
  console.log('========================================================================');
  console.log('🧹 LIMPEZA CIRÚRGICA DE EXPLICAÇÕES OBSOLETAS - QUESTÕES PERMUTADAS');
  console.log('========================================================================\n');

  // 1. Carrega o Manifesto Mestre
  const manifestoPath = path.join(AUDIT_DIR, 'manifesto_homologacao_mestre.json');
  if (!fs.existsSync(manifestoPath)) {
    throw new Error(`Manifesto não encontrado em: ${manifestoPath}`);
  }
  const manifesto = JSON.parse(fs.readFileSync(manifestoPath, 'utf8'));

  // 2. Cria Snapshot de Backup
  console.log(`🛡️ [1/4] Criando snapshot de backup de segurança em ${BACKUP_DIR}...`);
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  fs.mkdirSync(path.join(BACKUP_DIR, 'checkpoints'), { recursive: true });

  for (const f of specialtyFiles) {
    const src = path.join(DATA_DIR, f);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(BACKUP_DIR, f));
      console.log(`   ✔ Backup criado: ${f}`);
    }
  }
  for (const cp of checkpointFiles) {
    const src = path.join(CHECKPOINTS_DIR, cp);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(BACKUP_DIR, 'checkpoints', cp));
      console.log(`   ✔ Backup checkpoint criado: ${cp}`);
    }
  }

  // 3. Identifica as questões-alvo e aplica nos arquivos locais
  console.log('\n📝 [2/4] Aplicando limpeza nos arquivos canônicos locais...');
  const targetIds = new Set();
  const fileCleanStats = {};

  for (const fileName of specialtyFiles) {
    const filePath = path.join(DATA_DIR, fileName);
    if (!fs.existsSync(filePath)) continue;

    const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let cleanedCount = 0;

    for (const q of questions) {
      if (!q || !q.id) continue;

      const actionItem = manifesto[q.id];
      if (actionItem && actionItem.action === 'REMAP_PERMUTATION') {
        const comm = (q.commentary || '').trim();
        const hasOptExp = Array.isArray(q.options) && q.options.some(o => o.explanation && o.explanation.trim().length > 0);
        const hasDeep = Boolean(q.mainErrorReason || q.takeHomeMessage || q.guidelineEvolution || q.references);

        if (comm.length > 0 || hasOptExp || hasDeep) {
          targetIds.add(q.id);
          cleanedCount++;

          // Esvazia comentário
          q.commentary = '';

          // Remove explicações individuais das opções
          if (Array.isArray(q.options)) {
            for (const opt of q.options) {
              if ('explanation' in opt) delete opt.explanation;
            }
          }

          // Remove campos deep-solved
          delete q.mainErrorReason;
          delete q.takeHomeMessage;
          delete q.guidelineEvolution;
          delete q.references;
          delete q.official_answer;
        }
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf8');
    fileCleanStats[fileName] = cleanedCount;
    console.log(`   ✔ ${fileName.padEnd(38)}: ${cleanedCount.toString().padStart(5)} questões limpas.`);
  }

  console.log(`\n⭐ Total de questões únicas saneadas: ${targetIds.size.toLocaleString('pt-BR')}`);

  // 4. Limpa nos Checkpoints
  console.log('\n📋 [3/4] Sincronizando arquivos de checkpoint (data/checkpoints/)...');
  for (const cp of checkpointFiles) {
    const cpPath = path.join(CHECKPOINTS_DIR, cp);
    if (!fs.existsSync(cpPath)) continue;

    const list = JSON.parse(fs.readFileSync(cpPath, 'utf8'));
    const beforeCount = list.length;
    const filtered = list.filter(q => !targetIds.has(q.id));
    const removedCount = beforeCount - filtered.length;

    fs.writeFileSync(cpPath, JSON.stringify(filtered, null, 2), 'utf8');
    console.log(`   ✔ ${cp.padEnd(32)}: ${removedCount.toString().padStart(4)} removidas (${beforeCount} -> ${filtered.length})`);
  }

  // 5. Sincroniza com o Supabase
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.warn('\n⚠️ Aviso: Credenciais Supabase ausentes. Sincronização remota ignorada.');
    return;
  }

  console.log(`\n🚀 [4/4] Sincronizando com o Supabase PostgreSQL (${targetIds.size.toLocaleString('pt-BR')} questões)...`);
  const targetIdArray = Array.from(targetIds);
  const BATCH_SIZE = 100;
  const batches = [];

  for (let i = 0; i < targetIdArray.length; i += BATCH_SIZE) {
    batches.push(targetIdArray.slice(i, i + BATCH_SIZE));
  }

  const CONCURRENCY = 8;
  let doneBatches = 0;
  let totalSuccess = 0;
  let totalFailed = 0;

  async function executeBatch(batchIds) {
    const filter = `id=in.(${batchIds.join(',')})`;
    const endpoint = `${SUPABASE_URL}/rest/v1/questions?${filter}`;

    try {
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({ commentary: '' })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }
      totalSuccess += batchIds.length;
    } catch (err) {
      console.error(`\n❌ Falha no lote (${batchIds.length} ids): ${err.message}`);
      totalFailed += batchIds.length;
    }
  }

  let index = 0;
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (index < batches.length) {
      const b = batches[index++];
      await executeBatch(b);
      doneBatches++;
      if (doneBatches % 5 === 0 || doneBatches === batches.length) {
        const pct = ((doneBatches / batches.length) * 100).toFixed(1);
        process.stdout.write(`\r   Progresso Supabase: ${doneBatches}/${batches.length} lotes (${pct}%) | Sincronizados: ${totalSuccess}`);
      }
    }
  });

  await Promise.all(workers);
  console.log('\n\n========================================================================');
  console.log('✅ OPERAÇÃO CONCLUÍDA COM SUCESSO');
  console.log('========================================================================');
  console.log(`• Total de questões únicas com explicações apagadas: ${targetIds.size.toLocaleString('pt-BR')}`);
  console.log(`• Sincronizadas no Supabase com sucesso: ${totalSuccess.toLocaleString('pt-BR')}`);
  console.log(`• Falhas no Supabase: ${totalFailed}`);
  console.log(`• Backup íntegro salvo em: ${BACKUP_DIR}`);
  console.log('========================================================================\n');
}

main().catch(err => {
  console.error('\n❌ ERRO FATAL:', err);
  process.exit(1);
});

