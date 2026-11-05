/**
 * analyze_token_costs.mjs
 * Analisa uso estimado de tokens nos comentários de gabaritos de ginecologia
 * e estima custos por 100 questões por modelo Gemini Flash utilizado.
 *
 * Metodologia de estimativa de tokens:
 * - Gemini tokeniza aproximadamente 4 chars/token para texto em português
 * - Input: prompt do sistema + enunciado + alternativas + metadados da questão
 * - Output: commentary + explanations + mainErrorReason + takeHomeMessage + guidelineEvolution + references
 *
 * Fonte de preços (Google AI - Nov 2026, modelos Flash):
 * gemini-2.5-flash:         input $0.075/1M, output $0.30/1M  (thinking off)
 * gemini-2.0-flash:         input $0.10/1M,  output $0.40/1M
 * gemini-1.5-flash:         input $0.075/1M, output $0.30/1M
 * gemini-flash-lite:        input $0.019/1M, output $0.038/1M (ou free tier)
 * gemini-3.5-flash-lite:    input $0.019/1M, output $0.038/1M
 * gemini-3.5-flash:         input $0.075/1M, output $0.30/1M
 * gemini-3.6-flash:         input $0.10/1M,  output $0.40/1M
 * gemini-3-flash-preview:   free tier (quota apenas)
 */

import fs from 'fs';
import path from 'path';

const CHECKPOINT_PATH = path.resolve('data/checkpoints/ginecologia_deep_solved.json');
const SAMPLE_SIZE = 1000; // Usar 1000 questões para média estatisticamente robusta
const CHARS_PER_TOKEN = 4; // Estimativa conservadora para português técnico médico

// Preços em USD por 1M tokens (Novembro 2026 - Google AI Studio / Gemini API)
// Baseado na lista de modelos do solve_questions_engine.mjs:
// ['gemini-3.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3-flash-preview']
const MODEL_PRICING = {
  'gemini-3.5-flash-lite': {
    label: 'Gemini 3.5 Flash Lite',
    inputPer1M: 0.019,
    outputPer1M: 0.038,
    tier: 'Paid (Low Cost)',
    dailyQuota: 'Alta (prioritário no pool)'
  },
  'gemini-flash-lite-latest': {
    label: 'Gemini Flash Lite Latest',
    inputPer1M: 0.019,
    outputPer1M: 0.038,
    tier: 'Paid (Low Cost)',
    dailyQuota: 'Alta (alias do Flash Lite)'
  },
  'gemini-3.5-flash': {
    label: 'Gemini 3.5 Flash',
    inputPer1M: 0.075,
    outputPer1M: 0.30,
    tier: 'Paid (Standard)',
    dailyQuota: 'Média'
  },
  'gemini-3.6-flash': {
    label: 'Gemini 3.6 Flash',
    inputPer1M: 0.10,
    outputPer1M: 0.40,
    tier: 'Paid (Standard+)',
    dailyQuota: 'Média'
  },
  'gemini-3-flash-preview': {
    label: 'Gemini 3 Flash Preview',
    inputPer1M: 0.00,
    outputPer1M: 0.00,
    tier: 'Free Tier (quota only)',
    dailyQuota: 'Limitada (free tier gratuito)'
  }
};

