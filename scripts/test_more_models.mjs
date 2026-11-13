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

const key = env.GEMINI_API_KEY_1 || env.GEMINI_API_KEY_2;

const candidateModels2 = [
  'gemini-flash-latest',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash'
];

async function testMore() {
  for (const m of candidateModels2) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'OK' }] }],
          generationConfig: { maxOutputTokens: 10 }
        })
      });
      console.log(` - ${m.padEnd(25)}: HTTP ${res.status} ${res.ok ? '✅ FUNCIONANDO' : '❌'}`);
    } catch (e) {
      console.log(` - ${m.padEnd(25)}: ERRO ${e.message}`);
    }
  }
}

testMore();
