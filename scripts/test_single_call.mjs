import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const k9 = env.GEMINI_API_KEY_9;

const promptComm = `Você é um professor de medicina elaborando um comentário final com informações adicionais.
Baseado nas justificativas das alternativas (USG TV é o método de triagem com ponto de corte de 4 mm para mulheres sem TRH, com VPN > 99% para câncer de endométrio; histeroscopia é padrão-ouro para biópsia dirigida mas não deve ser primeiro passo cego; atrofia é a causa mais comum ~70%), produza uma síntese clínica densa adicionando o algoritmo completo de investigação diagnóstica de sangramento pós-menopausa.
Responda estritamente em JSON:
{
  "finalCommentary": "..."
}`;

async function run() {
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=' + k9, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptComm }] }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });

  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Usage Tokens:', data.usageMetadata);
  const parsed = JSON.parse(data.candidates[0].content.parts[0].text);
  console.log('\nComentário Enriquecido Gerado pelo Flash-Lite:');
  console.log(parsed.finalCommentary);
}

run();
