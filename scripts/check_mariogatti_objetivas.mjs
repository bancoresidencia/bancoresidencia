async function checkMarioGattiObjetivas() {
  const url = 'https://objetivas.selecao.net.br/informacoes/2568/';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  console.log(`[${res.status}] ${url}`);
  if (res.ok) {
    const html = await res.text();
    console.log('HTML length:', html.length);
    // Title
    const titleMatch = html.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i);
    console.log('Title:', titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '');
    
    // Find all links to files
    const links = [...html.matchAll(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
    console.log(`Found ${links.length} links:`);
    for (const l of links) {
      const href = l[1];
      const text = l[2].replace(/<[^>]+>/g, '').trim();
      if (href.includes('.pdf') || href.includes('download') || href.includes('arquivo') || text.toLowerCase().includes('gabarito') || text.toLowerCase().includes('prova')) {
        console.log(`  -> [${text}] ${href}`);
      }
    }
  }
}
checkMarioGattiObjetivas();
