async function checkGabaritosObjetivas() {
  const url = 'https://objetivas.selecao.net.br/informacoes/2568/';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const links = [...html.matchAll(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  for (const l of links) {
    const text = l[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.toLowerCase().includes('gabarito') || text.toLowerCase().includes('prova') || text.toLowerCase().includes('caderno') || text.toLowerCase().includes('recurso')) {
      console.log(`[${text}] -> ${l[1]}`);
    }
  }
}
checkGabaritosObjetivas();

