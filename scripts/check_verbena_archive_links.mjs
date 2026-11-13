import fs from 'fs';

async function fetchPageLinks(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`Failed to fetch ${url}: ${res.status}`);
      return [];
    }
    const buf = await res.arrayBuffer();
    const html = new TextDecoder('iso-8859-1').decode(buf);
    const regex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
    let match;
    const links = [];
    while ((match = regex.exec(html)) !== null) {
      const href = match[1];
      const text = match[2].replace(/<[^>]+>/g, '').trim();
      links.push({ href, text });
    }
    return links;
  } catch (e) {
    console.error(`Error on ${url}:`, e.message);
    return [];
  }
}

async function run() {
  console.log('=== VERBENA 2025 LINKS ===');
  const links2025 = await fetchPageLinks('https://sistemas.institutoverbena.ufg.br/2025/coreme-ses/');
  links2025.forEach(l => {
    if (l.href.includes('prova') || l.href.includes('gabarito') || l.text.toLowerCase().includes('prova') || l.text.toLowerCase().includes('gabarito')) {
      console.log(`[2025] [${l.text}] => ${l.href}`);
    }
  });

  console.log('\n=== VERBENA 2024 LINKS ===');
  const links2024 = await fetchPageLinks('https://sistemas.institutoverbena.ufg.br/2024/coreme-ses/');
  links2024.forEach(l => {
    if (l.href.includes('prova') || l.href.includes('gabarito') || l.text.toLowerCase().includes('prova') || l.text.toLowerCase().includes('gabarito')) {
      console.log(`[2024] [${l.text}] => ${l.href}`);
    }
  });
}

run();
