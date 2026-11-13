async function getFubogFiles() {
  const ids = [12, 18, 43];
  for (const id of ids) {
    const url = `https://portal.concursos.selecting.com.br/edital/ver/${id}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const blockRegex = /<p[^>]*class="[^"]*text-uppercase[^"]*"[^>]*>([\s\S]*?)<\/p>[\s\S]*?href=["'](https?:\/\/concursos\.selecting\.com\.br\/arquivo\.php\?file=[^"']+)["']/gi;
    let m;
    console.log(`\n=== FUBOG EDITAL ${id} FILES ===`);
    while ((m = blockRegex.exec(html)) !== null) {
      const name = m[1].replace(/<[^>]+>/g, '').trim();
      const fileUrl = m[2];
      console.log(`[${name}] -> ${fileUrl}`);
    }
  }
}
getFubogFiles();
