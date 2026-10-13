const years = ['2011', '2012', '2013', '2014', '2015', '2016', '2017'];

async function testAll() {
  const all = {};
  for (const y of years) {
    const url = `https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/revalida/provas-e-gabaritos/${y}`;
    try {
      const res = await fetch(url);
      const html = await res.text();
      const pdfRegex = /href="([^"]+\.pdf[^"]*)"/gi;
      const matches = [];
      let m;
      while ((m = pdfRegex.exec(html)) !== null) {
        matches.push(m[1]);
      }
      all[y] = matches;
      console.log(`Ano ${y}: ${matches.length} PDFs oficiais encontrados!`);
      matches.forEach(p => console.log(`   - ${p}`));
    } catch (e) {
      console.error(`Erro em ${y}:`, e.message);
    }
  }
}

testAll().catch(console.error);
