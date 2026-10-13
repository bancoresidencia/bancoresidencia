process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function checkUrl(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    console.log(`\nURL: ${url} (Status: ${res.status})`);
    if (res.status === 200) {
      const html = await res.text();
      const matches = Array.from(html.matchAll(/href="([^"]+)"/gi)).map(m => m[1]);
      const pdfs = matches.filter(l => l.toLowerCase().endsWith('.pdf') || l.includes('.pdf/view') || l.includes('@@download'));
      console.log(`Found ${pdfs.length} PDF/download links:`);
      pdfs.forEach(p => console.log('  -> ' + p));

      // Also check sublinks inside main content
      const contentLinks = matches.filter(l => l.includes('/provas') || l.includes('caderno') || l.includes('gabarito'));
      console.log(`Content links (${contentLinks.length}):`, contentLinks);
    }
  } catch (e) {
    console.error(`Error on ${url}:`, e.message);
  }
}

async function main() {
  const pages = [
    'https://www.gov.br/ebserh/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2024/area-do-candidato',
    'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2024-2025/provas',
    'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2023-2024/provas/area-medica'
  ];

  for (const p of pages) {
    await checkUrl(p);
  }
}

main();
