import fs from 'fs';

async function inspectHtml() {
  const url = 'https://med.estrategia.com/public/questoes/Mulher-45-anos-procura64a862e1a7/';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  fs.writeFileSync('scripts/estrategia_sample.html', html, 'utf8');
  console.log('Saved to scripts/estrategia_sample.html. Size:', html.length);
  // Check scripts
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
  console.log('Total scripts:', scripts.length);
  for (let i = 0; i < scripts.length; i++) {
    const s = scripts[i][1];
    if (s.includes('correct') || s.includes('gabarito') || s.includes('answer') || s.includes('alternativa') || s.includes('manobra')) {
      console.log(`Script [${i}] matched keywords! Length:`, s.length);
      console.log(s.slice(0, 500));
    }
  }
}
inspectHtml();
