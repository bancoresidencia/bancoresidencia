import fs from 'fs';

async function main() {
  const urls = [
    'https://www.ucamp.org.br/residencia-medica/539',
    'https://www.ucamp.org.br/residencia-medica',
    'https://www.amp.org.br/exame-amp',
    'https://www.amp.org.br/'
  ];

  for (const url of urls) {
    try {
      console.log(`Fetching: ${url}`);
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      console.log(`Status ${url}: ${res.status}`);
      if (res.ok) {
        const html = await res.text();
        const matches = [...html.matchAll(/href=["']([^"']*\.pdf[^"']*)["']/gi)].map(m => m[1]);
        const unique = [...new Set(matches)];
        console.log(`Found ${unique.length} PDF links in ${url}:`);
        unique.forEach(l => console.log('  ->', l));
      }
    } catch (err) {
      console.error(`Error on ${url}:`, err.message);
    }
  }
}

main();
