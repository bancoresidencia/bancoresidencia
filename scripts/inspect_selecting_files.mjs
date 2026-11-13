async function inspectFiles() {
  const editais = [18, 19, 27, 30, 31, 32, 35, 41, 42, 43];
  for (const id of editais) {
    const url = `https://portal.concursos.selecting.com.br/edital/ver/${id}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) continue;
    const html = await res.text();
    
    // Page title / contest title
    const contestTitle = html.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i)?.[1]?.replace(/<[^>]+>/g, '').trim() || '';
    console.log(`\n========================================`);
    console.log(`EDITAL ${id}: ${contestTitle}`);
    console.log(`========================================`);

    // Match each table row or item that has a link
    // Selecting usually has table rows <tr>...<td>Nome do arquivo</td>...<td><a href="arquivo.php...">Download</a></td>...</tr>
    const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    for (const r of rows) {
      const rowHtml = r[1];
      const linkMatch = rowHtml.match(/href=["'](https?:\/\/concursos\.selecting\.com\.br\/arquivo\.php\?file=[^"']+)["']/i);
      if (linkMatch) {
        const link = linkMatch[1];
        // clean text from row
        const rowText = rowHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        console.log(` - ${rowText} -> ${link}`);
      }
    }
  }
}
inspectFiles();

