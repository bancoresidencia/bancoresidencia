async function checkPdfsDetail() {
  const res = await fetch('https://fauscs.selecao.net.br/informacoes/28/');
  const html = await res.text();
  const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = linkRegex.exec(html)) !== null) {
    const href = m[1];
    const text = m[2].replace(/<[^>]+>/g, '').trim();
    if (text.toLowerCase().includes('gabarito') || text.toLowerCase().includes('prova')) {
      console.log(`[FAUSCS 28] ${text} -> ${href}`);
    }
  }
}
checkPdfsDetail();
