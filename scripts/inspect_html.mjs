import fs from 'fs';

async function inspectHtml() {
  const query = 'USCS residência médica 2025 gabarito';
  const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Accept-Language': 'pt-BR,pt;q=0.9'
    }
  });
  const html = await res.text();
  fs.writeFileSync('data/sample_ddg.html', html, 'utf8');
  console.log('Saved sample_ddg.html. Length:', html.length);
}

inspectHtml();