// Prompt base do sistema (extraído do solve_questions_engine.mjs)
// Calcula o tamanho do prompt fixo (cabeçalho + schema JSON + instruções)
function buildPromptBase(question) {
  const letters = (question.options || []).map(o => o.letter).join(', ');
  const goldAnswer = question.correctAnswer || question.correct_answer || 'A';
  const goldOption = (question.options || []).find(o => o.letter === goldAnswer);
  const goldOptionText = goldOption ? goldOption.text : '';
  const optionsSchemaExample = (question.options || [])
    .map(o => `    "${o.letter}": "Justificativa da alternativa ${o.letter}..."`)
    .join(',\n');

  const formattedOptions = (question.options || [])
    .map(opt => `${opt.letter}) ${opt.text}`)
    .join('\n');

  const prompt = `Você é um preceptor médico de elite e especialista em provas oficiais de Residência Médica e Revalida no Brasil.
Sua missão é fundamentar tecnicamente a questão e o gabarito oficial da banca examinadora com rigor acadêmico máximo, 100% de precisão e profundidade clínica.

Dados da Questão:
- Instituição/Banca: ${question.institution || 'Oficial'} (${question.year || 2024})
- Especialidade: ${question.especialidade || 'Ginecologia'}
- Tema/Foco: ${question.tema || ''} - ${question.foco || ''}
- Tópicos de Referência dos Livros Médicos: Ginecologia Oncológica, Endocrinologia Ginecológica, Uroginecologia

Enunciado:
${question.statement}

Alternativas:
${formattedOptions}

🔒 PRINCÍPIO DO GABARITO IMUTÁVEL (ÂNCORA DE OURO DA BANCA EXAMINADORA):
- O GABARITO OFICIAL HISTÓRICO DEFINITIVO DA BANCA EXAMINADORA É A ALTERNATIVA ${goldAnswer}: "${goldOptionText}".
- REGRA ABSOLUTA: VOCÊ NÃO DEVE ESCOLHER OUTRA ALTERNATIVA NEM DISCORDAR DA BANCA. O gabarito oficial considerado pelo concurso É A ALTERNATIVA ${goldAnswer}.
- Sua tarefa como preceptor é EXPLICAR e FUNDAMENTAR com a literatura médica por que a banca deu a Alternativa ${goldAnswer} como correta, dissecando os erros de todos os outros distratores.

DIRETRIZES FUNDAMENTAIS DE ELABORAÇÃO:
1. JUSTIFICATIVAS DAS ALTERNATIVAS (OBRIGATÓRIO PARA 100% DAS LETRAS: ${letters}):
   - OBRIGATORIEDADE ABSOLUTA: Forneça justificativa completa para TODAS as alternativas existentes (${letters}), INCLUINDO SEMPRE A ALTERNATIVA E (se houver). NUNCA omita nenhuma opção nem deixe texto vazio ou incompleto.
   - DESTAQUE EM NEGRITO OBRIGATÓRIO: Em TODAS as alternativas incorretas, você DEVE obrigatoriamente colocar em **negrito** o trecho específico incorreto ou o conceito errôneo que invalida a opção. Na alternativa correta (${goldAnswer}), destaque em **negrito** o conceito-chave padrão-ouro ou conduta mandatória.
   - SEM METARRETÓRICA: Vá DIRETO ao raciocínio clínico. NUNCA inicie com "A alternativa está correta/incorreta" ou "Incorreta porque". Comece imediatamente justificando os critérios clínicos, doses e diretrizes.
2. VERIFICAÇÃO DE COERÊNCIA HISTÓRICA DO GABARITO DA BANCA:
   - Avalie se a resposta oficial faz sentido segundo a literatura na época da prova (${question.year || 2024}).
   - Se o gabarito oficial for flagrantemente absurdo ou erro manifesto da banca: marque "isAbsurdKey": true, descreva em "divergenceReason" a fundamentação para curadoria/recurso e em "suggestedCorrectAnswer" indique a letra clinicamente correta (${letters.split(', ').join('/')}) ou "ANULADA" se a questão for insanável. Caso contrário, mantenha "isAbsurdKey": false e "suggestedCorrectAnswer": "${goldAnswer}".
3. COMENTÁRIO FINAL / SÍNTESE CLÍNICA:
   - Comece DIRETO no raciocínio clínico, fisiopatologia e conduta, destacando em **negrito** os termos essenciais.
4. PRINCIPAL MOTIVO DE ERRO:
   - Identifique a armadilha ("pegadinha") ou confusão comum de raciocínio de forma cirúrgica, destacando em **negrito** o ponto de confusão.
5. TAKE-HOME MESSAGE:
   - Mensagem-chave em 1 a 2 frases densas com destaque em **negrito** (NÃO inclua o prefixo "Pérola Prática").
6. EVOLUÇÃO DE DIRETRIZES:
   - Compare a diretriz da época com a atual (ou informe que permanece igual). NÃO use a expressão "da Banca" nem "Contexto Histórico".
7. REFERÊNCIAS:
   - Liste apenas nomes das diretrizes oficiais e tratados médicos clássicos (sem resumos teóricos genéricos).
8. REGRA ABSOLUTA: JAMAIS cite nomes de cursinhos ou marcas comerciais.

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "optionExplanations": {
${optionsSchemaExample}
  },
  "isAbsurdKey": false,
  "divergenceReason": "",
  "suggestedCorrectAnswer": "${goldAnswer}",
  "finalCommentary": "Síntese clínica unificada do professor...",
  "mainErrorReason": "O principal motivo que leva o aluno ao erro nesta questão é...",
  "takeHomeMessage": "Pérola clínica prática para memorização...",
  "guidelineEvolution": "Como era na época da prova vs o que mudou e como é hoje...",
  "references": [
    "Nome da Obra ou Diretriz Oficial 1",
    "Nome da Obra ou Diretriz Oficial 2"
  ]
}`;

  return prompt;
}

