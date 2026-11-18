import fs from 'fs';

async function testDDG() {
  const query = 'Mulher, 42a, comparece à Unidade Básica de Saúde com queixa de ondas de calor';
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  console.log('Fetching:', url);
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'pt-BR,pt;q=0.9'
    }
  });
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('HTML Length:', text.length);

  const regex = /<div class="result results_links[^"]*">[\s\S]*?<a rel="nofollow" class="result__a" href="([^"]+)">([\s\S]*?)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
  let match;
  let count = 0;
  while ((match = regex.exec(text)) !== null) {
    count++;
    let targetUrl = match[1];
    try {
      const uddg = new URL(match[1], 'https://duckduckgo.com').searchParams.get('uddg');
      if (uddg) targetUrl = decodeURIComponent(uddg);
    } catch (e) {}
    console.log(`[${count}] URL:`, targetUrl);
    console.log(`    Title:`, match[2].replace(/<[^>]+>/g, '').trim());
  }
  if (count === 0) {
    console.log('No results matched regex. Preview of HTML:');
    console.log(text.slice(0, 500));
  }
}
testDDG();
