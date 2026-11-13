async function inspectUfg() {
  const urls = [
    'https://centrodeselecao.ufg.br/2021/coreme-ses/',
    'https://centrodeselecao.ufg.br/2022/coreme-ses/',
    'https://centrodeselecao.ufg.br/2020/coreme/',
    'https://centrodeselecao.ufg.br/2023/residencia/',
    'https://centrodeselecao.ufg.br/2023/coreme_ses/'
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      console.log(`[${res.status}] ${u}`);
      if (res.ok) {
        const html = await res.text();
        const links = [...html.matchAll(/href=["']([^"']+\.pdf)["'][^>]*>([\s\S]*?)<\/a>/gi)];
        console.log(`  Found ${links.length} PDF links:`);
        for (const l of links) {
          const text = l[2].replace(/<[^>]+>/g, '').trim();
          if (text.toLowerCase().includes('prova') || text.toLowerCase().includes('gabarito') || l[1].toLowerCase().includes('prova') || l[1].toLowerCase().includes('gabarito')) {
            console.log(`    -> [${text}] ${l[1]}`);
          }
        }
      }
    } catch (e) {
      console.error(u, e.message);
    }
  }
}
inspectUfg();

