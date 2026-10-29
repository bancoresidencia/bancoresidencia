import fs from 'fs';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const API_KEYS = Object.keys(env)
  .filter(k => k.startsWith('GEMINI_API_KEY'))
  .sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, '') || '0', 10);
    const numB = parseInt(b.replace(/\D/g, '') || '0', 10);
    return numA - numB;
  })
  .map(k => env[k])
  .filter((k, idx, self) => k && self.indexOf(k) === idx);

console.log(`Diagnóstico profundo das ${API_KEYS.length} chaves no pool:`);

const testModels = [
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
  'gemini-3-flash-preview',
  'gemini-flash-latest'
];

for (let i = 0; i < API_KEYS.length; i++) {
  const key = API_KEYS[i];
  console.log(`\n--- Testando Chave ${i + 1}/${API_KEYS.length} (${key.slice(0, 10)}...) ---`);
  for (const m of testModels) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`;
    try {
      const controller = new AbortController();
      const tId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'ping' }] }] }),
        signal: controller.signal
      });
      clearTimeout(tId);
      if (res.ok) {
        console.log(`  [${m}] -> 200 OK ✅`);
      } else {
        const txt = await res.text();
        let reason = 'outro';
        try {
          const errObj = JSON.parse(txt);
          reason = errObj.error?.message || txt.slice(0, 80);
        } catch {
          reason = txt.slice(0, 80);
        }
        console.log(`  [${m}] -> HTTP ${res.status}: ${reason.slice(0, 120)}`);
      }
    } catch (e) {
      console.log(`  [${m}] -> Network Error: ${e.message}`);
    }
  }
}
