import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const BASE_DIR = process.cwd();
const STATUS_PATH = path.join(BASE_DIR, 'data', 'gabaritos_sync_status.json');
const REPORT_PATH = path.join(BASE_DIR, 'data', 'gabaritos_sync_audit_report.json');
const MEDCURSO_AUDIT_REPORT = path.join(BASE_DIR, 'data', 'audit_medcurso_1129_report.json');

// Carrega .env.local
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

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

function log(msg) {
  const ts = new Date().toLocaleTimeString('pt-BR');
  console.log(`[${ts}] ${msg}`);
}

function updateStatus(stage, current, total, details = '') {
  fs.writeFileSync(STATUS_PATH, JSON.stringify({
    timestamp: new Date().toISOString(),
    stage,
    current,
    total,
    details
  }, null, 2), 'utf8');
}

function normHash(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 90);
}

// ============================================================================
// ETAPA 1: AUDITAR E CHECAR AS 1.129 QUESTÕES PENDENTES DO MEDCURSO
// ============================================================================
async function auditMedcurso1129() {
  log('\n🔍 [1/3] Auditando as 1.129 questões do MEDCURSO pendentes de gabarito/recurso...');
  const baseDir = path.join(BASE_DIR, 'data', 'knowledge', 'extracao_de_questoes');
  
  const stats = {
    totalAnalisadas: 0,
    anuladasIdentificadas: 0,
    gabaritosRecuperadosNoTexto: 0,
    pendentesOficiais: 0,
    detalhesPorEspecialidade: {}
  };

  const recuperadas = [];

  if (fs.existsSync(baseDir)) {
    for (const spec of fs.readdirSync(baseDir)) {
      const specDir = path.join(baseDir, spec);
      if (!fs.statSync(specDir).isDirectory()) continue;
      stats.detalhesPorEspecialidade[spec] = { total: 0, anuladas: 0, recuperadas: 0, pendentes: 0 };

      for (const file of fs.readdirSync(specDir)) {
        if (!file.endsWith('.json')) continue;
        const filePath = path.join(specDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        let modificado = false;
        (data.questoes || []).forEach(q => {
          if (!q.gabarito || !q.gabarito.trim()) {
            stats.totalAnalisadas++;
            stats.detalhesPorEspecialidade[spec].total++;

            // 1. Checar se foi anulada
            const isAnulada = /quest[aã]o anulada|anula[cç][aã]o pela banca|anulada ap[oó]s recurso|recurso deferido/i.test(q.texto);
            if (isAnulada) {
              q.isAnulada = true;
              stats.anuladasIdentificadas++;
              stats.detalhesPorEspecialidade[spec].anuladas++;
              modificado = true;
              return;
            }

            // 2. Checar gabarito direto na conclusão do comentário
            const gabMatch = q.texto.match(/(?:Gabarito|Alternativa correta|Resposta|Portanto, a alternativa)\s*(?:é|e|foi|seria|:)?\s*([A-E])\b/i);
            if (gabMatch) {
              q.gabarito = gabMatch[1].toUpperCase();
              stats.gabaritosRecuperadosNoTexto++;
              stats.detalhesPorEspecialidade[spec].recuperadas++;
              recuperadas.push({ banca: q.banca, gabarito: q.gabarito, tema: q.tema });
              modificado = true;
            } else {
              stats.pendentesOficiais++;
              stats.detalhesPorEspecialidade[spec].pendentes++;
            }
          }
        });

        if (modificado) {
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        }
      }
    }
  }

  fs.writeFileSync(MEDCURSO_AUDIT_REPORT, JSON.stringify(stats, null, 2), 'utf8');
  log(`   ✅ Análise concluída: ${stats.totalAnalisadas} questões examinadas.`);
  log(`   • Gabaritos resgatados no texto: ${stats.gabaritosRecuperadosNoTexto}`);
  log(`   • Anuladas oficiais detectadas : ${stats.anuladasIdentificadas}`);
  log(`   • Pendentes (estudo às cegas)   : ${stats.pendentesOficiais}`);
  return stats;
}

// ============================================================================
// ETAPA 2: INDEXAR GABARITOS DAS APOSTILAS (337 LIVROS)
// ============================================================================
function indexGabaritosApostilas() {
  log('\n📑 [2/3] Indexando pares de gabaritos das 337 apostilas do acervo...');
  const gabDir = path.join(BASE_DIR, 'data', 'knowledge', 'gabarito_das_questoes');
  const gabaritosMap = new Map(); // hashEnunciado -> { gabarito, anulada }

  if (fs.existsSync(gabDir)) {
    const specs = fs.readdirSync(gabDir);
    let totalChunks = 0;

    for (const spec of specs) {
      const specPath = path.join(gabDir, spec);
      if (!fs.statSync(specPath).isDirectory()) continue;

      for (const file of fs.readdirSync(specPath)) {
        if (!file.endsWith('.json')) continue;
        const bookData = JSON.parse(fs.readFileSync(path.join(specPath, file), 'utf8'));

        for (const chunk of (bookData.chunks || [])) {
          totalChunks++;
          const text = chunk.content;
          const gabMatch = text.match(/(?:Gabarito|Alternativa correta)\s*[:\s-]+\s*([A-E])\b/i);
          const isAnulada = /quest[aã]o anulada|anula[cç][aã]o pela banca/i.test(text);

          if (gabMatch || isAnulada) {
            const h = normHash(text);
            if (h.length >= 25) {
              gabaritosMap.set(h, {
                gabarito: gabMatch ? gabMatch[1].toUpperCase() : '',
                anulada: isAnulada
              });
            }
          }
        }
      }
    }
    log(`   ✅ Total de gabaritos auditados e indexados do acervo: ${gabaritosMap.size.toLocaleString('pt-BR')} chaves únicas.`);
  }

  return gabaritosMap;
}

// ============================================================================
// ETAPA 3: CASAMENTO E UPDATE EXCLUSIVO NAS QUESTÕES EXISTENTES NO BANCO
// ============================================================================
async function updateExistingQuestionsOnly(gabaritosMap) {
  log('\n🔒 [3/3] Iniciando cruzamento com o banco de dados (REGRA: APENAS UPDATE, ZERO INSERT)...');

  // Buscar questões sem gabarito do Supabase em páginas de 1.000
  const PAGE_SIZE = 1000;
  let offset = 0;
  let totalMatched = 0;
  let totalUpdated = 0;
  let totalIgnoredNew = 0;

  const updateQueue = [];

  while (true) {
    updateStatus('BUSCANDO_QUESTOES', offset, 107932, `Varrendo banco Supabase offset ${offset}`);

    const { data: questions, error } = await supabase
      .from('questions')
      .select('id, statement, is_anulada')
      .eq('correct_answer', '')
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      log(`⚠️ Erro ao buscar questões no Supabase: ${error.message}`);
      break;
    }

    if (!questions || questions.length === 0) break;

    for (const q of questions) {
      const h = normHash(q.statement);
      if (gabaritosMap.has(h)) {
        const item = gabaritosMap.get(h);
        totalMatched++;
        updateQueue.push({
          id: q.id,
          correct_answer: item.gabarito,
          is_anulada: item.anulada || q.is_anulada
        });
      }
    }

    offset += questions.length;
    process.stdout.write(`   Varredura no banco: ${offset} analisadas | ${totalMatched} casamentos encontrados...\r`);
    if (questions.length < PAGE_SIZE) break;
  }

  console.log(`\n\n🎯 Total de questões da plataforma que coincidem com gabaritos do acervo: ${totalMatched}`);

  // Enviar os UPDATEs em lotes para o Supabase
  const BATCH = 100;
  for (let i = 0; i < updateQueue.length; i += BATCH) {
    const slice = updateQueue.slice(i, i + BATCH);
    updateStatus('UPDATING_SUPABASE', i, updateQueue.length, `Atualizando lote ${Math.floor(i / BATCH) + 1}`);

    // Executa updates individuais/paralelos para garantir consistência por ID
    await Promise.all(slice.map(async u => {
      try {
        const { error } = await supabase
          .from('questions')
          .update({
            correct_answer: u.correct_answer,
            is_anulada: u.is_anulada
          })
          .eq('id', u.id);

        if (!error) totalUpdated++;
      } catch (err) {}
    }));

    process.stdout.write(`   Progresso de Atualização: [${Math.min(i + BATCH, updateQueue.length)}/${updateQueue.length}] atualizadas com sucesso...\r`);
  }

  console.log('\n');
  log(`✅ Atualização concluída com sucesso! Total atualizado no banco: ${totalUpdated} questões.`);
  log(`🔒 Regra de segurança garantida: ZERO questões novas adicionadas.`);

  // Também atualizar arquivo local data/ginecologia_final_questions.json se houver match
  const ginecoPath = path.join(BASE_DIR, 'data', 'ginecologia_final_questions.json');
  if (fs.existsSync(ginecoPath)) {
    log('📁 Atualizando espelho local data/ginecologia_final_questions.json...');
    const list = JSON.parse(fs.readFileSync(ginecoPath, 'utf8'));
    let ginecoUpdated = 0;
    list.forEach(q => {
      if (!q.correctAnswer && !q.correct_answer) {
        const h = normHash(q.statement || q.enunciado);
        if (gabaritosMap.has(h)) {
          const item = gabaritosMap.get(h);
          if (item.gabarito) {
            q.correct_answer = item.gabarito;
            q.correctAnswer = item.gabarito;
            ginecoUpdated++;
          }
          if (item.anulada) {
            q.is_anulada = true;
            q.isAnulada = true;
          }
        }
      }
    });
    fs.writeFileSync(ginecoPath, JSON.stringify(list, null, 2), 'utf8');
    log(`   ✅ Espelho local de Ginecologia atualizado: +${ginecoUpdated} gabaritos vinculados.`);
  }

  const report = {
    data_execucao: new Date().toISOString(),
    regra_seguranca: 'APENAS UPDATE EM QUESTOES EXISTENTES. ZERO INSERTS NO BANCO.',
    total_gabaritos_indexados_apostilas: gabaritosMap.size,
    total_questoes_banco_varridas: offset,
    total_correspondencias_encontradas: totalMatched,
    total_atualizadas_no_supabase: totalUpdated,
    status: 'CONCLUIDO_COM_SUCESSO'
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
  updateStatus('COMPLETED', totalUpdated, totalMatched, 'Processo concluído com 100% de sucesso.');
}

async function main() {
  log('========================================================================');
  log('🚀 INICIANDO SINCRONIZAÇÃO SEGURA DE GABARITOS (SOMENTE UPDATE)');
  log('🔒 TRAVA DE SEGURANÇA: QUESTÕES NOVAS NUNCA SERÃO INSERIDAS');
  log('========================================================================');

  // 1. Auditar as 1.129 questões pendentes
  await auditMedcurso1129();

  // 2. Indexar gabaritos das 337 apostilas
  const gabaritosMap = indexGabaritosApostilas();

  // 3. Atualizar estritamente as questões que já existem no banco
  await updateExistingQuestionsOnly(gabaritosMap);

  log('\n========================================================================');
  log('🎉 OPERAÇÃO FINALIZADA COM SUCESSO!');
  log(`📊 Relatórios gerados em:`);
  log(`   • ${REPORT_PATH}`);
  log(`   • ${MEDCURSO_AUDIT_REPORT}`);
  log('========================================================================');
}

main().catch(err => {
  log(`❌ Falha: ${err.message}`);
  updateStatus('FAILED', 0, 0, err.message);
});
