import { loadLocalEnv, resolveGeminiKey } from './load_env.mjs';

const env = loadLocalEnv();
const newKey = resolveGeminiKey(env, ['GEMINI_API_KEY', 'GEMINI_API_KEY_1']);
if (!newKey) {
  console.error('❌ Defina GEMINI_API_KEY no .env.local ou passe --key=...');
  process.exit(1);
}

async function testNewKey() {
  console.log('=== TESTANDO NOVA CHAVE GRATUITA ===');
  console.log('Chave:', newKey.slice(0, 12) + '...' + newKey.slice(-6));

  const models = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-flash-lite-latest'];

  for (const m of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${newKey}`;
    try {
      const start = Date.now();
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'ping' }] }],
          generationConfig: { maxOutputTokens: 5 }
        })
      });
      const duration = Date.now() - start;
      if (res.ok) {
        const json = await res.json();
        console.log(`✅ ${m.padEnd(25)} -> HTTP 200 OK (${duration}ms)`);
      } else {
        const errJson = await res.json().catch(() => ({}));
        console.log(`❌ ${m.padEnd(25)} -> HTTP ${res.status} [${errJson.error?.status || ''}]: ${errJson.error?.message || ''}`);
      }
    } catch (e) {
      console.log(`⚠️ ${m.padEnd(25)} -> Erro: ${e.message}`);
    }
  }
}

testNewKey();
