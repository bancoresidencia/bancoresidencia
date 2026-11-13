async function testSanarPuericultura() {
  const url = 'https://sanarmed.com/q/um-medico-realiza-consulta-de-puericultura-de-um-menino-de-14-meses-de-vida/';
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const html = await res.text();
  const ldMatch = html.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
  if (ldMatch) {
    const data = JSON.parse(ldMatch[1]);
    console.log('acceptedAnswer:', JSON.stringify(data.mainEntity?.acceptedAnswer, null, 2));
  }
}
testSanarPuericultura();
