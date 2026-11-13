async function checkSpecificIds() {
  const ids = [530, 531, 532, 533, 534, 537, 538, 540, 541, 543, 544, 545];
  for (const id of ids) {
    const url = `https://www.ucamp.org.br/residencia-medica/${id}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) continue;
    const html = await res.text();
    const links = [...html.matchAll(/href=["']([^"']+)["']/g)].map(m => m[1]);
    const pdfs = links.filter(l => l.includes('bibliotecaarquivos') || l.includes('.pdf'));
    console.log(`[ID ${id}] ${pdfs.length} files:`);
    for (const p of pdfs) {
      console.log(`  -> ${p}`);
    }
  }
}
checkSpecificIds();

