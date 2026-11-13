async function searchHtml() {
  const url = 'https://sistemas.institutoverbena.ufg.br/2026/coreme-ses/';
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const html = await res.text();
  console.log(`HTML Length: ${html.length}`);

  // Find all links
  const allHrefs = [...html.matchAll(/href=["']([^"']+)["']/gi)].map(m => m[1]);
  console.log(`Total hrefs: ${allHrefs.length}`);

  const interesting = allHrefs.filter(h => {
    const l = h.toLowerCase();
    return l.includes('prova') || l.includes('gabarito') || l.includes('pre-requisito') || l.includes('r1');
  });

  console.log('Interesting hrefs:');
  interesting.forEach(h => console.log('  ->', h));

  // Also check text inside <a> tags
  const anchors = [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  console.log('\nAnchors with keywords:');
  for (const a of anchors) {
    const txt = a[2].replace(/<[^>]+>/g, '').trim().toLowerCase();
    if (txt.includes('gabarito') || txt.includes('prova') || txt.includes('caderno')) {
      console.log(`  [${txt}] => ${a[1]}`);
    }
  }
}

searchHtml();
