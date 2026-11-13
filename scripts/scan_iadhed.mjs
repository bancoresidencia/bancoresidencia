async function scanIadhed() {
  console.log('Scanning portal.iadhedconcursos.org/edital/ver/ 1..70...');
  for (let id = 1; id <= 70; id++) {
    const url = `https://portal.iadhedconcursos.org/edital/ver/${id}`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok) {
        const html = await res.text();
        const isTarget = html.toLowerCase().includes('mário gatti') || html.toLowerCase().includes('mario gatti') || html.toLowerCase().includes('samaritano');
        if (isTarget) {
          const titleMatch = html.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i);
          const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
          console.log(`[EDITAL ${id}] ${title}`);
          const files = [...html.matchAll(/href=["'](https?:\/\/iadhedconcursos\.org\/arquivo\.php\?file=[^"']+)["']/gi)].map(m => m[1]);
          console.log(`   Found ${files.length} files:`);
          for (const f of files) console.log(`     -> ${f}`);
        }
      }
    } catch (e) {}
    await new Promise(r => setTimeout(r, 60));
  }
}
scanIadhed();
