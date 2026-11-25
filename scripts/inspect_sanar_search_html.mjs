async function inspect() {
  const query = 'apresentação cefálica';
  const url = `https://sanarmed.com/questoes-de-concursos/?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  console.log('HTML sample:', html.substring(0, 1000));
  // check for any /q/ or question URLs or script tags
  const qMatches = html.match(/https:\/\/sanarmed\.com\/q\/[^\s"']+/g) || [];
  console.log('Direct q URLs in HTML:', [...new Set(qMatches)]);
  const internalLinks = html.match(/\/q\/[^\s"']+/g) || [];
  console.log('Internal /q/ links:', [...new Set(internalLinks)]);
}
inspect();
