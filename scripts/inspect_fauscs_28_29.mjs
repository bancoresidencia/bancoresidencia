async function inspectFauscsPdfs() {
  for (const id of [28, 29, 30, 31]) {
    const url = `https://fauscs.selecao.net.br/informacoes/${id}/`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    
    // Pega o título real da seleção
    const headerMatch = html.match(/class="[^"]*page-header[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                        html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
    const header = headerMatch ? headerMatch[1].replace(/<[^>]+>/g, '').trim() : 'Sem header';
    console.log(`\n=== FAUSCS ID ${id}: ${header} ===`);

    const pdfRegex = /<a[^>]*href="([^"]+\.pdf)"[^>]*>([\s\S]*?)<\/a>/gi;
    let m;
    while ((m = pdfRegex.exec(html)) !== null) {
      const link = m[1];
      const desc = m[2].replace(/<[^>]+>/g, '').trim();
      if (/prova|caderno|gabarito|retific|definitivo/i.test(desc) || /prova|caderno|gabarito/i.test(link)) {
        console.log(`  [${desc}] -> ${link}`);
      }
    }
  }
}
inspectFauscsPdfs();
