async function scanFauscs() {
  for (let id = 1; id <= 35; id++) {
    const url = `https://fauscs.selecao.net.br/informacoes/${id}/`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) continue;
      const html = await res.text();
      const titleMatch = html.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i) || html.match(/<title>([\s\S]*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : 'Sem título';
      
      const pdfs = [...html.matchAll(/href="([^"]+\.pdf)"/gi)].map(m => m[1]);
      console.log(`[FAUSCS ID ${id}] ${title} | ${pdfs.length} PDFs`);
      if (title.toLowerCase().includes('residência') || title.toLowerCase().includes('residencia')) {
        pdfs.forEach(p => console.log('   PDF:', p));
      }
    } catch (e) {}
  }
}
scanFauscs();
