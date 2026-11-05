/**
 * test_hybrid_pipeline.mjs
 * Testa a arquitetura de 3 chamadas sequenciais:
 *
 *  Call 1 → Flash 3.5 Standard : justificativas das alternativas (crítico)
 *  Call 2 → Flash Lite          : comentário final, enriquecido com as justificativas da Call 1
 *  Call 3 → Flash 3.5 Standard : evolução de diretrizes
 *  Call 4 → Flash Lite          : motivo de erro principal
 *  Call 5 → Flash Lite          : take-home message
 *
 * Mede tokens reais via usageMetadata da API e calcula custo real de cada call.
 */

import fs from 'fs';

const env = { ...process.env };
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

// Modelos
const MODEL_FLASH_35  = 'gemini-2.0-flash'; // alias para "Flash Standard 3.5" disponível
const MODEL_FLASH_LITE = 'gemini-2.0-flash-lite';

// Chave (pega a primeira disponível)
const API_KEY = Object.keys(env)
  .filter(k => k.startsWith('GEMINI_API_KEY') && !k.includes('PAID') && !k.includes('DEMAND'))
  .map(k => env[k])
  .filter(Boolean)[0];

if (!API_KEY) {
  console.error('❌ Nenhuma GEMINI_API_KEY encontrada no .env.local');
  process.exit(1);
}

// Preços USD por 1M tokens (Gemini API - Nov 2026)
const PRICING = {
  [MODEL_FLASH_35]:   { input: 0.075, output: 0.300, label: 'Flash 3.5 Standard' },
  [MODEL_FLASH_LITE]: { input: 0.019, output: 0.038, label: 'Flash Lite' },
};

// Questão de teste: sangramento pós-menopausa
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

// Acumula custos e tokens
const telemetry = [];

async function callGemini(modelId, prompt, label) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${API_KEY}`;
  const t0 = Date.now();

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

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status} em [${label}]: ${err.slice(0, 200)}`);
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

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`📡 [${label}] ${pricing.label}`);
  console.log(`   Input: ${inputTk} tokens | Output: ${outputTk} tokens | Latência: ${latencyMs}ms`);
  console.log(`   Custo: $${costUSD.toFixed(6)} USD`);
  console.log(`${'─'.repeat(60)}`);

  // Parse JSON
  let parsed = null;
  try {
    let clean = rawText.trim().replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const a = clean.indexOf('{'), b = clean.lastIndexOf('}');
    if (a !== -1 && b > a) clean = clean.slice(a, b + 1);
    parsed = JSON.parse(clean);
  } catch (e) {
    console.warn(`⚠️ JSON malformado em [${label}]: ${e.message}`);
    console.warn('Raw:', rawText.slice(0, 300));
  }

  return { parsed, rawText, inputTk, outputTk, costUSD };
}

// ─── CALL 1: Flash 3.5 — Justificativas das Alternativas ────────────────────
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
- Profundidade: inclua parâmetros numéricos, limiares diagnósticos e referências ao guideline implícito

Responda SOMENTE em JSON:
{
  "optionExplanations": {
${optSchema}
  }
}`;

// ─── CALL 2: Flash Lite — Comentário Final (alimentado pelas justificativas) ─
function buildPromptCall2(optionExplanations) {
  const expContext = Object.entries(optionExplanations)
    .map(([l, e]) => `Alt ${l}: ${e}`)
    .join('\n\n');

  return `Você é um professor de medicina que elabora sínteses clínicas para estudantes de residência médica.

Questão avaliada:
${QUESTION.statement}

Alternativas:
${formattedOptions}

Gabarito oficial: Alternativa ${QUESTION.correctAnswer} — "${goldOption.text}"

JUSTIFICATIVAS TÉCNICAS JÁ ELABORADAS (use-as como base e expanda):
${expContext}

TAREFA — COMENTÁRIO FINAL / SÍNTESE CLÍNICA:
Com base nas justificativas acima, produza uma síntese clínica unificada que:
1. Integre a fisiopatologia central do tema (sangramento pós-menopausa: causas, algoritmo investigatório)
2. Destaque o raciocínio que justifica o gabarito (${QUESTION.correctAnswer}) como conduta inicial correta
3. Mencione os pontos de confusão entre as alternativas (D vs B: por que USG antes da histeroscopia)
4. Use **negrito** nos termos-chave e condutas mandatórias
5. Tom: denso, objetivo, sem redundância com as justificativas individuais — ADICIONE informações

