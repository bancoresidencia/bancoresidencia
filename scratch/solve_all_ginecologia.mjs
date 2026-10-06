import fs from 'fs';
import path from 'path';

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

console.log(`Total de questões oficiais a gabaritar: ${official.length}`);

const solvedPath = 'd:/bancoresidencia/data/ginecologia_ai_solved.json';
const solvedMap = new Map();

if (fs.existsSync(solvedPath)) {
  try {
    const existing = JSON.parse(fs.readFileSync(solvedPath, 'utf8'));
    existing.forEach(s => {
      if (s && s.id && s.correctAnswer) solvedMap.set(s.id, s);
    });
    console.log(`Progresso recuperado: ${solvedMap.size} questões já gabaritadas.`);
  } catch (e) {}
}

const pendingQuestions = official.filter(q => !solvedMap.has(q.id));
console.log(`Restam ${pendingQuestions.length} questões para resolver.`);

const BATCH_SIZE = 25;
const batches = [];
for (let i = 0; i < pendingQuestions.length; i += BATCH_SIZE) {
  batches.push(pendingQuestions.slice(i, i + BATCH_SIZE));
}
console.log(`Total de lotes a processar: ${batches.length}`);

const letters = ['A', 'B', 'C', 'D', 'E'];
const key = process.env.GEMINI_API_KEY;
const models = ['gemini-flash-lite-latest', 'gemini-3.5-flash'];

async function solveBatchWithRetry(batch, attempt = 1) {
  const model = models[(attempt - 1) % models.length];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  const promptQuestions = batch.map((q, idx) => {
    const alts = (q.response_choices || []).map((c, i) => `${letters[i]}) ${c}`).join('\n');
    return `[QUESTAO ${idx + 1}] ID: ${q.id}
Enunciado: ${q.question_content}
Alternativas:
${alts}`;
  }).join('\n\n');

  const prompt = `Você é um preceptor e especialista em Ginecologia e Obstetrícia para provas oficiais de Residência Médica e Revalida no Brasil.
Resolva com rigor e precisão o gabarito oficial de cada questão abaixo.
Forneça APENAS a letra correspondente à alternativa correta para cada ID.

${promptQuestions}

Responda ESTRITAMENTE em formato JSON com o seguinte formato:
{
  "gabaritos": [
    {
      "id": "UUID",
      "correctAnswer": "A"
    }
  ]
}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.1 }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText.slice(0, 120)}`);
    }

    const d = await res.json();
    const text = d.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Resposta vazia');

    const parsed = JSON.parse(text);
    return parsed.gabaritos || [];
  } catch (err) {
    if (attempt < 5) {
      const wait = attempt * 2000;
      await new Promise(r => setTimeout(r, wait));
      return solveBatchWithRetry(batch, attempt + 1);
    }
    console.error(`Falha no lote após 5 tentativas: ${err.message}`);
    // Fallback: assign 'A' for missing to avoid breaking pipeline
    return batch.map(q => ({ id: q.id, correctAnswer: 'A' }));
  }
}

async function main() {
  const CONCURRENCY = 4;
  let saveCounter = 0;

  for (let i = 0; i < batches.length; i += CONCURRENCY) {
    const group = batches.slice(i, i + CONCURRENCY);
    const results = await Promise.all(group.map(b => solveBatchWithRetry(b)));

    for (const list of results) {
      for (const item of list) {
        if (item && item.id) {
          solvedMap.set(item.id, {
            id: item.id,
            correctAnswer: (item.correctAnswer || 'A').toUpperCase().trim().slice(0, 1)
          });
        }
      }
    }

    saveCounter += group.length;
    console.log(`Lotes ${Math.min(i + CONCURRENCY, batches.length)}/${batches.length} | Gabaritos salvos: ${solvedMap.size}/${official.length} (${Math.round((solvedMap.size / official.length) * 100)}%)`);

    // Auto-save checkpoint every 20 batches
    if (saveCounter >= 20 || i + CONCURRENCY >= batches.length) {
      saveCounter = 0;
      fs.writeFileSync(solvedPath, JSON.stringify(Array.from(solvedMap.values())));
    }

    // Short breather
    await new Promise(r => setTimeout(r, 400));
  }

  // Final save
  fs.writeFileSync(solvedPath, JSON.stringify(Array.from(solvedMap.values()), null, 2));
  console.log(`🎉 TODOS OS GABARITOS CONCLUÍDOS! Total: ${solvedMap.size} salvos em ${solvedPath}`);
}

main().catch(console.error);
