async function testBingClean() {
  const query = 'Além da triagem específica por meio do M-CHAT-R/F';
  try {
    const res = await fetch(`https://www.bing.com/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    console.log('Bing status:', res.status);
    const html = await res.text();
    console.log('Bing HTML length:', html.length);
    const sanarMatches = [...html.matchAll(/https?:\/\/[^\s"'<>]*(sanarmed\.com|estrategiamed\.com\.br|qconcursos\.com)[^\s"'<>]*/g)];
    console.log('Medical links in Bing:', sanarMatches.map(m => m[0]).slice(0, 5));
  } catch (e) {
    console.error('Bing err:', e.message);
  }
}
testBingClean();
