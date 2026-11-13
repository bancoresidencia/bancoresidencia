async function testSlug() {
  const stmt = "Homem, 71 anos, tabagista, com histórico de uso crônico de anti-inflamatórios";
  const slug = "homem-71-anos-tabagista-com-historico-de-uso-cronico";
  const url = `https://sanarmed.com/q/${slug}/`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  console.log('Status:', res.status, url);
  if (res.ok) {
    const text = await res.text();
    console.log(text.slice(0, 500));
  }
}
testSlug();
