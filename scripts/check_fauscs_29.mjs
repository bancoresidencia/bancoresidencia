async function checkFauscs29() {
  const res = await fetch('https://fauscs.selecao.net.br/informacoes/29/');
  const html = await res.text();
  const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = linkRegex.exec(html)) !== null) {
    const href = m[1];
    const text = m[2].replace(/<[^>]+>/g, '').trim();
    if (text.toLowerCase().includes('gabarito') || text.toLowerCase().includes('prova') || text.toLowerCase().includes('edital')) {
      console.log(`[FAUSCS 29] ${text} -> ${href}`);
    }
  }
}
checkFauscs29();
