async function fetchFauscs() {
  try {
    const res = await fetch('https://fauscs.selecao.net.br/', { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    console.log('Length:', html.length);
    const links = [...html.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
    for (const l of links) {
      if (l.includes('informacoes') || l.includes('edital') || l.includes('concurso')) {
        console.log(' ->', l);
      }
    }
  } catch (e) {
    console.error(e);
  }
}
fetchFauscs();
