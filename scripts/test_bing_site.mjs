function decodeBingUrl(href) {
  try {
    const match = href.match(/[?&]u=([^&]+)/);
    if (match) {
      const val = decodeURIComponent(match[1]);
      const b64 = val.startsWith('a1') ? val.slice(2) : val;
      return Buffer.from(b64, 'base64').toString('utf8');
    }
  } catch (e) {}
  return href;
}

async function searchBingSite(query) {
  const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
  console.log('Bing URL:', url);
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'pt-BR,pt;q=0.9'
    }
  });
  console.log('Status:', res.status);
  const html = await res.text();
  const matches = [...html.matchAll(/<li class="b_algo"[\s\S]*?<h2><a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a><\/h2>/gi)];
  console.log('Results count:', matches.length);
  for (const m of matches) {
    const targetUrl = decodeBingUrl(m[1]);
    const title = m[2].replace(/<[^>]+>/g, '').trim();
    console.log(`- ${title} -> ${targetUrl}`);
  }
}

async function test() {
  await searchBingSite('site:med.estrategia.com/public/questoes "tonturas rotatórias"');
  console.log('\n---\n');
  await searchBingSite('site:sanarmed.com/q "tonturas rotatórias"');
}
test();
