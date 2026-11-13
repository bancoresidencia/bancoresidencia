async function printAllUfgLinks() {
  for (const year of [2020, 2021, 2022]) {
    const url = `https://centrodeselecao.ufg.br/${year}/coreme-ses/`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) continue;
    const html = await res.text();
    console.log(`\n=== CS-UFG ${year} COREME-SES ===`);
    const links = [...html.matchAll(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
    for (const l of links) {
      const href = l[1];
      const text = l[2].replace(/<[^>]+>/g, '').trim();
      if (href.endsWith('.pdf') || href.includes('sistema/arquivos')) {
        console.log(`  [${text}] -> ${href}`);
      }
    }
  }
}
printAllUfgLinks();
