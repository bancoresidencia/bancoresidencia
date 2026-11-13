async function searchUcampArchives() {
  const urls = [
    'https://ucamp.org.br/',
    'https://ucamp.org.br/processos-seletivos/',
    'https://ucamp.org.br/processo-seletivo-2024/',
    'https://ucamp.org.br/processo-seletivo-2023/',
    'https://www.amp.org.br/residencia-medica',
    'https://www.amp.org.br/exames-anteriores'
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      console.log(`[${res.status}] ${u}`);
      if (res.ok) {
        const text = await res.text();
        const links = [...text.matchAll(/href=["']([^"']+)["']/g)].map(m => m[1]);
        const matched = links.filter(l => l.includes('bibliotecaarquivos') || l.includes('prova') || l.includes('gabarito') || l.includes('.pdf'));
        console.log(`  Found ${matched.length} candidate links. Sample:`);
        matched.slice(0, 10).forEach(l => console.log('   ->', l));
      }
    } catch (e) {
      console.error(u, e.message);
    }
  }
}
searchUcampArchives();
