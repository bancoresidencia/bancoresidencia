async function findSelectingLinks() {
  const urls = [
    'https://portal.concursos.selecting.com.br/',
    'https://selecting.com.br/',
    'https://portal.concursos.selecting.com.br/edital/ver/18',
    'https://portal.concursos.selecting.com.br/edital/ver/19',
    'https://portal.concursos.selecting.com.br/edital/ver/27',
    'https://portal.concursos.selecting.com.br/edital/ver/30',
    'https://portal.concursos.selecting.com.br/edital/ver/32',
    'https://portal.concursos.selecting.com.br/edital/ver/35',
    'https://portal.concursos.selecting.com.br/edital/ver/47',
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      console.log(`[${res.status}] ${u}`);
      if (res.ok) {
        const text = await res.text();
        const titleMatch = text.match(/<title>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : '';
        console.log('   Title:', title);
        
        // Find links
        const links = [...text.matchAll(/href=["']([^"']+)["']/gi)].map(m => m[1]);
        const pdfLinks = links.filter(l => l.includes('.pdf') || l.includes('arquivo.php') || l.includes('download') || l.includes('ver/'));
        if (pdfLinks.length > 0) {
          console.log(`   Found ${pdfLinks.length} candidate links. Sample:`);
          pdfLinks.slice(0, 8).forEach(l => console.log('     ->', l));
        }
      }
    } catch (e) {
      console.error(`Error ${u}:`, e.message);
    }
  }
}

findSelectingLinks();
