import fs from 'fs';

async function testSearchPhrases() {
  const query = 'além da triagem específica por meio do M-CHAT-R/F "irmãos ou pais com TEA"';
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'pt-BR,pt;q=0.9'
    }
  });
  const html = await res.text();
  console.log(`Status: ${res.status}`);
  const results = [...html.matchAll(/<a class="result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/g)];
  console.log(`Encontrados ${results.length} snippets.`);
  results.slice(0, 3).forEach((r, i) => console.log(`[${i+1}] ${r[1].replace(/<[^>]+>/g, '').trim()}`));
}

testSearchPhrases().catch(console.error);
