import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.trim().split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const sample10 = [
  { id: 'q1', enunciado: 'Gestante 32 semanas, PA 160x110, proteinúria e cefaleia. Conduta imediata?', alternativas: 'A) Sulfato de magnésio | B) Alta hospitalar', gabarito_oficial: 'Alternativa A', comentario: 'Pré-eclâmpsia grave.' },
  { id: 'q2', enunciado: 'Pré-eclâmpsia com iminência. Droga para prevenir eclâmpsia?', alternativas: 'A) Sulfato de magnésio | B) Diazepam', gabarito_oficial: 'Alternativa A', comentario: 'Sulfato de magnésio Pritchard ou Zuspan.' },
  { id: 'q3', enunciado: 'Síndrome HELLP. Critérios laboratoriais?', alternativas: 'A) Plaquetas < 100k, LDH > 600, AST elevada | B) Leucocitose isolada', gabarito_oficial: 'Alternativa A', comentario: 'Critérios de Tennessee.' },
  { id: 'q4', enunciado: 'Eclâmpsia com convulsão em andamento. Primeira conduta?', alternativas: 'A) Vias aéreas e sulfato de Mg | B) Cesárea imediata sem estabilização', gabarito_oficial: 'Alternativa A', comentario: 'Estabilização materna antes do parto.' },
  { id: 'q5', enunciado: 'Intoxicação por sulfato de magnésio com perda de reflexo patelar. Antídoto?', alternativas: 'A) Gluconato de cálcio 10% | B) Naloxona', gabarito_oficial: 'Alternativa A', comentario: 'Gluconato de cálcio 1g EV.' },
  { id: 'q6', enunciado: 'Níveis terapêuticos de magnesemia para profilaxia de eclâmpsia?', alternativas: 'A) 4 a 7 mEq/L | B) 10 a 15 mEq/L', gabarito_oficial: 'Alternativa A', comentario: 'Faixa de 4 a 7 mEq/L.' },
  { id: 'q7', enunciado: 'Critério diagnóstico de pré-eclâmpsia sobreposta à hipertensão crônica?', alternativas: 'A) Piora súbita da PA ou nova proteinúria após 20 sem | B) PA normal', gabarito_oficial: 'Alternativa A', comentario: 'Sobreposição.' },
  { id: 'q8', enunciado: 'Hipertensão gestacional transitória sem proteinúria. Diagnóstico definitivo após quanto tempo puerperal?', alternativas: 'A) 12 semanas | B) 2 semanas', gabarito_oficial: 'Alternativa A', comentario: 'Resolução em até 12 semanas pós-parto.' },
  { id: 'q9', enunciado: 'Primeira linha anti-hipertensiva oral para gestante com HAS crônica?', alternativas: 'A) Metildopa, Hidralazina ou Nifedipino | B) IECA ou BRA', gabarito_oficial: 'Alternativa A', comentario: 'Metildopa é clássica.' },
  { id: 'q10', enunciado: 'Complicação hepática mais temida da Síndrome HELLP?', alternativas: 'A) Hematoma e rotura hepática subcapsular | B) Hepatite A', gabarito_oficial: 'Alternativa A', comentario: 'Rotura hepática com choque hemorrágico.' }
];

const subfocos = [
  'Pré-Eclâmpsia: Diagnóstico e Critérios de Gravidade',
  'Manejo Clínico e Prevenção de Eclâmpsia (Sulfato de Magnésio)',
  'Síndrome HELLP e Complicações Materno-Fetais',
  'Hipertensão Arterial Crônica na Gestação e Pré-Eclâmpsia Sobreposta'
];

const prompt = `Você é um Professor e Preceptor Médico de Residência Médica da plataforma Banco Residência.
Classifique o LOTE DE 10 QUESTÕES na árvore taxonômica oficial.

SUBFOCOS VÁLIDOS (Escolha estritamente UM por questão a partir desta lista oficial):
${JSON.stringify(subfocos, null, 2)}

LOTE DE QUESTÕES:
${JSON.stringify(sample10, null, 2)}

RESPONDA ESTRITAMENTE EM FORMATO JSON COMO UM ARRAY DE OBJETOS:
[
  {
    "id": "ID_EXATO",
    "subfoco_escolhido": "NOME_EXATO_DO_SUBFOCO",
    "justificativa_clinica": "Justificativa médica concisa."
  }
]`;

async function testGroq120b() {
  const t0 = Date.now();
  console.log('Sending 10-question test to Groq (openai/gpt-oss-120b)...');
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 3500
      })
    });
    console.log('Groq 120B Status:', res.status, 'in', ((Date.now() - t0) / 1000).toFixed(1) + 's');
    const data = await res.json();
    console.log(data?.choices?.[0]?.message?.content);
  } catch (e) {
    console.log('Error:', e.message);
  }
}

async function testGemini3Flash() {
  const t0 = Date.now();
  console.log('\nSending 10-question test to Gemini 3 Flash Preview...');
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      })
    });
    console.log('Gemini 3 Flash Status:', res.status, 'in', ((Date.now() - t0) / 1000).toFixed(1) + 's');
    const data = await res.json();
    console.log(data?.candidates?.[0]?.content?.parts?.[0]?.text?.slice(0, 500) + '...');
  } catch (e) {
    console.log('Error:', e.message);
  }
}

await testGroq120b();
await testGemini3Flash();

