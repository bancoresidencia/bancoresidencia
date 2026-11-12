import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.trim().split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const sample5 = [
  { id: 'q1', enunciado: 'Gestante 32 semanas, PA 160x110, proteinúria maciça e cefaleia. Conduta imediata?', alternativas: 'A) Sulfato de magnésio | B) Alta', gabarito_oficial: 'Alternativa A', comentario: 'Pré-eclâmpsia grave.' },
  { id: 'q2', enunciado: 'Pré-eclâmpsia com iminência. Droga para prevenir eclâmpsia?', alternativas: 'A) Sulfato de magnésio | B) Diazepam', gabarito_oficial: 'Alternativa A', comentario: 'Sulfato de magnésio Pritchard ou Zuspan.' },
  { id: 'q3', enunciado: 'Síndrome HELLP. Critérios laboratoriais?', alternativas: 'A) Plaquetas < 100k, LDH > 600, AST elevada | B) Leucocitose', gabarito_oficial: 'Alternativa A', comentario: 'Critérios de Tennessee.' },
  { id: 'q4', enunciado: 'Eclâmpsia com convulsão. Primeira conduta?', alternativas: 'A) Manutenção de vias aéreas e sulfato de Mg | B) Cesárea imediata', gabarito_oficial: 'Alternativa A', comentario: 'Estabilização materna antes do parto.' },
  { id: 'q5', enunciado: 'Intoxicação por sulfato de magnésio com perda de reflexo patelar. Antídoto?', alternativas: 'A) Gluconato de cálcio 10% | B) Naloxona', gabarito_oficial: 'Alternativa A', comentario: 'Gluconato de cálcio 1g EV.' }
];

const subfocos = [
  'Pré-Eclâmpsia: Diagnóstico e Critérios de Gravidade',
  'Manejo Clínico e Prevenção de Eclâmpsia (Sulfato de Magnésio)',
  'Síndrome HELLP e Complicações Materno-Fetais'
];

const prompt = `Você é um Professor e Preceptor Médico de Residência Médica da plataforma Banco Residência.
Classifique o LOTE DE QUESTÕES na árvore taxonômica oficial.

SUBFOCOS VÁLIDOS:
${JSON.stringify(subfocos, null, 2)}

LOTE DE QUESTÕES:
${JSON.stringify(sample5, null, 2)}

RESPONDA ESTRITAMENTE EM FORMATO JSON COMO UM ARRAY DE OBJETOS:
[
  {
    "id": "q1",
    "subfoco_escolhido": "NOME_EXATO",
    "justificativa_clinica": "Justificativa médica."
  }
]`;

async function testBatch() {
  const t0 = Date.now();
  console.log('Sending 5-question test to OpenRouter (Nemotron 550B)...');
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://bancoresidencia.com.br',
        'X-Title': 'Banco Residencia'
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-ultra-550b-a55b:free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2500,
        temperature: 0.1
      })
    });
    console.log('Status:', res.status, 'in', ((Date.now() - t0) / 1000).toFixed(1) + 's');
    const data = await res.json();
    console.log('Choice message content:');
    console.log(data?.choices?.[0]?.message?.content);
  } catch (err) {
    console.log('Error:', err.message);
  }
}
testBatch();
