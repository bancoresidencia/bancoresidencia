async function check57and58() {
  for (const id of [57, 58]) {
    const url = `https://portal.iadhedconcursos.org/edital/ver/${id}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    console.log(`\n=== IADHED EDITAL ${id} ===`);
    const links = [...html.matchAll(/href="([^"]+\.pdf)"/gi)].map(m => m[1]);
    console.log(`Total PDFs encontrados: ${links.length}`);
    for (const l of links) {
      console.log('  ->', l);
    }
  }
}
check57and58();
