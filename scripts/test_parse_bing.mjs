import fs from 'fs';

async function parseBing() {
  const query = 'USCS residência médica 2025 gabarito';
  const res = await fetch(`https://www.bing.com/search?q=${encodeURIComponent(query)}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'pt-BR,pt;q=0.9'
    }
  });
  const html = await res.text();
  // Regex to extract search results in Bing
  const regex = /<li class="b_algo">[\s\S]*?<h2><a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a><\/h2>[\s\S]*?<div class="b_caption">[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/g;
  let match;
  let count = 0;
  while ((match = regex.exec(html)) !== null && count < 5) {
    count++;
    const url = match[1];
    const title = match[2].replace(/<[^>]+>/g, '').trim();
    const snippet = match[3].replace(/<[^>]+>/g, '').trim();
    console.log(`[Result ${count}]`);
    console.log(`Title: ${title}`);
    console.log(`URL: ${url}`);
    console.log(`Snippet: ${snippet}\n`);
  }
}

parseBing();
