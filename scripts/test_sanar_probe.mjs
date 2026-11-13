async function testSanarUrl() {
  const url = 'https://sanarmed.com/q/homem-de-52-anos-de-idade/';
  console.log('Fetching:', url);
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  console.log('Status:', res.status, res.url);
  if (res.ok) {
    const html = await res.text();
    const ldMatches = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
    console.log('LD matches:', ldMatches.length);
    for (const m of ldMatches) {
      if (m[1].includes('acceptedAnswer') || m[1].includes('QAPage')) {
        console.log('QAPage JSON-LD:\n', m[1].slice(0, 1000));
      }
    }
  }
}
testSanarUrl();
