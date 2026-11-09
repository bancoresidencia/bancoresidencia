import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const key = env.match(/GEMINI_API_KEY=(.+)/)[1].trim();

const prompt = 'Você é um médico. Responda em JSON: {"status": "ok", "mensagem": "teste bem-sucedido"}';
const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${key}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json' }
  })
});

console.log('Status:', res.status, res.statusText);
const txt = await res.text();
console.log('Response:', txt);

