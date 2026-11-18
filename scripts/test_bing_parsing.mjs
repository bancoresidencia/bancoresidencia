import fs from 'fs';

async function testBing() {
  const query = 'Além da triagem específica por meio do M-CHAT-R/F';
  const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
    }
  });
  console.log('Bing status:', res.status);
  const html = await res.text();
  console.log('Bing HTML len:', html.length);
  fs.writeFileSync('scripts/bing_sample.html', html, 'utf8');

  // Find all links in bing results
  const matches = [...html.matchAll(/<li class="b_algo"[\s\S]*?<h2><a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a><\/h2>/gi)];
  console.log(`Matched ${matches.length} result titles!`);
  for (const m of matches) {
    const rawUrl = m[1];
    const title = m[2].replace(/<[^>]+>/g, '').trim();
    console.log(`- ${title} -> ${rawUrl}`);
  }
}
testBing();
