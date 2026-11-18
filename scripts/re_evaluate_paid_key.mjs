import { loadLocalEnv, resolveGeminiKey } from './load_env.mjs';

const env = loadLocalEnv();
const originalKey = resolveGeminiKey(env, ['GEMINI_API_KEY_PAID', 'GEMINI_API_KEY_ON_DEMAND', 'GEMINI_API_KEY']);
if (!originalKey) {
  console.error('❌ Defina GEMINI_API_KEY_PAID no .env.local ou passe --key=...');
  process.exit(1);
}

console.log('Original Key:', originalKey);
console.log('Length:', originalKey.length);

async function testVariant(label, k, endpoint = 'v1beta', model = 'gemini-1.5-flash') {
  const url = `https://generativelanguage.googleapis.com/${endpoint}/models/${model}:generateContent?key=${k}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'Oi' }] }] })
    });
    const status = res.status;
    const body = await res.json();
    if (res.ok) {
      console.log(`✅ [${label}] HTTP ${status} SUCESSO!`, body.candidates?.[0]?.content?.parts?.[0]?.text?.slice(0, 50));
      return true;
    } else {
      console.log(`❌ [${label}] HTTP ${status}:`, body.error?.message, `(${body.error?.details?.[0]?.reason || ''})`);
      return false;
    }
  } catch (e) {
    console.log(`❌ [${label}] Erro de rede:`, e.message);
    return false;
  }
}

async function run() {
  console.log('--- Testando Key Exata em diferentes endpoints e modelos ---');
  await testVariant('v1beta gemini-1.5-flash', originalKey, 'v1beta', 'gemini-1.5-flash');
  await testVariant('v1 gemini-1.5-flash', originalKey, 'v1', 'gemini-1.5-flash');
  await testVariant('v1beta gemini-2.0-flash', originalKey, 'v1beta', 'gemini-2.0-flash');
  await testVariant('v1beta gemini-3.1-flash-lite', originalKey, 'v1beta', 'gemini-3.1-flash-lite');
  await testVariant('v1alpha gemini-1.5-flash', originalKey, 'v1alpha', 'gemini-1.5-flash');

  console.log('\n--- Testando com header x-goog-api-key ---');
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': originalKey
      },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'Oi' }] }] })
    });
    const body = await res.json();
    console.log(`Header x-goog-api-key -> HTTP ${res.status}:`, body.error?.message || 'OK');
  } catch (e) {
    console.log('Erro header:', e.message);
  }

  console.log('\n--- Testando variantes de digitação comuns (se houver typo) ---');
  // Se os dois underlines fossem um só:
  const varSingleUnderscore = originalKey.replace('O__7', 'O_7');
  await testVariant('Variante O_7 (1 underscore)', varSingleUnderscore);

  // Se fosse hífen:
  const varHyphen = originalKey.replace('O__7', 'O-7');
  await testVariant('Variante O-7 (hífen)', varHyphen);

  // Se fosse underline e hífen:
  const varUnderscoreHyphen = originalKey.replace('O__7', 'O_-7');
  await testVariant('Variante O_-7', varUnderscoreHyphen);
}

run();
