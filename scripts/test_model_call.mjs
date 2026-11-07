import fs from 'fs';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const [k, ...v] = l.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
}
const key = env.GEMINI_API_KEY_PAID;
const models = ['gemini-3.5-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

for (const m of models) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: 'Ping' }] }] })
  });
  console.log(`Model ${m} status:`, res.status);
  const data = await res.json();
  if (!res.ok) {
    console.log(`  Error:`, data.error?.message);
  } else {
    console.log(`  OK! Candidate text:`, data.candidates?.[0]?.content?.parts?.[0]?.text?.slice(0, 50));
    console.log(`  usageMetadata:`, data.usageMetadata);
  }
}

