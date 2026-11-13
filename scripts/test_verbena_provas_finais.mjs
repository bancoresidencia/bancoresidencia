async function fetchProvasFinais() {
  const url = 'https://sistemas.institutoverbena.ufg.br/2026/coreme-ses/sistema/provas_gabaritos/Provas_gabaritos_finais_COREME_SES-2026-%23%24%23%24R.html';
  const res = await fetch(url);
  const html = await res.text();
  console.log('Provas Finais status:', res.status, 'Length:', html.length);
  const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = linkRegex.exec(html)) !== null) {
    const text = m[2].replace(/<[^>]+>/g, '').trim();
    console.log(`${text} -> ${m[1]}`);
  }
}
fetchProvasFinais();

