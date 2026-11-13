async function check() {
  const r = await fetch('https://portal.concursos.selecting.com.br/edital/ver/44', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await r.text();
  const files = [...html.matchAll(/arquivo\.php\?file=([^"']+)/g)].map(m => m[1]);
  const pMatches = [...html.matchAll(/<p[^>]*class="[^"]*text-uppercase[^"]*"[^>]*>([\s\S]*?)<\/p>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
  for (let i = 0; i < Math.min(files.length, pMatches.length); i++) {
    console.log(pMatches[i], '->', 'https://concursos.selecting.com.br/arquivo.php?file=' + files[i]);
  }
}
check().catch(console.error);

