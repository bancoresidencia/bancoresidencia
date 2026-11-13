async function checkEstrategiaAmp() {
  const url = 'https://med.estrategia.com/portal/eventos/amp-acesso-direto-2025-gabarito-recursos/';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  console.log(`[${res.status}] ${url}`);
  if (res.ok) {
    const html = await res.text();
    // find links to pdf or tables
    const links = [...html.matchAll(/href=["']([^"']+)["']/g)].map(m => m[1]);
    const pdfs = links.filter(l => l.includes('.pdf') || l.includes('amp.org.br'));
    console.log('PDF/AMP links:', pdfs);
  }
}
checkEstrategiaAmp();
