async function checkAllTitles() {
  for (let id = 1; id <= 46; id++) {
    const url = `https://portal.concursos.selecting.com.br/edital/ver/${id}`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) continue;
      const html = await res.text();
      // First link text or header
      const match = html.match(/file=edital\/1\/\d+\/[a-f0-9]+\.pdf[^>]*>([^<]+)<\/a>/i) ||
                    html.match(/<title>([^<]+)<\/title>/i);
      // or find text around edital/1/id/
      const matchBlock = html.match(/<p[^>]*class="[^"]*text-uppercase[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
      const title = matchBlock ? matchBlock[1].replace(/<[^>]+>/g, '').trim() : (match ? match[1].trim() : '');
      if (title) {
        console.log(`Edital ${id}: ${title}`);
      }
    } catch(e) {}
    await new Promise(r => setTimeout(r, 100));
  }
}
checkAllTitles();
