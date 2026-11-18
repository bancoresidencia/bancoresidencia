import { loadLocalEnv, resolveGeminiKey } from './load_env.mjs';

const env = loadLocalEnv();
const key = resolveGeminiKey(env, ['GEMINI_API_KEY_PAID', 'GEMINI_API_KEY_ON_DEMAND', 'GEMINI_API_KEY']);
if (!key) {
  console.error('❌ Defina GEMINI_API_KEY_PAID no .env.local ou passe --key=...');
  process.exit(1);
}

console.log('Testando token:', key);
console.log('Comprimento:', key.length);

async function testAll() {
  // Teste 1: Query param
  try {
    const r1 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    console.log('\n--- 1. Query Param ?key= ---');
    console.log('Status:', r1.status, r1.statusText);
    const d1 = await r1.json();
    console.log('Data:', JSON.stringify(d1, null, 2));
  } catch (e) {
    console.error('Erro 1:', e.message);
  }

  // Teste 2: Header x-goog-api-key
  try {
    const r2 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models`, {
      headers: { 'x-goog-api-key': key }
    });
    console.log('\n--- 2. Header x-goog-api-key ---');
    console.log('Status:', r2.status, r2.statusText);
    const d2 = await r2.json();
    console.log('Data:', JSON.stringify(d2, null, 2));
  } catch (e) {
    console.error('Erro 2:', e.message);
  }

  // Teste 3: Authorization: Bearer
  try {
    const r3 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models`, {
      headers: { 'Authorization': `Bearer ${key}` }
    });
    console.log('\n--- 3. Header Authorization: Bearer ---');
    console.log('Status:', r3.status, r3.statusText);
    const d3 = await r3.json();
    console.log('Data:', JSON.stringify(d3, null, 2));
  } catch (e) {
    console.error('Erro 3:', e.message);
  }

  // Teste 4: Google Cloud tokeninfo / oauth2 inspect
  try {
    const r4 = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${key}`);
    console.log('\n--- 4. OAuth2 Tokeninfo ---');
    console.log('Status:', r4.status, r4.statusText);
    const d4 = await r4.json();
    console.log('Data:', JSON.stringify(d4, null, 2));
  } catch (e) {
    console.error('Erro 4:', e.message);
  }
}

testAll();
