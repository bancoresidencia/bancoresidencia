async function test() {
  const q = "trabalho de parto dilatação total apresentação cefálica";
  const url = `https://sanarmed.com/questoes-de-concursos/?q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const qMatches = [...new Set(html.match(/https:\/\/sanarmed\.com\/q\/[^\s"']+/g) || [])];
  console.log(`Found ${qMatches.length} questions for query "${q}":`);
  qMatches.forEach(u => console.log('  ', u));
}
test();
