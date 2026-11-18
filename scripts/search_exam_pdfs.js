import fs from 'fs';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
];

async function searchDDG(query) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENTS[0],
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9'
      }
    });
    const html = await res.text();
    const results = [];
    const linkRegex = /<a class="result__url"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      const rawUrl = match[1];
      const actualUrl = rawUrl.includes('uddg=') ? decodeURIComponent(rawUrl.split('uddg=')[1].split('&')[0]) : rawUrl;
      results.push(actualUrl);
    }
    return results;
  } catch (e) {
    console.error('Search error:', e.message);
    return [];
  }
}

async function run() {
  console.log("=== Buscando Provas HMMSJP (FAFIPA) ===");
  const r1 = await searchDDG('site:fundacaofafipa.org.br "São José dos Pinhais" "Residência Médica" "Gabarito" filetype:pdf');
  console.log('Resultados FAFIPA:', r1);

  await new Promise(r => setTimeout(r, 2000));

  console.log("\n=== Buscando Provas SEMUSA Macaé (AOCP) ===");
  const r2 = await searchDDG('site:institutoaocp.org.br "Macaé" "Residência Médica" "Gabarito" filetype:pdf');
  console.log('Resultados AOCP:', r2);
}

run();
