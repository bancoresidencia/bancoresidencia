async function test() {
  const url = 'https://sanarmed.com/q/menina-de-4-anos-eacute-levada-a-uma-unidade-baacutesica-de-sauacutede-pela/';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0...' } });
  const html = await res.text();
  const matches = html.match(/https?:\/\/[^"'\s]+\.(?:png|jpg|jpeg|webp)/gi) || [];
  const qImgs = matches.filter(u => u.includes('assets') || u.includes('cetrus') || u.includes('lunar') || u.includes('sanar'));
  console.log('Sanar images:', qImgs);
}

test().catch(console.error);
