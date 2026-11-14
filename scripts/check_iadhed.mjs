async function checkIadhed() {
  const url = 'https://portal.iadhedconcursos.org/edital/ver/57';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  console.log('IADHED Edital 57 length:', html.length);
  const blockRegex = /<p[^>]*class="[^"]*text-uppercase[^"]*"[^>]*>([\s\S]*?)<\/p>[\s\S]*?href=["']([^"']+)["']/gi;
  let m;
  while ((m = blockRegex.exec(html)) !== null) {
    const name = m[1].replace(/<[^>]+>/g, '').trim();
    const fileUrl = m[2];
    console.log(`[${name}] -> ${fileUrl}`);
  }
}
checkIadhed();
