async function testSanar() {
  const url = 'https://sanarmed.com/q/com-relacao-a-sindrome-nefrotica-idiopatica-na-infancia-e-correto-afirmar-que/';
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  console.log('Status:', res.status);
  const html = await res.text();
  const ldRegex = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = ldRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(m[1]);
      if (data['@type'] === 'QAPage' || data.mainEntity?.['@type'] === 'Question') {
        console.log('Found QAPage in testSanar!');
        console.log('AcceptedAnswer:', data.mainEntity?.acceptedAnswer?.text?.slice(0, 100));
        console.log('Comment:', data.mainEntity?.acceptedAnswer?.comment?.text?.slice(0, 100));
      }
    } catch (_) {}
  }
}

testSanar();
