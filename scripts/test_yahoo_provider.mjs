async function testYahoo() {
  const query = 'Além da triagem específica por meio do M-CHAT-R/F';
  try {
    const res = await fetch(`https://search.yahoo.com/search?p=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9'
      }
    });
    console.log('Yahoo status:', res.status);
    const html = await res.text();
    console.log('Yahoo HTML length:', html.length);
    const hasSanar = html.includes('sanarmed.com');
    console.log('Contains sanarmed.com:', hasSanar);
  } catch (e) {
    console.error('Yahoo err:', e.message);
  }
}
testYahoo();