// Calcula o output completo (o que a API retorna)
function buildOutputText(q) {
  const optionExplanations = (q.options || [])
    .filter(o => o.explanation)
    .map(o => `"${o.letter}": "${o.explanation}"`)
    .join(',\n');

  const refs = Array.isArray(q.references) ? q.references.map(r => `"${r}"`).join(', ') : '';

  return `{
  "optionExplanations": {
${optionExplanations}
  },
  "isAbsurdKey": false,
  "divergenceReason": "",
  "suggestedCorrectAnswer": "${q.correctAnswer || q.correct_answer || 'A'}",
  "finalCommentary": "${(q.commentary || '').slice(0, 500)}",
  "mainErrorReason": "${q.mainErrorReason || ''}",
  "takeHomeMessage": "${q.takeHomeMessage || ''}",
  "guidelineEvolution": "${q.guidelineEvolution || ''}",
  "references": [${refs}]
}`;
}

function charsToTokens(chars) {
  return Math.ceil(chars / CHARS_PER_TOKEN);
}

function formatNumber(n) {
  return n.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
}

function formatCost(usd) {
  return `$${usd.toFixed(4)} USD`;
}

// ─── MAIN ───────────────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(70));
console.log('📊 ANALISADOR DE TOKENS — GABARITOS GINECOLOGIA (BANCO RESIDÊNCIA)');
console.log('='.repeat(70) + '\n');

if (!fs.existsSync(CHECKPOINT_PATH)) {
  console.error('❌ Checkpoint de ginecologia não encontrado:', CHECKPOINT_PATH);
  process.exit(1);
}

const raw = fs.readFileSync(CHECKPOINT_PATH, 'utf8');
const allData = JSON.parse(raw);
const resolved = allData.filter(q => q && q.commentary && q.mainErrorReason);
console.log(`📂 Total de questões no checkpoint: ${allData.length}`);
console.log(`✅ Questões com commentary completo: ${resolved.length}`);

// Amostragem estratificada: 1000 questões distribuídas uniformemente
const step = Math.max(1, Math.floor(resolved.length / SAMPLE_SIZE));
const sample = [];
for (let i = 0; i < resolved.length && sample.length < SAMPLE_SIZE; i += step) {
  sample.push(resolved[i]);
}
console.log(`🔍 Amostra selecionada: ${sample.length} questões (passo ${step})\n`);

// Calcular tokens por questão
const stats = sample.map(q => {
  const inputText = buildPromptBase(q);
  const outputText = buildOutputText(q);

  const inputChars = inputText.length;
  const outputChars = outputText.length;
  const inputTokens = charsToTokens(inputChars);
  const outputTokens = charsToTokens(outputChars);

  return {
    id: q.id,
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    optionsCount: (q.options || []).length,
    statementLen: (q.statement || '').length,
    commentaryLen: (q.commentary || '').length
  };
});

