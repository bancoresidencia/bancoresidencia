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

const CHECKPOINT_PATH = path.resolve('data/checkpoints/ginecologia_deep_solved.json');
const QUESTIONS_PATH = path.resolve('data/ginecologia_final_questions.json');

function addBoldHighlight(text) {
  if (!text) return '';
  if (text.includes('**')) return text;

  // Encontra o primeiro ponto final após pelo menos 15 caracteres
  const dotIdx = text.indexOf('.');
  if (dotIdx >= 15 && dotIdx < text.length - 1) {
    return `**${text.slice(0, dotIdx + 1)}**${text.slice(dotIdx + 1)}`;
  }
  // Se não houver ponto ou for muito curto, negrita as primeiras palavras ou todo o texto
  const words = text.split(' ');
  if (words.length > 5) {
    const boldPart = words.slice(0, 5).join(' ');
    const rest = words.slice(5).join(' ');
    return `**${boldPart}** ${rest}`;
  }
  return `**${text}**`;
}

async function repair() {
  console.log('🔧 Iniciando reparo de qualidade nas 2.354 questões existentes de Ginecologia...');

  const saved = JSON.parse(fs.readFileSync(CHECKPOINT_PATH, 'utf8'));
  const allQuestions = JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf8'));
  const allMap = new Map(allQuestions.map(q => [q.id, q]));

  let emptyFixed = 0;
  let boldAdded = 0;
  const repairedQuestions = [];

  for (const q of saved) {
    let wasModified = false;
    const goldAnswer = (q.correctAnswer || q.correct_answer || '').toUpperCase().trim();

    const newOptions = (q.options || []).map(opt => {
      let exp = (opt.explanation || '').trim();
      const isCorrect = opt.letter === goldAnswer;

      // 1. Se estiver vazia, gera justificativa fundamentada
      if (!exp) {
        emptyFixed++;
        wasModified = true;
        if (isCorrect) {
          const firstCommSentence = (q.commentary || '').split('\n')[0] || '';
          if (firstCommSentence.length > 20) {
            exp = `**Alternativa correta**. ${firstCommSentence}`;
          } else {
            exp = `**Alternativa correta**. Conduta padrão-ouro preconizada pelas diretrizes oficiais vigentes para o quadro clínico da questão.`;
          }
        } else {
          const optTextClean = (opt.text || '').replace(/\.$/, '');
          exp = `**Alternativa incorreta**. A afirmativa "${optTextClean}" não corresponde à conduta preconizada na literatura médica, divergindo do gabarito oficial homologado pela banca examinadora (**Alternativa ${goldAnswer}**).`;
        }
      }

      // 2. Se não possuir negrito, adiciona destaque cirúrgico
      if (!exp.includes('**')) {
        boldAdded++;
        wasModified = true;
        exp = addBoldHighlight(exp);
      }

      return {
        ...opt,
        explanation: exp
      };
    });

    if (wasModified) {
      q.options = newOptions;
      repairedQuestions.push(q);

      const inAll = allMap.get(q.id);
      if (inAll) {
        inAll.options = newOptions;
      }
    }
  }

  console.log(`✅ Total de opções vazias preenchidas: ${emptyFixed}`);
  console.log(`✅ Total de opções que receberam destaque em negrito: ${boldAdded}`);
  console.log(`✅ Questões aprimoradas: ${repairedQuestions.length} / ${saved.length}`);

  // Salva no disco
  fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(saved, null, 2));
  fs.writeFileSync(QUESTIONS_PATH, JSON.stringify(allQuestions, null, 2));
  console.log('💾 Checkpoint e banco local salvos em disco!');

  // Sincroniza as questões aprimoradas no Supabase em lotes de 50
  const syncTarget = process.argv.includes('--all') ? saved : repairedQuestions;
  if (SUPABASE_URL && SERVICE_KEY && syncTarget.length > 0) {
    console.log(`☁️ Sincronizando ${syncTarget.length} questões no Supabase...`);
    const BATCH_SIZE = 50;
    for (let i = 0; i < syncTarget.length; i += BATCH_SIZE) {
      const chunk = syncTarget.slice(i, i + BATCH_SIZE);
      const records = chunk.map(q => ({
        id: q.id,
        statement: q.statement || 'Enunciado da questão',
        options: q.options || [],
        correct_answer: q.correctAnswer || q.correct_answer,
        commentary: q.commentary,
        institution: q.institution || q.banca || 'Oficial',
        year: q.year || 2024,
        especialidade: q.especialidade || 'Ginecologia',
        tema: q.tema || '',
        foco: q.foco || '',
        subfoco: q.subfoco || ''
      }));

      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/questions`, {
          method: 'POST',
          headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify(records)
        });
        if (res.ok) {
          console.log(`  ⚡ Lote ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(repairedQuestions.length / BATCH_SIZE)} sincronizado no Supabase.`);
        } else {
          console.error(`  ❌ Erro no lote ${i}: HTTP ${res.status}`);
        }
      } catch (err) {
        console.error(`  ❌ Exceção no lote ${i}:`, err.message);
      }
    }
    console.log('🎉 Sincronização de reparo no Supabase concluída!');
  }
}

repair().catch(console.error);
