async function checkUcampIds() {
  console.log('Testing ucamp.org.br/residencia-medica/<id>...');
  for (let id = 510; id <= 545; id++) {
    const url = `https://www.ucamp.org.br/residencia-medica/${id}`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok) {
        const html = await res.text();
        const titleMatch = html.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i);
        const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
        console.log(`[${id}] Title: ${title}`);
        
        // Find links
        const links = [...html.matchAll(/href=["']([^"']+)["']/g)].map(m => m[1]);
        const pdfs = links.filter(l => l.includes('.pdf') || l.includes('bibliotecaarquivos'));
        for (const p of pdfs) {
          if (p.includes('prova') || p.includes('gabarito')) {
            console.log(`     -> ${p}`);
          }
        }
      }
    } catch (e) {}
    await new Promise(r => setTimeout(r, 100));
  }
}
checkUcampIds();

