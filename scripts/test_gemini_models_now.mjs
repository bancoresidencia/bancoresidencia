import { API_KEYS } from './solve_questions_engine.mjs';

const models = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite'
];

async function testAll() {
  const key = API_KEYS[0];
  console.log('Testando modelos com a chave 1 (...' + key.slice(-6) + '):');
  for (const m of models) {
    try {
      const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + m + ':generateContent?key=' + key;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'ping' }] }] })
      });
      const data = await res.json();
      if (res.ok) {
        console.log('✅', m, 'OK (HTTP 200)');
      } else {
        console.log('❌', m, 'Status:', res.status, data.error?.message?.slice(0, 75));
      }
    } catch (e) {
      console.log('❌', m, 'Err:', e.message);
    }
  }
}
testAll();
