import fs from 'fs';

const state = {
  status: "PARADO",
  specialty: "Medicina Preventiva",
  file: "data/medicina_preventiva_final_questions.json",
  model: "gemini-3.1-flash-lite (Modo 100% Gratuito - Custo R$ 0,00)",
  scope: "Questões de Texto Puro com Gabarito Homologado (questions_direto)",
  concurrency: 4,
  totalToProcess: 19320,
  processedCount: 0,
  successCount: 0,
  errorCount: 0,
  progressPercent: 0,
  pricing: {
    tier: "Gratuito (Free Tier)",
    costUSD: "$0.00",
    costBRL: "R$ 0,00",
    note: "Operando exclusivamente com cotas diárias gratuitas do Google AI Studio"
  },
  velocity: {
    questionsPerMinute: 0,
    elapsedSeconds: 0,
    estimatedSecondsRemaining: 0,
    etaFormatted: "Parado"
  },
  recentHistory: []
};

fs.writeFileSync('data/pipeline_progress_state.json', JSON.stringify(state, null, 2), 'utf8');
console.log('pipeline_progress_state.json resetado para PARADO (100% Gratuito)');
