async function printAllFiles() {
  const ids = [32, 41, 42, 43];
  for (const id of ids) {
    const url = `https://portal.concursos.selecting.com.br/edital/ver/${id}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const blockRegex = /<p[^>]*class="[^"]*text-uppercase[^"]*"[^>]*>([\s\S]*?)<\/p>[\s\S]*?href=["'](https?:\/\/concursos\.selecting\.com\.br\/arquivo\.php\?file=[^"']+)["']/gi;
    let m;
    console.log(`\n=== ALL FILES IN EDITAL ${id} ===`);
    while ((m = blockRegex.exec(html)) !== null) {
      console.log(`[${m[1].replace(/<[^>]+>/g, '').trim()}] -> ${m[2]}`);
    }
  }
}
printAllFiles();

