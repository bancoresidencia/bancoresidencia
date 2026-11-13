async function printLdSnippet() {
  const url = 'https://sanarmed.com/q/um-menino-de-9-anos-e-trazido-ao-consultorio-pelos/';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
  const html = await res.text();
  const m = html.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
  if (m) {
    console.log(m[1].slice(0, 1000));
  }
}
printLdSnippet();
