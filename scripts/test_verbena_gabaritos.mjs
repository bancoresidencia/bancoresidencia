async function filterGabaritos() {
  const url = 'https://sistemas.institutoverbena.ufg.br/2026/coreme-ses/';
  const res = await fetch(url);
  const html = await res.text();
  const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = linkRegex.exec(html)) !== null) {
    const href = m[1];
    const text = m[2].replace(/<[^>]+>/g, '').trim();
    if (href.toLowerCase().includes('gabarito') || text.toLowerCase().includes('gabarito') ||
        href.toLowerCase().includes('prova') || text.toLowerCase().includes('caderno')) {
      console.log(`[Link] ${text} -> https://sistemas.institutoverbena.ufg.br${href}`);
    }
  }
}
filterGabaritos();

