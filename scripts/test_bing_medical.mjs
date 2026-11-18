import fs from 'fs';

function decodeBingUrl(href) {
  try {
    const match = href.match(/[?&]u=([^&]+)/);
    if (match) {
      const val = decodeURIComponent(match[1]);
      // Remove 'a1' prefix if present
      const b64 = val.startsWith('a1') ? val.slice(2) : val;
      return Buffer.from(b64, 'base64').toString('utf8');
    }
  } catch (e) {}
  return href;
}

async function searchBing(query) {
  const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'pt-BR,pt;q=0.9'
    }
  });
  if (!res.ok) return [];
  const html = await res.text();
  const matches = [...html.matchAll(/<li class="b_algo"[\s\S]*?<h2><a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a><\/h2>/gi)];
  const results = [];
  for (const m of matches) {
    const rawHref = m[1];
    const decodedUrl = decodeBingUrl(rawHref);
    const title = m[2].replace(/<[^>]+>/g, '').trim();
    results.push({ title, url: decodedUrl });
  }
  return results;
}

async function run() {
  const q = '"tonturas rotatórias" "manobras de reposicionamento" "São Camilo"';
  console.log('Searching Bing for:', q);
  const items = await searchBing(q);
  console.log(`Found ${items.length} items:`);
  items.forEach((it, i) => console.log(`[${i+1}] ${it.title} -> ${it.url}`));
}
run();
