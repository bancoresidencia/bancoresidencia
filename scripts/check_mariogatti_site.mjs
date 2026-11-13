async function checkMarioGattiSite() {
  const urls = [
    'https://redemariogatti.sp.gov.br/',
    'https://redemariogatti.sp.gov.br/concursos-e-processos-seletivos',
    'https://redemariogatti.sp.gov.br/residencia-medica',
    'https://redemariogatti.sp.gov.br/ensino-e-pesquisa'
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      console.log(`[${res.status}] ${u}`);
      if (res.ok) {
        const text = await res.text();
        const links = [...text.matchAll(/href=["']([^"']+)["']/g)].map(m => m[1]);
        links.filter(l => l.includes('edital') || l.includes('residencia') || l.includes('concurso') || l.includes('.pdf')).slice(0, 15).forEach(l => console.log(' ->', l));
      }
    } catch (e) {
      console.error(u, e.message);
    }
  }
}
checkMarioGattiSite();

