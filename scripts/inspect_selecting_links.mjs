async function inspect12and18() {
  for (const id of [12, 18, 19, 31, 32]) {
    const url = `https://portal.concursos.selecting.com.br/edital/ver/${id}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    console.log(`\n=== EDITAL ${id} (len: ${html.length}) ===`);
    
    // Procura todos os links para arquivos .pdf ou arquivo.php
    const links = [...html.matchAll(/href=["']([^"']*(?:\.pdf|arquivo\.php[^"']*))["']/gi)];
    console.log(`Total links encontrados: ${links.length}`);
    for (const l of links.slice(0, 10)) {
      console.log('  ->', l[1]);
    }
  }
}
inspect12and18();
