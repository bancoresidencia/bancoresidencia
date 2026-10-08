import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || 'https://ezluharxlmlqhdkqrjbz.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('ERRO: SUPABASE_SERVICE_ROLE_KEY não encontrada!');
  process.exit(1);
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

      if (res.ok) return true;

      const txt = await res.text();
      console.warn(`[Lote ${batchIndex}/${totalBatches}] Tentativa ${attempt} falhou: HTTP ${res.status} - ${txt.slice(0, 100)}`);
      if (attempt < retries) await new Promise(r => setTimeout(r, 1200 * attempt));
    } catch (err) {
      console.warn(`[Lote ${batchIndex}/${totalBatches}] Erro de rede ${attempt}: ${err.message}`);
      if (attempt < retries) await new Promise(r => setTimeout(r, 1200 * attempt));
    }
  }
  return false;
}

export async function syncGinecologia() {
  console.log('--- Sincronizando Gabaritos de Ginecologia ---');
  const solvedPath = path.resolve('data/ginecologia_ai_solved.json');
  const finalPath = path.resolve('data/ginecologia_final_questions.json');

  if (!fs.existsSync(solvedPath) || !fs.existsSync(finalPath)) {
    console.error('Arquivos necessários não encontrados.');
    return;
  }

  const solvedList = JSON.parse(fs.readFileSync(solvedPath, 'utf8'));
  const solvedMap = new Map();
  solvedList.forEach(s => {
    if (s && s.id && s.correctAnswer) solvedMap.set(s.id, s.correctAnswer);
  });
  console.log(`Gabaritos resolvidos carregados: ${solvedMap.size}`);

  const finalQuestions = JSON.parse(fs.readFileSync(finalPath, 'utf8'));
  let updatedCount = 0;

  for (const q of finalQuestions) {
    if (solvedMap.has(q.id)) {
      const newAns = solvedMap.get(q.id);
      if (q.correctAnswer !== newAns) {
        q.correctAnswer = newAns;
        updatedCount++;
      }
      // If commentary is default gabarito, update it with new letter
      if (!q.commentary || q.commentary.startsWith('Gabarito Oficial: Alternativa')) {
        q.commentary = `Gabarito Oficial: Alternativa ${newAns}.`;
      }
    }
  }

  console.log(`Questões com gabarito atualizado no dataset: ${updatedCount}`);
  fs.writeFileSync(finalPath, JSON.stringify(finalQuestions, null, 2));
  console.log(`Arquivo ${finalPath} salvo com sucesso!`);

  // Enviar para o Supabase
  const mapped = finalQuestions.map(mapQuestion);
  const BATCH_SIZE = 250;
  const totalBatches = Math.ceil(mapped.length / BATCH_SIZE);
  let success = 0;
  let failed = 0;

  console.log(`\nIniciando upload de ${mapped.length} questões para o Supabase em ${totalBatches} lotes...`);

  for (let i = 0; i < totalBatches; i++) {
    const chunk = mapped.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
    const ok = await uploadBatch(chunk, i + 1, totalBatches);
    if (ok) success += chunk.length;
    else failed += chunk.length;

    const pct = (((i + 1) / totalBatches) * 100).toFixed(1);
    process.stdout.write(`Progresso: [${i + 1}/${totalBatches}] ${pct}% | Sucesso: ${success} | Falhas: ${failed}\r`);
  }

  console.log(`\n\n🎉 Sincronização concluída! Total no Supabase: ${success} questões atualizadas.`);
}

if (process.argv[1]?.includes('sync_ginecologia_supabase.mjs')) {
  syncGinecologia().catch(console.error);
}
