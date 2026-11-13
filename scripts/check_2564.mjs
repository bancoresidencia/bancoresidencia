async function check2564() {
  const url = 'https://objetivas.selecao.net.br/informacoes/2564/';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  console.log(`[${res.status}] ${url}`);
  if (res.ok) {
    const html = await res.text();
    const titleMatch = html.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i);
    console.log('Title:', titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '');
    const files = [...html.matchAll(/<a[^>]*href=["']([^"']+\.pdf)["'][^>]*>([\s\S]*?)<\/a>/gi)];
    for (const f of files) {
      const text = f[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (text.toLowerCase().includes('gabarito') || text.toLowerCase().includes('prova')) {
        console.log(`  -> [${text}] ${f[1]}`);
      }
    }
  }
}
check2564();

