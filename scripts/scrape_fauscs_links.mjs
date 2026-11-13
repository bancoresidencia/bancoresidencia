async function scrapeFauscs() {
  const urls = [
    'https://fauscs.org.br/',
    'https://fauscs.org.br/concursos',
    'https://fauscs.org.br/processos-seletivos'
  ];

  for (const url of urls) {
    try {
      console.log(`Buscando: ${url}...`);
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(6000)
      });
      console.log(`Status: ${res.status}`);
      if (res.ok) {
        const html = await res.text();
        const links = [...html.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
        console.log(`Total links em ${url}: ${links.length}`);
        links.filter(l => l.includes('residencia') || l.includes('medica') || l.includes('uscs') || l.includes('hfasp') || l.includes('pdf')).slice(0, 15).forEach(l => console.log(' ->', l));
      }
    } catch (e) {
      console.error(`Erro em ${url}:`, e.message);
    }
  }
}

scrapeFauscs();
