async function test() {
  const urls = [
    'https://conhecimento.fgv.br/concursos/enare24/provas-e-gabaritos',
    'https://enare2026.conhecimento.fgv.br',
    'https://conhecimento.fgv.br/concursos/enare2024'
  ];
  for (const u of urls) {
    try {
      const res = await fetch(u);
      console.log(`URL ${u}: HTTP ${res.status}`);
      if (res.ok) {
        const html = await res.text();
        const pdfs = Array.from(new Set(html.match(/href="([^"]+\.pdf[^"]*)"/gi) || []));
        console.log(`   PDFs encontrados: ${pdfs.length}`);
        pdfs.slice(0, 10).forEach(p => console.log('   ', p));
      }
    } catch (e) {
      console.log(`URL ${u}: Erro ${e.message}`);
    }
  }
}

test();
