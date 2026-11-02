import fs from 'fs';
import path from 'path';

// Carregar variáveis de ambiente de .env.local
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ ERRO: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes em .env.local');
  process.exit(1);
}

const BASE_DIR = process.cwd();
const DATA_DIR = path.join(BASE_DIR, 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups', `phase1_backup_${Date.now()}`);

const FILES = [
  { key: 'cirurgia', name: 'Cirurgia', file: 'cirurgia_final_questions.json' },
  { key: 'clinica', name: 'Clínica Médica', file: 'clinica_medica_final_questions.json' },
  { key: 'ginecologia', name: 'Ginecologia', file: 'ginecologia_final_questions.json' },
  { key: 'preventiva', name: 'Medicina Preventiva e Social', file: 'medicina_preventiva_final_questions.json' },
  { key: 'obstetricia', name: 'Obstetrícia', file: 'obstetricia_final_questions.json' },
  { key: 'pediatria', name: 'Pediatria', file: 'pediatria_final_questions.json' },
  { key: 'urologia', name: 'Urologia', file: 'urologia_final_questions.json' }
];

async function main() {
  console.log('='.repeat(90));
  console.log('🚀 EXECUÇÃO DA FASE 1: APLICAÇÃO PADRÃO-OURO & QUARENTENA DE QUESTÕES DANIFICADAS');
  console.log('='.repeat(90));

  // 1. BACKUP DE SEGURANÇA
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`\n📦 1. Criando backup de segurança dos arquivos locais em:\n   ${BACKUP_DIR}`);
  for (const f of FILES) {
    const src = path.join(DATA_DIR, f.file);
    if (fs.existsSync(src)) {
      const dest = path.join(BACKUP_DIR, f.file);
      fs.copyFileSync(src, dest);
      console.log(`   • Backup criado: ${f.file}`);
    }
  }

  // 2. CARREGAR CHECKPOINTS DE OURO
  console.log('\n📦 2. Carregando Checkpoints Padrão-Ouro em memória...');
  const goldGineco = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'checkpoints', 'ginecologia_gold_anchors_complete.json'), 'utf8'));
  const goldUro = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'checkpoints', 'urologia_gold_anchors_complete.json'), 'utf8'));
  const goldAll = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'all_homologated_questions_gold.json'), 'utf8'));

  const ginecoMap = new Map();
  goldGineco.forEach(g => {
    const ans = (g.official_answer || g.correct_answer || g.correctAnswer || '').trim().toUpperCase();
    if (ans && ['A', 'B', 'C', 'D', 'E', 'ANULADA'].includes(ans)) {
      ginecoMap.set(g.id, { ans, isAnul: ans === 'ANULADA', source: 'checkpoint_gineco' });
    }
  });

  const uroMap = new Map();
  goldUro.forEach(u => {
    const ans = (u.official_answer || u.correct_answer || u.correctAnswer || '').trim().toUpperCase();
    if (ans && ['A', 'B', 'C', 'D', 'E', 'ANULADA'].includes(ans)) {
      uroMap.set(u.id, { ans, isAnul: ans === 'ANULADA', source: 'checkpoint_uro' });
    }
  });

  const allMap = new Map();
  goldAll.forEach(a => {
    const ans = (a.official_answer || a.correct_answer || a.correctAnswer || '').trim().toUpperCase();
    if (ans && ['A', 'B', 'C', 'D', 'E', 'ANULADA'].includes(ans)) {
      allMap.set(a.id, { ans, isAnul: ans === 'ANULADA', source: 'checkpoint_gold_all' });
    }
  });

  console.log(`   • Checkpoint Ginecologia: ${ginecoMap.size} gabaritos válidos`);
  console.log(`   • Checkpoint Urologia: ${uroMap.size} gabaritos válidos`);
  console.log(`   • Checkpoint Geral Ouro: ${allMap.size} gabaritos válidos`);

  // 3. APLICAR CORREÇÕES NOS ARQUIVOS LOCAIS
  console.log('\n📝 3. Aplicando correções locais e quarentena...');

  const auditLog = [];
  const quarantineLog = [];
  const supabaseUpdates = new Map(); // qid -> { correct_answer, is_anulada, commentary }

  const stats = {
    totalAudited: 0,
    gabaritosCorrected: 0,
    commentsCleaned: 0,
    quarantined: 0,
    bySpec: {}
  };

  for (const f of FILES) {
    const fpath = path.join(DATA_DIR, f.file);
    if (!fs.existsSync(fpath)) continue;

    const questions = JSON.parse(fs.readFileSync(fpath, 'utf8'));
    stats.totalAudited += questions.length;

    let specCorr = 0;
    let specComm = 0;
    let specQuar = 0;

    for (const q of questions) {
      const qid = q.id;
      if (!qid) continue;

      const currentAns = (q.correctAnswer || q.correct_answer || '').trim().toUpperCase();
      const currentAnul = Boolean(q.isAnulada || q.is_anulada || currentAns === 'ANULADA');
      const currentComm = q.commentary || '';

      const isMultiChoice = q.type !== 'Dissertativa';
      const opts = q.options || [];
      const stmt = (q.statement || '').trim();

      // REGRA DE QUARENTENA: Múltipla escolha sem opções OU enunciado truncado (< 15 chars)
      const isMissingOpts = isMultiChoice && opts.length === 0;
      const isTruncatedStmt = stmt.length < 15;

      if ((isMissingOpts || isTruncatedStmt) && !currentAnul) {
        q.isAnulada = true;
        q.is_anulada = true;
        q.correctAnswer = 'ANULADA';
        q.correct_answer = 'ANULADA';
        q.commentary = '';

        specQuar++;
        stats.quarantined++;

        quarantineLog.push({
          id: qid,
          code: q.code,
          spec: f.name,
          reason: isMissingOpts ? 'MULTIPLA_ESCOLHA_SEM_OPCOES' : 'ENUNCIADO_TRUNCADO_MENOR_15_CHARS',
          optionsCount: opts.length,
          statementSnippet: stmt.slice(0, 60)
        });

        supabaseUpdates.set(qid, {
          correct_answer: 'ANULADA',
          is_anulada: true,
          commentary: ''
        });

        continue;
      }

      // REGRA DE PADRÃO-OURO: Verifica divergência contra os checkpoints
      let gold = null;
      if (f.key === 'ginecologia') gold = ginecoMap.get(qid);
      else if (f.key === 'urologia') gold = uroMap.get(qid);
      else gold = allMap.get(qid);

      if (gold) {
        const isDiff = gold.isAnul ? !currentAnul : (currentAns !== gold.ans || currentAnul);
        if (isDiff) {
          specCorr++;
          stats.gabaritosCorrected++;

          const hadComment = Boolean(currentComm && currentComm.trim().length > 0);
          if (hadComment) {
            specComm++;
            stats.commentsCleaned++;
          }

          const newAns = gold.ans;
          const newAnul = gold.isAnul;

          // Aplicação estrita: atualiza gabarito e limpa comentário desatualizado
          q.correctAnswer = newAns;
          q.correct_answer = newAns;
          q.isAnulada = newAnul;
          q.is_anulada = newAnul;
          q.commentary = ''; // LIMPO CONFORME ORDEM DO USUÁRIO

          auditLog.push({
            id: qid,
            code: q.code,
            spec: f.name,
            oldAns: currentAns,
            newAns: newAns,
            oldAnul: currentAnul,
            newAnul: newAnul,
            source: gold.source,
            commentCleaned: hadComment
          });

          supabaseUpdates.set(qid, {
            correct_answer: newAns,
            is_anulada: newAnul,
            commentary: ''
          });
        }
      }
    }

    stats.bySpec[f.name] = {
      total: questions.length,
      corrected: specCorr,
      commentsCleaned: specComm,
      quarantined: specQuar
    };

    // Salvar arquivo JSON local atualizado
    fs.writeFileSync(fpath, JSON.stringify(questions, null, 2), 'utf8');
    console.log(`   ✅ [${f.name.padEnd(28)}]: ${specCorr} gabaritos corrigidos | ${specComm} comentários limpos | ${specQuar} em quarentena`);
  }

  // 4. SALVAR RELATÓRIOS LOCAIS DE AUDITORIA
  const auditPath = path.join(DATA_DIR, 'fase1_audit_log.json');
  fs.writeFileSync(auditPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: stats,
    sampleAudit: auditLog.slice(0, 100),
    sampleQuarantine: quarantineLog.slice(0, 100)
  }, null, 2), 'utf8');

  const quarPath = path.join(DATA_DIR, 'quarentena_questions.json');
  fs.writeFileSync(quarPath, JSON.stringify(quarantineLog, null, 2), 'utf8');

  console.log(`\n📄 Logs gerados em:\n   • ${auditPath}\n   • ${quarPath}`);

  // 5. SINCRONIZAÇÃO EM MASSA NO SUPABASE VIA PATCH POR GRUPOS
  console.log(`\n📡 4. Sincronizando ${supabaseUpdates.size.toLocaleString('pt-BR')} alterações no Supabase (questions)...`);

  // Agrupar IDs por tupla (correct_answer, is_anulada, commentary)
  const grouped = new Map();
  for (const [qid, payload] of supabaseUpdates.entries()) {
    const key = `${payload.correct_answer}|${payload.is_anulada}|${payload.commentary}`;
    if (!grouped.has(key)) {
      grouped.set(key, { payload, ids: [] });
    }
    grouped.get(key).ids.push(qid);
  }

  console.log(`   • ${grouped.size} grupos atômicos distintos formados para PATCH.`);

  const BATCH_SIZE = 100;
  const updateTasks = [];

  for (const [, group] of grouped.entries()) {
    for (let i = 0; i < group.ids.length; i += BATCH_SIZE) {
      const chunk = group.ids.slice(i, i + BATCH_SIZE);
      updateTasks.push({
        ids: chunk,
        payload: group.payload
      });
    }
  }

  console.log(`   • Total de requisições de lote necessárias: ${updateTasks.length}`);

  const CONCURRENCY = 8;
  let completedTasks = 0;
  let successfulRows = 0;
  let taskIndex = 0;

  async function worker() {
    while (taskIndex < updateTasks.length) {
      const curr = updateTasks[taskIndex++];
      const filter = `id=in.(${curr.ids.join(',')})`;
      const url = `${SUPABASE_URL}/rest/v1/questions?${filter}`;

      let attempts = 0;
      let success = false;

      while (attempts < 3 && !success) {
        attempts++;
        try {
          const res = await fetch(url, {
            method: 'PATCH',
            headers: {
              'apikey': SERVICE_KEY,
              'Authorization': `Bearer ${SERVICE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify(curr.payload)
          });

          if (res.ok) {
            success = true;
            successfulRows += curr.ids.length;
            completedTasks++;
            process.stdout.write(`\r   Progresso Supabase: ${completedTasks}/${updateTasks.length} lotes (${successfulRows.toLocaleString('pt-BR')} questões sincronizadas)...`);
          } else {
            const errText = await res.text();
            console.warn(`\n   ⚠️ Tentativa ${attempts} falhou no lote (status ${res.status}): ${errText.slice(0, 80)}`);
            await new Promise(r => setTimeout(r, 1000 * attempts));
          }
        } catch (e) {
          console.warn(`\n   ⚠️ Tentativa ${attempts} erro de conexão: ${e.message}`);
          await new Promise(r => setTimeout(r, 1000 * attempts));
        }
      }

      if (!success) {
        console.error(`\n❌ Falha persistente ao atualizar lote com ${curr.ids.length} IDs.`);
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);
  console.log(`\n\n🎉 Sincronização Supabase concluída: ${successfulRows.toLocaleString('pt-BR')} registros sincronizados com sucesso!`);

  // 6. RELATÓRIO CONSOLIDADO FINAL
  console.log('\n' + '='.repeat(90));
  console.log('🏁 RESULTADO CONSOLIDADO DA FASE 1:');
  console.log('='.repeat(90));
  console.log(`⭐ Total de Gabaritos Homologados Corrigidos pelo Checkpoint Ouro: ${stats.gabaritosCorrected.toLocaleString('pt-BR')}`);
  console.log(`🧹 Total de Comentários Desatualizados Limpos: ${stats.commentsCleaned.toLocaleString('pt-BR')}`);
  console.log(`🛡️ Total de Questões Danificadas Isoladas em Quarentena: ${stats.quarantined.toLocaleString('pt-BR')}`);
  console.log(`🔄 Total de Questões Atualizadas em Arquivo e Supabase: ${supabaseUpdates.size.toLocaleString('pt-BR')}`);
  console.log('='.repeat(90) + '\n');
}

main().catch(err => {
  console.error('❌ Erro fatal durante a execução:', err);
  process.exit(1);
});

