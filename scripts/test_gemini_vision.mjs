import fs from 'fs';

const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_1;

async function testGemini() {
  const imgBase64 = fs.readFileSync('scripts/medevo_logo_ref.png').toString('base64');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [
      {
        parts: [
          {
            text: 'Descreva de forma curta este símbolo: cor, formato e significado evidente.'
          },
          {
            inlineData: {
              mimeType: 'image/png',
              data: imgBase64
            }
          }
        ]
      }
    ]
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  console.log('Gemini status:', res.status);
  console.log('Gemini response:', JSON.stringify(data, null, 2));
}

testGemini().catch(console.error);
