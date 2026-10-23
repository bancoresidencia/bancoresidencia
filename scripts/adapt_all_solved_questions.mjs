import fs from 'fs';
import path from 'path';

// Carrega variáveis do .env.local
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/["']/g, '');
  });
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ ERRO: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados no .env.local');
  process.exit(1);
}

const CHECKPOINT_PATH = path.resolve('data/checkpoints/ginecologia_deep_solved.json');
const QUESTIONS_PATH = path.resolve('data/ginecologia_final_questions.json');

export function cleanOptionExplanation(text) {
  if (!text) return '';
  let res = text.trim();

  // Remove meta-linguagem de acerto/erro da alternativa
  res = res.replace(/^(?:Esta\s+(?:é\s+a\s+)?alternativa\s+(?:CORRETA|INCORRETA|correta|incorreta)[^.:\n]*[.:]\s*)/i, '');
  res = res.replace(/^(?:Alternativa\s+(?:CORRETA|INCORRETA|correta|incorreta)[^.:\n]*[.:]\s*)/i, '');
  res = res.replace(/^(?:A\s+alternativa\s+correta\s+está\s+correta\s+(?:porque|pois)\s*)/i, '');
  res = res.replace(/^(?:A\s+alternativa(?:\s+[A-E])?\s+(?:está|é\s+a)\s+(?:correta|incorreta)\s+(?:porque|pois|já que|visto que|devido ao fato de que|:|-)?\s*)/i, '');
  res = res.replace(/^(?:Esta\s+alternativa\s+(?:está\s+)?(?:correta|incorreta)\s+(?:porque|pois|já que|:|-)?\s*)/i, '');
  res = res.replace(/^(?:(?:Correta|Incorreta)\s+(?:porque|pois|já que|visto que)\s*)/i, '');
  res = res.replace(/^(?:(?:Correta|Incorreta)[.:-]\s*)/i, '');
  res = res.replace(/^(?:Opção\s+[A-E][.:-]?\s*(?:correta|incorreta)?[.:-]?\s*)/i, '');

  res = res.trim();
  if (res.length > 0) {
    res = res.charAt(0).toUpperCase() + res.slice(1);
  }
  return res;
}

export function cleanCommentary(comm) {
  if (!comm) return '';
  let res = comm.trim();

  // 1. Remove Gabarito Oficial do topo
  res = res.replace(/^Gabarito Oficial:\s*Alternativa\s*[A-E]\.?\s*/im, '');

  // 2. Remove Resumo Clínico e Diagnóstico
  res = res.replace(/^Resumo Clínico e Diagnóstico:\s*/im, '');
  res = res.replace(/^Resumo Clínico:\s*/im, '');

  // 3. Remove bloco duplicado "Análise das Alternativas"
  const altBlockRegex = /(?:Análise das Alternativas|Comentário das Alternativas|Justificativa das Alternativas|Alternativas):([\s\S]*?)(?=(?:\n\s*\n\s*(?:Principal Motivo|Take-Home|Evolução|Referências)|$))/i;
  res = res.replace(altBlockRegex, '');

  // 4. Take-Home Message
  res = res.replace(/Take-Home Message\s*\([^)]*Pérola[^)]*\):?/gi, 'Take-Home Message:');
  res = res.replace(/(Take-Home Message:[\s\n]*)(?:\(?\s*Pérola Prática\s*[:)]?\s*)/gi, '$1');

  // 5. Evolução de Diretrizes
  res = res.replace(/Evolução de Diretrizes(?:\s*(?:&|e)\s*Contexto Histórico)?(?:\s*da Banca)?:?/gi, 'Evolução de Diretrizes:');
  res = res.replace(/(Evolução de Diretrizes:[\s\n]*)(?:(?:&|e)\s*)?Contexto Histórico(?:\s*da Banca)?[:\s]*/gi, '$1');
  res = res.replace(/(Evolução de Diretrizes:[\s\n]*)da Banca[:\s]*/gi, '$1');

  // 6. Referências
  res = res.replace(/(?:Referências Teóricas|Base Teórica & Diretrizes Médicas|Fontes Bibliográficas):?/gi, 'Referências:');
  res = res.replace(/^•\s*(?:Teóricas?|Base Teórica)\s*$/gim, '');

  // 7. Sanitização de quebras de linha
  res = res.replace(/\n{3,}/g, '\n\n').trim();
  return res;
}

