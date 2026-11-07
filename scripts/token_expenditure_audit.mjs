import fs from 'fs';

const filePath = 'C:/Users/froge/.gemini/antigravity/brain/7b3c779d-de2a-4d34-9e11-0f56afb8dcbf/scratch/batch_100_results.json';
const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const questions = raw.questions;

console.log(`Analisando ${questions.length} questões...`);

// Métricas de Saída (Output)
const outputBreakdown = {
  optionExplanations: { chars: 0, count: 0 },
  finalCommentary: { chars: 0, count: 0 },
  mainErrorReason: { chars: 0, count: 0 },
  takeHomeMessage: { chars: 0, count: 0 },
  guidelineEvolution: { chars: 0, count: 0 },
  references: { chars: 0, count: 0 },
  jsonOverhead: { chars: 0, count: 0 },
  totalOutputChars: 0,
  totalCandidateTokens: 0,
  optionsCountTotal: 0
};

// Métricas de Entrada (Input)
const inputBreakdown = {
  totalPromptTokens: 0,
  statementChars: 0,
  optionsChars: 0,
  metadataChars: 0,
  staticInstructionsChars: 0
};

for (const q of questions) {
  // Output analysis
  const candTokens = q.usage?.candidatesTokenCount || 0;
  outputBreakdown.totalCandidateTokens += candTokens;

  // Option explanations
  let optExplChars = 0;
  let optCount = 0;
  if (Array.isArray(q.options)) {
    for (const opt of q.options) {
      optExplChars += (opt.explanation || '').length;
      optCount++;
    }
  }
  outputBreakdown.optionExplanations.chars += optExplChars;
  outputBreakdown.optionsCountTotal += optCount;

  // Final Commentary
  const fcChars = (q.finalCommentary || '').length;
  outputBreakdown.finalCommentary.chars += fcChars;

  // Main Error Reason
  const merChars = (q.mainErrorReason || '').length;
  outputBreakdown.mainErrorReason.chars += merChars;

  // Take Home Message
  const thmChars = (q.takeHomeMessage || '').length;
  outputBreakdown.takeHomeMessage.chars += thmChars;

  // Guideline Evolution
  const geChars = (q.guidelineEvolution || '').length;
  outputBreakdown.guidelineEvolution.chars += geChars;

  // References
  let refChars = 0;
  if (Array.isArray(q.references)) {
    refChars = q.references.reduce((acc, r) => acc + (r || '').length, 0);
  }
  outputBreakdown.references.chars += refChars;

  const contentChars = optExplChars + fcChars + merChars + thmChars + geChars + refChars;
  outputBreakdown.totalOutputChars += contentChars;

  // Input analysis
  const promptTokens = q.usage?.promptTokenCount || 0;
  inputBreakdown.totalPromptTokens += promptTokens;

  const stmtLen = (q.statement || '').length;
  inputBreakdown.statementChars += stmtLen;

  let optLen = 0;
  if (Array.isArray(q.options)) {
    optLen = q.options.reduce((acc, o) => acc + (o.text || '').length, 0);
  }
  inputBreakdown.optionsChars += optLen;
}

const n = questions.length;

console.log('\n======================================================');
console.log('--- RELATÓRIO DE MÉTRICAS MÉDIAS POR QUESTÃO ---');
console.log('======================================================');

console.log('\n--- 1. INPUT (PROMPT) ---');
console.log(`Tokens de Entrada Médios: ${(inputBreakdown.totalPromptTokens / n).toFixed(1)} tokens`);
console.log(`Média de Caracteres do Enunciado: ${(inputBreakdown.statementChars / n).toFixed(1)} caracteres`);
console.log(`Média de Caracteres das Alternativas Originais: ${(inputBreakdown.optionsChars / n).toFixed(1)} caracteres`);
console.log(`Média de Alternativas por Questão: ${(outputBreakdown.optionsCountTotal / n).toFixed(1)} alternativas`);

