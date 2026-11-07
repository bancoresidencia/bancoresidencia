import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});

const paidValue = env.GEMINI_API_KEY_PAID;
const freeKeys = Object.keys(env)
  .filter(k => k.startsWith('GEMINI_API_KEY'))
  .filter(k => !k.includes('PAID') && !k.includes('ON_DEMAND') && !k.includes('BILLING'))
  .map(k => ({ name: k, key: env[k] }))
  .filter(item => item.key && item.key !== paidValue);

const uniqueFreeKeys = [...new Set(freeKeys.map(i => i.key))];
console.log(`Testando ${uniqueFreeKeys.length} chaves gratuitas com gemini-3.5-flash-lite...`);

for (let i = 0; i < uniqueFreeKeys.length; i++) {
  const key = uniqueFreeKeys[i];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${key}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'OK' }] }] })
    });
    console.log(`Chave ${i + 1}/${uniqueFreeKeys.length} (${key.slice(0, 8)}...${key.slice(-4)}): HTTP ${res.status}`);
  } catch (err) {
    console.log(`Chave ${i + 1} erro: ${err.message}`);
  }
}

