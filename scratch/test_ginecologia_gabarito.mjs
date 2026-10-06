import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('d:/bancoresidencia/data/ginecologia_medevo_extracted.json', 'utf8'));

// Filter out autorais
const official = raw.questions.filter(q => {
  const loc = (q.location?.name || '').toLowerCase();
  const stmt = (q.question_content || '').toLowerCase();
  if (loc.includes('medevo') || loc.includes('simulado medevo') || stmt.includes('medevo autoral')) {
    return false;
  }
  return true;
});

const sample = official.slice(0, 15);
const letters = ['A', 'B', 'C', 'D', 'E'];

const promptQuestions = sample.map((q, idx) => {
  const alts = (q.response_choices || []).map((c, i) => `${letters[i]}) ${c}`).join('\n');
  return `[QUESTAO ${idx + 1}] ID: ${q.id}
Enunciado: ${q.question_content}
Alternativas:
${alts}`;
}).join('\n\n');

const prompt = `Você é um preceptor e especialista em Ginecologia e Obstetrícia para provas de Residência Médica e Revalida.
Resolva com máxima precisão o gabarito oficial de cada uma das questões a seguir.
Como solicitado, forneça APENAS a letra correta (gabarito) para cada questão.

${promptQuestions}

Responda ESTRITAMENTE em formato JSON:
{
  "gabaritos": [
    {
      "id": "UUID_DA_QUESTAO",
      "correctAnswer": "A"
    }
  ]
}`;

async function run() {
  const key = process.env.GEMINI_API_KEY;
  const model = 'gemini-flash-lite-latest';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  
  console.log(`Testando resolução de ${sample.length} questões com ${model}...`);
  const t0 = Date.now();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.1 }
    })
  });

  const d = await res.json();
  const duration = (Date.now() - t0) / 1000;
  console.log(`Resposta recebida em ${duration.toFixed(2)}s`);
  if (!d.candidates?.[0]?.content?.parts?.[0]?.text) {
    console.error('Resposta inesperada:', JSON.stringify(d, null, 2));
    return;
  }
  const parsed = JSON.parse(d.candidates[0].content.parts[0].text);
  console.log(`Gabaritos recebidos: ${parsed.gabaritos?.length}`);
  console.log('Amostra de gabaritos:', parsed.gabaritos?.slice(0, 5));
}

run().catch(console.error);
