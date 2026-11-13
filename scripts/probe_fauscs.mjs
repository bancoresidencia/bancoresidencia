async function probeFauscs() {
  const urls = [
    'https://www.fauscs.org.br/post/sele%C3%A7%C3%A3o-p%C3%BAblica-para-resid%C3%AAncia-m%C3%A9dica-2026',
    'https://www.fauscs.org.br/post/sele%C3%A7%C3%A3o-p%C3%BAblica-para-resid%C3%AAncia-m%C3%A9dica-2025'
  ];

  for (const url of urls) {
    console.log(`\nFetching ${url}...`);
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      console.log(`Status: ${res.status}`);
      if (res.ok) {
        const html = await res.text();
        const matches = [...html.matchAll(/href=["']([^"']*(?:pdf|drive|wixstatic)[^"']*)["']/gi)].map(m => m[1]);
        const unique = [...new Set(matches)];
        console.log(`Found ${unique.length} links:`);
        unique.forEach(l => console.log('  ->', l));

        // Also check any anchors mentioning "prova" or "caderno"
        const anchors = [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
        console.log(`Checking anchor texts (${anchors.length} total anchors):`);
        for (const a of anchors) {
          const txt = a[2].replace(/<[^>]+>/g, '').trim().toLowerCase();
          if (txt.includes('prova') || txt.includes('caderno') || txt.includes('gabarito') || txt.includes('objetiva')) {
            console.log(`  [LINK] "${txt}" => ${a[1]}`);
          }
        }
      }
    } catch (e) {
      console.error('Error:', e.message);
    }
  }
}

probeFauscs();