Responda SOMENTE em JSON:
{
  "finalCommentary": "..."
}`;
}

// ─── CALL 3: Flash 3.5 — Evolução de Diretrizes ─────────────────────────────
const PROMPT_CALL3 = `Você é um especialista em atualização de diretrizes médicas para provas de residência médica no Brasil.

Questão:
${QUESTION.statement}

Gabarito oficial: Alternativa ${QUESTION.correctAnswer} — "${goldOption.text}"
Banca: ${QUESTION.institution} (${QUESTION.year}) | Tema: ${QUESTION.tema}

TAREFA — EVOLUÇÃO DE DIRETRIZES:
Compare como o tema "${QUESTION.tema}" era abordado nas diretrizes/literatura na época da prova (${QUESTION.year})
versus as recomendações atuais (2026). Seja específico sobre:
- Qual diretriz/guideline vigente na época (FEBRASGO, ACOG, FIGO, etc.)
- O que mudou (ou se permanece igual)
- Impacto para provas contemporâneas

Responda SOMENTE em JSON:
{
  "guidelineEvolution": "..."
}`;

// ─── CALL 4: Flash Lite — Motivo de Erro ────────────────────────────────────
function buildPromptCall4(optionExplanations) {
  const wrongOpts = QUESTION.options
    .filter(o => o.letter !== QUESTION.correctAnswer)
    .map(o => `${o.letter}) ${o.text}`)
    .join('\n');

  return `Você é um professor de medicina identificando as armadilhas pedagógicas de questões de residência médica.

Enunciado: ${QUESTION.statement}
Gabarito correto: Alternativa ${QUESTION.correctAnswer} — "${goldOption.text}"

Alternativas distratoras (erradas):
${wrongOpts}

TAREFA — PRINCIPAL MOTIVO DE ERRO:
Identifique a ÚNICA armadilha central ("pegadinha") que faz o candidato errar esta questão.
- Seja cirúrgico: 1 parágrafo denso, sem divagação
- Use **negrito** no ponto específico de confusão
- Foque na confusão mais comum (ex: escolher a alternativa B — histeroscopia direta — sem a triagem ultrassonográfica prévia)

Responda SOMENTE em JSON:
{
  "mainErrorReason": "..."
}`;
}

// ─── CALL 5: Flash Lite — Take-Home Message ─────────────────────────────────
function buildPromptCall5(finalCommentary, mainErrorReason) {
  return `Você é um professor de medicina criando mensagens de memorização para estudantes de residência.

Enunciado: ${QUESTION.statement}
Gabarito: ${QUESTION.correctAnswer} — "${goldOption.text}"

Síntese clínica do tema:
${finalCommentary ? finalCommentary.slice(0, 400) : ''}

Principal armadilha da questão:
${mainErrorReason ? mainErrorReason.slice(0, 200) : ''}

TAREFA — TAKE-HOME MESSAGE:
Crie 1 a 2 frases curtas e impactantes de memorização clínica.
- Use **negrito** nas palavras-chave mais importantes
- Deve funcionar como mnemônico ou regra de ouro
- Não use o prefixo "Pérola Prática" nem "Lembre-se"
- Ex bom: "**Sangramento pós-menopausa = adenocarcinoma de endométrio até prova em contrário**: sempre investigar com USG TV primeiro."

