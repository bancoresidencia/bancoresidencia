import fs from 'fs';

async function fetchProvasGabaritosPage() {
  const url = 'https://sistemas.institutoverbena.ufg.br/2026/coreme-ses/sistema/provas_gabaritos/Provas_gabaritos_finais_COREME_SES-2026-%23%24%23%24R.html';
  console.log(`Fetching ${url}...`);
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  console.log(`Status: ${res.status}`);
  if (res.ok) {
    const html = await res.text();
    fs.writeFileSync('data/verbena_provas_gabaritos.html', html);
    const links = [...html.matchAll(/href=["']([^"']+\.pdf)[\"']/gi)].map(m => m[1]);
    console.log(`Found ${links.length} PDF links:`);
    links.forEach(l => console.log('  ->', l));
  }
}

fetchProvasGabaritosPage();
