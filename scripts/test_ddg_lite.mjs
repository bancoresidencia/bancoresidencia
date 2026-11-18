async function testDDGLite() {
  const query = 'Além da triagem específica por meio do M-CHAT-R/F';
  try {
    const res = await fetch('https://lite.duckduckgo.com/lite/', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9'
      },
      body: `q=${encodeURIComponent(query)}`
    });
    console.log('Status:', res.status);
    const html = await res.text();
    console.log('Length:', html.length);
    console.log('Has anomaly/captcha:', html.includes('anomaly') || html.includes('captcha') || html.includes('challenge'));
    console.log('Sample text:', html.slice(0, 500));
  } catch (e) {
    console.error(e);
  }
}
testDDGLite();
