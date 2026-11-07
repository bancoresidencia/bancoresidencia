import fs from 'fs';

// Verifica clinica_medica_final_questions.json
const clinica = JSON.parse(fs.readFileSync('data/clinica_medica_final_questions.json', 'utf8'));

let countWithComment = 0;
let totalPromptTokensEstimate = 0;
let totalCandidateTokensEstimate = 0;

for (const q of clinica) {
  if (q.finalCommentary || q.commentary) {
    countWithComment++;
    // Estima tokens reais baseados no tamanho do texto
    const promptLen = (q.statement || '').length + (JSON.stringify(q.options || [])).length + 2000;
    const respLen = (q.finalCommentary || '').length + (q.mainErrorReason || '').length + (q.takeHomeMessage || '').length + 1000;
    totalPromptTokensEstimate += Math.round(promptLen / 3.5);
    totalCandidateTokensEstimate += Math.round(respLen / 3.5);
  }
}

console.log('=== DIAGNÓSTICO DETALHADO DE CONSUMO ===');
console.log(`Questões com comentário em Clínica Médica: ${countWithComment} de ${clinica.length}`);

// Preço oficial do Gemini Flash-Lite:
// Input: $0.075 / 1.000.000 tokens
// Output: $0.30 / 1.000.000 tokens
const costFlashLiteUSD = (totalPromptTokensEstimate / 1000000 * 0.075) + (totalCandidateTokensEstimate / 1000000 * 0.30);

// Preço oficial do Gemini Flash normal (gemini-1.5-flash / gemini-2.0-flash / gemini-2.5-flash):
// Input: $0.075 / 1.000.000 tokens (ou $0.15 para prompts normais em algumas versões)
// Output: $0.30 / 1.000.000 tokens (ou $0.60)
const costFlashUSD = (totalPromptTokensEstimate / 1000000 * 0.15) + (totalCandidateTokensEstimate / 1000000 * 0.60);

// Preço oficial do Gemini Pro (gemini-1.5-pro):
// Input: $1.25 / 1.000.000 tokens
// Output: $5.00 / 1.000.000 tokens
const costProUSD = (totalPromptTokensEstimate / 1000000 * 1.25) + (totalCandidateTokensEstimate / 1000000 * 5.00);

console.log('\n--- Estimativas de Custo para as ' + countWithComment + ' questões ---');
console.log('Tokens Estimados: Prompt=' + totalPromptTokensEstimate.toLocaleString('pt-BR') + ' | Resposta=' + totalCandidateTokensEstimate.toLocaleString('pt-BR'));
console.log('Se tarifado como Flash-Lite ($0.075/$0.30): $' + costFlashLiteUSD.toFixed(2) + ' USD (~R$ ' + (costFlashLiteUSD * 5.75).toFixed(2) + ' BRL)');
console.log('Se tarifado como Flash Normal ($0.15/$0.60):   $' + costFlashUSD.toFixed(2) + ' USD (~R$ ' + (costFlashUSD * 5.75).toFixed(2) + ' BRL)');
console.log('Se tarifado como Gemini Pro ($1.25/$5.00):     $' + costProUSD.toFixed(2) + ' USD (~R$ ' + (costProUSD * 5.75).toFixed(2) + ' BRL)');

