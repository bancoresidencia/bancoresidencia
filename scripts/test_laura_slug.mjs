async function testSlug() {
  const slug = 'laura-um-lactente-de-dois-anos';
  const url = `https://sanarmed.com/q/${slug}/`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  console.log('HTML length:', html.length);
  const match = html.match(/Exantema súbito/i);
  console.log('Match Exantema súbito:', !!match);
  if (match) {
    const idx = html.indexOf(match[0]);
    console.log('Context:', html.slice(Math.max(0, idx - 100), idx + 200).replace(/\s+/g, ' '));
  }
}
testSlug();
