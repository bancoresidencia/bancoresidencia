async function scanEditais() {
  console.log('Scanning selecting.com.br editais 1..50...');
  for (let id = 1; id <= 50; id++) {
    const url = `https://portal.concursos.selecting.com.br/edital/ver/${id}`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok) {
        const html = await res.text();
        // find headings or edital title
        const m = html.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi);
        const textSnippets = m ? m.map(h => h.replace(/<[^>]+>/g, '').trim()).filter(Boolean) : [];
        const isTarget = html.toLowerCase().includes('olhos') || html.toLowerCase().includes('fubog') || html.toLowerCase().includes('residencia');
        if (isTarget || textSnippets.some(t => t.toLowerCase().includes('médica') || t.toLowerCase().includes('olhos'))) {
          console.log(`[EDITAL ${id}] TARGET FOUND!`);
          console.log('   Headings:', textSnippets.slice(0, 4));
          // List files
          const files = [...html.matchAll(/href=["'](https?:\/\/concursos\.selecting\.com\.br\/arquivo\.php\?file=[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
          for (const f of files) {
            const link = f[1];
            const label = f[2].replace(/<[^>]+>/g, '').trim();
            console.log(`     -> [${label}] ${link}`);
          }
        }
      }
    } catch (e) {
      // ignore
    }
    // small jitter
    await new Promise(r => setTimeout(r, 150));
  }
}

scanEditais();

