async function scanAround2218() {
  console.log('Scanning informacoes/ around 2218...');
  for (let id = 2210; id <= 2235; id++) {
    const url = `https://objetivas.selecao.net.br/informacoes/${id}/`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok) {
        const html = await res.text();
        if (html.toLowerCase().includes('mário gatti') || html.toLowerCase().includes('mario gatti')) {
          const m = html.match(/Edital N[°º\s\w\/-]+Abertura[^\n<]+/i);
          console.log(`[ID ${id}] MATCH:`, m ? m[0] : 'Found Mario Gatti');
          const pdfs = [...html.matchAll(/href=["'](https?:\/\/anexos\.cdn\.selecao\.net\.br\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
          for (const p of pdfs) {
            const label = p[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            if (label.toLowerCase().includes('gabarito') || label.toLowerCase().includes('caderno') || label.toLowerCase().includes('prova')) {
              console.log(`   -> [${label}] ${p[1]}`);
            }
          }
        }
      }
    } catch(e) {}
    await new Promise(r => setTimeout(r, 60));
  }
}
scanAround2218();

