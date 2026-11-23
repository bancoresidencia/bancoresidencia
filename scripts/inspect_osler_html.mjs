import fs from 'fs';

async function check() {
  const res = await fetch("https://oslermedicina.com.br/questoes/fmusp-2026-125837956f3342f6a000e51dd9eacf93", {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
    }
  });
  const text = await res.text();
  fs.writeFileSync('temp_osler.html', text);
  console.log('Saved temp_osler.html');

  // Search for anything resembling an image or api in the text
  const matches = text.match(/\/api\/[^\s"']+/gi) || [];
  console.log('API endpoints found:', [...new Set(matches)]);

  const imgTags = text.match(/<img[^>]+>/gi) || [];
  console.log('IMG tags:', imgTags);

  const scripts = text.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
  console.log('Script tags count:', scripts.length);
  for (const s of scripts) {
    if (s.includes('125837956f3342f6a000e51dd9eacf93') || s.includes('colangiografia') || s.includes('image')) {
      console.log('Relevant script snippet:', s.substring(0, 300));
    }
  }
}

check().catch(console.error);
