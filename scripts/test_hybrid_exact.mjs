import fs from 'fs';

const env = { ...process.env };
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

// Pool com todas as 10 chaves únicas
const API_KEYS = Object.keys(env)
  .filter(k => k.startsWith('GEMINI_API_KEY') && !k.includes('PAID') && !k.includes('DEMAND'))
  .map(k => env[k])
  .filter((k, idx, self) => k && self.indexOf(k) === idx);

console.log(`🔑 Pool com ${API_KEYS.length} chaves únicas carregado.`);

let keyIdx = 0;
function getNextKey() {
  const k = API_KEYS[keyIdx % API_KEYS.length];
  keyIdx++;
  return k;
}

const MODEL_FLASH_35 = 'gemini-3.5-flash';
const MODEL_FLASH_LITE = 'gemini-3.5-flash-lite';

const PRICING = {
  [MODEL_FLASH_35]:   { input: 0.075, output: 0.300, label: 'Flash 3.5 Standard' },
  [MODEL_FLASH_LITE]: { input: 0.019, output: 0.038, label: 'Flash Lite' },
};

const QUESTION = {
  id: '83437934-34f9-44e0-a41f-7020a996f9a5',
  statement: 'Paciente de 62 anos, história de menopausa aos 50 anos, apresentando-se com episódios de sangramento vaginal de leve intensidade, de início há + ou - 20 dias. Exame especular sem anormalidades. Nega uso de TRH ou outras medicações. Diante deste quadro clinico, deve-se:',
  options: [
    { letter: 'A', text: 'indicar CUF com material enviando para histopatológico.' },
    { letter: 'B', text: 'indicar histeroscopia com biopsia de endométrio.' },
    { letter: 'C', text: 'indicar estrogênioterapia tendo em vista atrofia como possível causa.' },
    { letter: 'D', text: 'solicitar USG transvaginal. Se observado espessamento endometrial, indicar histeroscopia diagnostica.' },
    { letter: 'E', text: 'leiomiomas uterinos podem ser a causa do sangramento.' }
  ],
  correctAnswer: 'D',
  institution: 'ENARE',
  year: 2022,
  especialidade: 'Ginecologia',
  tema: 'Sangramento Pós-Menopausa'
};

const formattedOptions = QUESTION.options.map(o => `${o.letter}) ${o.text}`).join('\n');
const goldOption = QUESTION.options.find(o => o.letter === QUESTION.correctAnswer);
const optSchema = QUESTION.options.map(o => `    "${o.letter}": "..."`).join(',\n');
const letters = QUESTION.options.map(o => o.letter).join(', ');

const telemetry = [];

async function callGemini(modelId, prompt, label, retries = 8) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const key = getNextKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${key}`;
    const t0 = Date.now();

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.15,
            maxOutputTokens: 4096
          }
        })
      });

      const latencyMs = Date.now() - t0;

      if (res.status === 429) {
        console.log(`[429] Chave rotacionada em ${label}. Aguardando 1.5s (tentativa ${attempt}/${retries})...`);
        await new Promise(r => setTimeout(r, 1500));
        continue;
      }

      if (res.status === 503 || res.status === 500) {
        console.log(`[${res.status}] Servidor sobrecarregado em ${label}. Aguardando 2s...`);
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }

      if (!res.ok) {
        const err = await res.text();
        if (attempt < retries) {
          console.warn(`[HTTP ${res.status}] Tentativa ${attempt}. Alternando chave...`);
          await new Promise(r => setTimeout(r, 1500));
          continue;
        }
        throw new Error(`HTTP ${res.status} em ${label}: ${err.slice(0, 200)}`);
      }

      const json = await res.json();
      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const usage = json.usageMetadata || {};
      const inputTk = usage.promptTokenCount || 0;
      const outputTk = usage.candidatesTokenCount || 0;
      const pricing = PRICING[modelId];
      const costUSD = (inputTk / 1e6) * pricing.input + (outputTk / 1e6) * pricing.output;

      const record = { label, model: pricing.label, inputTk, outputTk, latencyMs, costUSD };
      telemetry.push(record);

      console.log('\n------------------------------------------------------------');
      console.log(`📡 [${label}] ${pricing.label}`);
      console.log(`   Input: ${inputTk} tk | Output: ${outputTk} tk | Latência: ${latencyMs}ms`);
      console.log(`   Custo: $${costUSD.toFixed(6)} USD`);
      console.log('------------------------------------------------------------');

      let parsed = null;
      try {
        let clean = rawText.trim().replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        const a = clean.indexOf('{'), b = clean.lastIndexOf('}');
        if (a !== -1 && b > a) clean = clean.slice(a, b + 1);
        parsed = JSON.parse(clean);
      } catch (e) {
        console.warn(`JSON malformado em ${label}: ${e.message}`);
      }

      return { parsed, rawText, inputTk, outputTk, costUSD };
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`Erro em ${label}: ${err.message}. Alternando chave...`);
      await new Promise(r => setTimeout(r, 1500));
    }
  }
}

// Prompts
const PROMPT_CALL1 = `Você é um preceptor médico especialista em provas de Residência Médica e Revalida no Brasil.

