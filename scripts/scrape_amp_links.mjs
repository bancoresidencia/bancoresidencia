async function checkAmp() {
  const urls = [
    'https://www.amp.org.br/exame-amp',
    'https://ucamp.org.br/',
    'https://www.amp.org.br/editais',
    'https://ucamp.org.br/processos-seletivos/'
  ];

  for (const url of urls) {
    try {
      console.log(`Buscando: ${url}...`);
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(5000)
      });
      console.log(`Status: ${res.status}`);
      if (res.ok) {
        const html = await res.text();
        const pdfMatches = html.match(/href="([^"]+\.pdf)"/gi) || [];
        console.log(`PDFs encontrados em ${url}: ${pdfMatches.length}`);
        pdfMatches.slice(0, 10).forEach(m => console.log('  ->', m));
      }
    } catch (e) {
      console.error(`Erro em ${url}:`, e.message);
    }
  }
}

checkAmp();
