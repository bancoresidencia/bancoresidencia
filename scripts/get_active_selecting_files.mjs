async function getActiveFiles() {
  const ids = [31, 32, 33, 34, 41, 42, 43, 44, 45, 46, 47];
  for (const id of ids) {
    const url = `https://portal.concursos.selecting.com.br/edital/ver/${id}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const blockRegex = /<p[^>]*class="[^"]*text-uppercase[^"]*"[^>]*>([\s\S]*?)<\/p>[\s\S]*?href=["'](https?:\/\/concursos\.selecting\.com\.br\/arquivo\.php\?file=[^"']+)["']/gi;
    let m;
    const files = [];
    while ((m = blockRegex.exec(html)) !== null) {
      const name = m[1].replace(/<[^>]+>/g, '').trim();
      const fileUrl = m[2];
      if (name.includes('GABARITO') || name.includes('CADERNO') || name.includes('PROVA')) {
        files.push({ name, fileUrl });
      }
    }
    if (files.length > 0) {
      console.log(`\n=== EDITAL ${id} === (${files.length} arquivos de prova/gabarito)`);
      for (const f of files) {
        console.log(`  [${f.name}] -> ${f.fileUrl}`);
      }
    }
  }
}
getActiveFiles();
