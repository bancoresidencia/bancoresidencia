async function checkAmpNews2024() {
  const url = 'https://www.amp.org.br/web/noticias/exame-amp-2024-realizado-com-sucesso-gabaritos-j-est-o-dispon-veis-2024-11-04';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  console.log(`[${res.status}] ${url}`);
  if (res.ok) {
    const html = await res.text();
    const links = [...html.matchAll(/href=["']([^"']+)["']/g)].map(m => m[1]);
    console.log(`Total links: ${links.length}`);
    for (const l of links) {
      if (l.includes('.pdf') || l.includes('bibliotecaarquivos') || l.includes('gabarito')) {
        console.log(' ->', l);
      }
    }
  }
}
checkAmpNews2024();
