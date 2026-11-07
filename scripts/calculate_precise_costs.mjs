import fs from 'fs';

const stats = JSON.parse(fs.readFileSync('C:/Users/froge/.gemini/antigravity/brain/7b3c779d-de2a-4d34-9e11-0f56afb8dcbf/scratch/census_stats.json', 'utf8'));

// Google Gemini Flash-Lite Official Tier Pricing
const PRICE_INPUT_PER_M = 0.075;   // $0.075 per 1M input tokens
const PRICE_OUTPUT_PER_M = 0.30;   // $0.30 per 1M output tokens
const TOKENS_PER_IMAGE = 258;      // standard Gemini multimodal token cost
const USD_BRL = 5.80;              // taxa cambial estimada R$ 5,80 por USD

function estimateCost(numQuestions, numImages, avgInputTokens = 850, avgOutputTokens = 500) {
  const textInputTokens = numQuestions * avgInputTokens;
  const imageInputTokens = numImages * TOKENS_PER_IMAGE;
  const totalInputTokens = textInputTokens + imageInputTokens;
  const totalOutputTokens = numQuestions * avgOutputTokens;

  const costInputUSD = (totalInputTokens / 1_000_000) * PRICE_INPUT_PER_M;
  const costOutputUSD = (totalOutputTokens / 1_000_000) * PRICE_OUTPUT_PER_M;
  const totalUSD = costInputUSD + costOutputUSD;
  const totalBRL = totalUSD * USD_BRL;

  const costPerQuestionUSD = totalUSD / numQuestions;
  const costPerQuestionBRL = totalBRL / numQuestions;

  return {
    numQuestions,
    numImages,
    totalInputTokens,
    totalOutputTokens,
    costInputUSD,
    costOutputUSD,
    totalUSD,
    totalBRL,
    costPerQuestionUSD,
    costPerQuestionBRL
  };
}

const clinicaStats = stats.bySpecialty.clinica_medica;
const costClinica = estimateCost(clinicaStats.withoutComments, clinicaStats.withoutCommentsWithImages);
const costTotalBank = estimateCost(stats.homologatedWithoutComments, stats.homologatedWithoutCommentsWithImages);

console.log('=== ESTIMATIVA CLÍNICA MÉDICA (24.468 questões) ===');
console.log(JSON.stringify(costClinica, null, 2));

console.log('\n=== ESTIMATIVA BANCO COMPLETO (61.022 questões) ===');
console.log(JSON.stringify(costTotalBank, null, 2));

const report = {
  clinica: costClinica,
  totalBank: costTotalBank,
  pricingBasis: {
    model: 'gemini-3.5-flash-lite',
    inputPerMillionUSD: PRICE_INPUT_PER_M,
    outputPerMillionUSD: PRICE_OUTPUT_PER_M,
    tokensPerImage: TOKENS_PER_IMAGE,
    usdBrlRate: USD_BRL
  }
};

fs.writeFileSync('C:/Users/froge/.gemini/antigravity/brain/7b3c779d-de2a-4d34-9e11-0f56afb8dcbf/scratch/cost_estimation.json', JSON.stringify(report, null, 2));
