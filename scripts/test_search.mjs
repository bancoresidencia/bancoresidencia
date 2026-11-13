async function search(q) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
  const html = await res.text();
  const matches = [...html.matchAll(/<a[^>]+class="result__url"[^>]+href="([^"]+)"/gi)];
  console.log(`Query: ${q} (found ${matches.length} links)`);
  for (const m of matches.slice(0, 5)) {
    let u = m[1];
    if (u.includes('uddg=')) u = decodeURIComponent(u.split('uddg=')[1].split('&')[0]);
    console.log('  ->', u);
  }
}

search('Homem 71 anos tabagista com histórico de uso crônico de AINEs');
