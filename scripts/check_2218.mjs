async function check2218() {
  const url = 'https://objetivas.selecao.net.br/informacoes/2218/';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  console.log(`[${res.status}] ${url}`);
  if (res.ok) {
    const html = await res.text();
    console.log('HTML length:', html.length);
    const titleMatch = html.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i);
    console.log('Title:', titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '');
    const links = [...html.matchAll(/<a[^>]*href=["']([^"']+\.pdf)["'][^>]*>([\s\S]*?)<\/a>/gi)];
    for (const l of links) {
      const text = l[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      console.log(`  -> [${text}] ${l[1]}`);
    }
  }
}
check2218();

