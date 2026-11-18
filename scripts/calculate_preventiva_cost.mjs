// Cálculo detalhado para Medicina Preventiva
// Taxas informadas pelo usuário:
// Input: $0.25 por 1 milhão de tokens ($0.00000025 / token)
// Output: $1.50 por 1 milhão de tokens ($0.0000015 / token)

const INPUT_RATE_PER_M = 0.25;
const OUTPUT_RATE_PER_M = 1.50;

// Médias por questão observadas empiricamente no motor:
// Prompt (enunciado + alternativas + instruções pedagógicas + diretrizes): ~1.150 tokens
// Candidate (assertiva a assertiva + distratores + take-home + motivo erro): ~480 tokens
const AVG_INPUT_TOKENS = 1150;
const AVG_OUTPUT_TOKENS = 480;

const costInputPerQ = (AVG_INPUT_TOKENS / 1000000) * INPUT_RATE_PER_M;
const costOutputPerQ = (AVG_OUTPUT_TOKENS / 1000000) * OUTPUT_RATE_PER_M;
const totalCostPerQ = costInputPerQ + costOutputPerQ;

console.log('--- CUSTO POR QUESTÃO MÉDICA ---');
console.log(`Input (${AVG_INPUT_TOKENS} tokens):  $${costInputPerQ.toFixed(7)} USD`);
console.log(`Output (${AVG_OUTPUT_TOKENS} tokens): $${costOutputPerQ.toFixed(7)} USD`);
console.log(`Total por questão:         $${totalCostPerQ.toFixed(6)} USD (~R$ ${(totalCostPerQ * 5.80).toFixed(4)})`);

console.log('\n--- CUSTO POR 1.000 QUESTÕES ---');
const costPer1k = totalCostPerQ * 1000;
console.log(`1.000 questões: $${costPer1k.toFixed(2)} USD (~R$ ${(costPer1k * 5.80).toFixed(2)})`);

console.log('\n--- LOTE DE MEDICINA PREVENTIVA (19.320 QUESTÕES PENDENTES DE TEXTO PURO) ---');
const totalQ = 19320;
const totalInputTokens = totalQ * AVG_INPUT_TOKENS;
const totalOutputTokens = totalQ * AVG_OUTPUT_TOKENS;
const totalTokens = totalInputTokens + totalOutputTokens;

const totalInputCostUSD = (totalInputTokens / 1000000) * INPUT_RATE_PER_M;
const totalOutputCostUSD = (totalOutputTokens / 1000000) * OUTPUT_RATE_PER_M;
const totalCostUSD = totalInputCostUSD + totalOutputCostUSD;
const totalCostBRL = totalCostUSD * 5.80;

console.log(`Total de Questões: ${totalQ.toLocaleString('pt-BR')}`);
console.log(`Total Input Tokens:  ${totalInputTokens.toLocaleString('pt-BR')} (${(totalInputTokens / 1000000).toFixed(2)}M) -> $${totalInputCostUSD.toFixed(2)} USD`);
console.log(`Total Output Tokens: ${totalOutputTokens.toLocaleString('pt-BR')} (${(totalOutputTokens / 1000000).toFixed(2)}M) -> $${totalOutputCostUSD.toFixed(2)} USD`);
console.log(`Total Tokens:        ${totalTokens.toLocaleString('pt-BR')} (${(totalTokens / 1000000).toFixed(2)}M)`);
console.log(`CUSTO TOTAL ESTIMADO: $${totalCostUSD.toFixed(2)} USD (~R$ ${totalCostBRL.toFixed(2)})`);

console.log('\n--- SE CONSIDERADO O TETO MÁXIMO GLOBAL DE PREVENTIVA (24.396 QUESTÕES) ---');
const maxQ = 24396;
const maxInputTokens = maxQ * AVG_INPUT_TOKENS;
const maxOutputTokens = maxQ * AVG_OUTPUT_TOKENS;
const maxInputCostUSD = (maxInputTokens / 1000000) * INPUT_RATE_PER_M;
const maxOutputCostUSD = (maxOutputTokens / 1000000) * OUTPUT_RATE_PER_M;
const maxCostUSD = maxInputCostUSD + maxOutputCostUSD;
const maxCostBRL = maxCostUSD * 5.80;

console.log(`Total Input Tokens:  ${maxInputTokens.toLocaleString('pt-BR')} (${(maxInputTokens / 1000000).toFixed(2)}M) -> $${maxInputCostUSD.toFixed(2)} USD`);
console.log(`Total Output Tokens: ${maxOutputTokens.toLocaleString('pt-BR')} (${(maxOutputTokens / 1000000).toFixed(2)}M) -> $${maxOutputCostUSD.toFixed(2)} USD`);
console.log(`CUSTO TETO GLOBAL:   $${maxCostUSD.toFixed(2)} USD (~R$ ${maxCostBRL.toFixed(2)})`);
