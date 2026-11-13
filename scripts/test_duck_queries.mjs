async function testDuckQueries() {
  const qList = [
    'Qual o tratamento recomendado pelo Ministério da Saúde para os casos confirmados de coqueluche',
    'Qual o agente etiológico da coqueluche',
    'Conforme o calendário de vacinação da Sociedade Brasileira de Pediatria a vacina contra',
    'Escolar sexo masculino 7 anos de idade tem historia de dor abdominal difusa'
  ];

  for (const q of qList) {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const html = await res.text();
    const regex = /<a[^>]+class="result__url"[^>]+href="([^"]+)"/g;
    let m;
    const links = [];
    while ((m = regex.exec(html)) !== null && links.length < 3) {
      let l = m[1];
      if (l.includes('uddg=')) l = decodeURIComponent(l.split('uddg=')[1].split('&')[0]);
      links.push(l);
    }
    console.log(`Query: "${q.slice(0, 50)}..."`);
    links.forEach(l => console.log('  ->', l));
  }
}
testDuckQueries();

