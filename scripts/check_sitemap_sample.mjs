async function searchUnifespInSitemaps() {
  console.log('Checking sitemaps for UNIFESP questions not in /provas/...');
  const smRes = await fetch('https://sanarmed.com/questao-sitemap1.xml', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const smText = await smRes.text();
  const locs = [...smText.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  console.log(`Checking 50 questions from sitemap 1...`);

  const insts = {};
  for (let i = 0; i < 50; i++) {
    try {
      const qRes = await fetch(locs[i], { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await qRes.text();
      const m = html.match(/<script type="application\/json" id="wordpress-question-data">([\s\S]*?)<\/script>/);
      if (m) {
        const q = JSON.parse(m[1]);
        const inst = q.institution?.name || 'Sem Instituição';
        insts[inst] = (insts[inst] || 0) + 1;
      }
    } catch (_) {}
  }
  console.log('Institutions found in sitemap sample:', insts);
}

searchUnifespInSitemaps().catch(console.error);
