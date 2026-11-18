import fs from 'fs';
import path from 'path';
import { loadLocalEnv, resolveGeminiKey } from './load_env.mjs';

const env = loadLocalEnv();
const PAID_KEY = resolveGeminiKey(env, ['GEMINI_API_KEY_PAID', 'GEMINI_API_KEY_ON_DEMAND', 'GEMINI_API_KEY']);
if (!PAID_KEY) {
  console.error('❌ Defina GEMINI_API_KEY_PAID no .env.local ou passe --key=...');
  process.exit(1);
}
const QUESTIONS_FILE = path.resolve('data/medicina_preventiva_final_questions.json');
const TARGET_CODES = [
  'UFRGSHCPA-2022-MPS-0004', // SUS / Financiamento
  'UFSCHU-2019-MPS-0050',    // Testes Diagnósticos (Sensibilidade / Especificidade)
  'UFPRHC-2019-MPS-0085'     // Atenção Primária / Prevenção Combinada (PrEP / PEP)
];

const allQuestions = JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf8'));
const selectedQuestions = TARGET_CODES.map(code => allQuestions.find(q => q.code === code)).filter(Boolean);

console.log(`Carregadas ${selectedQuestions.length} questões para o benchmark.`);

function buildPrompt(q) {
  const goldAnswer = (q.correctAnswer || q.correct_answer || '').toUpperCase().trim();
  const formattedOptions = (q.options || []).map(opt => `${opt.letter}) ${opt.text}`).join('\n');
  const optLetters = (q.options || []).map(o => o.letter).join(', ');
  const optionsSchemaExample = (q.options || [])
    .map(o => o.letter === goldAnswer
      ? `    "${o.letter}": "Conceito padrão-ouro em **negrito**"`
      : `    "${o.letter}": "Erro em **negrito** e correção (máx 120 carac)"`)
    .join(',\n');

  const roleInstruction = 'Você é um Médico Sanitarista, Epidemiologista e preceptor de residência médica. Fundamente com as diretrizes do Ministério da Saúde, Legislação do SUS (Leis 8.080/90 e 8.142/90, NOBs, NOAS, PNAB) e referências consagradas de Epidemiologia (Rouquayrol, Medronho, Fletcher).';

  return `${roleInstruction}
Fundamente com rigor acadêmico, concisão e exatidão clínica o gabarito oficial da banca examinadora.

Dados da Questão:
- Instituição/Banca: ${q.institution || 'Oficial'} (${q.year || 2024})
- Especialidade: Medicina Preventiva - ${q.tema || 'Geral'}

Enunciado:
${q.statement}

Alternativas:
${formattedOptions}

🔒 GABARITO OFICIAL IMUTÁVEL (ÂNCORA DE OURO): ALTERNATIVA ${goldAnswer}.
Fundamente tecnicamente por que a alternativa ${goldAnswer} é a correta e aponte o erro dos demais distratores. Proibido divergir do gabarito oficial.

REGRAS OBRIGATÓRIAS:
1. Justificativas das Opções (${optLetters}):
   - Letra correta (${goldAnswer}): Destaque o conceito padrão-ouro ou conduta mandatória em **negrito**.
   - Distratores incorretos: Seja conciso (1 a 2 frases curtas, 100-120 caracteres). Destaque em **negrito** o trecho ou conceito errôneo e indique a correção médica.
   - Sem metarretórica: Vá direto ao raciocínio, sem "A alternativa está correta/incorreta".
2. Comentário Final:
No campo "finalCommentary", apresente o comentário em TEXTO CORRIDO ÚNICO, coeso, direto e bem explicativo.
NÃO SEPARE por subtópicos como "Fisiopatologia", "Raciocínio Diagnóstico", "Conduta Escalonada" ou "Critérios Decisórios".
Discuta a questão em sua integridade, abordando tudo que for importante para a compreensão clínica unindo diagnóstico à conduta.
NÃO adicione períodos finais discutindo nomes de diretrizes ou sociedades médicas (discuta a clínica do caso).
Destaque em **negrito** os termos diagnósticos e condutas essenciais/pontos diferenciais mais importantes.
O campo 'finalCommentary' DEVE ser objetivo, conciso e completo (cerca de 100 a 140 palavras / ~600 a 650 caracteres), unindo o diagnóstico à conduta sem deixar ideias inacabadas e sem qualquer palavra dispensável.
3. Principal Motivo do Erro (analisa os distratores):
   - Identifique com precisão a armadilha ("pegadinha") ou confusão comum induzida pelos distratores da questão que leva o aluno ao erro, destacando em **negrito** o ponto de confusão.
4. Take-Home Message (principal ponto):
   - Síntese da pérola clínica central e conceito-chave para memorização rápida da questão (1 a 2 frases densas), destacando em **negrito** o ponto principal.
5. Evolução de Diretrizes:
   - Preencha APENAS se houve mudança real na conduta ou classificação histórica desde o ano da prova até hoje. Se a diretriz permanecer inalterada, retorne string vazia "".
6. Sem nomes de cursinhos ou marcas comerciais.

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "optionExplanations": {
${optionsSchemaExample}
  },
  "isAbsurdKey": false,
  "divergenceReason": "",
  "suggestedCorrectAnswer": "${goldAnswer}",
  "finalCommentary": "Texto corrido direto abordando o caso em sua integridade sem período final de diretriz (~600 a 650 carac)",
  "mainErrorReason": "Análise da pegadinha dos distratores com termo em **negrito**",
  "takeHomeMessage": "Ponto central e pérola prática com termo em **negrito**",
  "guidelineEvolution": ""
}`;
}

