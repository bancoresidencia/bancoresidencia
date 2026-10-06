const key = process.env.GEMINI_API_KEY;
const candidates = [
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-2.5-flash-lite',
  'gemini-3.7-flash',
  'gemini-3.5-flash',
  'gemini-2.5-flash'
];

async function run() {
  for (const m of candidates) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'Responda com apenas uma palavra: OK' }] }] })
      });
      const d = await res.json();
      console.log(m, 'Status:', res.status, d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || d.error?.message?.slice(0, 80));
    } catch (e) {
      console.log(m, 'Error:', e.message);
    }
  }
}
run();
