import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ezluharxlmlqhdkqrjbz.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_KEY) {
  console.error('Erro: SUPABASE_SERVICE_ROLE_KEY não configurada nas variáveis de ambiente.');
}
function mapQuestion(q) {
  return {
    id: String(q.id || '').trim(),
    code: q.code || '',
    institution: q.institution || '',
    banca: q.banca || '',
    year: Number(q.year) || 2024,
    tipo_prova: q.tipoProva || 'Prova 1',
    modalidade: q.modalidade || 'Residência Médica',
    especialidade: q.especialidade || q.specialty || '',
    tema: q.tema || '',
    foco: q.foco || '',
    subfoco: q.subfoco || '',
    difficulty: q.difficulty || 'Médio',
    type: q.type || 'Múltipla escolha',
    is_anulada: Boolean(q.isAnulada),
    statement: q.statement || '',
    options: Array.isArray(q.options) ? q.options : [],
    correct_answer: q.correctAnswer || '',
    commentary: q.commentary || '',
    images: Array.isArray(q.images) ? q.images : (q.imageUrl ? [q.imageUrl] : [])
  };
}

async function uploadBatch(records, batchIndex, totalBatches, retries = 3) {
  const url = `${SUPABASE_URL}/rest/v1/questions`;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(records)
      });

      if (response.ok) {
        return true;
      }

      const errText = await response.text();
      console.warn(`[Lote ${batchIndex}/${totalBatches}] Tentativa ${attempt} falhou: Status ${response.status} - ${errText.slice(0, 150)}`);
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1500 * attempt));
      }
    } catch (err) {
      console.warn(`[Lote ${batchIndex}/${totalBatches}] Erro de rede tentativa ${attempt}: ${err.message}`);
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1500 * attempt));
      }
    }
  }
  return false;
}

async function run() {
  console.log('--- Iniciando Importação para o Supabase ---');
  console.log(`Endpoint: ${SUPABASE_URL}`);

  const allQuestionsMap = new Map();

  // 1. Carregar urologia
  const urologiaPath = path.resolve('data/urologia_final_questions.json');
  if (fs.existsSync(urologiaPath)) {
    console.log('Lendo data/urologia_final_questions.json...');
    const raw = JSON.parse(fs.readFileSync(urologiaPath, 'utf8'));
    for (const q of raw) {
      if (q.id) allQuestionsMap.set(String(q.id), mapQuestion(q));
    }
    console.log(`Carregadas ${raw.length} questões de Urologia.`);
  }

  // 2. Carregar ginecologia
  const ginecologiaPath = path.resolve('data/ginecologia_final_questions.json');
  if (fs.existsSync(ginecologiaPath)) {
    console.log('Lendo data/ginecologia_final_questions.json...');
    const raw = JSON.parse(fs.readFileSync(ginecologiaPath, 'utf8'));
    for (const q of raw) {
      if (q.id) allQuestionsMap.set(String(q.id), mapQuestion(q));
    }
    console.log(`Carregadas ${raw.length} questões de Ginecologia.`);
  }

  const allQuestions = Array.from(allQuestionsMap.values());
  console.log(`\nTotal de questões únicas para envio: ${allQuestions.length}`);

  const BATCH_SIZE = 250;
  const totalBatches = Math.ceil(allQuestions.length / BATCH_SIZE);
  let successCount = 0;
  let failedCount = 0;

  console.log(`Enviando em ${totalBatches} lotes de até ${BATCH_SIZE} questões...\n`);

  for (let i = 0; i < totalBatches; i++) {
    const chunk = allQuestions.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
    const ok = await uploadBatch(chunk, i + 1, totalBatches);

    if (ok) {
      successCount += chunk.length;
    } else {
      failedCount += chunk.length;
    }

    const pct = (((i + 1) / totalBatches) * 100).toFixed(1);
    process.stdout.write(`Progresso: [${i + 1}/${totalBatches}] ${pct}% - Enviadas: ${successCount} | Falhas: ${failedCount}\r`);
  }

  console.log('\n\n--- Importação Concluída! ---');
  console.log(`Sucesso: ${successCount} questões importadas no Supabase.`);
  if (failedCount > 0) {
    console.warn(`Atenção: ${failedCount} questões falharam após retentativas.`);
  }
}

run().catch(console.error);
