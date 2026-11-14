async function check44to47() {
  for (const id of [44, 45, 46, 47]) {
    const url = `https://portal.concursos.selecting.com.br/edital/ver/${id}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const blockRegex = /<p[^>]*class="[^"]*text-uppercase[^"]*"[^>]*>([\s\S]*?)<\/p>[\s\S]*?href=["'](https?:\/\/concursos\.selecting\.com\.br\/arquivo\.php\?file=[^"']+)["']/gi;
    let m;
    const files = [];
    while ((m = blockRegex.exec(html)) !== null) {
      files.push({ name: m[1].replace(/<[^>]+>/g, '').trim(), url: m[2] });
    }
    console.log(`\n=== EDITAL ${id} (${files.length} arquivos) ===`);
    files.forEach(f => console.log(`  [${f.name}] -> ${f.url}`));
  }
}
check44to47();