Questão:
- Banca/Instituição: ${QUESTION.institution} (${QUESTION.year})
- Especialidade: ${QUESTION.especialidade} | Tema: ${QUESTION.tema}
- Enunciado: ${QUESTION.statement}

Alternativas:
${formattedOptions}

🔒 GABARITO OFICIAL: Alternativa ${QUESTION.correctAnswer} — "${goldOption.text}"
NUNCA discorde do gabarito oficial. Sua tarefa é FUNDAMENTAR com rigor clínico máximo.

TAREFA — JUSTIFICATIVAS POR ALTERNATIVA:
Para CADA alternativa (${letters}), gere uma justificativa técnica densa:
- Use **negrito** em TODOS os termos incorretos das alternativas erradas
- Use **negrito** no conceito padrão-ouro da alternativa correta (${QUESTION.correctAnswer})
- Vá DIRETO ao raciocínio clínico, fisiopatologia, doses, critérios diagnósticos — SEM metarretórica

Responda SOMENTE em JSON:
{
  "optionExplanations": {
${optSchema}
  }
}`;

function buildPromptCall2(optionExplanations) {
  const expContext = Object.entries(optionExplanations)
    .map(([l, e]) => `Alt ${l}: ${e}`)
    .join('\n\n');

  return `Você é um professor de medicina que elabora sínteses clínicas para estudantes de residência médica.

Questão: ${QUESTION.statement}
Gabarito: Alternativa ${QUESTION.correctAnswer} — "${goldOption.text}"

JUSTIFICATIVAS TÉCNICAS JÁ ELABORADAS (use-as como base para aprofundar):
${expContext}

TAREFA — COMENTÁRIO FINAL / SÍNTESE CLÍNICA (FLASH LITE):
Com base nas justificativas acima, produza uma síntese clínica unificada que traga INFORMAÇÕES A MAIS que complementam a questão:
1. Algoritmo propedêutico completo de sangramento pós-menopausa
2. Limiares de corte ultrassonográficos (com e sem TRH)
3. Fisiopatologia da atrofia endometrial vs adenocarcinoma
4. Use **negrito** nos conceitos essenciais e condutas padrão-ouro

Responda SOMENTE em JSON:
{
  "finalCommentary": "..."
}`;
}

const PROMPT_CALL3 = `Você é um especialista em atualização de diretrizes médicas para provas de residência médica no Brasil.

Questão:
${QUESTION.statement}

Gabarito oficial: Alternativa ${QUESTION.correctAnswer} — "${goldOption.text}"
Banca: ${QUESTION.institution} (${QUESTION.year}) | Tema: ${QUESTION.tema}

TAREFA — EVOLUÇÃO DE DIRETRIZES:
Compare como o tema "${QUESTION.tema}" era abordado nas diretrizes na época da prova (${QUESTION.year}) versus as recomendações atuais (2026):
- Diretrizes de referência (FEBRASGO, ACOG, FIGO)
- Limiares ultrassonográficos (4 mm vs 5 mm) e papel da histeroscopia com biópsia dirigida
- Se houve mudança ou se permanece 100% vigente

