process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function main() {
  const editions = ['2024-2025', '2025-2026'];
  for (const ed of editions) {
    const url = `https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/${ed}`;
    try {
      const res = await fetch(url);
      const html = await res.text();
      const pdfRegex = /href="([^"]+)"/gi;
      let m;
      console.log(`\n=== Edition ${ed} (HTTP ${res.status}) ===`);
      const links = [];
      while ((m = pdfRegex.exec(html)) !== null) {
        if (m[1].includes('.pdf') || /prova|gabarito|caderno|med/i.test(m[1])) {
          links.push(m[1]);
        }
      }
      console.log(`Encontrados ${links.length} links relevantes:`);
      links.forEach(l => console.log('  ', l));
    } catch (e) {
      console.error(e);
    }
  }
}

main();