// Estatísticas gerais
const avgInput = stats.reduce((s, x) => s + x.inputTokens, 0) / stats.length;
const avgOutput = stats.reduce((s, x) => s + x.outputTokens, 0) / stats.length;
const avgTotal = stats.reduce((s, x) => s + x.totalTokens, 0) / stats.length;
const medianInput = stats.map(x => x.inputTokens).sort((a,b) => a-b)[Math.floor(stats.length/2)];
const medianOutput = stats.map(x => x.outputTokens).sort((a,b) => a-b)[Math.floor(stats.length/2)];
const p95Input = stats.map(x => x.inputTokens).sort((a,b) => a-b)[Math.floor(stats.length * 0.95)];
const p95Output = stats.map(x => x.outputTokens).sort((a,b) => a-b)[Math.floor(stats.length * 0.95)];
const minTotal = Math.min(...stats.map(x => x.totalTokens));
const maxTotal = Math.max(...stats.map(x => x.totalTokens));

console.log('─'.repeat(70));
console.log('📏 ESTATÍSTICAS DE TOKENS (ESTIMATIVA — 4 chars/token, português médico)');
console.log('─'.repeat(70));
console.log(`  Média de tokens de INPUT  (prompt+questão):  ${formatNumber(Math.round(avgInput))}`);
console.log(`  Média de tokens de OUTPUT (resposta JSON):   ${formatNumber(Math.round(avgOutput))}`);
console.log(`  Média TOTAL por questão:                     ${formatNumber(Math.round(avgTotal))}`);
console.log(`  Mediana de INPUT:                            ${formatNumber(medianInput)}`);
console.log(`  Mediana de OUTPUT:                           ${formatNumber(medianOutput)}`);
console.log(`  P95 de INPUT:                                ${formatNumber(p95Input)}`);
console.log(`  P95 de OUTPUT:                               ${formatNumber(p95Output)}`);
console.log(`  Mínimo TOTAL por questão:                    ${formatNumber(minTotal)}`);
console.log(`  Máximo TOTAL por questão:                    ${formatNumber(maxTotal)}`);
console.log();

// Custo por 100 questões por modelo
console.log('─'.repeat(70));
console.log('💰 CUSTO ESTIMADO POR 100 QUESTÕES — POR MODELO');
console.log('─'.repeat(70));
console.log(`  (Baseado em média: ${formatNumber(Math.round(avgInput))} tokens input + ${formatNumber(Math.round(avgOutput))} tokens output)\n`);

const results = [];
for (const [modelId, pricing] of Object.entries(MODEL_PRICING)) {
  const inputCost100  = (avgInput  / 1_000_000) * pricing.inputPer1M  * 100;
  const outputCost100 = (avgOutput / 1_000_000) * pricing.outputPer1M * 100;
  const totalCost100  = inputCost100 + outputCost100;
  const totalCost1000 = totalCost100 * 10;

  results.push({ modelId, pricing, inputCost100, outputCost100, totalCost100, totalCost1000 });

  console.log(`  🤖 ${pricing.label}`);
  console.log(`     Tier:          ${pricing.tier}`);
  console.log(`     Preço input:   $${pricing.inputPer1M}/1M tokens`);
  console.log(`     Preço output:  $${pricing.outputPer1M}/1M tokens`);
  console.log(`     Custo INPUT  (100q): ${formatCost(inputCost100)}`);
  console.log(`     Custo OUTPUT (100q): ${formatCost(outputCost100)}`);
  console.log(`     ⭐ TOTAL POR 100 QUESTÕES: ${formatCost(totalCost100)}`);
  console.log(`     ⭐ TOTAL POR 1.000 QUESTÕES: ${formatCost(totalCost1000)}`);
  console.log();
}

