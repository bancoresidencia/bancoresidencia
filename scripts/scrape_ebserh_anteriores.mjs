process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function main() {
  const years = [
    '2025-2026',
    '2024-2025',
    '2023-2024',
    '2022-2023',
    '2021-2022',
    '2020-2021'
  ];

  for (const y of years) {
    const url = `https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/${y}`;
    console.log(`\n================== Checking ${y} (${url}) ==================`);
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      console.log('Status:', res.status);
      const html = await res.text();
      const matches = html.matchAll(/href="([^"]+)"/gi);
      const links = [];
      for (const m of matches) links.push(m[1]);
      const pdfsOrPortals = links.filter(l => 
        l.endsWith('.pdf') || 
        l.includes('prova') || 
        l.includes('gabarito') || 
        l.includes('fgv') || 
        l.includes('aocp')
      );
      console.log(`Found ${pdfsOrPortals.length} relevant links for ${y}:`);
      pdfsOrPortals.forEach(l => console.log(' - ' + l));
    } catch (err) {
      console.error(`Error on ${y}:`, err.message);
    }
  }
}

main();
