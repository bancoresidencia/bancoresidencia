import { loadLocalEnv, resolveGeminiKey } from './load_env.mjs';

const env = loadLocalEnv();
const testKey = resolveGeminiKey(env, ['GEMINI_API_KEY_PAID', 'GEMINI_API_KEY_ON_DEMAND', 'GEMINI_API_KEY']);
if (!testKey) {
  console.error('❌ Defina GEMINI_API_KEY_PAID no .env.local ou passe --key=...');
  process.exit(1);
}

async function testProModels() {
  const proModels = [
    'gemini-2.5-pro',
    'gemini-3.1-pro-preview',
    'gemini-pro-latest',
    'gemini-2.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash-lite'
  ];

  console.log('Testando os modelos topo de linha (Pro / Flash):');
  for (const m of proModels) {
    const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${testKey}`;
    try {
      const res = await fetch(genUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Explique brevemente conduta no choque séptico.' }] }],
          generationConfig: { maxOutputTokens: 20 }
        })
      });
      if (res.ok) {
        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log(`✅ ${m.padEnd(25)} -> HTTP 200 OK | Resposta: ${text.trim().slice(0, 60)}...`);
      } else {
        const errJson = await res.json().catch(() => ({}));
        console.log(`❌ ${m.padEnd(25)} -> HTTP ${res.status} [${errJson.error?.status || ''}]: ${errJson.error?.message || ''}`);
      }
    } catch (e) {
      console.log(`⚠️ ${m.padEnd(25)} -> Erro: ${e.message}`);
    }
  }
}

testProModels();
