import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});

const key1 = env.GEMINI_API_KEY_1;
const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key1}`);
const data = await res.json();
if (data.models) {
  console.log(`Modelos disponíveis para a chave gratuita (${data.models.length}):`);
  data.models
    .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
    .forEach(m => console.log(' - ' + m.name.replace('models/', '')));
} else {
  console.log('Erro ao listar:', data);
}

