import { loadLocalEnv, resolveGeminiKey } from './load_env.mjs';

const env = loadLocalEnv();
const key = resolveGeminiKey(env, ['GEMINI_API_KEY', 'GEMINI_API_KEY_1']);
if (!key) {
  console.error('❌ Defina GEMINI_API_KEY no .env.local ou passe --key=...');
  process.exit(1);
}

async function checkModelMetadata() {
  const models = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-flash-lite-latest'];

  for (const m of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}?key=${key}`;
    try {
      const res = await fetch(url);
      console.log(`\n=== MODELO: ${m} === (HTTP ${res.status})`);
      if (res.ok) {
        const json = await res.json();
        console.log('DisplayName:', json.displayName);
        console.log('InputTokenLimit:', json.inputTokenLimit);
        console.log('OutputTokenLimit:', json.outputTokenLimit);
        console.log('SupportedGenerationMethods:', json.supportedGenerationMethods);
      }
    } catch (e) {
      console.log('Erro:', e.message);
    }
  }
}

checkModelMetadata();
