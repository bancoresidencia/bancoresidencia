async function testEstrategia() {
  const url = 'https://med.estrategia.com/public/questoes/alternativa13d82bb815/';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
  });
  console.log('Estrategia status:', res.status);
  const html = await res.text();
  console.log('Estrategia length:', html.length);
  // Look for ld+json or next_data
  const ld = html.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  if (ld) {
    console.log('LD JSON count:', ld.length);
    console.log(ld[0].slice(0, 300));
  }
  // Look for next_data
  const nextData = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (nextData) {
    console.log('Found NEXT_DATA in Estratégia!');
    const d = JSON.parse(nextData[1]);
    console.log('Keys in pageProps:', Object.keys(d.props?.pageProps || {}));
    console.log('Question object keys:', Object.keys(d.props?.pageProps?.question || d.props?.pageProps?.data || {}));
    const qObj = d.props?.pageProps?.question || d.props?.pageProps?.data;
    if (qObj) {
      console.log('gabarito:', qObj.gabarito || qObj.correctAnswer || qObj.answer);
      console.log('preview:', JSON.stringify(qObj).slice(0, 400));
    }
  }
}
testEstrategia();

