async function getLinks() {
  const urls = ['https://ucamp.org.br/', 'https://ucamp.org.br/processos-seletivos/'];
  for (const u of urls) {
    const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const text = await res.text();
    const links = [...text.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
    console.log(`Links em ${u} (${links.length}):`);
    links.filter(l => l.includes('pdf') || l.includes('prova') || l.includes('gabarito') || l.includes('edital') || l.includes('2026') || l.includes('2025')).forEach(l => console.log(' ->', l));
  }
}
getLinks();
