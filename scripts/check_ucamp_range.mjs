async function checkUcampRange() {
  console.log('Scanning ucamp.org.br/residencia-medica/ from 450 to 510...');
  for (let id = 450; id <= 510; id++) {
    const url = `https://www.ucamp.org.br/residencia-medica/${id}`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok) {
        const html = await res.text();
        const links = [...html.matchAll(/href=["'](https?:\/\/cms\.amp\.org\.br\/arquivos\/bibliotecaarquivos\/[^"']+)["']/g)].map(m => m[1]);
        if (links.length > 0) {
          console.log(`[ID ${id}] Found ${links.length} files:`);
          for (const l of links) {
            console.log(`   -> ${l}`);
          }
        }
      }
    } catch(e) {}
    await new Promise(r => setTimeout(r, 60));
  }
}
checkUcampRange();
