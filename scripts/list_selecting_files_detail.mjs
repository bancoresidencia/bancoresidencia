async function listSelectingFiles() {
  const editais = [18, 19, 27, 30, 31, 32, 35, 41, 42, 43];
  for (const id of editais) {
    const url = `https://portal.concursos.selecting.com.br/edital/ver/${id}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) continue;
    const html = await res.text();
    
    // Search for institute or title in the page
    const titleMatch = html.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi) || [];
    const titles = titleMatch.map(t => t.replace(/<[^>]+>/g, '').trim()).filter(Boolean);

    // Extract blocks
    const items = [];
    const blockRegex = /<p[^>]*class="[^"]*text-uppercase[^"]*"[^>]*>([\s\S]*?)<\/p>[\s\S]*?href=["'](https?:\/\/concursos\.selecting\.com\.br\/arquivo\.php\?file=[^"']+)["']/gi;
    let m;
    while ((m = blockRegex.exec(html)) !== null) {
      items.push({ name: m[1].replace(/<[^>]+>/g, '').trim(), url: m[2] });
    }

    if (items.length > 0) {
      console.log(`\n================ EDITAL ${id} (${items.length} files) ================`);
      if (titles.length) console.log('Titles:', titles.join(' | '));
      for (const it of items) {
        if (it.name.includes('PROVA') || it.name.includes('GABARITO') || it.name.includes('CADERNO') || it.name.includes('DEFINITIVO') || it.name.includes('PRELIMINAR')) {
          console.log(`   [PROVA/GABARITO] ${it.name} -> ${it.url}`);
        }
      }
    }
  }
}
listSelectingFiles();