console.log('\n--- 2. OUTPUT (CANDIDATOS / RESPOSTA GERADA) ---');
console.log(`Tokens de Saída Médios: ${(outputBreakdown.totalCandidateTokens / n).toFixed(1)} tokens`);
console.log(`Total de Caracteres de Conteúdo Médio: ${(outputBreakdown.totalOutputChars / n).toFixed(1)} caracteres`);

const avgOptExpl = outputBreakdown.optionExplanations.chars / n;
const avgFc = outputBreakdown.finalCommentary.chars / n;
const avgMer = outputBreakdown.mainErrorReason.chars / n;
const avgThm = outputBreakdown.takeHomeMessage.chars / n;
const avgGe = outputBreakdown.guidelineEvolution.chars / n;
const avgRef = outputBreakdown.references.chars / n;
const totalContent = avgOptExpl + avgFc + avgMer + avgThm + avgGe + avgRef;

console.log(`\nDetalhamento dos Caracteres de Saída por Campo:`);
console.log(`- Justificativas das Opções (A-E): ${avgOptExpl.toFixed(1)} caracteres (${((avgOptExpl / totalContent) * 100).toFixed(1)}%)`);
console.log(`  └ Média por alternativa individual: ${(avgOptExpl / (outputBreakdown.optionsCountTotal / n)).toFixed(1)} caracteres`);
console.log(`- Comentário Final (finalCommentary): ${avgFc.toFixed(1)} caracteres (${((avgFc / totalContent) * 100).toFixed(1)}%)`);
console.log(`- Principal Motivo de Erro (mainErrorReason): ${avgMer.toFixed(1)} caracteres (${((avgMer / totalContent) * 100).toFixed(1)}%)`);
console.log(`- Take-Home Message (takeHomeMessage): ${avgThm.toFixed(1)} caracteres (${((avgThm / totalContent) * 100).toFixed(1)}%)`);
console.log(`- Evolução de Diretrizes (guidelineEvolution): ${avgGe.toFixed(1)} caracteres (${((avgGe / totalContent) * 100).toFixed(1)}%)`);
console.log(`- Referências (references): ${avgRef.toFixed(1)} caracteres (${((avgRef / totalContent) * 100).toFixed(1)}%)`);

// Estimativa de tokens por campo (usando a razão de tokens/caracter do modelo para português ~ 3.5 a 4 chars por token)
const charToTokenRatio = (outputBreakdown.totalCandidateTokens / outputBreakdown.totalOutputChars);
console.log(`\nTaxa empírica de tokens por caractere de saída: ${charToTokenRatio.toFixed(3)} tokens/char (~${(1/charToTokenRatio).toFixed(2)} chars/token)`);

console.log(`\nEstimativa de Tokens de Saída por Campo:`);
console.log(`- Justificativas das Opções: ~${(avgOptExpl * charToTokenRatio).toFixed(1)} tokens (${((avgOptExpl / totalContent) * 100).toFixed(1)}%)`);
console.log(`- Comentário Final: ~${(avgFc * charToTokenRatio).toFixed(1)} tokens (${((avgFc / totalContent) * 100).toFixed(1)}%)`);
console.log(`- Principal Motivo de Erro: ~${(avgMer * charToTokenRatio).toFixed(1)} tokens (${((avgMer / totalContent) * 100).toFixed(1)}%)`);
console.log(`- Take-Home Message: ~${(avgThm * charToTokenRatio).toFixed(1)} tokens (${((avgThm / totalContent) * 100).toFixed(1)}%)`);
console.log(`- Evolução de Diretrizes: ~${(avgGe * charToTokenRatio).toFixed(1)} tokens (${((avgGe / totalContent) * 100).toFixed(1)}%)`);
console.log(`- Referências: ~${(avgRef * charToTokenRatio).toFixed(1)} tokens (${((avgRef / totalContent) * 100).toFixed(1)}%)`);

