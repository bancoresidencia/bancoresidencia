async function probeUcampIds() {
  const ids = [538, 537, 536, 535, 534, 533, 532, 531, 530, 529, 528, 525, 520, 515, 510, 500];

  for (const id of ids) {
    const url = `https://www.ucamp.org.br/residencia-medica/${id}`;
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      if (res.ok) {
        const html = await res.text();
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i) || html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        const title = titleMatch ? titleMatch[1].trim() : 'Sem título';
        const pdfMatches = [...html.matchAll(/href=["']([^"']*\.pdf[^"']*)["']/gi)].map(m => m[1]);
        const uniquePdfs = [...new Set(pdfMatches)];
        console.log(`[HTTP 200] ID ${id}: "${title}" | ${uniquePdfs.length} PDFs encontrados`);
        if (uniquePdfs.length > 0) {
          uniquePdfs.forEach(p => console.log('   ->', p));
        }
      }
    } catch (e) {
      // ignore
    }
  }
}

probeUcampIds();
