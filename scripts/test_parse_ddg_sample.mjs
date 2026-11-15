import fs from 'fs';

const html = fs.readFileSync('data/sample_ddg.html', 'utf8');

const regex = /<div class="result results_links[^"]*">[\s\S]*?<a rel="nofollow" class="result__a" href="([^"]+)">([\s\S]*?)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;

let match;
let count = 0;
while ((match = regex.exec(html)) !== null && count < 5) {
  count++;
  const rawHref = match[1];
  let targetUrl = rawHref;
  try {
    const urlObj = new URL(rawHref, 'https://duckduckgo.com');
    const uddg = urlObj.searchParams.get('uddg');
    if (uddg) targetUrl = decodeURIComponent(uddg);
  } catch (e) {}
  
  const title = match[2].replace(/<[^>]+>/g, '').trim();
  const snippet = match[3].replace(/<[^>]+>/g, '').trim();
  console.log(`[Result ${count}]`);
  console.log('Title:', title);
  console.log('URL:', targetUrl);
  console.log('Snippet:', snippet, '\n');
}
