async function getAmpLinks() {
  const urls = [
    'https://www.amp.org.br/',
    'https://www.amp.org.br/exame-amp',
    'https://www.amp.org.br/exame-da-amp',
    'https://www.amp.org.br/provas-e-gabaritos',
    'https://www.amp.org.br/residencia-medica'
  ];
  for (const u of urls) {
    try {
      const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      console.log(`[${res.status}] ${u}`);
      if (res.ok) {
        const text = await res.text();
        const links = [...text.matchAll(/href=["']([^"']+)["']/g)].map(m => m[1]);
        links
          .filter(l => l.includes('.pdf') || l.includes('prova') || l.includes('gabarito') || l.includes('exame'))
          .forEach(l => console.log(' ->', l));
      }
    } catch (e) {
      console.error(u, e.message);
    }
  }
}
getAmpLinks();
