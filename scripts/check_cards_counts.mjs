async function inspectCards() {
  const res = await fetch('https://sanarmed.com/questoes-de-concursos/provas/', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();

  // Find cards with institution and question count
  const cardRegex = /<a[^>]+href="([^"]*\/prova\/([^"\/]+)\/?)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  const cards = [];
  while ((m = cardRegex.exec(html)) !== null) {
    const link = m[1];
    const slug = m[2];
    const cardContent = m[3];
    const countMatch = cardContent.match(/(\d+[\.\,]?\d*)\s*quest/i);
    const count = countMatch ? countMatch[1] : 'unknown';
    cards.push({ slug, link, count });
  }

  console.log(`Found ${cards.length} cards on /provas/ page. First 10:`);
  console.log(cards.slice(0, 10));

  // Sum all counts
  let totalReported = 0;
  for (const c of cards) {
    const n = parseInt(c.count.replace(/\./g, ''), 10);
    if (!isNaN(n)) totalReported += n;
  }
  console.log(`Total questions reported by cards: ${totalReported}`);
}

inspectCards().catch(console.error);
