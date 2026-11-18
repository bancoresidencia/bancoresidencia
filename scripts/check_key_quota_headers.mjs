import { loadLocalEnv, resolveGeminiKey } from './load_env.mjs';

const env = loadLocalEnv();
const testKey = resolveGeminiKey(env, ['GEMINI_API_KEY_PAID', 'GEMINI_API_KEY_ON_DEMAND', 'GEMINI_API_KEY']);
if (!testKey) {
  console.error('❌ Defina GEMINI_API_KEY_PAID ou GEMINI_API_KEY no .env.local ou passe --key=...');
  process.exit(1);
}

async function check() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${testKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'ping' }] }],
      generationConfig: { maxOutputTokens: 5 }
    })
  });

  console.log('Status:', res.status, res.statusText);
  const text = await res.text();
  console.log('Body:', text);
}

check();