async function callGemini(model, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${PAID_KEY}`;
  const start = Date.now();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
        maxOutputTokens: 1500
      }
    })
  });

  const duration = (Date.now() - start) / 1000;
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`HTTP ${res.status}: ${errBody}`);
  }

  const json = await res.json();
  const usage = json.usageMetadata || {};
  const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  let clean = rawText.trim().replace(/^\`\`\`json\s*/i, '').replace(/^\`\`\`\s*/i, '').replace(/\s*\`\`\`$/i, '').trim();
  const firstB = clean.indexOf('{');
  const lastB = clean.lastIndexOf('}');
  if (firstB !== -1 && lastB !== -1 && lastB > firstB) clean = clean.slice(firstB, lastB + 1);

  const parsed = JSON.parse(clean);
  return {
    parsed,
    duration,
    promptTokens: usage.promptTokenCount || 0,
    candidateTokens: usage.candidatesTokenCount || 0,
    totalTokens: usage.totalTokenCount || 0
  };
}

async function runBenchmark() {
  const models = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'];
  const results = {};

  for (const q of selectedQuestions) {
    console.log(`\n================================================================================`);
    console.log(`📌 PROCESSANDO: ${q.code} (${q.tema})`);
    console.log(`================================================================================`);

    results[q.code] = {
      code: q.code,
      tema: q.tema,
      institution: q.institution,
      year: q.year,
      statement: q.statement,
      options: q.options,
      correctAnswer: q.correctAnswer || q.correct_answer,
      evaluations: {}
    };

    const prompt = buildPrompt(q);

    for (const m of models) {
      console.log(`  🚀 Executando no modelo: ${m}...`);
      try {
        const resp = await callGemini(m, prompt);
        console.log(`    ✅ Sucesso! ⚡ ${resp.duration.toFixed(2)}s | Tokens: In=${resp.promptTokens}, Out=${resp.candidateTokens}`);
        results[q.code].evaluations[m] = resp;
      } catch (err) {
        console.error(`    ❌ Erro no modelo ${m}:`, err.message);
        results[q.code].evaluations[m] = { error: err.message };
      }
    }
  }

  fs.writeFileSync('data/comparison_3_5_vs_3_1.json', JSON.stringify(results, null, 2), 'utf8');
  console.log('\n✅ Benchmark concluído com sucesso! Resultados salvos em data/comparison_3_5_vs_3_1.json');
}

runBenchmark();
