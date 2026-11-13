async function test() {
  const res = await fetch('https://sanarmed.com/q/homem-71-anos-tabagista-com-historico/', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await res.text();
  const ld = html.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) || [];
  console.log(ld[0]?.slice(0, 500));
}
test();
