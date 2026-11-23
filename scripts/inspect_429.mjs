import { API_KEYS } from './solve_questions_engine.mjs';

async function inspectError() {
  const key = API_KEYS[0];
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=' + key;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: 'ping' }] }] })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
inspectError();