// Resumo comparativo
console.log('─'.repeat(70));
console.log('📊 RESUMO COMPARATIVO — CUSTO POR 100 QUESTÕES');
console.log('─'.repeat(70));
console.log(`${'Modelo'.padEnd(32)} ${'Input'.padStart(10)} ${'Output'.padStart(10)} ${'Total'.padStart(12)}`);
console.log('─'.repeat(70));
for (const r of results.sort((a, b) => a.totalCost100 - b.totalCost100)) {
  const isFree = r.totalCost100 === 0;
  const totalStr = isFree ? '       FREE' : `$${r.totalCost100.toFixed(4)} USD`;
  console.log(
    `${r.pricing.label.padEnd(32)} ` +
    `${('$' + r.inputCost100.toFixed(4)).padStart(10)} ` +
    `${('$' + r.outputCost100.toFixed(4)).padStart(10)} ` +
    `${totalStr.padStart(12)}`
  );
}

// Volume total estimado
console.log('\n' + '─'.repeat(70));
console.log('📈 PROJEÇÃO PARA O VOLUME TOTAL DE GINECOLOGIA');
console.log('─'.repeat(70));
console.log(`  Total de questões resolvidas: ${formatNumber(resolved.length)}`);
const totalInputTokens = avgInput * resolved.length;
const totalOutputTokens = avgOutput * resolved.length;
console.log(`  Total tokens INPUT estimados:  ${formatNumber(Math.round(totalInputTokens))}`);
console.log(`  Total tokens OUTPUT estimados: ${formatNumber(Math.round(totalOutputTokens))}`);
console.log();
for (const r of results.sort((a, b) => a.totalCost100 - b.totalCost100)) {
  const scaledCost = r.totalCost100 * (resolved.length / 100);
  const isFree = scaledCost === 0;
  const costStr = isFree ? 'FREE (cota gratuita)' : formatCost(scaledCost);
  console.log(`  ${r.pricing.label}: ${costStr}`);
}

console.log('\n' + '='.repeat(70));
console.log('⚠️  NOTA METODOLÓGICA:');
console.log('  - Estimativa baseada em 4 caracteres/token (padrão texto português)');
console.log('  - O engine usa modelos GRATUITOS (free tier AI Studio) por padrão');
console.log('  - Preços de modelos pagos são referenciais para custo real de produção');
console.log('  - O prompt base tem ~2.700 chars fixos + enunciado + alternativas variáveis');
console.log('  - MaxOutputTokens configurado em 8.192 no engine');
console.log('='.repeat(70) + '\n');

// Salvar resultado em JSON para o relatório
const reportData = {
  generatedAt: new Date().toISOString(),
  sampleSize: sample.length,
  totalResolved: resolved.length,
  methodology: '4 chars/token (português médico técnico)',
  avgInputTokens: Math.round(avgInput),
  avgOutputTokens: Math.round(avgOutput),
  avgTotalTokens: Math.round(avgTotal),
  medianInputTokens: medianInput,
  medianOutputTokens: medianOutput,
  p95InputTokens: p95Input,
  p95OutputTokens: p95Output,
  minTotalTokens: minTotal,
  maxTotalTokens: maxTotal,
  costPer100Questions: results.map(r => ({
    modelId: r.modelId,
    label: r.pricing.label,
    tier: r.pricing.tier,
    inputPricePer1M: r.pricing.inputPer1M,
    outputPricePer1M: r.pricing.outputPer1M,
    inputCostUSD: parseFloat(r.inputCost100.toFixed(6)),
    outputCostUSD: parseFloat(r.outputCost100.toFixed(6)),
    totalCostUSD: parseFloat(r.totalCost100.toFixed(6)),
    totalCost1000USD: parseFloat(r.totalCost1000.toFixed(6))
  })),
  projectionTotalGinecologia: results.map(r => ({
    modelId: r.modelId,
    label: r.pricing.label,
    totalCostUSD: parseFloat((r.totalCost100 * (resolved.length / 100)).toFixed(4))
  }))
};

const reportPath = path.resolve('scripts/token_cost_report_ginecologia.json');
fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2), 'utf8');
console.log(`📄 Relatório JSON salvo em: ${reportPath}\n`);
