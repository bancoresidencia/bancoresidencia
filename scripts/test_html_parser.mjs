async function testHtmlParser() {
  const url = 'https://www.medway.com.br/conteudos/prova-de-residencia-medica-gabarito-ses-go/';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();

  // Remove scripts, styles
  const cleanHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ');

  // Parser regex
  const regexPatterns = [
    /\b(\d{1,3})\s*[\.\:\-\)]\s*([A-E]|ANULADA|NULA|\*|X)\b/gi,
    /\b(\d{1,3})\s+([A-E])\b/g
  ];

  const answerMap = {};
  for (const pat of regexPatterns) {
    let m;
    while ((m = pat.exec(cleanHtml)) !== null) {
      const num = parseInt(m[1], 10);
      const ans = m[2].toUpperCase().trim();
      if (num >= 1 && num <= 100) {
        if (!answerMap[num]) answerMap[num] = ans;
      }
    }
  }

  console.log('Total respostas encontradas no HTML limpo:', Object.keys(answerMap).length);
  console.log('Amostra de respostas:', Object.entries(answerMap).slice(0, 20));
}

testHtmlParser();
