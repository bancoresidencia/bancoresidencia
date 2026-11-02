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
const BACKUP_DIR = path.join(DATA_DIR, 'backups', `phase2_backup_${Date.now()}`);

function safeWriteFileSync(filePath, content) {
  let attempts = 0;
  while (attempts < 10) {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      return;
    } catch (err) {
      attempts++;
      if (attempts >= 10) throw err;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 150 * attempts);
    }
  }
}

function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanPrefix(norm) {
  return norm
    .replace(/^([0-9]{1,3}\s*[\.\-\)]\s*)/, '')
    .replace(/^(questao\s*[0-9]{1,3}\s*[\.\-\:]\s*)/, '')
    .replace(/^(assinale a alternativa (correta|incorreta|falsa|verdadeira)|com relacao a|a respeito de|sobre|quanto a|no que se refere a|considerando|diante do exposto|com base no caso)\s+/i, '')
    .trim();
}

function textSimilarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1.0;
  const wordsA = new Set(a.split(' ').filter(w => w.length > 2));
  const wordsB = new Set(b.split(' ').filter(w => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let intersection = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) intersection++;
  }
  const union = new Set([...wordsA, ...wordsB]).size;
  return intersection / union;
}

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
  console.log('🚀 EXECUÇÃO DA FASE 2: CRUZAMENTO SEMÂNTICO E RE-MAPEAMENTO DE CADERNOS PERMUTADOS');
  console.log('='.repeat(90));

  // 1. BACKUP DE SEGURANÇA
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`\n📦 1. Criando backup de segurança em:\n   ${BACKUP_DIR}`);
  for (const f of FILES) {
    const src = path.join(DATA_DIR, f.file);
    if (fs.existsSync(src)) {
      const dest = path.join(BACKUP_DIR, f.file);
      fs.copyFileSync(src, dest);
      console.log(`   • Backup criado: ${f.file}`);
    }
  }

  // 2. CARREGAR E INDEXAR MEDBRAVE CLEAN
  console.log('\n📦 2. Carregando acervo limpo do MedBrave (52.034 questões)...');
  const mbQuestions = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'medbrave_questions_clean.json'), 'utf8'));

  const mbIndexPrefix = new Map();
  const mbIndexMid = new Map();

  for (const mb of mbQuestions) {
    const rawNorm = normalize(mb.statement);
    const norm = cleanPrefix(rawNorm);
    if (norm.length < 25) continue;

    const isAnul = Boolean(mb.is_annulled || mb.correct_letter === 'ANULADA');
    let correctText = '';
    if (Array.isArray(mb.alternatives)) {
      const correctAlt = mb.alternatives.find(a => a.isCorrect || a.letter === mb.correct_letter);
      if (correctAlt) correctText = normalize(correctAlt.text);
    }

    if (!correctText && !isAnul) continue;

    const entry = {
      id: mb.id,
      year: mb.year,
      norm,
      isAnul,
      correct_letter: mb.correct_letter,
      correctText,
      alternatives: mb.alternatives || []
    };

    const p = norm.slice(0, 45);
    if (!mbIndexPrefix.has(p)) mbIndexPrefix.set(p, []);
    mbIndexPrefix.get(p).push(entry);

    if (norm.length >= 70) {
      const mid = norm.slice(Math.floor(norm.length / 2) - 20, Math.floor(norm.length / 2) + 20);
      if (!mbIndexMid.has(mid)) mbIndexMid.set(mid, []);
      mbIndexMid.get(mid).push(entry);
    }
  }

  console.log(`   • MedBrave indexado com sucesso (${mbQuestions.length.toLocaleString('pt-BR')} registros).`);

  // 3. EXECUTAR RE-MAPEAMENTO
  console.log('\n📝 3. Executando re-mapeamento de alternativas e saneamento...');

  const auditLog = [];
  const supabaseUpdates = new Map(); // qid -> { correct_answer, is_anulada, commentary }

  const stats = {
    totalAudited: 0,
    scrambledBookletsFixed: 0,
    newHomologated: 0,
    anuladasConfirmed: 0,
    commentsCleaned: 0,
    bySpec: {}
  };

  for (const f of FILES) {
    const fpath = path.join(DATA_DIR, f.file);
    if (!fs.existsSync(fpath)) continue;

    const questions = JSON.parse(fs.readFileSync(fpath, 'utf8'));
    stats.totalAudited += questions.length;

    let specScrambled = 0;
    let specNew = 0;
    let specAnul = 0;
    let specComm = 0;

    for (const q of questions) {
      const qid = q.id;
      if (!qid) continue;

      const currentAns = (q.correctAnswer || q.correct_answer || '').trim().toUpperCase();
      const currentAnul = Boolean(q.isAnulada || q.is_anulada || currentAns === 'ANULADA');
      const currentComm = q.commentary || '';

      // Pula questões em quarentena (sem opções ou truncadas)
      const isMultiChoice = q.type !== 'Dissertativa';
      const opts = q.options || [];
      const stmt = (q.statement || '').trim();
      if ((isMultiChoice && opts.length === 0) || stmt.length < 15) continue;

      const rawNorm = normalize(q.statement);
      const norm = cleanPrefix(rawNorm);
      if (norm.length < 25) continue;

      const p = norm.slice(0, 45);
      const mid = norm.length >= 70 ? norm.slice(Math.floor(norm.length / 2) - 20, Math.floor(norm.length / 2) + 20) : null;
      const pool = [...(mbIndexPrefix.get(p) || []), ...(mid ? (mbIndexMid.get(mid) || []) : [])];
      if (pool.length === 0) continue;

      const seenIds = new Set();
      let bestMatch = null;
      let highestSim = 0;

      for (const cand of pool) {
        if (seenIds.has(cand.id)) continue;
        seenIds.add(cand.id);

        if (cand.year && q.year && Math.abs(cand.year - q.year) > 1) continue;

        const simStmt = textSimilarity(norm, cand.norm);
        if (simStmt >= 0.85 && simStmt > highestSim) {
          if (cand.isAnul) {
            bestMatch = { cand, type: 'ANULADA', stmtSim: simStmt };
            highestSim = simStmt;
          } else if (Array.isArray(q.options) && q.options.length > 0 && cand.correctText) {
            for (const opt of q.options) {
              const optNorm = normalize(opt.text);
              const optSim = textSimilarity(cand.correctText, optNorm);
              if (optSim >= 0.85) {
                highestSim = simStmt;
                bestMatch = {
                  cand,
                  type: 'VALID',
                  assignedLetter: opt.letter,
                  optSim,
                  stmtSim: simStmt
                };
                break;
              }
            }
          }
        }
      }

      if (bestMatch) {
        let hasChange = false;
        let action = '';
        let targetAns = currentAns;
        let targetAnul = currentAnul;

        if (bestMatch.type === 'ANULADA') {
          if (!currentAnul) {
            hasChange = true;
            action = 'ANULACAO_CONFIRMADA_OFICIAL';
            targetAns = 'ANULADA';
            targetAnul = true;
            specAnul++;
            stats.anuladasConfirmed++;
          }
        } else if (bestMatch.type === 'VALID') {
          if (!currentAns && !currentAnul) {
            hasChange = true;
            action = 'NOVO_GABARITO_HOMOLOGADO';
            targetAns = bestMatch.assignedLetter;
            targetAnul = false;
            specNew++;
            stats.newHomologated++;
          } else if (currentAns && currentAns !== bestMatch.assignedLetter && !currentAnul) {
            hasChange = true;
            action = 'PERMUTACAO_CADERNO_CORRIGIDA';
            targetAns = bestMatch.assignedLetter;
            targetAnul = false;
            specScrambled++;
            stats.scrambledBookletsFixed++;
          }
        }

        if (hasChange) {
          const hadComm = Boolean(currentComm && currentComm.trim().length > 0);
          if (hadComm) {
            specComm++;
            stats.commentsCleaned++;
          }

          q.correctAnswer = targetAns;
          q.correct_answer = targetAns;
          q.isAnulada = targetAnul;
          q.is_anulada = targetAnul;
          q.commentary = ''; // LIMPO CONFORME DIRETRIZ

          auditLog.push({
            id: qid,
            code: q.code,
            spec: f.name,
            banca: q.banca || q.institution,
            year: q.year,
            action,
            oldAns: currentAns,
            newAns: targetAns,
            oldAnul: currentAnul,
            newAnul: targetAnul,
            mbId: bestMatch.cand.id,
            mbLetter: bestMatch.cand.correct_letter,
            stmtSim: (bestMatch.stmtSim * 100).toFixed(1) + '%',
            optSim: bestMatch.optSim ? (bestMatch.optSim * 100).toFixed(1) + '%' : null,
            commentCleaned: hadComm
          });

          supabaseUpdates.set(qid, {
            correct_answer: targetAns,
            is_anulada: targetAnul,
            commentary: ''
          });
        }
      }
    }

    stats.bySpec[f.name] = {
      total: questions.length,
      scrambledFixed: specScrambled,
      newHomologated: specNew,
      anuladasConfirmed: specAnul,
      commentsCleaned: specComm
    };

    // Salvar arquivo JSON local atualizado com retry
    safeWriteFileSync(fpath, JSON.stringify(questions, null, 2));
    console.log(`   ✅ [${f.name.padEnd(28)}]: ${specScrambled} permutações corrigidas | ${specNew} novos | ${specAnul} anuladas | ${specComm} comentários limpos`);
  }

  // 4. SALVAR RELATÓRIO DE AUDITORIA
  const auditPath = path.join(DATA_DIR, 'fase2_audit_log.json');
  fs.writeFileSync(auditPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: stats,
    sampleScrambled: auditLog.filter(a => a.action === 'PERMUTACAO_CADERNO_CORRIGIDA').slice(0, 100),
    sampleNew: auditLog.filter(a => a.action === 'NOVO_GABARITO_HOMOLOGADO').slice(0, 50),
    sampleAnul: auditLog.filter(a => a.action === 'ANULACAO_CONFIRMADA_OFICIAL').slice(0, 50)
  }, null, 2), 'utf8');

  console.log(`\n📄 Log de auditoria da Fase 2 salvo em:\n   • ${auditPath}`);

  // 5. SINCRONIZAÇÃO EM MASSA NO SUPABASE
  console.log(`\n📡 4. Sincronizando ${supabaseUpdates.size.toLocaleString('pt-BR')} alterações no Supabase (questions)...`);

  const grouped = new Map();
  for (const [qid, payload] of supabaseUpdates.entries()) {
    const key = `${payload.correct_answer}|${payload.is_anulada}|${payload.commentary}`;
    if (!grouped.has(key)) {
      grouped.set(key, { payload, ids: [] });
    }
    grouped.get(key).ids.push(qid);
  }

  console.log(`   • ${grouped.size} grupos atômicos formados para PATCH.`);

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
  console.log('🏁 RESULTADO CONSOLIDADO DA FASE 2:');
  console.log('='.repeat(90));
  console.log(`⭐ Permutações de Caderno Corrigidas (Gabarito trocado para a letra real): ${stats.scrambledBookletsFixed.toLocaleString('pt-BR')}`);
  console.log(`📘 Novos Gabaritos Homologados (que estavam pendentes): ${stats.newHomologated.toLocaleString('pt-BR')}`);
  console.log(`🛡️ Anulações Oficiais Confirmadas: ${stats.anuladasConfirmed.toLocaleString('pt-BR')}`);
  console.log(`🧹 Comentários Antigos Desatualizados Limpos: ${stats.commentsCleaned.toLocaleString('pt-BR')}`);
  console.log(`🔄 Total de Questões Atualizadas em Arquivo e Supabase: ${supabaseUpdates.size.toLocaleString('pt-BR')}`);
  console.log('='.repeat(90) + '\n');
}

main().catch(err => {
  console.error('❌ Erro fatal durante a execução:', err);
  process.exit(1);
});
