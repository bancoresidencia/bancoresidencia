import fs from 'fs';
import path from 'path';

const BASE_DIR = process.cwd();
const GOLD_PATH = path.join(BASE_DIR, 'data', 'all_homologated_questions_gold.json');
const STATUS_PATH = path.join(BASE_DIR, 'data', 'lote2_sync_status.json');
const LOG_PATH = path.join(BASE_DIR, 'data', 'lote2_execution.log');

// Carrega variáveis de ambiente
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
  console.error('❌ ERRO: Credenciais Supabase ausentes em .env.local');
  process.exit(1);
}

function log(msg) {
  const ts = new Date().toLocaleTimeString('pt-BR');
  const line = `[${ts}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_PATH, line + '\n', 'utf8');
}

// ⚠️ ISOLAMENTO TOTAL DO LOTE 1 (Regra Pétrea de Não-Interferência)
const LOTE1_KEYWORDS = [
  'enare', 'enamed', 'ebserh',
  'sus-sp', 'sus sp',
  'ses-pe', 'ses pe', 'iaupe',
  'usp', 'fuvest', 'hcfmusp', 'hcrp',
  'iamspe', 'hspe',
  'unesp', 'hcfmb',
  'fmabc',
  'unifesp', 'epm',
  'santa casa de sao paulo', 'santa casa de sp', 'iscmsp', 'fcmscsp'
];

function isLote1(inst) {
  if (!inst) return false;
  const s = inst.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return LOTE1_KEYWORDS.some(k => s.includes(k));
}

async function runLote2Daemon() {
  fs.writeFileSync(LOG_PATH, `=== CONTINUAÇÃO AUTOMATIZADA DA COLETA E HOMOLOGAÇÃO DO LOTE 2 ===\nInício: ${new Date().toISOString()}\n\n`, 'utf8');
  log('🚀 Iniciando Motor de Continuação do Lote 2 em Segundo Plano...');

  if (!fs.existsSync(GOLD_PATH)) {
    log(`❌ Arquivo ${GOLD_PATH} não encontrado.`);
    return;
  }

  const rawGold = JSON.parse(fs.readFileSync(GOLD_PATH, 'utf8'));
  log(`📂 Catálogo Geral carregado com ${rawGold.length.toLocaleString('pt-BR')} registros.`);

  // Filtra estritamente Lote 2+ (excluindo Lote 1) e deduplica por ID
  const uniqueMap = new Map();
  let lote1Ignoradas = 0;

  for (const q of rawGold) {
    if (!q.id || !q.correct_answer) continue;
    if (isLote1(q.institution)) {
      lote1Ignoradas++;
      continue;
    }
    uniqueMap.set(q.id, q);
  }

  const candidateQuestions = Array.from(uniqueMap.values());
  log(`🛡️ Isolamento Lote 1 aplicado: ${lote1Ignoradas.toLocaleString('pt-BR')} questões do Lote 1 preservadas intactas.`);
  log(`🎯 Total de questões elegíveis para Lote 2 / Expansão: ${candidateQuestions.length.toLocaleString('pt-BR')}`);

  // Estatísticas por especialidade (Opção A: Todas as áreas médicas)
  const bySpec = {};
  candidateQuestions.forEach(q => {
    const sp = q.specialty || 'geral_acesso_direto';
    bySpec[sp] = (bySpec[sp] || 0) + 1;
  });
  log(`📊 Distribuição de Especialidades (Opção A - Todas as Áreas): ${JSON.stringify(bySpec)}`);

  // Processamento em lotes com verificação de status existente (continuação de onde parou)
  const CHUNK_SIZE = 40;
  let jaHomologadas = 0;
  let recemAtualizadas = 0;
  let erros = 0;
  const startTime = Date.now();

  for (let i = 0; i < candidateQuestions.length; i += CHUNK_SIZE) {
    const chunk = candidateQuestions.slice(i, i + CHUNK_SIZE);
    const ids = chunk.map(q => q.id);

    // Consulta estado atual no Supabase para pular as que já estão homologadas
    let existingMap = new Map();
    try {
      const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/questions?id=in.(${ids.join(',')})&select=id,correct_answer,commentary`, {
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`
        }
      });
      if (checkRes.ok) {
        const rows = await checkRes.json();
        rows.forEach(r => existingMap.set(r.id, r));
      }
    } catch (e) {}

    // Filtra apenas as que precisam ser atualizadas/homologadas
    const toUpdate = [];
    for (const q of chunk) {
      const existing = existingMap.get(q.id);
      const isAlreadyOfficial = existing && 
        existing.commentary && 
        existing.commentary.includes('Gabarito Oficial Homologado') && 
        existing.correct_answer && 
        ['A', 'B', 'C', 'D', 'E', 'ANULADA'].includes(existing.correct_answer.toUpperCase().trim());

      if (isAlreadyOfficial) {
        jaHomologadas++;
      } else {
        toUpdate.push(q);
      }
    }

    // Executa PATCH concorrente para as pendentes
    if (toUpdate.length > 0) {
      await Promise.all(toUpdate.map(async q => {
        const isAnul = q.is_anulada === true || ['ANULADA', 'X', 'NULA', '*'].includes((q.correct_answer || '').toUpperCase().trim());
        const finalAns = isAnul ? 'ANULADA' : q.correct_answer.toUpperCase().trim();
        const shortInst = (q.institution || 'Banca Oficial').split(' - ')[0].trim();
        const commentary = `Gabarito Oficial Homologado - ${shortInst} ${q.year || ''} (Prova Oficial Definitiva)`.replace(/\s+/g, ' ').trim();

        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?id=eq.${q.id}`, {
            method: 'PATCH',
            headers: {
              'apikey': SERVICE_KEY,
              'Authorization': `Bearer ${SERVICE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              correct_answer: finalAns,
              commentary: commentary,
              is_anulada: isAnul
            })
          });

          if (res.ok) {
            recemAtualizadas++;
          } else {
            erros++;
          }
        } catch (err) {
          erros++;
        }
      }));
    }

    const processed = Math.min(i + CHUNK_SIZE, candidateQuestions.length);
    const pct = ((processed / candidateQuestions.length) * 100).toFixed(1);
    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(0);

    // Grava checkpoint de status a cada 200 itens ou no final
    if (processed % 200 === 0 || processed === candidateQuestions.length) {
      log(`⚡ Progresso Lote 2: ${processed}/${candidateQuestions.length} (${pct}%) | Já Homologadas: ${jaHomologadas} | Recém-Homologadas: ${recemAtualizadas} | Falhas: ${erros} | Tempo: ${elapsedSec}s`);

      const statusPayload = {
        timestamp: new Date().toISOString(),
        status: processed === candidateQuestions.length ? 'CONCLUIDO' : 'EM_EXECUCAO',
        total_candidatas_lote2: candidateQuestions.length,
        processadas: processed,
        ja_homologadas_previamente: jaHomologadas,
        homologadas_nesta_execucao: recemAtualizadas,
        erros: erros,
        cobertura_homologacao: `${pct}%`,
        tempo_decorrido_segundos: elapsedSec,
        especialidades: bySpec
      };

      fs.writeFileSync(STATUS_PATH, JSON.stringify(statusPayload, null, 2), 'utf8');
    }
  }

  log(`\n🎉 [CONCLUÍDO] Sincronização e Homologação do Lote 2 finalizada com sucesso!`);
  log(`📊 Total Homologadas: ${jaHomologadas + recemAtualizadas} | Novas Gravadas: ${recemAtualizadas} | Erros: ${erros}`);
}

runLote2Daemon().catch(err => {
  log(`❌ ERRO FATAL NO MOTOR DO LOTE 2: ${err.message}`);
  process.exit(1);
});