async function uploadBatchToSupabase(records) {
  const url = `${SUPABASE_URL}/rest/v1/questions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(records)
  });
  return res.ok;
}

async function main() {
  console.log('\n=============================================================');
  console.log('🔄 ADAPTAÇÃO CIRÚRGICA DE TODAS AS 1.761 QUESTÕES RESOLVIDAS');
  console.log('=============================================================\n');

  if (!fs.existsSync(CHECKPOINT_PATH)) {
    console.error(`Checkpoint não encontrado em ${CHECKPOINT_PATH}`);
    process.exit(1);
  }

  const checkpoint = JSON.parse(fs.readFileSync(CHECKPOINT_PATH, 'utf8'));
  const solvedKeys = Object.keys(checkpoint);
  console.log(`📦 Questões no checkpoint para adaptar: ${solvedKeys.length}`);

  // Mapa com os dados originais para garantir integridade de todos os campos
  let originalMap = new Map();
  let questionsList = [];
  if (fs.existsSync(QUESTIONS_PATH)) {
    questionsList = JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf8'));
    originalMap = new Map(questionsList.map(q => [q.id, q]));
    console.log(`📚 Catálogo de questões ginecologia carregado: ${questionsList.length} itens.`);
  }

  const adaptedQuestions = [];
  let updatedInCatalogCount = 0;

  for (const k of solvedKeys) {
    const q = checkpoint[k];
    const orig = originalMap.get(q.id) || {};

    // 1. Limpa explicações das alternativas
    const cleanedOptions = (q.options || orig.options || []).map(opt => ({
      letter: opt.letter,
      text: opt.text,
      explanation: cleanOptionExplanation(opt.explanation || '')
    }));

    // 2. Limpa comentário geral
    const cleanedComm = cleanCommentary(q.commentary || '');

    // Atualiza objeto da questão
    q.options = cleanedOptions;
    q.commentary = cleanedComm;

    // Atualiza no checkpoint
    checkpoint[k] = q;

    // Atualiza no catálogo geral se existir
    if (originalMap.has(q.id)) {
      const origItem = originalMap.get(q.id);
      origItem.options = cleanedOptions;
      origItem.commentary = cleanedComm;
      updatedInCatalogCount++;
    }

    // Prepara payload para o Supabase
    adaptedQuestions.push({
      id: q.id,
      statement: q.statement || orig.statement || 'Enunciado da questão',
      options: cleanedOptions,
      correct_answer: q.correctAnswer || q.correct_answer || orig.correctAnswer || orig.correct_answer,
      commentary: cleanedComm,
      institution: q.institution || orig.institution || q.banca || orig.banca || 'Oficial',
      year: q.year || orig.year || 2024,
      especialidade: q.especialidade || orig.especialidade || 'Ginecologia',
      tema: q.tema || orig.tema || '',
      foco: q.foco || orig.foco || '',
      subfoco: q.subfoco || orig.subfoco || ''
    });
  }

  // 1. Salva checkpoint atualizado
  fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2), 'utf8');
  console.log(`💾 Checkpoint salvo localmente: ${CHECKPOINT_PATH}`);

  // 2. Salva catálogo geral se houver atualizações
  if (questionsList.length > 0) {
    fs.writeFileSync(QUESTIONS_PATH, JSON.stringify(questionsList, null, 2), 'utf8');
    console.log(`💾 Catálogo geral salvo localmente: ${QUESTIONS_PATH} (${updatedInCatalogCount} questões sincronizadas)`);
  }

  // 3. Sincroniza em lotes de 50 no Supabase
  console.log('\n☁️ Sincronizando com o Supabase em lotes de 50...');
  const BATCH_SIZE = 50;
  const totalBatches = Math.ceil(adaptedQuestions.length / BATCH_SIZE);
  let successCount = 0;

  for (let i = 0; i < adaptedQuestions.length; i += BATCH_SIZE) {
    const batch = adaptedQuestions.slice(i, i + BATCH_SIZE);
    const batchIndex = Math.floor(i / BATCH_SIZE) + 1;
    const ok = await uploadBatchToSupabase(batch);

    if (ok) {
      successCount += batch.length;
      process.stdout.write(`  [${batchIndex}/${totalBatches}] Sincronizadas ${successCount}/${adaptedQuestions.length} questões no Supabase...\r`);
    } else {
      console.error(`\n❌ Falha no lote ${batchIndex}. Tentando novamente...`);
      // Retry único
      await new Promise(r => setTimeout(r, 1000));
      const retryOk = await uploadBatchToSupabase(batch);
      if (retryOk) {
        successCount += batch.length;
      } else {
        console.error(`❌ Erro persistente no lote ${batchIndex}`);
      }
    }
  }

  console.log('\n\n=============================================================');
  console.log(`🎉 CONCLUÍDO COM SUCESSO!`);
  console.log(`• Total adaptadas: ${adaptedQuestions.length} questões`);
  console.log(`• Total sincronizadas no Supabase: ${successCount} questões`);
  console.log(`• O processo foi pausado conforme solicitado.`);
  console.log('=============================================================\n');
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