Responda SOMENTE em JSON:
{
  "takeHomeMessage": "..."
}`;
}

// ═══ EXECUÇÃO PRINCIPAL ═══════════════════════════════════════════════════
console.log('\n' + '═'.repeat(60));
console.log('🧪 TESTE: PIPELINE HÍBRIDO DE 5 CHAMADAS SEQUENCIAIS');
console.log(`📋 Questão: ${QUESTION.id.slice(0, 8)}... | ${QUESTION.institution} ${QUESTION.year}`);
console.log(`📝 "${QUESTION.statement.slice(0, 80)}..."`);
console.log('═'.repeat(60));

try {
  // CALL 1: Flash 3.5 — Justificativas
  console.log('\n🔵 CALL 1/5 — Flash 3.5: Justificativas das Alternativas');
  const r1 = await callGemini(MODEL_FLASH_35, PROMPT_CALL1, 'CALL1 Justificativas');
  const optExpls = r1.parsed?.optionExplanations || {};

  if (Object.keys(optExpls).length > 0) {
    console.log('\n📋 RESULTADO CALL 1:');
    for (const [letter, exp] of Object.entries(optExpls)) {
      console.log(`\n  Alt ${letter} (${String(exp).length} chars):`);
      console.log('  ' + String(exp).slice(0, 250) + (String(exp).length > 250 ? '...' : ''));
    }
  }

  // CALL 2: Flash Lite — Comentário Final (com contexto das justificativas)
  console.log('\n🟢 CALL 2/5 — Flash Lite: Comentário Final (enriquecido)');
  const r2 = await callGemini(MODEL_FLASH_LITE, buildPromptCall2(optExpls), 'CALL2 Comentário Final');
  const finalComm = r2.parsed?.finalCommentary || '';

  console.log('\n📋 RESULTADO CALL 2:');
  console.log('  ' + finalComm.slice(0, 500) + (finalComm.length > 500 ? '...' : ''));

  // CALL 3: Flash 3.5 — Evolução de Diretrizes
  console.log('\n🔵 CALL 3/5 — Flash 3.5: Evolução de Diretrizes');
  const r3 = await callGemini(MODEL_FLASH_35, PROMPT_CALL3, 'CALL3 Diretrizes');
  const guideline = r3.parsed?.guidelineEvolution || '';

  console.log('\n📋 RESULTADO CALL 3:');
  console.log('  ' + guideline.slice(0, 400) + (guideline.length > 400 ? '...' : ''));

  // CALL 4: Flash Lite — Motivo de Erro
  console.log('\n🟢 CALL 4/5 — Flash Lite: Motivo de Erro Principal');
  const r4 = await callGemini(MODEL_FLASH_LITE, buildPromptCall4(optExpls), 'CALL4 Motivo Erro');
  const mainError = r4.parsed?.mainErrorReason || '';

  console.log('\n📋 RESULTADO CALL 4:');
  console.log('  ' + mainError.slice(0, 300));

  // CALL 5: Flash Lite — Take-Home Message
  console.log('\n🟢 CALL 5/5 — Flash Lite: Take-Home Message');
  const r5 = await callGemini(MODEL_FLASH_LITE, buildPromptCall5(finalComm, mainError), 'CALL5 TakeHome');
  const takeHome = r5.parsed?.takeHomeMessage || '';

  console.log('\n📋 RESULTADO CALL 5:');
  console.log('  ' + takeHome);

  // ─── TELEMETRIA FINAL ──────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(60));
  console.log('📊 TELEMETRIA DA QUESTÃO');
  console.log('═'.repeat(60));
  console.log(`\n${'Chamada'.padEnd(26)} ${'Modelo'.padEnd(20)} ${'In tk'.padStart(7)} ${'Out tk'.padStart(7)} ${'ms'.padStart(6)} ${'Custo USD'.padStart(12)}`);
  console.log('─'.repeat(82));

  let totalIn = 0, totalOut = 0, totalMs = 0, totalCost = 0;
  for (const t of telemetry) {
    totalIn += t.inputTk; totalOut += t.outputTk; totalMs += t.latencyMs; totalCost += t.costUSD;
    console.log(
      t.label.padEnd(26) + t.model.padEnd(20) +
      String(t.inputTk).padStart(7) + String(t.outputTk).padStart(7) +
      String(t.latencyMs).padStart(6) + ('$'+t.costUSD.toFixed(6)).padStart(12)
    );
  }
  console.log('─'.repeat(82));
  console.log(
    'TOTAL'.padEnd(46) +
    String(totalIn).padStart(7) + String(totalOut).padStart(7) +
    String(totalMs).padStart(6) + ('$'+totalCost.toFixed(6)).padStart(12)
  );

  // Projeção 132.000 questões
  console.log('\n' + '═'.repeat(60));
  console.log('💰 PROJEÇÃO PARA 132.000 QUESTÕES (tokens reais desta questão)');
  console.log('═'.repeat(60));

  const Q = 132000;
  // Custo por modelo (separado)
  const flash35Calls = telemetry.filter(t => t.model === 'Flash 3.5 Standard');
  const flashLiteCalls = telemetry.filter(t => t.model === 'Flash Lite');

  const f35TotalIn  = flash35Calls.reduce((s,t) => s+t.inputTk, 0);
  const f35TotalOut = flash35Calls.reduce((s,t) => s+t.outputTk, 0);
  const fLiteTotalIn  = flashLiteCalls.reduce((s,t) => s+t.inputTk, 0);
  const fLiteTotalOut = flashLiteCalls.reduce((s,t) => s+t.outputTk, 0);

  const cost35Q  = (f35TotalIn/1e6*0.075 + f35TotalOut/1e6*0.300);
  const costLiteQ = (fLiteTotalIn/1e6*0.019 + fLiteTotalOut/1e6*0.038);
  const totalCostQ = cost35Q + costLiteQ;

  console.log(`\n  Flash 3.5 Standard (Calls 1+3):`);
  console.log(`    Input:  ${f35TotalIn} tk/q × 132.000 = ${(f35TotalIn*Q/1e6).toFixed(2)}M tokens → $${(f35TotalIn/1e6*0.075*Q).toFixed(2)}`);
  console.log(`    Output: ${f35TotalOut} tk/q × 132.000 = ${(f35TotalOut*Q/1e6).toFixed(2)}M tokens → $${(f35TotalOut/1e6*0.300*Q).toFixed(2)}`);
  console.log(`    Subtotal: $${(cost35Q*Q).toFixed(2)} USD`);

  console.log(`\n  Flash Lite (Calls 2+4+5):`);
  console.log(`    Input:  ${fLiteTotalIn} tk/q × 132.000 = ${(fLiteTotalIn*Q/1e6).toFixed(2)}M tokens → $${(fLiteTotalIn/1e6*0.019*Q).toFixed(2)}`);
  console.log(`    Output: ${fLiteTotalOut} tk/q × 132.000 = ${(fLiteTotalOut*Q/1e6).toFixed(2)}M tokens → $${(fLiteTotalOut/1e6*0.038*Q).toFixed(2)}`);
  console.log(`    Subtotal: $${(costLiteQ*Q).toFixed(2)} USD`);

  console.log(`\n  ⭐ CUSTO TOTAL POR QUESTÃO:   $${totalCostQ.toFixed(6)} USD`);
  console.log(`  ⭐ CUSTO TOTAL 132.000 QUESTÕES: $${(totalCostQ*Q).toFixed(2)} USD`);

  // Tempo estimado
  const avgLatency = totalMs / telemetry.length;
  const bottleneck = Math.max(...telemetry.map(t=>t.latencyMs));
  // Calls paralelas: Calls 2,4,5 (Lite) podem rodar em paralelo após Call1 e Call3
  // Tempo seq: Call1 + Call3 (Flash 3.5) + max(Call2, Call4, Call5) = F35 serial + Lite paralelo
  const f35Serial = flash35Calls.reduce((s,t)=>s+t.latencyMs,0);
  const litePar = Math.max(...flashLiteCalls.map(t=>t.latencyMs));
  const timePerQ = (f35Serial + litePar) / 1000;
  console.log(`\n  Latência por questão (otimizada): ~${timePerQ.toFixed(1)}s`);
  console.log(`  Throughput com 6 workers paralelos, 1 chave: ~${(6/timePerQ).toFixed(2)} q/s`);
  const totalHours1key = (Q * timePerQ / 3600 / 6).toFixed(1);
  const totalHours10keys = (Q * timePerQ / 3600 / 60).toFixed(1);
  console.log(`  Tempo para 132k q (1 chave, 6 workers):   ~${totalHours1key}h`);
  console.log(`  Tempo para 132k q (10 chaves, 6 workers): ~${totalHours10keys}h`);

  // Salvar resultado completo
  const result = {
    question: QUESTION,
    outputs: {
      optionExplanations: optExpls,
      finalCommentary: finalComm,
      guidelineEvolution: guideline,
      mainErrorReason: mainError,
      takeHomeMessage: takeHome
    },
    telemetry,
    summary: {
      totalInputTokens: totalIn,
      totalOutputTokens: totalOut,
      totalLatencyMs: totalMs,
      totalCostUSD: totalCost,
      costPer132k: totalCostQ * Q
    }
  };
  fs.writeFileSync('scripts/hybrid_pipeline_test_result.json', JSON.stringify(result, null, 2));
  console.log('\n📄 Resultado completo salvo em scripts/hybrid_pipeline_test_result.json');

} catch (err) {
  console.error('\n❌ Erro no pipeline:', err.message);
  process.exit(1);
}
