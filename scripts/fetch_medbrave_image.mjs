import fs from 'fs';

async function fetchMedbrave() {
  const url = 'https://www.medbrave.com.br/questoes/escolar-6-anos-chega-ao-plantao-febril-taquipneico-9EW4QM';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  fs.writeFileSync('data/medbrave_page.html', html, 'utf8');
  
  const matches = [...html.matchAll(/https?:\/\/[^"'\s<>]+?\.(?:png|jpg|jpeg|webp)(?:\?[^"'\s<>]*)?/gi)].map(m => m[0]);
  console.log('Image URLs found on page:');
  for (const m of matches) {
    if (!m.includes('favicon') && !m.includes('logo') && !m.includes('avatar') && !m.includes('_next/static')) {
      console.log('Candidate:', m);
    }
  }
}

fetchMedbrave().catch(console.error);
