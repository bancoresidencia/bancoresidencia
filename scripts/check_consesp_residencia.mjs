async function checkConsespResidencia() {
  const url = 'https://sis.consesp.com.br/mariogatti/?t=R';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  console.log(`[${res.status}] ${url}`);
  if (res.ok) {
    const html = await res.text();
    console.log('HTML length:', html.length);
    const links = [...html.matchAll(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
    console.log(`Found ${links.length} links:`);
    for (const l of links) {
      const text = l[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      console.log(`  -> [${text}] ${l[1]}`);
    }
  }
}
checkConsespResidencia();
