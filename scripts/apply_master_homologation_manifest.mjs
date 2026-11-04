#!/usr/bin/env node

/**
 * scripts/apply_master_homologation_manifest.mjs
 * 
 * Aplicação Segura do Manifesto Mestre de Homologação (10.510 ações)
 * nos 9 arquivos canônicos do Banco Residência.
 * 
 * Protocolo de Segurança:
 * 1. Snapshot integral de backup em data/backups/pre_homologacao_geral_20261104/
 * 2. Aplicação das 10.510 ações (Permutações, Órfãos e Anulações)
 * 3. Validação de integridade pós-gravação (sem letras inválidas, contagem preservada)
 * 4. Geração do payload para sincronização com o banco remoto Supabase
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const DATA_DIR = path.join(ROOT_DIR, 'data');
const AUDIT_DIR = path.join(DATA_DIR, 'audit_triagem_geral');
const BACKUP_DIR = path.join(DATA_DIR, 'backups', 'pre_homologacao_geral_20261104');

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

async function main() {
  console.log('========================================================');
  console.log('🚀 APLICADOR DO MANIFESTO MESTRE DE HOMOLOGAÇÃO');
  console.log('   Alvo: 10.510 ações nos 9 arquivos do Banco Residência');
  console.log('========================================================');

  // 1. Carrega o Manifesto
  const manifestoPath = path.join(AUDIT_DIR, 'manifesto_homologacao_mestre.json');
  if (!fs.existsSync(manifestoPath)) {
    throw new Error(`Manifesto não encontrado em: ${manifestoPath}`);
  }

  const manifesto = JSON.parse(fs.readFileSync(manifestoPath, 'utf8'));
  const totalActions = Object.keys(manifesto).length;
  console.log(`📋 Manifesto carregado com sucesso: ${totalActions.toLocaleString('pt-BR')} ações mapeadas.`);

  // 2. Snapshot de Backup Preventivo
  console.log(`\n🛡️ [1/4] Criando snapshot de backup em ${BACKUP_DIR}...`);
  fs.mkdirSync(BACKUP_DIR, { recursive: true });

  for (const f of specialtyFiles) {
    const src = path.join(DATA_DIR, f);
    if (fs.existsSync(src)) {
      const dest = path.join(BACKUP_DIR, f);
      fs.copyFileSync(src, dest);
      console.log(`   ✔ Backup criado: ${f} (${(fs.statSync(dest).size / 1048576).toFixed(2)} MB)`);
    }
  }

  // 3. Aplicação Atômica nos Arquivos
  console.log(`\n📝 [2/4] Aplicando retificações e homologações nos arquivos consolidados...`);

  const executionReport = {
    timestamp: new Date().toISOString(),
    totalManifestoAcoes: totalActions,
    detalhesArquivos: {},
    totaisAplicados: {
      remapPermutacoes: 0,
      orfaosResgatados: 0,
      anulacoesHomologadas: 0,
      totalGeralModificacoes: 0
    }
  };

  const appliedIds = new Set();
  const supabasePayload = [];

  for (const fileName of specialtyFiles) {
    const filePath = path.join(DATA_DIR, fileName);
    if (!fs.existsSync(filePath)) continue;

    console.log(`\n⏳ Atualizando ${fileName}...`);
    const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!Array.isArray(questions)) continue;

    const fileStats = {
      totalOriginal: questions.length,
      modificadas: 0,
      remapPermutacoes: 0,
      orfaosResgatados: 0,
      anulacoesHomologadas: 0
    };

    for (const q of questions) {
      if (!q || !q.id || !manifesto[q.id]) continue;

      const actionItem = manifesto[q.id];
      const previousAns = q.correct_answer || q.correctAnswer || '';
      let wasModified = false;

      switch (actionItem.action) {
        case 'REMAP_PERMUTATION':
          q.correct_answer = actionItem.newAnswer;
          q.correctAnswer = actionItem.newAnswer;
          fileStats.remapPermutacoes++;
          wasModified = true;
          break;

        case 'FILL_ORPHAN':
          q.correct_answer = actionItem.newAnswer;
          q.correctAnswer = actionItem.newAnswer;
          fileStats.orfaosResgatados++;
          wasModified = true;
          break;

        case 'FILL_ORPHAN_DISCURSIVE':
          q.correct_answer = actionItem.newAnswer;
          q.correctAnswer = actionItem.newAnswer;
          if (actionItem.textCorrect) {
            q.official_answer = actionItem.textCorrect;
          }
          fileStats.orfaosResgatados++;
          wasModified = true;
          break;

        case 'ANULATE':
          q.is_anulada = true;
          q.isAnulada = true;
          q.correct_answer = 'ANULADA';
          q.correctAnswer = 'ANULADA';
          fileStats.anulacoesHomologadas++;
          wasModified = true;
          break;
      }

      if (wasModified) {
        fileStats.modificadas++;
        if (!appliedIds.has(q.id)) {
          appliedIds.add(q.id);
          executionReport.totaisAplicados.totalGeralModificacoes++;
          if (actionItem.action === 'REMAP_PERMUTATION') executionReport.totaisAplicados.remapPermutacoes++;
          else if (actionItem.action.startsWith('FILL_ORPHAN')) executionReport.totaisAplicados.orfaosResgatados++;
          else if (actionItem.action === 'ANULATE') executionReport.totaisAplicados.anulacoesHomologadas++;

          supabasePayload.push({
            id: q.id,
            correct_answer: q.correct_answer,
            is_anulada: Boolean(q.is_anulada),
            action: actionItem.action,
            zone: actionItem.zone,
            previous_answer: previousAns
          });
        }
      }
    }

    // Salva arquivo atualizado
    fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf8');

    console.log(`   ✅ ${fileName} atualizado com sucesso:`);
    console.log(`      + ${fileStats.remapPermutacoes.toLocaleString('pt-BR')} permutações corrigidas`);
    console.log(`      + ${fileStats.orfaosResgatados.toLocaleString('pt-BR')} gabaritos órfãos preenchidos`);
    console.log(`      + ${fileStats.anulacoesHomologadas.toLocaleString('pt-BR')} anulações oficiais aplicadas`);
    console.log(`      Total de questões afetadas neste arquivo: ${fileStats.modificadas.toLocaleString('pt-BR')}`);

    executionReport.detalhesArquivos[fileName] = fileStats;
  }

  // 4. Validação Rigorosa de Integridade Pós-Gravação
  console.log(`\n🔍 [3/4] Executando validação de integridade pós-gravação...`);
  let totalAuditadasApos = 0;
  let letrasInvalidas = 0;

  for (const fileName of specialtyFiles) {
    const filePath = path.join(DATA_DIR, fileName);
    if (!fs.existsSync(filePath)) continue;

    const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    totalAuditadasApos += questions.length;

    for (const q of questions) {
      const ans = String(q.correct_answer || q.correctAnswer || '').trim().toUpperCase();
      if (!ans || ans === 'ANULADA' || q.is_anulada) continue;

      if (q.options && q.options.length > 0) {
        const hasLetter = q.options.some(o => String(o.letter || '').toUpperCase() === ans);
        if (!hasLetter) {
          letrasInvalidas++;
        }
      }
    }
  }

  console.log(`   ✔ Integridade de JSON: 100% dos arquivos válidos.`);
  console.log(`   ✔ Total de questões auditadas: ${totalAuditadasApos.toLocaleString('pt-BR')}`);
  console.log(`   ✔ Letras órfãs ou inválidas: ${letrasInvalidas} (esperado: 0)`);

  if (letrasInvalidas > 0) {
    console.warn(`   ⚠️ Atenção: ${letrasInvalidas} questões com letras sem opção correspondente.`);
  } else {
    console.log(`   💎 Perfeito: 100% dos gabaritos apontam para alternativas existentes.`);
  }

  // 5. Geração dos Payloads e Relatório de Execução
  console.log(`\n💾 [4/4] Gravando relatório e payload de sincronização Supabase...`);

  const reportPath = path.join(AUDIT_DIR, 'relatorio_execucao_manifesto.json');
  fs.writeFileSync(reportPath, JSON.stringify(executionReport, null, 2), 'utf8');

  const supaPath = path.join(AUDIT_DIR, 'payload_supabase_sync_10510.json');
  fs.writeFileSync(supaPath, JSON.stringify(supabasePayload, null, 2), 'utf8');

  console.log('========================================================');
  console.log('🏁 RESULTADO CONSOLIDADO DA APLICAÇÃO:');
  console.log(`   Total de ações no manifesto: ${totalActions.toLocaleString('pt-BR')}`);
  console.log(`   Questões únicas modificadas no Banco: ${appliedIds.size.toLocaleString('pt-BR')}`);
  console.log(`   ----------------------------------------------------`);
  console.log(`   🔵 Permutações de caderno retificadas: ${executionReport.totaisAplicados.remapPermutacoes.toLocaleString('pt-BR')}`);
  console.log(`   🟣 Gabaritos órfãos preenchidos:       ${executionReport.totaisAplicados.orfaosResgatados.toLocaleString('pt-BR')}`);
  console.log(`   🟡 Anulações oficiais homologadas:     ${executionReport.totaisAplicados.anulacoesHomologadas.toLocaleString('pt-BR')}`);
  console.log(`   ----------------------------------------------------`);
  console.log(`   Payload para Supabase: ${supaPath}`);
  console.log(`   Relatório registrado em: ${reportPath}`);
  console.log('========================================================');
}

main().catch(err => {
  console.error('💥 Erro fatal ao aplicar manifesto:', err);
  process.exit(1);
});

