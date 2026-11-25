import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const GROQ_KEY = process.env.GROQ_API_KEY || env.GROQ_API_KEY || '';
const MODELS = ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b'];

const envPath = path.resolve('.env.local');
const env = {};
fs.readFileSync(envPath, 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY);
const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

const failedCodes = ['EXP-DIR-104221', 'EXP-DIR-904', 'EXP-DIR-158602', 'EXP-DIR-207354', 'EXP-DIR-205812'];

function sanitizePostgres(str) {
  if (!str) return '';
  return String(str).replace(/\u0000/g, '').replace(/\\u0000/g, '').replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '');
}

async function solveOne(code, mIdx = 0) {
  const q = db.prepare('SELECT * FROM questions_curated_staging WHERE code = ?').get(code);
  if (!q) return;

  let options = [];
  try { options = JSON.parse(q.options); } catch { }
  if (!Array.isArray(options)) options = [];

  const goldAnswer = (q.correct_answer || '').toUpperCase().trim();
  const optLetters = options.map(o => o.letter).join(', ');
  const formattedOptions = options.map(o => `${o.letter}) ${o.text}`).join('\n');

  const prompt = `Você é um Pediatra e Preceptor de Residência Médica (SBP / Ministério da Saúde / Nelson Tratado de Pediatria).
Fundamente com rigor acadêmico, concisão e exatidão clínica o gabarito oficial da banca examinadora.

Dados da Questão:
- Instituição/Banca: ${q.institution || q.banca || 'Oficial'} (${q.year || 2024})
- Tema: Pediatria - ${q.tema || 'Geral'}

Enunciado:
${q.statement}

Alternativas:
${formattedOptions}

🔒 GABARITO OFICIAL IMUTÁVEL (ÂNCORA DE OURO): ALTERNATIVA ${goldAnswer}.
Fundamente tecnicamente por que a alternativa ${goldAnswer} é a correta e aponte o erro dos demais distratores. Proibido divergir do gabarito oficial.

REGRAS OBRIGATÓRIAS:
1. Justificativas das Opções (${optLetters}):
   - Letra correta (${goldAnswer}): Destaque o conceito padrão-ouro ou conduta mandatória em **negrito**.
   - Distratores incorretos: Seja conciso (1 a 2 frases curtas). Destaque em **negrito** o trecho ou conceito errôneo e indique a correção médica.
2. Comentário Integrado (finalCommentary):
   - Apresente um texto corrido único, coeso, direto e completo (cerca de 100 a 140 palavras), unindo o diagnóstico à conduta. Destaque termos diagnósticos e condutas em **negrito**.
3. Take-Home Message:
   - Uma regra de ouro ou pérola clínica direta e inesquecível em 1 período.

RESPONDA EXCLUSIVAMENTE EM JSON VÁLIDO:
{
  "options": {
    ${options.map(o => `"${o.letter}": "..."`).join(',\n    ')}
  },
  "finalCommentary": "...",
  "takeHomeMessage": "..."
}`;

  const model = MODELS[mIdx % MODELS.length];
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + GROQ_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: 'Preceptor de Pediatria de elite. Responda estritamente em JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 1500
    })
  });

  if (!res.ok) {
    console.log(`Retry ${code} em 5s...`);
    await new Promise(r => setTimeout(r, 5000));
    return solveOne(code, mIdx + 1);
  }

  const data = await res.json();
  const parsed = JSON.parse(data.choices[0].message.content);

  const cleanFinal = sanitizePostgres(parsed.finalCommentary || '');
  const cleanTakeHome = sanitizePostgres(parsed.takeHomeMessage || '');
  const fullCommentary = `${cleanFinal}\n\n**Take-Home Message:** ${cleanTakeHome}`;

  const cleanedOptions = options.map(opt => ({
    ...opt,
    text: sanitizePostgres(opt.text),
    explanation: sanitizePostgres(parsed.options?.[opt.letter] || '')
  }));

  const uuidMatch = q.id.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  const plainId = uuidMatch ? uuidMatch[0] : q.id.replace(/^(questions_expansion_direto_|expansion_direto_|questions_)/, '');

  await supabase.from('questions_direto').update({ commentary: fullCommentary, options: cleanedOptions }).eq('id', plainId);
  await supabase.from('questions').update({ commentary: fullCommentary, options: cleanedOptions }).eq('id', plainId).then(() => { }).catch(() => { });
  db.prepare('UPDATE questions_curated_staging SET commentary = ?, options = ? WHERE id = ?').run(fullCommentary, JSON.stringify(cleanedOptions), q.id);

  console.log(`✅ [RETRY OK] ${code} | 🤖 ${model} | Supabase OK`);
}

async function run() {
  for (const c of failedCodes) {
    await solveOne(c);
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log('Todos os retries concluídos com sucesso!');
}
run();
