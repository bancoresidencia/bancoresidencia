async function checkSitemaps() {
  const urls = [
    'https://med.estrategia.com/sitemap.xml',
    'https://www.sanarmed.com/sitemap.xml',
    'https://www.qconcursos.com/sitemap.xml'
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u, {
        method: 'HEAD',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      console.log(`${u} -> Status: ${res.status} (Type: ${res.headers.get('content-type')})`);
    } catch (e) {
      console.log(`${u} -> Erro: ${e.message}`);
    }
  }
}

checkSitemaps().catch(console.error);