Responda SOMENTE em JSON:
{
  "guidelineEvolution": "..."
}`;

function buildPromptCall4(optionExplanations) {
  const wrongOpts = QUESTION.options
    .filter(o => o.letter !== QUESTION.correctAnswer)
    .map(o => `${o.letter}) ${o.text}`)
    .join('\n');

  return `Você é um professor de medicina identificando as armadilhas pedagógicas de questões de residência.

Enunciado: ${QUESTION.statement}
Gabarito correto: Alternativa ${QUESTION.correctAnswer} — "${goldOption.text}"
Alternativas erradas:
${wrongOpts}

TAREFA — PRINCIPAL MOTIVO DE ERRO:
Identifique a ÚNICA pegadinha central que faz o candidato errar.
- Seja cirúrgico: 1 parágrafo denso
- Destaque em **negrito** o ponto de confusão (ex: pular para a histeroscopia direta sem o USG prévio)

Responda SOMENTE em JSON:
{
  "mainErrorReason": "..."
}`;
}

function buildPromptCall5(finalCommentary, mainErrorReason) {
  return `Você é um professor de medicina criando mensagens de memorização rápida para estudantes.

Enunciado: ${QUESTION.statement}
Gabarito: ${QUESTION.correctAnswer} — "${goldOption.text}"
Síntese: ${finalCommentary ? finalCommentary.slice(0, 300) : ''}
Motivo de erro: ${mainErrorReason ? mainErrorReason.slice(0, 200) : ''}

TAREFA — TAKE-HOME MESSAGE:
Crie 1 a 2 frases densas de memorização clínica com **negrito** nas palavras-chave.
Regra de ouro aplicável na prova.

