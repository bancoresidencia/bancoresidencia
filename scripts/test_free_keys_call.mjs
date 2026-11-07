import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});

const key1 = env.GEMINI_API_KEY_1;
console.log('Testing Free Key 1:', key1.slice(0, 10) + '...' + key1.slice(-4));

const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.0-flash-lite', 'gemini-3.5-flash-lite'];

for (const m of models) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key1}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'Responda OK' }] }] })
    });
    console.log(`Model ${m}: Status = ${res.status}`);
    const data = await res.json();
    if (res.ok) {
      console.log(`  -> Sucesso! Resposta: ${data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()}`);
    } else {
      console.log(`  -> Erro: ${data.error?.message?.slice(0, 100)}`);
    }
  } catch (err) {
    console.log(`Model ${m} fetch error: ${err.message}`);
  }
}

