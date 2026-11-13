async function checkFauscsSelection() {
  for (const id of [26, 27, 28, 29, 30]) {
    const url = `https://fauscs.selecao.net.br/informacoes/${id}/`;
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const html = await res.text();
      const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<title>([^<]+)<\/title>/i);
      console.log(`\n--- Concurso ${id} ---`);
      console.log('Title:', titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : 'No title');
      // Find all PDFs
      const pdfs = [...html.matchAll(/href="([^"]+\.pdf)"/gi)];
      console.log(`PDFs (${pdfs.length}):`);
      pdfs.forEach(p => {
        if (p[1].toLowerCase().includes('gabarito') || p[1].toLowerCase().includes('prova') || p[1].toLowerCase().includes('resultado')) {
          console.log('  ->', p[1]);
        }
      });
    } catch (e) {
      console.log(id, 'err:', e.message);
    }
  }
}
checkFauscsSelection();
