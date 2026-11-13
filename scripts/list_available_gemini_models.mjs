import fs from 'fs';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
}

// Pega a primeira chave válida
const key = env.GEMINI_API_KEY_1 || env.GEMINI_API_KEY_2 || env.GEMINI_API_KEY_3;

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.models) {
    const flashModels = data.models
      .map(m => m.name.replace('models/', ''))
      .filter(m => m.includes('flash') || m.includes('lite') || m.includes('gemini'));
    console.log('Modelos disponíveis no Google AI Studio:');
    console.log(flashModels);
  } else {
    console.log('Resposta:', data);
  }
}

listModels();