Responda SOMENTE em JSON:
{
  "takeHomeMessage": "..."
}`;
}

console.log('\n======================================================');
console.log('🧪 TESTE HÍBRIDO DEFINITIVO — 10 KEYS ROTATIVAS');
console.log('======================================================');

try {
  console.log('\n🔵 CALL 1/5 — Flash 3.5 Standard: Justificativas das Alternativas');
  const r1 = await callGemini(MODEL_FLASH_35, PROMPT_CALL1, 'CALL1 Justificativas (Flash 3.5)');
  const optExpls = r1.parsed?.optionExplanations || {};

  console.log('\n🟢 CALL 2/5 — Flash Lite: Comentário Final com Informações Adicionais');
  const r2 = await callGemini(MODEL_FLASH_LITE, buildPromptCall2(optExpls), 'CALL2 Comentário Final (Flash Lite)');
  const finalComm = r2.parsed?.finalCommentary || '';

  console.log('\n🔵 CALL 3/5 — Flash 3.5 Standard: Evolução de Diretrizes');
  const r3 = await callGemini(MODEL_FLASH_35, PROMPT_CALL3, 'CALL3 Diretrizes (Flash 3.5)');
  const guideline = r3.parsed?.guidelineEvolution || '';

  console.log('\n🟢 CALL 4/5 — Flash Lite: Motivo de Erro');
  const r4 = await callGemini(MODEL_FLASH_LITE, buildPromptCall4(optExpls), 'CALL4 Motivo Erro (Flash Lite)');
  const mainError = r4.parsed?.mainErrorReason || '';

  console.log('\n🟢 CALL 5/5 — Flash Lite: Take-Home Message');
  const r5 = await callGemini(MODEL_FLASH_LITE, buildPromptCall5(finalComm, mainError), 'CALL5 TakeHome (Flash Lite)');
  const takeHome = r5.parsed?.takeHomeMessage || '';

  console.log('\n======================================================');
  console.log('🎉 TODAS AS 5 CHAMADAS EXECUTADAS COM SUCESSO!');
  console.log('======================================================\n');

  console.log('📋 TELEMETRIA DAS 5 CHAMADAS (TOKENS REAIS MEDIDOS):');
  console.log('--------------------------------------------------------------------------------------');
  console.log(`${'Chamada'.padEnd(32)} ${'Modelo'.padEnd(20)} ${'In tk'.padStart(7)} ${'Out tk'.padStart(7)} ${'ms'.padStart(7)} ${'Custo USD'.padStart(12)}`);
  console.log('--------------------------------------------------------------------------------------');

  let totalIn = 0, totalOut = 0, totalMs = 0, totalCost = 0;
  for (const t of telemetry) {
    totalIn += t.inputTk; totalOut += t.outputTk; totalMs += t.latencyMs; totalCost += t.costUSD;
    console.log(
      t.label.padEnd(32) + t.model.padEnd(20) +
      String(t.inputTk).padStart(7) + String(t.outputTk).padStart(7) +
      String(t.latencyMs).padStart(7) + ('$' + t.costUSD.toFixed(6)).padStart(12)
    );
  }
  console.log('--------------------------------------------------------------------------------------');
  console.log(
    'TOTAL POR QUESTÃO'.padEnd(52) +
    String(totalIn).padStart(7) + String(totalOut).padStart(7) +
    String(totalMs).padStart(7) + ('$' + totalCost.toFixed(6)).padStart(12)
  );

  const Q = 132000;
  const f35Calls = telemetry.filter(t => t.model === 'Flash 3.5 Standard');
  const fLiteCalls = telemetry.filter(t => t.model === 'Flash Lite');

  const f35In = f35Calls.reduce((s,t) => s + t.inputTk, 0);
  const f35Out = f35Calls.reduce((s,t) => s + t.outputTk, 0);
  const fLiteIn = fLiteCalls.reduce((s,t) => s + t.inputTk, 0);
  const fLiteOut = fLiteCalls.reduce((s,t) => s + t.outputTk, 0);

  const f35CostQ = (f35In / 1e6 * 0.075) + (f35Out / 1e6 * 0.300);
  const fLiteCostQ = (fLiteIn / 1e6 * 0.019) + (fLiteOut / 1e6 * 0.038);
  const grandTotalQ = f35CostQ + fLiteCostQ;

  console.log('\n======================================================');
  console.log(`💰 CUSTO FINAL EXATO PARA ${Q.toLocaleString('pt-BR')} QUESTÕES:`);
  console.log('======================================================');
  console.log(`\n🔹 Flash 3.5 Standard (Justificativas + Diretrizes):`);
  console.log(`   Tokens de Input:  ${(f35In * Q / 1e6).toFixed(2)}M tokens → $${(f35In / 1e6 * 0.075 * Q).toFixed(2)} USD`);
  console.log(`   Tokens de Output: ${(f35Out * Q / 1e6).toFixed(2)}M tokens → $${(f35Out / 1e6 * 0.300 * Q).toFixed(2)} USD`);
  console.log(`   Subtotal Flash 3.5: $${(f35CostQ * Q).toFixed(2)} USD`);

  console.log(`\n🔹 Flash Lite (Comentário Final + Motivo Erro + Take-Home):`);
  console.log(`   Tokens de Input:  ${(fLiteIn * Q / 1e6).toFixed(2)}M tokens → $${(fLiteIn / 1e6 * 0.019 * Q).toFixed(2)} USD`);
  console.log(`   Tokens de Output: ${(fLiteOut * Q / 1e6).toFixed(2)}M tokens → $${(fLiteOut / 1e6 * 0.038 * Q).toFixed(2)} USD`);
  console.log(`   Subtotal Flash Lite: $${(fLiteCostQ * Q).toFixed(2)} USD`);

  console.log(`\n⭐ GASTO FINAL COMBINADO (132.000 questões): $${(grandTotalQ * Q).toFixed(2)} USD`);
  console.log(`⭐ Custo por questão: $${grandTotalQ.toFixed(5)} USD (~${(grandTotalQ * 5.8).toFixed(4)} BRL)`);

  const sampleResult = {
    optExpls,
    finalComm,
    guideline,
    mainError,
    takeHome,
    telemetry,
    costPer132k: grandTotalQ * Q
  };
  fs.writeFileSync('scripts/pipeline_exact_result.json', JSON.stringify(sampleResult, null, 2), 'utf8');

} catch (err) {
  console.error('❌ Falha fatal no teste:', err.message);
  process.exit(1);
}
